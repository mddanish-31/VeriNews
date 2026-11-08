import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tracker = join(root, 'project-tracker')
const allowedStatuses = new Set(['Not Started', 'In Progress', 'Completed', 'Blocked', 'Failed'])
const priorities = new Set(['High', 'Medium', 'Low'])

function requireValue(condition, message) {
  if (!condition) throw new Error(message)
}

async function json(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

const roadmap = await json(join(tracker, 'roadmap.json'))
const progress = await json(join(tracker, 'progress.json'))
const activity = await json(join(tracker, 'activity-log.json'))
requireValue(roadmap.schemaVersion === 1 && Array.isArray(roadmap.phases), 'Invalid roadmap schema.')
requireValue(progress.schemaVersion === 1 && Array.isArray(progress.tasks), 'Invalid progress schema.')
requireValue(activity.schemaVersion === 1 && Array.isArray(activity.entries), 'Invalid activity schema.')
requireValue(progress.lifecycle?.mode === 'Development' || progress.lifecycle?.mode === 'Maintenance', 'Invalid lifecycle mode.')
requireValue(Array.isArray(progress.lifecycle.releases) && Array.isArray(progress.lifecycle.deployments) && Array.isArray(progress.lifecycle.maintenanceItems), 'Lifecycle histories must be arrays.')
if (progress.lifecycle.mode === 'Maintenance') {
  requireValue(progress.lifecycle.releaseApproval?.status === 'Approved' && progress.lifecycle.releaseApproval.approvedAt && progress.lifecycle.releaseApproval.approvedBy && progress.lifecycle.releaseApproval.evidenceRef && progress.lifecycle.currentVersion, 'Maintenance mode requires explicit release approval, approver, timestamp, version and evidence.')
}
requireValue(roadmap.phases.length === 16, 'Expected exactly 16 canonical phases.')

const unique = (items, key, label) => {
  const values = items.map((item) => item[key])
  requireValue(values.every((value) => typeof value === 'string' && value), `${label} IDs must be non-empty strings.`)
  requireValue(new Set(values).size === values.length, `Duplicate ${label} ID.`)
}
unique(roadmap.phases, 'id', 'phase')
unique(progress.tasks, 'id', 'task')
unique(activity.entries, 'id', 'activity')

for (const [index, phase] of roadmap.phases.entries()) {
  requireValue(phase.id === `P${String(index).padStart(2, '0')}`, 'Canonical phases must run P00 through P15 in order.')
  requireValue(allowedStatuses.has(phase.status), `Invalid status on ${phase.id}.`)
  const task = progress.tasks.find((candidate) => candidate.phaseId === phase.id)
  requireValue(task && task.id === phase.id && task.status === phase.status, `Missing or unsynchronized task record for ${phase.id}.`)
}
requireValue(progress.tasks.length === 16, 'Expected one task per canonical phase.')

for (const task of progress.tasks) {
  requireValue(['title', 'description', 'assignedCategory'].every((field) => typeof task[field] === 'string' && task[field]), `Task ${task.id} is missing required text.`)
  requireValue(allowedStatuses.has(task.status), `Invalid task status on ${task.id}.`)
  requireValue(priorities.has(task.priority), `Invalid priority on ${task.id}.`)
  for (const key of ['createdAt', 'updatedAt']) requireValue(!Number.isNaN(Date.parse(task[key])), `Invalid ${key} on ${task.id}.`)
  requireValue(task.completedAt === null || !Number.isNaN(Date.parse(task.completedAt)), `Invalid completion timestamp on ${task.id}.`)
  requireValue(task.status === 'Completed' || task.completedAt === null, `Non-completed task ${task.id} has a completion timestamp.`)
  requireValue(task.status !== 'Completed' || task.completedAt !== null || task.completionTimestampNote, `Completed task ${task.id} is missing timestamp provenance.`)
  for (const field of ['verificationEvidence', 'relatedFiles']) requireValue(Array.isArray(task[field]) && task[field].every((item) => typeof item === 'string'), `Invalid ${field} on ${task.id}.`)
  for (const field of ['executionReportRef', 'gitCommitRef', 'blockerDetails', 'completionTimestampNote']) requireValue(task[field] === null || typeof task[field] === 'string', `Invalid ${field} on ${task.id}.`)
}

const executions = (await readdir(join(tracker, 'execution-history'))).filter((name) => name.endsWith('.json'))
const executionIds = []
for (const name of executions) {
  const record = await json(join(tracker, 'execution-history', name))
  requireValue(typeof record.id === 'string' && Array.isArray(record.taskIds) && record.taskIds.every((id) => progress.tasks.some((task) => task.id === id)), `Invalid task references in ${name}.`)
  executionIds.push(record.id)
}
requireValue(new Set(executionIds).size === executionIds.length, 'Duplicate execution history ID.')
console.log(`Tracker valid: ${roadmap.phases.length} phases, ${progress.tasks.length} unique tasks, ${activity.entries.length} activity records, ${executions.length} execution records.`)
