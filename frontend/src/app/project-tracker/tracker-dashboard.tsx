'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Icon } from '../../components/Icon'
import { ThemeToggle } from '../../components/ThemeToggle'
import { GlassCard } from '../../components/ui/GlassCard'
import { PillBadge } from '../../components/ui/PillBadge'
import type { TaskPriority, TaskStatus, TrackerSnapshot, TrackerTask } from '../../lib/project-tracker-types'

interface TrackerDashboardProps {
  snapshot: TrackerSnapshot | null
  error: string | null
  warnings: string[]
}

const statusBadgeVariants: Record<TaskStatus, 'success' | 'primary' | 'warning' | 'danger' | 'neutral'> = {
  Completed: 'success',
  'In Progress': 'primary',
  Blocked: 'warning',
  Failed: 'danger',
  'Not Started': 'neutral',
}

const priorities: TaskPriority[] = ['High', 'Medium', 'Low']
const statuses: TaskStatus[] = ['Not Started', 'In Progress', 'Completed', 'Blocked', 'Failed']

function formatDate(value: string | null) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not recorded'
    : `${new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(date)} UTC`
}

function TaskDetails({
  task,
  executions,
}: {
  task: TrackerTask
  executions: TrackerSnapshot['executionHistory']
}) {
  const history = executions.filter((entry) => entry.taskIds.includes(task.id))
  return (
    <div className="grid gap-6 border-t border-border/80 px-5 py-6 sm:grid-cols-2 bg-surface-secondary/20">
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-content-muted mb-1">
            Task Description
          </h4>
          <p className="text-content-secondary leading-relaxed">{task.description}</p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs font-mono">
          <dt className="text-content-muted">Created:</dt>
          <dd className="text-content-secondary">{formatDate(task.createdAt)}</dd>
          <dt className="text-content-muted">Updated:</dt>
          <dd className="text-content-secondary">{formatDate(task.updatedAt)}</dd>
          <dt className="text-content-muted">Completed:</dt>
          <dd className="text-content-secondary">{formatDate(task.completedAt)}</dd>
          <dt className="text-content-muted">Category:</dt>
          <dd className="text-content-secondary">{task.assignedCategory}</dd>
        </dl>
        {task.completionTimestampNote && (
          <p className="text-xs text-content-muted italic bg-surface-secondary/50 p-2.5 rounded-lg border border-border/50">
            {task.completionTimestampNote}
          </p>
        )}
        {task.blockerDetails && (
          <div className="rounded-xl border border-status-warning/30 bg-status-warning/10 p-3.5 text-xs text-content-primary">
            <strong className="text-status-warning block mb-0.5">Blocker / Dependency:</strong>
            {task.blockerDetails}
          </div>
        )}
      </div>
      <div className="space-y-4 text-xs">
        <section>
          <h4 className="mb-2 font-mono font-bold uppercase tracking-wider text-content-muted">
            Verification Evidence
          </h4>
          {task.verificationEvidence.length ? (
            <ul className="space-y-1.5 text-content-secondary">
              {task.verificationEvidence.map((evidence, index) => (
                <li key={`${task.id}-evidence-${index}`} className="flex items-start gap-2">
                  <span className="text-brand-blue font-bold">•</span>
                  <span>{evidence}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-content-muted">No verification evidence recorded yet.</p>
          )}
        </section>
        <section>
          <h4 className="mb-2 font-mono font-bold uppercase tracking-wider text-content-muted">
            Related Files
          </h4>
          {task.relatedFiles.length ? (
            <ul className="space-y-1 font-mono text-content-secondary">
              {task.relatedFiles.map((file) => (
                <li className="break-all" key={file}>
                  {file}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-content-muted">None recorded.</p>
          )}
        </section>
        <section className="space-y-1 text-content-secondary pt-2 border-t border-border/50 font-mono text-[11px]">
          <p>
            <strong className="text-content-primary">Execution report:</strong>{' '}
            {task.executionReportRef ?? 'Not recorded'}
          </p>
          <p>
            <strong className="text-content-primary">Git commit:</strong>{' '}
            {task.gitCommitRef ?? 'Not available'}
          </p>
        </section>
        {history.length > 0 && (
          <section className="pt-2 border-t border-border/50">
            <h4 className="mb-2 font-mono font-bold uppercase tracking-wider text-content-muted">
              Execution History ({history.length})
            </h4>
            <ul className="space-y-2">
              {history.map((entry) => (
                <li className="rounded-xl bg-surface-secondary/70 p-3 border border-border/60" key={entry.id}>
                  <p className="font-semibold text-content-primary text-xs">{entry.summary}</p>
                  <p className="mt-1 text-[11px] text-content-muted font-mono">
                    Recorded {formatDate(entry.recordedAt)} · {entry.status}
                  </p>
                  {entry.commands.map((command) => (
                    <p className="mt-1 font-mono text-[11px] text-content-secondary break-all" key={`${entry.id}-${command.command}`}>
                      {command.command}: {command.result}
                    </p>
                  ))}
                  {entry.blockers.map((blocker) => (
                    <p className="mt-1 text-status-warning text-xs" key={blocker}>
                      Blocker: {blocker}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

export function TrackerDashboard({ snapshot, error, warnings }: TrackerDashboardProps) {
  const [phaseFilter, setPhaseFilter] = useState('All phases')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [activeTab, setActiveTab] = useState<'track1' | 'track2'>('track1')

  const visibleTasks = useMemo(() => {
    if (!snapshot) return []
    return snapshot.tasks.filter(
      (task) =>
        (phaseFilter === 'All phases' || task.phaseId === phaseFilter) &&
        (statusFilter === 'All statuses' || task.status === statusFilter) &&
        (priorityFilter === 'All priorities' || task.priority === priorityFilter)
    )
  }, [snapshot, phaseFilter, statusFilter, priorityFilter])

  if (!snapshot) {
    return (
      <main className="min-h-screen bg-main px-4 py-12 text-content-primary sm:px-6">
        <GlassCard variant="elevated" className="mx-auto max-w-2xl p-8 text-center border-status-danger/40">
          <PillBadge label="Tracker Unavailable" variant="danger" className="mb-3" />
          <h1 className="mt-2 font-display text-2xl font-bold text-content-primary">
            Tracker Data Could Not Be Loaded
          </h1>
          <p className="mt-3 text-sm text-content-secondary leading-relaxed">
            {error ?? 'No valid repository project tracker snapshot is currently available.'}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-blue text-white text-xs font-semibold shadow-soft hover:shadow-glow-blue transition"
            >
              <Icon name="arrow" className="w-3.5 h-3.5 rotate-180" />
              <span>Return to VeriNews</span>
            </Link>
          </div>
        </GlassCard>
      </main>
    )
  }

  const counts = statuses.reduce<Record<TaskStatus, number>>(
    (result, status) => {
      result[status] = snapshot.tasks.filter((task) => task.status === status).length
      return result
    },
    { 'Not Started': 0, 'In Progress': 0, Completed: 0, Blocked: 0, Failed: 0 }
  )
  const progressPercent = Math.round((counts.Completed / snapshot.roadmap.length) * 100)
  const activePhases = snapshot.roadmap.filter((phase) =>
    snapshot.project.activePhaseIds.includes(phase.id)
  )

  return (
    <main className="min-h-screen bg-main text-content-primary pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header Strip */}
        <header className="mb-10 flex flex-col justify-between gap-6 border-b border-border/80 pb-8 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-content-secondary hover:text-brand-blue transition mb-4 focus-visible:ring-2 focus-visible:ring-brand-blue rounded-md px-1"
            >
              <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" />
              <span>Back to VeriNews</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 h-5 w-6" aria-hidden="true">
                <span className="w-1.5 h-3.5 bg-brand-blue/70 rounded-full transform -skew-x-12" />
                <span className="w-1.5 h-5 bg-brand-blue rounded-full transform -skew-x-12" />
                <span className="w-1.5 h-4 bg-brand-violet rounded-full transform -skew-x-12" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                VeriNews <span className="text-brand-blue">Control Center</span>
              </h1>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-content-secondary max-w-2xl">
              Authoritative, repository-backed progress and verification dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <PillBadge
              label={`${snapshot.lifecycle.mode} Mode`}
              variant="primary"
              icon={<span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />}
            />
            <PillBadge
              label={snapshot.gitSync.repositoryDetected ? 'Git Connected' : 'Git Unavailable'}
              variant={snapshot.gitSync.repositoryDetected ? 'success' : 'warning'}
              icon={<Icon name="layers" className="w-3.5 h-3.5" />}
            />
          </div>
        </header>

        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-status-danger/30 bg-status-danger/10 p-4 text-sm text-status-danger flex items-center gap-3">
            <Icon name="close" className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {warnings.map((warning) => (
          <div role="status" className="mb-6 rounded-2xl border border-status-warning/30 bg-status-warning/10 p-4 text-sm text-content-primary flex items-center gap-3" key={warning}>
            <Icon name="shield" className="w-5 h-5 text-status-warning flex-shrink-0" />
            <span>{warning}</span>
          </div>
        ))}

        {/* Overview Hero Section */}
        <section aria-labelledby="overview-title" className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] mb-10">
          <GlassCard variant="elevated" glowEffect className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-content-muted">
                  Track 1 Core Completion
                </span>
                <h2 id="overview-title" className="mt-1 font-display text-4xl sm:text-5xl font-extrabold text-content-primary">
                  {progressPercent}%
                </h2>
              </div>
              <PillBadge
                label={`${counts.Completed} of ${snapshot.roadmap.length} phases completed`}
                variant="success"
              />
            </div>

            <div
              className="mt-6 h-3 overflow-hidden rounded-full bg-surface-secondary border border-border/60"
              role="progressbar"
              aria-label="Completed roadmap phases"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-violet transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-content-muted">
              {snapshot.project.progressMethod}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {statuses.map((status) => (
                <div className="rounded-xl border border-border/80 bg-surface-secondary/50 p-3" key={status}>
                  <p className="text-2xl font-bold font-mono text-content-primary">{counts[status]}</p>
                  <p className="mt-1 text-xs text-content-secondary">{status}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="flex flex-col gap-5">
            <GlassCard variant="default" className="p-6">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-blue block mb-1">
                Current Active Phases
              </span>
              <h3 className="font-display text-lg font-bold text-content-primary">
                {activePhases.length
                  ? activePhases.map((phase) => `${phase.id} · ${phase.title}`).join(' + ')
                  : 'None recorded'}
              </h3>
              <p className="mt-2 text-xs text-content-secondary leading-relaxed">
                {activePhases.map((phase) => phase.stateNote).join(' ')}
              </p>
            </GlassCard>

            <GlassCard variant="elevated" className="p-6 border-brand-blue/30 bg-brand-blue/5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-blue block mb-1">
                Next Recommendation · {snapshot.project.nextTaskId}
              </span>
              <h3 className="font-display text-base font-bold text-content-primary">
                {snapshot.project.nextRecommendedTask}
              </h3>
              <p className="mt-2 text-[11px] text-content-muted leading-relaxed">
                Recommendation only; no roadmap phase auto-starts. Stop for mentor/owner review after each authorized task.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* Dual-Track Selector */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-surface-secondary/60 rounded-2xl border border-border/70 max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('track1')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition ${
              activeTab === 'track1'
                ? 'bg-surface text-brand-blue shadow-xs border border-border/70'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            Track 1: Core Platform (P00–P15)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('track2')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition ${
              activeTab === 'track2'
                ? 'bg-surface text-brand-violet shadow-xs border border-border/70'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            Track 2: Redesign (Phases 1–5)
          </button>
        </div>

        {/* Track 2 Redesign Showcase */}
        {activeTab === 'track2' ? (
          <section className="space-y-4 mb-10">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-extrabold text-content-primary">
                Track 2: Premium UI Redesign (Phases 1–5)
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary mt-1">
                Ponytail-driven modern glassmorphic experience redesign with Three.js, GSAP, and Lenis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <GlassCard variant="default" className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-brand-blue">Phase 1</span>
                    <PillBadge label="Completed & Approved" variant="success" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-content-primary">
                    Foundational Design System & Base UI Atoms
                  </h3>
                  <p className="mt-2 text-xs text-content-secondary leading-relaxed">
                    Design tokens, glassmorphism utilities, Lenis + GSAP SmoothScrollProvider, GlassCard, PillBadge, MagneticButton, CustomCursor.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-mono text-content-muted">
                  Validation: 9/9 Browser QA PASS · 100% Complete
                </div>
              </GlassCard>

              <GlassCard variant="default" className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-brand-blue">Phase 2</span>
                    <PillBadge label="Completed & Approved" variant="success" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-content-primary">
                    WebGL Particle Hero & Cinematic Motion
                  </h3>
                  <p className="mt-2 text-xs text-content-secondary leading-relaxed">
                    Vanilla Three.js particle field, GLSL wave horizon shader, GSAP entrance timeline, theme sync, reduced-motion compliance.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-mono text-content-muted">
                  Validation: 10/10 Browser QA PASS · 100% Complete
                </div>
              </GlassCard>

              <GlassCard variant="elevated" glowEffect className="p-6 flex flex-col justify-between border-brand-blue/30">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-brand-blue">Phase 3</span>
                    <PillBadge label="OWNER APPROVED" variant="success" glowing />
                  </div>
                  <h3 className="font-display font-bold text-lg text-content-primary">
                    Complete Homepage Experience
                  </h3>
                  <p className="mt-2 text-xs text-content-secondary leading-relaxed">
                    10-point homepage: responsive navbar, WebGL hero integration, redesigned Analyzer, AnalysisResult with live web sources, 3 feature pillars, and footer.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-mono text-content-muted">
                  Validation: 11/11 Browser QA PASS · 100% Complete
                </div>
              </GlassCard>

              <GlassCard variant="default" className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-brand-blue">Phase 4</span>
                    <PillBadge label="OWNER APPROVED" variant="success" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-content-primary">
                    Remaining Screens & Experiences
                  </h3>
                  <p className="mt-2 text-xs text-content-secondary leading-relaxed">
                    Redesigned accessible InfoModals (Methodology, Limitations, FAQ, Privacy, Terms), circular focus cycling in mobile drawer, and redesigned Project Tracker dashboard.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-mono text-content-muted">
                  Validation: 14/14 Browser QA PASS · 100% Complete
                </div>
              </GlassCard>

              <GlassCard variant="default" className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-brand-blue">Phase 5</span>
                    <PillBadge label="OWNER APPROVED" variant="success" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-content-primary">
                    Final QA & Optimization
                  </h3>
                  <p className="mt-2 text-xs text-content-secondary leading-relaxed">
                    Cross-browser verification, responsive multi-viewport audit, WebGL context loss recovery, accessibility WCAG 2.1 AA audit, and full backend ML regressions.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-[11px] font-mono text-content-muted">
                  Validation: 14/14 QA PASS · 100% Complete
                </div>
              </GlassCard>
            </div>
          </section>
        ) : (
          /* Track 1 Tasks Section */
          <section className="mb-10" aria-labelledby="roadmap-title">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end mb-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-blue">
                  P00–P15 Foundation
                </span>
                <h2 id="roadmap-title" className="mt-1 font-display text-2xl font-extrabold text-content-primary">
                  Core Platform Tasks
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-content-secondary">
                  Read-only status dashboard. Canonical updates execute via local OpenCode scripts.
                </p>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <label className="text-xs font-medium text-content-secondary">
                  Phase
                  <select
                    className="mt-1 min-h-[40px] w-full rounded-xl border border-border bg-surface px-3 text-xs text-content-primary focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    value={phaseFilter}
                    onChange={(e) => setPhaseFilter(e.target.value)}
                  >
                    <option>All phases</option>
                    {snapshot.roadmap.map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.id} · {phase.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-content-secondary">
                  Status
                  <select
                    className="mt-1 min-h-[40px] w-full rounded-xl border border-border bg-surface px-3 text-xs text-content-primary focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All statuses</option>
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-content-secondary">
                  Priority
                  <select
                    className="mt-1 min-h-[40px] w-full rounded-xl border border-border bg-surface px-3 text-xs text-content-primary focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option>All priorities</option>
                    {priorities.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {visibleTasks.map((task) => {
                const phase = snapshot.roadmap.find((item) => item.id === task.phaseId)
                return (
                  <details
                    className="group overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-xs open:shadow-soft transition duration-150"
                    key={task.id}
                  >
                    <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 sm:p-5 marker:hidden hover:bg-surface-secondary/40 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand-blue">{task.phaseId}</span>
                          <h3 className="font-display font-bold text-sm sm:text-base text-content-primary">
                            {phase?.title ?? task.title}
                          </h3>
                        </div>
                        <p className="mt-1 text-xs text-content-secondary leading-relaxed">
                          {phase?.stateNote}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        <PillBadge label={task.status} variant={statusBadgeVariants[task.status]} />
                        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-mono text-content-secondary">
                          {task.priority}
                        </span>
                        <Icon
                          name="chevron"
                          className="h-4 w-4 text-content-muted transition-transform group-open:rotate-180"
                        />
                      </div>
                    </summary>
                    <TaskDetails task={task} executions={snapshot.executionHistory} />
                  </details>
                )
              })}
              {!visibleTasks.length && (
                <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-sm text-content-secondary">
                  No tasks match the selected filters.
                </div>
              )}
            </div>
          </section>
        )}

        {/* Verification and Git Synchronization */}
        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          <GlassCard variant="default" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="check" className="h-5 w-5 text-brand-blue" />
              <h2 className="font-display text-lg font-bold text-content-primary">Latest Verification Results</h2>
            </div>
            <ul className="space-y-3">
              {snapshot.verificationResults.map((check, index) => (
                <li
                  className="flex flex-wrap items-start justify-between gap-2 border-t border-border/60 pt-3 first:border-0 first:pt-0"
                  key={`${check.name}-${check.recordedAt}-${index}`}
                >
                  <div className="pr-2">
                    <p className="text-xs sm:text-sm font-medium text-content-primary">{check.name}</p>
                    <p className="mt-0.5 text-[11px] text-content-muted font-mono">{check.source}</p>
                  </div>
                  <PillBadge
                    label={check.result}
                    variant={check.result === 'Passed' ? 'success' : check.result === 'Failed' ? 'danger' : 'warning'}
                  />
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard variant="default" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="layers" className="h-5 w-5 text-brand-violet" />
              <h2 className="font-display text-lg font-bold text-content-primary">Git Synchronization</h2>
            </div>
            <p className="text-sm font-semibold text-content-primary">{snapshot.gitSync.status}</p>
            <p className="mt-1 text-xs text-content-secondary leading-relaxed">{snapshot.gitSync.explanation}</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-xs font-mono">
              <dt className="text-content-muted">Remote:</dt>
              <dd className="break-all text-content-secondary">{snapshot.gitSync.remote ?? 'None detected'}</dd>
              <dt className="text-content-muted">Head Commit:</dt>
              <dd className="break-all text-content-secondary">{snapshot.gitSync.headCommit ?? 'None detected'}</dd>
              <dt className="text-content-muted">Workflow Checks:</dt>
              <dd className="text-content-secondary">
                {snapshot.gitSync.workflowChecks.length ? snapshot.gitSync.workflowChecks.length : 'Unavailable'}
              </dd>
            </dl>
          </GlassCard>
        </section>

        {/* Recent Activity Log Stream */}
        <GlassCard variant="default" className="p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="clock" className="h-5 w-5 text-brand-blue" />
            <h2 className="font-display text-lg font-bold text-content-primary">Recent Project Activity</h2>
          </div>
          {snapshot.activity.length ? (
            <ol className="space-y-4">
              {snapshot.activity.slice(0, 10).map((entry) => (
                <li className="flex gap-3 border-l-2 border-brand-blue/30 pl-4 py-0.5" key={entry.id}>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-content-primary">
                      {entry.type}
                      {entry.taskId ? ` · ${entry.taskId}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-content-secondary leading-relaxed">{entry.summary}</p>
                    <p className="mt-1 text-[11px] text-content-muted font-mono">
                      Recorded {formatDate(entry.recordedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-content-secondary">No activity has been recorded.</p>
          )}
        </GlassCard>

        {/* Read-Only Footer Note */}
        <footer className="border-t border-border/80 pt-6 text-xs text-content-muted flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Repository-backed JSON records. The dashboard is strictly read-only. Updates follow the validated workflow in <code className="font-mono">project-tracker/README.md</code>.
          </p>
          <div className="flex items-center gap-1.5 text-content-muted flex-shrink-0">
            <Icon name="shield" className="w-3.5 h-3.5 text-status-success" />
            <span>Strict Zero Content Retention</span>
          </div>
        </footer>
      </div>
    </main>
  )
}
