export const TASK_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Blocked', 'Failed'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]
export type TaskPriority = 'High' | 'Medium' | 'Low'

export interface TrackerPhase {
  id: string
  title: string
  description: string
  status: TaskStatus
  stateNote: string
}

export interface TrackerTask {
  id: string
  phaseId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: string
  updatedAt: string
  completedAt: string | null
  completionTimestampNote: string | null
  assignedCategory: string
  verificationEvidence: string[]
  relatedFiles: string[]
  executionReportRef: string | null
  gitCommitRef: string | null
  blockerDetails: string | null
}

export interface TrackerActivity {
  id: string
  recordedAt: string
  occurredAt: string | null
  taskId: string | null
  phaseId: string | null
  type: string
  summary: string
  executionReportRef: string | null
}

export interface VerificationResult {
  name: string
  result: 'Passed' | 'Failed' | 'Pending' | 'Blocked'
  executedAt: string | null
  recordedAt: string
  source: string
}

export interface ExecutionRecord {
  id: string
  recordedAt: string
  startedAt: string | null
  completedAt: string | null
  recordOrigin: string
  taskIds: string[]
  status: TaskStatus
  summary: string
  filesChanged: string[]
  commands: Array<{ command: string; result: string; details?: string }>
  errors: string[]
  blockers: string[]
  commitRef: string | null
  executionReportRef: string | null
  mentorReview: string
}

export interface TrackerSnapshot {
  roadmap: TrackerPhase[]
  project: {
    name: string
    status: string
    activePhaseIds: string[]
    nextTaskId: string
    nextRecommendedTask: string
    progressMethod: string
  }
  lifecycle: {
    mode: 'Development' | 'Maintenance'
    releaseApproval: { status: string; approvedAt: string | null; approvedBy: string | null; evidenceRef: string | null }
    currentVersion: string | null
    releases: Array<Record<string, unknown>>
    deployments: Array<Record<string, unknown>>
    maintenanceItems: Array<Record<string, unknown>>
  }
  tasks: TrackerTask[]
  activity: TrackerActivity[]
  executionHistory: ExecutionRecord[]
  verificationResults: VerificationResult[]
  gitSync: {
    status: string
    observedAt: string
    repositoryDetected: boolean
    remote: string | null
    headCommit: string | null
    workflowChecks: Array<Record<string, unknown>>
    explanation: string
  }
}

export interface TrackerLoadResult {
  snapshot: TrackerSnapshot | null
  error: string | null
  warnings: string[]
}
