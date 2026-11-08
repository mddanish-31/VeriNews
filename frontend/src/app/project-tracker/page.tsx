import { TrackerDashboard } from './tracker-dashboard'
import { loadTrackerSnapshot } from '../../lib/project-tracker-data.server'

export const dynamic = 'force-dynamic'

export default async function ProjectTrackerPage() {
  const result = await loadTrackerSnapshot()
  return <TrackerDashboard snapshot={result.snapshot} error={result.error} warnings={result.warnings} />
}
