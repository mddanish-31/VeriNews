import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const temporaryRoot = await mkdtemp(join(process.env.TEMP ?? process.env.TMP ?? '.', 'verinews-tracker-test-'))
const fixture = join(temporaryRoot, 'project-tracker')
const scripts = join(temporaryRoot, 'scripts')

try {
  await cp(join(root, 'project-tracker'), fixture, { recursive: true })
  await mkdir(scripts, { recursive: true })
  await cp(join(root, 'scripts', 'update_project_tracker.mjs'), join(scripts, 'update_project_tracker.mjs'))
  await cp(join(root, 'scripts', 'validate_project_tracker.mjs'), join(scripts, 'validate_project_tracker.mjs'))
  await cp(join(root, 'scripts', 'activate_maintenance_mode.mjs'), join(scripts, 'activate_maintenance_mode.mjs'))

  const progressPath = join(fixture, 'progress.json')
  const progress = JSON.parse(await readFile(progressPath, 'utf8'))
  const count = (status) => progress.tasks.filter((task) => task.status === status).length
  assert.equal(progress.tasks.length, 16)
  assert.equal(count('Completed'), 2)
  assert.equal(count('In Progress'), 3)
  assert.equal(count('Not Started'), 11)
  assert.equal(count('Blocked'), 0)
  assert.equal(count('Failed'), 0)
  assert.equal(progress.tasks.filter((task) => task.phaseId === 'P03' && task.priority === 'High').length, 1)
  assert.equal(progress.tasks.filter((task) => task.status === 'Completed').every((task) => task.completedAt === null || Date.parse(task.completedAt)), true)

  const run = (...args) => execFileSync(process.execPath, [join(scripts, 'update_project_tracker.mjs'), ...args], { cwd: temporaryRoot, encoding: 'utf8' })
  const startOutput = run('start', '--task', 'P03', '--note', 'Self-test execution started in temporary fixture.')
  const executionId = startOutput.match(/Execution ID: (EXEC-[A-Z0-9-]+)/)?.[1]
  assert.ok(executionId, 'start should emit a reusable execution ID')
  run('finish', '--task', 'P03', '--execution', executionId, '--status', 'Completed', '--note', 'Self-test completion in temporary fixture.', '--next-task', 'P04', '--recommendation', 'Continue the next active test phase.', '--file', 'frontend/src/example.tsx', '--check', 'npm run typecheck | PASS | fixture pass', '--evidence', 'Temporary isolated test evidence.')

  const blockedStart = run('start', '--task', 'P05', '--note', 'Self-test blocked execution started in temporary fixture.')
  const blockedId = blockedStart.match(/Execution ID: (EXEC-[A-Z0-9-]+)/)?.[1]
  assert.ok(blockedId)
  run('finish', '--task', 'P05', '--execution', blockedId, '--status', 'Blocked', '--note', 'Self-test blocker in temporary fixture.', '--next-task', 'P01', '--recommendation', 'Wait on the P01 approval gate.', '--blocker', 'Temporary test blocker.')

  const updated = JSON.parse(await readFile(progressPath, 'utf8'))
  assert.equal(updated.tasks.find((task) => task.id === 'P03').status, 'Completed')
  assert.ok(updated.tasks.find((task) => task.id === 'P03').completedAt)
  assert.ok(updated.tasks.find((task) => task.id === 'P03').relatedFiles.includes('frontend/src/example.tsx'))
  assert.equal(updated.tasks.find((task) => task.id === 'P05').status, 'Blocked')
  assert.equal(updated.project.nextTaskId, 'P01')
  assert.ok(updated.verificationResults.some((item) => item.name === 'npm run typecheck' && item.result === 'Passed'))

  const activity = JSON.parse(await readFile(join(fixture, 'activity-log.json'), 'utf8'))
  assert.equal(activity.entries.length, 7)
  const executionFiles = await (await import('node:fs/promises')).readdir(join(fixture, 'execution-history'))
  assert.equal(executionFiles.length, 4)
  execFileSync(process.execPath, [join(scripts, 'validate_project_tracker.mjs')], { cwd: temporaryRoot, stdio: 'pipe' })

  await writeFile(progressPath, '{ malformed JSON', 'utf8')
  assert.notEqual(spawnSync(process.execPath, [join(scripts, 'validate_project_tracker.mjs')], { cwd: temporaryRoot }).status, 0, 'malformed tracker JSON should fail validation safely')
  await rm(progressPath)
  assert.notEqual(spawnSync(process.execPath, [join(scripts, 'validate_project_tracker.mjs')], { cwd: temporaryRoot }).status, 0, 'missing tracker data should fail validation safely')

  const releaseRoot = join(temporaryRoot, 'release-test')
  await cp(join(root, 'project-tracker'), join(releaseRoot, 'project-tracker'), { recursive: true })
  await mkdir(join(releaseRoot, 'scripts'), { recursive: true })
  await cp(join(root, 'scripts', 'activate_maintenance_mode.mjs'), join(releaseRoot, 'scripts', 'activate_maintenance_mode.mjs'))
  await cp(join(root, 'scripts', 'validate_project_tracker.mjs'), join(releaseRoot, 'scripts', 'validate_project_tracker.mjs'))
  const releaseProgressPath = join(releaseRoot, 'project-tracker', 'progress.json')
  const releaseRoadmapPath = join(releaseRoot, 'project-tracker', 'roadmap.json')
  const activationArgs = ['--version', 'v1.0.0', '--approved-by', 'Self-test approver', '--approval-at', new Date().toISOString(), '--approval-evidence', 'Temporary fixture approval evidence.', '--release-notes', 'Temporary fixture release notes.']
  const blockedActivation = spawnSync(process.execPath, [join(releaseRoot, 'scripts', 'activate_maintenance_mode.mjs'), ...activationArgs], { cwd: releaseRoot })
  assert.notEqual(blockedActivation.status, 0, 'incomplete roadmap must not activate Maintenance mode')
  assert.equal(JSON.parse(await readFile(releaseProgressPath, 'utf8')).lifecycle.mode, 'Development')
  assert.equal((await (await import('node:fs/promises')).readdir(join(releaseRoot, 'project-tracker', 'archives'))).length, 0)
  const releaseProgress = JSON.parse(await readFile(releaseProgressPath, 'utf8'))
  const releaseRoadmap = JSON.parse(await readFile(releaseRoadmapPath, 'utf8'))
  const completedAt = new Date().toISOString()
  for (const task of releaseProgress.tasks) { task.status = 'Completed'; task.completedAt = completedAt; task.updatedAt = completedAt }
  for (const phase of releaseRoadmap.phases) phase.status = 'Completed'
  await writeFile(releaseProgressPath, JSON.stringify(releaseProgress, null, 2))
  await writeFile(releaseRoadmapPath, JSON.stringify(releaseRoadmap, null, 2))
  activationArgs[activationArgs.indexOf('--approval-at') + 1] = completedAt
  execFileSync(process.execPath, [join(releaseRoot, 'scripts', 'activate_maintenance_mode.mjs'), ...activationArgs], { cwd: releaseRoot, stdio: 'pipe' })
  const maintenanceProgress = JSON.parse(await readFile(releaseProgressPath, 'utf8'))
  assert.equal(maintenanceProgress.lifecycle.mode, 'Maintenance')
  assert.equal(maintenanceProgress.lifecycle.currentVersion, 'v1.0.0')
  assert.equal(maintenanceProgress.lifecycle.releaseApproval.status, 'Approved')
  assert.equal(maintenanceProgress.lifecycle.releases[0].releaseNotes, 'Temporary fixture release notes.')
  const archivedSnapshots = await (await import('node:fs/promises')).readdir(join(releaseRoot, 'project-tracker', 'archives'))
  assert.equal(archivedSnapshots.length, 1)
  const preservedProgress = JSON.parse(await readFile(join(releaseRoot, 'project-tracker', 'archives', archivedSnapshots[0], 'progress.json'), 'utf8'))
  assert.equal(preservedProgress.lifecycle.mode, 'Development', 'development history must be copied before lifecycle transition')
  execFileSync(process.execPath, [join(releaseRoot, 'scripts', 'validate_project_tracker.mjs')], { cwd: releaseRoot, stdio: 'pipe' })
  console.log('Tracker tests passed: initial counts/filters, start/finish logging, verification evidence, blocker handling, next-task updates, unique execution records, malformed/missing-data validation, incomplete-release gate, explicit approval transition and preserved archive copy.')
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}
