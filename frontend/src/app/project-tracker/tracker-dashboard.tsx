'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Icon } from '../../components/Icon'
import type { TaskPriority, TaskStatus, TrackerSnapshot, TrackerTask } from '../../lib/project-tracker-types'

interface TrackerDashboardProps {
  snapshot: TrackerSnapshot | null
  error: string | null
  warnings: string[]
}

const statusStyles: Record<TaskStatus, string> = {
  Completed: 'bg-status-success-bg text-status-success border-status-success-border',
  'In Progress': 'bg-brand-blue/10 text-brand-blue border-brand-blue/30',
  Blocked: 'bg-status-warning-bg text-status-warning border-status-warning-border',
  Failed: 'bg-status-danger-bg text-status-danger border-status-danger-border',
  'Not Started': 'bg-surface-secondary text-content-secondary border-border',
}

const priorities: TaskPriority[] = ['High', 'Medium', 'Low']
const statuses: TaskStatus[] = ['Not Started', 'In Progress', 'Completed', 'Blocked', 'Failed']

function formatDate(value: string | null) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not recorded'
    : `${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(date)} UTC`
}

function recordText(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'string' && value ? value : 'Not recorded'
}

function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>{status}</span>
}

function TaskDetails({ task, executions }: { task: TrackerTask; executions: TrackerSnapshot['executionHistory'] }) {
  const history = executions.filter((entry) => entry.taskIds.includes(task.id))
  return (
    <div className="grid gap-5 border-t border-border px-5 py-5 sm:grid-cols-2">
      <div className="space-y-3 text-sm">
        <p className="text-content-secondary">{task.description}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs">
          <dt className="text-content-muted">Created</dt><dd className="text-content-secondary">{formatDate(task.createdAt)}</dd>
          <dt className="text-content-muted">Updated</dt><dd className="text-content-secondary">{formatDate(task.updatedAt)}</dd>
          <dt className="text-content-muted">Completed</dt><dd className="text-content-secondary">{formatDate(task.completedAt)}</dd>
          <dt className="text-content-muted">Category</dt><dd className="text-content-secondary">{task.assignedCategory}</dd>
        </dl>
        {task.completionTimestampNote && <p className="text-xs text-content-muted">{task.completionTimestampNote}</p>}
        {task.blockerDetails && <p className="rounded-lg border border-status-warning-border bg-status-warning-bg p-3 text-xs text-content-primary"><strong>Blocker / note:</strong> {task.blockerDetails}</p>}
      </div>
      <div className="space-y-4 text-xs">
        <section>
          <h4 className="mb-2 font-semibold text-content-primary">Verification evidence</h4>
          {task.verificationEvidence.length ? <ul className="list-disc space-y-1 pl-4 text-content-secondary">{task.verificationEvidence.map((evidence, index) => <li key={`${task.id}-evidence-${index}`}>{evidence}</li>)}</ul> : <p className="text-content-muted">No verification evidence recorded yet.</p>}
        </section>
        <section>
          <h4 className="mb-2 font-semibold text-content-primary">Related files</h4>
          {task.relatedFiles.length ? <ul className="space-y-1 font-mono text-content-secondary">{task.relatedFiles.map((file) => <li className="break-all" key={file}>{file}</li>)}</ul> : <p className="text-content-muted">None recorded.</p>}
        </section>
        <section className="space-y-1 text-content-secondary">
          <p><strong className="text-content-primary">Execution report:</strong> {task.executionReportRef ?? 'Not recorded'}</p>
          <p><strong className="text-content-primary">Git commit:</strong> {task.gitCommitRef ?? 'Not available'}</p>
        </section>
        <section>
          <h4 className="mb-2 font-semibold text-content-primary">Execution history</h4>
          {history.length ? <ul className="space-y-2">{history.map((entry) => <li className="rounded-lg bg-surface-secondary p-3" key={entry.id}><p className="font-semibold text-content-primary">{entry.summary}</p><p className="mt-1 text-content-muted">Recorded {formatDate(entry.recordedAt)} · {entry.status}</p>{entry.commands.map((command) => <p className="mt-1 font-mono text-content-secondary" key={`${entry.id}-${command.command}`}>{command.command}: {command.result}</p>)}{entry.blockers.map((blocker) => <p className="mt-1 text-status-warning" key={blocker}>Blocker: {blocker}</p>)}</li>)}</ul> : <p className="text-content-muted">No execution report is available.</p>}
        </section>
      </div>
    </div>
  )
}

export function TrackerDashboard({ snapshot, error, warnings }: TrackerDashboardProps) {
  const [phaseFilter, setPhaseFilter] = useState('All phases')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')

  const visibleTasks = useMemo(() => {
    if (!snapshot) return []
    return snapshot.tasks.filter((task) =>
      (phaseFilter === 'All phases' || task.phaseId === phaseFilter) &&
      (statusFilter === 'All statuses' || task.status === statusFilter) &&
      (priorityFilter === 'All priorities' || task.priority === priorityFilter),
    )
  }, [snapshot, phaseFilter, statusFilter, priorityFilter])

  if (!snapshot) {
    return (
      <main className="min-h-screen bg-main px-4 py-12 text-content-primary sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-status-danger-border bg-surface p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-status-danger">Project tracker unavailable</p>
          <h1 className="mt-2 font-display text-2xl font-bold">Tracker data could not be loaded</h1>
          <p className="mt-3 text-sm text-content-secondary">{error ?? 'No valid tracker snapshot is available.'}</p>
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold hover:bg-surface-secondary">Return to VeriNews</Link>
        </div>
      </main>
    )
  }

  const counts = statuses.reduce<Record<TaskStatus, number>>((result, status) => {
    result[status] = snapshot.tasks.filter((task) => task.status === status).length
    return result
  }, { 'Not Started': 0, 'In Progress': 0, Completed: 0, Blocked: 0, Failed: 0 })
  const progressPercent = Math.round((counts.Completed / snapshot.roadmap.length) * 100)
  const activePhases = snapshot.roadmap.filter((phase) => snapshot.project.activePhaseIds.includes(phase.id))

  return (
    <main className="min-h-screen bg-main text-content-primary">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-content-secondary hover:text-brand-blue"><Icon name="arrow" className="h-4 w-4 rotate-180" /> Back to VeriNews</Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Project Control Center</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{snapshot.project.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-content-secondary">{snapshot.project.status}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-brand-blue/30 bg-brand-blue/10 px-4 text-sm font-semibold text-brand-blue"><span className="h-2 w-2 rounded-full bg-brand-blue" />{snapshot.lifecycle.mode} Mode</span>
            <span className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${snapshot.gitSync.repositoryDetected ? 'border-status-success-border bg-status-success-bg text-status-success' : 'border-status-warning-border bg-status-warning-bg text-status-warning'}`}><Icon name="layers" className="h-4 w-4" />Git: {snapshot.gitSync.status}</span>
          </div>
        </header>

        {error && <div role="alert" className="mb-5 rounded-xl border border-status-danger-border bg-status-danger-bg p-4 text-sm text-status-danger">{error}</div>}
        {warnings.map((warning) => <div role="status" className="mb-5 rounded-xl border border-status-warning-border bg-status-warning-bg p-4 text-sm text-content-primary" key={warning}>{warning}</div>)}

        <section aria-labelledby="overview-title" className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-content-secondary">Overall progress</p><h2 id="overview-title" className="mt-1 font-display text-3xl font-extrabold">{progressPercent}%</h2></div>
              <span className="rounded-full bg-surface-secondary px-3 py-1.5 text-xs font-medium text-content-secondary">{counts.Completed} of {snapshot.roadmap.length} phases complete</span>
            </div>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-surface-secondary" role="progressbar" aria-label="Completed roadmap phases" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}><div className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-violet transition-[width]" style={{ width: `${progressPercent}%` }} /></div>
            <p className="mt-3 text-xs leading-relaxed text-content-muted">{snapshot.project.progressMethod}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {statuses.map((status) => <div className="rounded-xl border border-border bg-main p-3" key={status}><p className="text-2xl font-bold tabular-nums">{counts[status]}</p><p className="mt-1 text-xs text-content-secondary">{status}</p></div>)}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6" aria-labelledby="active-phase-title">
              <p className="text-xs font-semibold uppercase tracking-wider text-content-secondary">Current active phase</p>
              <h2 id="active-phase-title" className="mt-2 font-display text-xl font-bold">{activePhases.length ? activePhases.map((phase) => `${phase.id} · ${phase.title}`).join(' + ') : 'None recorded'}</h2>
              <p className="mt-2 text-sm text-content-secondary">{activePhases.map((phase) => phase.stateNote).join(' ')}</p>
            </section>
            <section className="rounded-2xl border border-brand-blue/25 bg-brand-blue/5 p-5 sm:p-6" aria-labelledby="next-task-title">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-blue">Next recommended task · {snapshot.project.nextTaskId}</p>
              <h2 id="next-task-title" className="mt-2 font-display text-lg font-bold">{snapshot.project.nextRecommendedTask}</h2>
              <p className="mt-2 text-xs text-content-secondary">Recommendation only; no roadmap phase auto-starts. Stop for mentor review after the requested task.</p>
            </section>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6" aria-labelledby="verification-title">
            <div className="flex items-center gap-2"><Icon name="check" className="h-5 w-5 text-brand-blue" /><h2 id="verification-title" className="font-display text-lg font-bold">Latest verification</h2></div>
            <ul className="mt-4 space-y-3">{snapshot.verificationResults.map((check, index) => <li className="flex flex-wrap items-start justify-between gap-2 border-t border-border pt-3 first:border-0 first:pt-0" key={`${check.name}-${check.recordedAt}-${index}`}><div><p className="text-sm font-medium text-content-primary">{check.name}</p><p className="mt-1 text-xs text-content-muted">{check.source}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${check.result === 'Passed' ? 'bg-status-success-bg text-status-success' : check.result === 'Failed' ? 'bg-status-danger-bg text-status-danger' : 'bg-status-warning-bg text-status-warning'}`}>{check.result}</span></li>)}</ul>
          </section>
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6" aria-labelledby="git-title">
            <div className="flex items-center gap-2"><Icon name="layers" className="h-5 w-5 text-brand-violet" /><h2 id="git-title" className="font-display text-lg font-bold">GitHub synchronization</h2></div>
            <p className="mt-3 text-sm font-semibold">{snapshot.gitSync.status}</p><p className="mt-1 text-sm text-content-secondary">{snapshot.gitSync.explanation}</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs"><dt className="text-content-muted">Remote</dt><dd className="break-all text-content-secondary">{snapshot.gitSync.remote ?? 'None detected'}</dd><dt className="text-content-muted">Commit</dt><dd className="break-all font-mono text-content-secondary">{snapshot.gitSync.headCommit ?? 'None detected'}</dd><dt className="text-content-muted">Workflow checks</dt><dd className="text-content-secondary">{snapshot.gitSync.workflowChecks.length ? snapshot.gitSync.workflowChecks.length : 'Unavailable'}</dd></dl>
          </section>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6" aria-labelledby="lifecycle-title">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-content-secondary">Lifecycle</p><h2 id="lifecycle-title" className="mt-1 font-display text-xl font-bold">{snapshot.lifecycle.mode === 'Development' ? 'Development roadmap active' : `Maintenance · ${snapshot.lifecycle.currentVersion ?? 'Version not recorded'}`}</h2></div><span className="rounded-full border border-status-warning-border bg-status-warning-bg px-3 py-1.5 text-xs font-semibold text-status-warning">Release approval: {snapshot.lifecycle.releaseApproval.status}</span></div>
          {snapshot.lifecycle.mode === 'Development' ? <p className="mt-3 text-sm text-content-secondary">Maintenance mode is not active. Switching requires explicit release approval with a recorded approver, timestamp and evidence; completing every task does not trigger a release.</p> : <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <section><h3 className="font-semibold">Releases and notes</h3>{snapshot.lifecycle.releases.length ? <ul className="mt-2 space-y-2">{snapshot.lifecycle.releases.map((release, index) => <li className="rounded-xl bg-surface-secondary p-3" key={`release-${index}`}><p className="font-semibold">{recordText(release, 'version')} · {recordText(release, 'status')}</p><p className="mt-1">{recordText(release, 'releaseNotes')}</p><p className="mt-1 text-xs text-content-muted">{recordText(release, 'releasedAt')} · Approval: {recordText(release, 'approvalRef')}</p></li>)}</ul> : <p className="mt-2 text-sm text-content-secondary">No releases recorded.</p>}</section>
            <section><h3 className="font-semibold">Deployments</h3>{snapshot.lifecycle.deployments.length ? <ul className="mt-2 space-y-2">{snapshot.lifecycle.deployments.map((deployment, index) => <li className="rounded-xl bg-surface-secondary p-3" key={`deployment-${index}`}><p className="font-semibold">{recordText(deployment, 'environment')} · {recordText(deployment, 'status')}</p><p className="mt-1 text-xs text-content-muted">{recordText(deployment, 'deployedAt')} · {recordText(deployment, 'releaseVersion')}</p></li>)}</ul> : <p className="mt-2 text-sm text-content-secondary">No deployments recorded.</p>}</section>
            <section><h3 className="font-semibold">Maintenance work</h3>{snapshot.lifecycle.maintenanceItems.length ? <ul className="mt-2 space-y-2">{snapshot.lifecycle.maintenanceItems.map((item, index) => <li className="rounded-xl bg-surface-secondary p-3" key={`maintenance-${index}`}><p className="font-semibold">{recordText(item, 'kind')} · {recordText(item, 'title')}</p><p className="mt-1">{recordText(item, 'description')}</p><p className="mt-1 text-xs text-content-muted">{recordText(item, 'status')} · {recordText(item, 'relatedVersion')}</p></li>)}</ul> : <p className="mt-2 text-sm text-content-secondary">No maintenance items recorded.</p>}</section>
          </div>}
        </section>

        <section className="mt-8" aria-labelledby="roadmap-title">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">P00–P15</p><h2 id="roadmap-title" className="mt-1 font-display text-2xl font-extrabold">Roadmap tasks</h2><p className="mt-1 text-sm text-content-secondary">Read-only dashboard. Update status through the documented local OpenCode workflow.</p></div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className="text-xs font-medium text-content-secondary">Phase<select className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)}><option>All phases</option>{snapshot.roadmap.map((phase) => <option key={phase.id} value={phase.id}>{phase.id}</option>)}</select></label>
              <label className="text-xs font-medium text-content-secondary">Status<select className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              <label className="text-xs font-medium text-content-secondary">Priority<select className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option>All priorities</option>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {visibleTasks.map((task) => {
              const phase = snapshot.roadmap.find((item) => item.id === task.phaseId)
              return <details className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-xs open:shadow-soft" key={task.id}><summary className="flex cursor-pointer list-none flex-col gap-3 p-4 marker:hidden hover:bg-surface-secondary/50 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-brand-blue">{task.phaseId}</span><h3 className="font-display font-bold">{phase?.title ?? task.title}</h3></div><p className="mt-1 text-sm text-content-secondary">{phase?.stateNote}</p></div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={task.status} /><span className="rounded-full border border-border px-2.5 py-1 text-xs text-content-secondary">{task.priority} priority</span><span className="sr-only">Expand task details</span><Icon name="chevron" className="h-4 w-4 text-content-muted transition-transform group-open:rotate-180" /></div></summary><TaskDetails task={task} executions={snapshot.executionHistory} /></details>
            })}
            {!visibleTasks.length && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-content-secondary">No tasks match these filters.</p>}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6" aria-labelledby="activity-title">
          <div className="flex items-center gap-2"><Icon name="clock" className="h-5 w-5 text-brand-blue" /><h2 id="activity-title" className="font-display text-lg font-bold">Recent activity</h2></div>
          {snapshot.activity.length ? <ol className="mt-4 space-y-4">{snapshot.activity.slice(0, 8).map((entry) => <li className="flex gap-3 border-l-2 border-border pl-4" key={entry.id}><div><p className="text-sm font-semibold text-content-primary">{entry.type}{entry.taskId ? ` · ${entry.taskId}` : ''}</p><p className="mt-1 text-sm text-content-secondary">{entry.summary}</p><p className="mt-1 text-xs text-content-muted">Recorded {formatDate(entry.recordedAt)}{entry.occurredAt ? ` · Occurred ${formatDate(entry.occurredAt)}` : ' · Original event time not recorded'}</p></div></li>)}</ol> : <p className="mt-4 text-sm text-content-secondary">No activity has been recorded.</p>}
        </section>

        <footer className="mt-10 border-t border-border pt-5 text-xs text-content-muted">Tracker records are repository-backed JSON. The dashboard is read-only; local OpenCode execution updates use the validated workflow in <code>project-tracker/README.md</code>. No secrets are stored.</footer>
      </div>
    </main>
  )
}
