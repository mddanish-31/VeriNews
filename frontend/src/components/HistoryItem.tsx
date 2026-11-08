import type { HistoryEntryData } from '../types'
import { Icon } from './Icon'

interface HistoryItemProps {
  entry: HistoryEntryData
}

export function HistoryItem({ entry }: HistoryItemProps) {
  const confidencePercent =
    entry.confidence === null ? null : Math.round(Math.min(100, Math.max(0, entry.confidence)))

  return (
    <article className="flex items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border hover:border-brand-blue/30 transition shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-surface-secondary text-content-secondary flex items-center justify-center flex-shrink-0">
          <Icon name="clock" className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-sm text-content-primary truncate">{entry.title}</h3>
          <p className="text-xs text-content-secondary flex items-center gap-2 mt-0.5">
            <span>{entry.language.toUpperCase()}</span>
            <span>·</span>
            <span>{entry.analyzedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-secondary text-content-primary border border-border">
          {entry.label}
        </span>
        <span className="font-mono text-xs text-content-secondary">
          {confidencePercent === null ? '—' : `${confidencePercent}%`}
        </span>
      </div>
    </article>
  )
}
