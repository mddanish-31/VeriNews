import { TrackerDashboard } from './tracker-dashboard'
import { loadTrackerSnapshot } from '../../lib/project-tracker-data.server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProjectTrackerPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }
  const result = await loadTrackerSnapshot()
  return <TrackerDashboard snapshot={result.snapshot} error={result.error} warnings={result.warnings} />
}
