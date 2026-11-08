import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, open, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tracker = join(root, 'project-tracker')
const historyDirectory = join(tracker, 'execution-history')
const lockPath = join(tracker, '.update.lock')
const validStatuses = new Set(['Not Started', 'In Progress', 'Completed', 'Blocked', 'Failed'])

function usage() {
  console.error(`Usage:
  node scripts/update_project_tracker.mjs start --task P03 --note "Starting authorized work"
  node scripts/update_project_tracker.mjs finish --task P03 --execution EXEC-ID --status "Completed|In Progress|Blocked|Failed" --note "Observed outcome" [--file path] [--check "command | PASS | observed result"] [--evidence "evidence reference"] [--blocker "actual blocker"] [--error "actual error"] [--commit <verified-git-commit>]

Repeat --file, --check, --evidence, --blocker and --error as needed. Completing a task requires at least one passing check and evidence. This CLI does not provide public dashboard write controls or change release mode.`)
  process.exit(2)
}

function argsMap(argv) {
  const options = new Map()
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]
    if (!key.startsWith('--')) usage()
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) usage()
    const list = options.get(key) ?? []
    list.push(value)
    options.set(key, list)
    index += 1
  }
  return options
}

function one(options, key) {
  const values = options.get(key) ?? []
  if (values.length > 1) usage()
  return values[0] ?? null
}

function many(options, key) {
  return options.get(key) ?? []
}

function isoNow() {
  return new Date().toISOString()
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'))
}

async function writeJsonAtomic(file, data) {
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
  await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
  await rename(temporary, file)
}

function splitCheck(value) {
  const [command, result, ...details] = value.split('|').map((part) => part.trim())
  if (!command || !['PASS', 'FAIL', 'PENDING', 'BLOCKED'].includes(result)) {
    throw new Error(`Invalid --check '${value}'. Use "command | PASS|FAIL|PENDING|BLOCKED | actual result".`)
  }
  return { command, result, details: details.join(' | ') }
}

const [action, ...argv] = process.argv.slice(2)
if (!['start', 'finish'].includes(action)) usage()
const options = argsMap(argv)
const taskId = one(options, '--task')
const note = one(options, '--note')
if (!taskId || !note) usage()

await mkdir(historyDirectory, { recursive: true })
let lock
try {
  lock = await open(lockPath, 'wx')
} catch {
  throw new Error('Tracker update lock exists. Another update may be running; inspect it before removing any stale lock.')
}

try {
  const progressPath = join(tracker, 'progress.json')
  const activityPath = join(tracker, 'activity-log.json')
  const progress = await readJson(progressPath)
  const activity = await readJson(activityPath)
  if (progress.schemaVersion !== 1 || activity.schemaVersion !== 1 || !Array.isArray(progress.tasks) || !Array.isArray(activity.entries)) throw new Error('Tracker files are malformed; run node scripts/validate_project_tracker.mjs and repair data before updating.')
  if (new Set(progress.tasks.map((item) => item.id)).size !== progress.tasks.length) throw new Error('Duplicate task IDs found; repair tracker records before updating.')
  const task = progress.tasks.find((item) => item.id === taskId)
  if (!task) throw new Error(`Unknown task ID: ${taskId}`)
  const now = isoNow()
  const filePaths = many(options, '--file')
  const evidence = many(options, '--evidence')
  const checks = many(options, '--check').map(splitCheck)
  const blockers = many(options, '--blocker')
  const errors = many(options, '--error')
  const suppliedCommit = one(options, '--commit')
  let verifiedCommit = null
  if (suppliedCommit) {
    verifiedCommit = execFileSync('git', ['-C', root, 'rev-parse', '--verify', `${suppliedCommit}^{commit}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  }

  let record
  let historyFile
  if (action === 'start') {
    if (task.status === 'Completed') throw new Error(`Completed task ${taskId} cannot be restarted without an explicit, separately documented correction.`)
    const recordId = `EXEC-${now.replaceAll(/[-:.TZ]/g, '')}-${randomUUID().slice(0, 8).toUpperCase()}`
    historyFile = `${recordId.toLowerCase()}.json`
    record = {
      id: recordId, recordedAt: now, startedAt: now, completedAt: null,
      recordOrigin: 'OpenCode execution record', taskIds: [taskId], status: 'In Progress',
      summary: note, filesChanged: [], commands: [], errors: [], blockers: [],
      commitRef: null, executionReportRef: null, mentorReview: 'Pending',
    }
    task.status = 'In Progress'
    task.updatedAt = now
    task.completedAt = null
    task.completionTimestampNote = null
    progress.project.nextTaskId = taskId
    progress.project.nextRecommendedTask = note
    progress.project.activePhaseIds = [...new Set([...progress.project.activePhaseIds, task.phaseId])]
  } else {
    const executionId = one(options, '--execution')
    const nextStatus = one(options, '--status')
    const nextTaskId = one(options, '--next-task')
    const nextRecommendation = one(options, '--recommendation')
    if (!executionId || !nextStatus || !validStatuses.has(nextStatus) || nextStatus === 'Not Started') usage()
    const nextTaskRecord = progress.tasks.find((item) => item.id === nextTaskId)
    if (!nextTaskId || !nextRecommendation || !nextTaskRecord || nextTaskRecord.status === 'Completed') throw new Error('Finish requires a valid, non-completed --next-task ID and --recommendation for the tracker dashboard.')
    if (nextTaskId === taskId && nextStatus === 'Completed') throw new Error('A completed task cannot be its own next recommendation.')
    if (task.status === 'Completed' && nextStatus !== 'Completed') throw new Error(`Completed task ${taskId} cannot be downgraded; preserve history and create a correction record instead.`)
    if (nextStatus === 'Blocked' && blockers.length === 0) throw new Error('A Blocked task requires --blocker with the actual unresolved condition.')
    if (nextStatus === 'Completed' && (checks.length === 0 || checks.some((check) => check.result !== 'PASS') || evidence.length === 0)) throw new Error('Completed requires at least one observed PASS check, all checks passing, and at least one verification evidence reference.')
    const fileNames = await readdir(historyDirectory)
    historyFile = fileNames.find((name) => name.endsWith('.json') && name.toLowerCase().startsWith(executionId.toLowerCase()))
    if (!historyFile) throw new Error(`Execution record ${executionId} was not found.`)
    record = await readJson(join(historyDirectory, historyFile))
    if (!Array.isArray(record.taskIds) || !record.taskIds.includes(taskId) || record.completedAt) throw new Error('Execution record does not belong to this task or is already closed.')
    record.recordedAt = now
    record.completedAt = now
    record.status = nextStatus
    record.summary = note
    record.filesChanged = [...new Set([...record.filesChanged, ...filePaths])]
    record.commands = [...record.commands, ...checks]
    record.errors = [...record.errors, ...errors]
    record.blockers = [...record.blockers, ...blockers]
    record.commitRef = verifiedCommit
    record.executionReportRef = `project-tracker/execution-history/${historyFile}`
    task.status = nextStatus
    task.updatedAt = now
    task.completedAt = nextStatus === 'Completed' ? now : null
    task.completionTimestampNote = null
    task.blockerDetails = nextStatus === 'Blocked' ? blockers.join(' ') : null
    task.relatedFiles = [...new Set([...task.relatedFiles, ...filePaths])]
    task.verificationEvidence = [...task.verificationEvidence, ...evidence]
    task.executionReportRef = record.executionReportRef
    task.gitCommitRef = verifiedCommit
    progress.project.nextTaskId = nextTaskId
    progress.project.nextRecommendedTask = nextRecommendation
    progress.project.activePhaseIds = [nextTaskRecord.phaseId]
    progress.verificationResults = [
      ...progress.verificationResults,
      ...checks.map((check) => ({
        name: check.command,
        result: ({ PASS: 'Passed', FAIL: 'Failed', PENDING: 'Pending', BLOCKED: 'Blocked' })[check.result],
        executedAt: null,
        recordedAt: now,
        source: `OpenCode execution ${record.id}${check.details ? ` — ${check.details}` : ''}`,
      })),
    ].slice(-20)
    try {
      const repositoryRoot = execFileSync('git', ['-C', root, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
      const headCommit = execFileSync('git', ['-C', root, 'rev-parse', '--verify', 'HEAD^{commit}'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
      let remote = null
      try {
        const remoteUrl = execFileSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
        const parsed = new URL(remoteUrl)
        remote = parsed.hostname.toLowerCase() === 'github.com'
          ? `https://github.com/${parsed.pathname.split('/').filter(Boolean).slice(0, 2).join('/')}`
          : `Configured remote (${parsed.hostname})`
      } catch {
        // Missing or non-URL origin is not exposed in the dashboard.
      }
      progress.gitSync.repositoryDetected = true
      progress.gitSync.headCommit = headCommit
      progress.gitSync.remote = remote
      progress.gitSync.status = remote ? 'Repository detected; workflow sync unavailable' : 'Repository detected; no GitHub remote detected'
      progress.gitSync.explanation = `Local Git metadata was read from ${repositoryRoot}. GitHub workflow status is not queried by this local tracker.`
    } catch {
      progress.gitSync.repositoryDetected = false
      progress.gitSync.headCommit = null
      progress.gitSync.remote = null
      progress.gitSync.status = 'Unavailable'
      progress.gitSync.explanation = 'No Git repository was detected; commit and workflow synchronization are unavailable. Local tracker updates remain enabled.'
    }
    progress.gitSync.observedAt = now
  }

  const roadmapPath = join(tracker, 'roadmap.json')
  const roadmap = await readJson(roadmapPath)
  const phase = roadmap.phases.find((item) => item.id === task.phaseId)
  if (!phase) throw new Error(`Roadmap phase ${task.phaseId} is missing.`)
  phase.status = task.status
  phase.stateNote = `${task.status} — ${note}`

  const activityId = `ACT-${now.replaceAll(/[-:.TZ]/g, '')}-${randomUUID().slice(0, 8).toUpperCase()}`
  activity.entries.push({
    id: activityId, recordedAt: now, occurredAt: now, taskId, phaseId: task.phaseId,
    type: action === 'start' ? 'Execution Started' : `Execution ${record.status}`,
    summary: note, executionReportRef: action === 'finish' ? record.executionReportRef : `EXEC-ID:${record.id}`,
  })
  await writeJsonAtomic(join(historyDirectory, historyFile), record)
  await writeJsonAtomic(roadmapPath, roadmap)
  await writeJsonAtomic(progressPath, progress)
  await writeJsonAtomic(activityPath, activity)
  console.log(`${action === 'start' ? 'Started' : 'Recorded'} ${taskId} as ${task.status}. Execution ID: ${record.id}`)
  if (action === 'start') console.log(`Finish with: node scripts/update_project_tracker.mjs finish --task ${taskId} --execution ${record.id} --status "..." --note "..."`)
} finally {
  await lock.close()
  await rm(lockPath, { force: true })
}
