import { readdir, readFile, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import type {
  ExecutionRecord,
  TaskPriority,
  TaskStatus,
  TrackerActivity,
  TrackerLoadResult,
  TrackerPhase,
  TrackerSnapshot,
  TrackerTask,
  VerificationResult,
} from './project-tracker-types'
import { TASK_STATUSES } from './project-tracker-types'

type JsonObject = Record<string, unknown>
const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low']

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function isIsoDate(value: unknown): value is string {
  return isString(value) && !Number.isNaN(Date.parse(value))
}

function fail(message: string): never {
  throw new Error(message)
}

function assertTask(value: unknown): asserts value is TrackerTask {
  if (!isObject(value)) fail('Task record must be an object.')
  const fields = ['id', 'phaseId', 'title', 'description', 'assignedCategory'] as const
  if (!fields.every((field) => isString(value[field]) && value[field].length > 0)) fail('Task is missing a required text field.')
  if (!TASK_STATUSES.includes(value.status as TaskStatus)) fail(`Task ${value.id} has an invalid status.`)
  if (!PRIORITIES.includes(value.priority as TaskPriority)) fail(`Task ${value.id} has an invalid priority.`)
  if (!isIsoDate(value.createdAt) || !isIsoDate(value.updatedAt)) fail(`Task ${value.id} has an invalid created/updated timestamp.`)
  if (!isNullableString(value.completedAt) || (value.completedAt !== null && !isIsoDate(value.completedAt))) fail(`Task ${value.id} has an invalid completion timestamp.`)
  if (value.status === 'Completed' && value.completedAt === null && !isString(value.completionTimestampNote)) fail(`Completed task ${value.id} needs a timestamp or an explicit timestamp note.`)
  if (value.status !== 'Completed' && value.completedAt !== null) fail(`Non-completed task ${value.id} cannot have a completion timestamp.`)
  if (!isNullableString(value.completionTimestampNote) || !isNullableString(value.executionReportRef) || !isNullableString(value.gitCommitRef) || !isNullableString(value.blockerDetails)) fail(`Task ${value.id} has invalid nullable fields.`)
  if (!isStringArray(value.verificationEvidence) || !isStringArray(value.relatedFiles)) fail(`Task ${value.id} evidence and related files must be arrays of strings.`)
}

function assertPhase(value: unknown): asserts value is TrackerPhase {
  if (!isObject(value) || !isString(value.id) || !isString(value.title) || !isString(value.description) || !isString(value.stateNote)) fail('Roadmap phase has missing fields.')
  if (!TASK_STATUSES.includes(value.status as TaskStatus)) fail(`Phase ${value.id} has an invalid status.`)
}

function assertActivity(value: unknown): asserts value is TrackerActivity {
  if (!isObject(value) || !isString(value.id) || !isIsoDate(value.recordedAt) || !isNullableString(value.occurredAt) || !isNullableString(value.taskId) || !isNullableString(value.phaseId) || !isString(value.type) || !isString(value.summary) || !isNullableString(value.executionReportRef)) fail('Activity record has missing or invalid fields.')
}

function assertExecution(value: unknown): asserts value is ExecutionRecord {
  if (!isObject(value) || !isString(value.id) || !isIsoDate(value.recordedAt) || !isNullableString(value.startedAt) || !isNullableString(value.completedAt) || !isString(value.recordOrigin) || !isStringArray(value.taskIds) || !TASK_STATUSES.includes(value.status as TaskStatus) || !isString(value.summary) || !isStringArray(value.filesChanged) || !Array.isArray(value.commands) || !value.commands.every((command) => isObject(command) && isString(command.command) && isString(command.result)) || !isStringArray(value.errors) || !isStringArray(value.blockers) || !isNullableString(value.commitRef) || !isNullableString(value.executionReportRef) || !isString(value.mentorReview)) fail('Execution history record has missing or invalid fields.')
}

function validateSnapshot(roadmapJson: unknown, progressJson: unknown, activityJson: unknown, executionJson: unknown[]): TrackerSnapshot {
  if (!isObject(roadmapJson) || roadmapJson.schemaVersion !== 1 || !Array.isArray(roadmapJson.phases)) fail('roadmap.json must use schemaVersion 1 and contain phases.')
  if (!isObject(progressJson) || progressJson.schemaVersion !== 1 || !isObject(progressJson.project) || !isObject(progressJson.lifecycle) || !Array.isArray(progressJson.tasks) || !Array.isArray(progressJson.verificationResults) || !isObject(progressJson.gitSync)) fail('progress.json has an unsupported or malformed structure.')
  if (!isObject(activityJson) || activityJson.schemaVersion !== 1 || !Array.isArray(activityJson.entries)) fail('activity-log.json must use schemaVersion 1 and contain entries.')

  roadmapJson.phases.forEach(assertPhase)
  progressJson.tasks.forEach(assertTask)
  activityJson.entries.forEach(assertActivity)
  executionJson.forEach(assertExecution)

  const phases = roadmapJson.phases as TrackerPhase[]
  const tasks = progressJson.tasks as TrackerTask[]
  const activity = activityJson.entries as TrackerActivity[]
  const executions = executionJson as ExecutionRecord[]
  const assertUnique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length) fail(`Duplicate ${label} ID found.`)
  }
  assertUnique(phases.map((phase) => phase.id), 'phase')
  assertUnique(tasks.map((task) => task.id), 'task')
  assertUnique(activity.map((entry) => entry.id), 'activity')
  assertUnique(executions.map((entry) => entry.id), 'execution')
  if (phases.length !== 16 || phases.some((phase, index) => phase.id !== `P${String(index).padStart(2, '0')}`)) fail('Canonical roadmap must contain P00 through P15 in order.')
  if (tasks.length !== phases.length) fail('Each canonical phase must have one task record.')
  for (const phase of phases) {
    const task = tasks.find((candidate) => candidate.phaseId === phase.id)
    if (!task || task.status !== phase.status) fail(`Phase ${phase.id} and its task record are missing or out of sync.`)
  }

  const project = progressJson.project
  const lifecycle = progressJson.lifecycle
  const gitSync = progressJson.gitSync
  if (!isString(project.name) || !isString(project.status) || !isStringArray(project.activePhaseIds) || !isString(project.nextTaskId) || !isString(project.nextRecommendedTask) || !isString(project.progressMethod)) fail('Project summary is malformed.')
  if (lifecycle.mode !== 'Development' && lifecycle.mode !== 'Maintenance') fail('Lifecycle mode is invalid.')
  if (!isObject(lifecycle.releaseApproval) || !isNullableString(lifecycle.releaseApproval.approvedAt) || !isNullableString(lifecycle.releaseApproval.approvedBy) || !isNullableString(lifecycle.releaseApproval.evidenceRef)) fail('Release approval record is malformed.')
  if (lifecycle.mode === 'Maintenance' && (lifecycle.releaseApproval.status !== 'Approved' || !lifecycle.releaseApproval.approvedAt || !lifecycle.releaseApproval.approvedBy || !lifecycle.releaseApproval.evidenceRef || !isString(lifecycle.currentVersion))) fail('Maintenance mode requires explicit release approval, version and evidence.')
  if (!Array.isArray(lifecycle.releases) || !Array.isArray(lifecycle.deployments) || !Array.isArray(lifecycle.maintenanceItems)) fail('Lifecycle release, deployment and maintenance records must be arrays.')
  if (!lifecycle.releases.every((item) => isObject(item) && isString(item.version) && isString(item.status) && isNullableString(item.releasedAt) && isString(item.releaseNotes) && isString(item.approvalRef) && isNullableString(item.commitRef))) fail('Release history contains a malformed record.')
  if (!lifecycle.deployments.every((item) => isObject(item) && isString(item.environment) && isString(item.status) && isNullableString(item.deployedAt) && isString(item.releaseVersion) && isNullableString(item.runUrl) && isNullableString(item.commitRef))) fail('Deployment history contains a malformed record.')
  if (!lifecycle.maintenanceItems.every((item) => isObject(item) && isString(item.id) && ['Bug', 'Enhancement', 'Feature Request'].includes(String(item.kind)) && isString(item.title) && isString(item.description) && TASK_STATUSES.includes(item.status as TaskStatus) && PRIORITIES.includes(item.priority as TaskPriority) && isIsoDate(item.createdAt) && isIsoDate(item.updatedAt) && isString(item.relatedVersion) && isNullableString(item.executionReportRef))) fail('Maintenance history contains a malformed record.')
  if (!isString(gitSync.status) || !isIsoDate(gitSync.observedAt) || typeof gitSync.repositoryDetected !== 'boolean' || !isNullableString(gitSync.remote) || !isNullableString(gitSync.headCommit) || !Array.isArray(gitSync.workflowChecks) || !isString(gitSync.explanation)) fail('Git synchronization status is malformed.')
  if (!Array.isArray(progressJson.verificationResults) || !progressJson.verificationResults.every((item) => isObject(item) && isString(item.name) && ['Passed', 'Failed', 'Pending', 'Blocked'].includes(String(item.result)) && isNullableString(item.executedAt) && isIsoDate(item.recordedAt) && isString(item.source))) fail('Verification results are malformed.')

  const knownTaskIds = new Set(tasks.map((task) => task.id))
  for (const execution of executions) if (execution.taskIds.some((taskId) => !knownTaskIds.has(taskId))) fail(`Execution ${execution.id} references an unknown task.`)
  return {
    roadmap: phases,
    project: project as TrackerSnapshot['project'],
    lifecycle: lifecycle as TrackerSnapshot['lifecycle'],
    tasks,
    activity: activity.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    executionHistory: executions.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    verificationResults: progressJson.verificationResults as VerificationResult[],
    gitSync: gitSync as TrackerSnapshot['gitSync'],
  }
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8')) as unknown
}

export async function loadTrackerSnapshot(): Promise<TrackerLoadResult> {
  const roots = [resolve(process.cwd(), '..', 'project-tracker'), resolve(process.cwd(), 'project-tracker')]
  let root: string | null = null
  for (const candidate of roots) {
    try {
      if ((await stat(candidate)).isDirectory()) {
        root = candidate
        break
      }
    } catch {
      // Try the next known workspace-relative location.
    }
  }
  if (!root) return { snapshot: null, error: 'Tracker records are missing. Restore the repository project-tracker data files.', warnings: [] }

  try {
    const [roadmapJson, progressJson, activityJson] = await Promise.all([
      readJson(join(root, 'roadmap.json')),
      readJson(join(root, 'progress.json')),
      readJson(join(root, 'activity-log.json')),
    ])
    const historyDirectory = join(root, 'execution-history')
    let historyFiles: string[]
    const warnings: string[] = []
    try {
      historyFiles = (await readdir(historyDirectory)).filter((name) => name.endsWith('.json')).sort()
    } catch {
      historyFiles = []
      warnings.push('Execution history directory is missing or unreadable; task and roadmap records are still available.')
    }
    const executionJson = await Promise.all(historyFiles.map((name) => readJson(join(historyDirectory, name))))
    return { snapshot: validateSnapshot(roadmapJson, progressJson, activityJson, executionJson), error: null, warnings }
  } catch {
    return { snapshot: null, error: 'Tracker data is malformed or unreadable. Validate project-tracker JSON records before retrying.', warnings: [] }
  }
}
