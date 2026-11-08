import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { cp, mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tracker = join(root, 'project-tracker')
const historyDirectory = join(tracker, 'execution-history')
const archivesDirectory = join(tracker, 'archives')
const lockPath = join(tracker, '.update.lock')

function usage() {
  console.error('Usage: node scripts/activate_maintenance_mode.mjs --version v1.0.0 --approved-by "mentor" --approval-at "ISO timestamp" --approval-evidence "actual approval reference" --release-notes "approved release notes"')
  process.exit(2)
}

function optionsFrom(argv) {
  const options = new Map()
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]
    const value = argv[index + 1]
    if (!key.startsWith('--') || !value || value.startsWith('--') || options.has(key)) usage()
    options.set(key, value)
    index += 1
  }
  return options
}

function atomicJson(file, value) {
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
  return writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' }).then(() => rename(temporary, file))
}

const options = optionsFrom(process.argv.slice(2))
const version = options.get('--version')
const approvedBy = options.get('--approved-by')
const approvalAt = options.get('--approval-at')
const approvalEvidence = options.get('--approval-evidence')
const releaseNotes = options.get('--release-notes')
if (!version || !/^v\d+\.\d+(?:\.\d+)?$/.test(version) || !approvedBy || !approvalAt || Number.isNaN(Date.parse(approvalAt)) || !approvalEvidence || !releaseNotes) usage()

await mkdir(archivesDirectory, { recursive: true })
let lock
try {
  lock = await open(lockPath, 'wx')
} catch {
  throw new Error('Tracker update lock exists. Inspect it before removing any stale lock.')
}

try {
  const progressPath = join(tracker, 'progress.json')
  const roadmapPath = join(tracker, 'roadmap.json')
  const activityPath = join(tracker, 'activity-log.json')
  const [progress, roadmap, activity] = await Promise.all([
    readFile(progressPath, 'utf8').then(JSON.parse),
    readFile(roadmapPath, 'utf8').then(JSON.parse),
    readFile(activityPath, 'utf8').then(JSON.parse),
  ])
  if (progress.lifecycle.mode !== 'Development') throw new Error('Maintenance mode is already active; this transition is one-way in this workflow.')
  if (!progress.tasks.every((task) => task.status === 'Completed')) throw new Error('Release is not eligible: every canonical phase task must be complete before explicit release approval can activate Maintenance mode.')

  // Copy the original development records; never move or remove them.
  const archiveName = `development-pre-${version}-${new Date().toISOString().replace(/[:.]/g, '-')}`
  const archivePath = join(archivesDirectory, archiveName)
  await mkdir(archivePath, { recursive: false })
  await Promise.all([
    cp(progressPath, join(archivePath, 'progress.json')),
    cp(roadmapPath, join(archivePath, 'roadmap.json')),
    cp(activityPath, join(archivePath, 'activity-log.json')),
    cp(historyDirectory, join(archivePath, 'execution-history'), { recursive: true }),
  ])

  const now = new Date().toISOString()
  progress.lifecycle.mode = 'Maintenance'
  progress.lifecycle.currentVersion = version
  progress.lifecycle.releaseApproval = { status: 'Approved', approvedAt: new Date(approvalAt).toISOString(), approvedBy, evidenceRef: approvalEvidence }
  progress.lifecycle.releases.push({
    version,
    status: 'Released',
    releasedAt: now,
    releaseNotes,
    approvalRef: approvalEvidence,
    commitRef: null,
  })
  const activityId = `ACT-${now.replace(/[-:.TZ]/g, '')}-${randomUUID().slice(0, 8).toUpperCase()}`
  activity.entries.push({
    id: activityId,
    recordedAt: now,
    occurredAt: now,
    taskId: null,
    phaseId: 'P15',
    type: 'Maintenance Mode Activated',
    summary: `Explicit release approval recorded for ${version}; development history copied to project-tracker/archives/${archiveName}/.`,
    executionReportRef: null,
  })

  // Optional synchronization metadata is read-only and never reveals remote credentials.
  try {
    progress.gitSync.headCommit = execFileSync('git', ['-C', root, 'rev-parse', '--verify', 'HEAD^{commit}'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch {
    progress.gitSync.headCommit = null
  }
  progress.gitSync.observedAt = now
  await atomicJson(progressPath, progress)
  await atomicJson(activityPath, activity)
  console.log(`Maintenance mode activated for ${version}. Development history preserved at project-tracker/archives/${archiveName}/.`)
} finally {
  await lock.close()
  await rm(lockPath, { force: true })
}
