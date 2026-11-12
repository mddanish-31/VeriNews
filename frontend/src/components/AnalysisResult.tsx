'use client'

import type { AnalysisResultData } from '../types'
import { Icon } from './Icon'
import { GlassCard } from './ui/GlassCard'
import { PillBadge } from './ui/PillBadge'

interface AnalysisResultProps {
  result: AnalysisResultData
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  // Support both live evidence verification status and statistical prediction label
  const status = result.status || result.prediction

  const isSupported =
    status === 'Supported by Available Evidence' ||
    status === 'Credible' ||
    status === 'Real'
  const isContradicted =
    status === 'Contradicted by Available Evidence' ||
    status === 'Unreliable' ||
    status === 'Fake'
  const isPartiallySupported = status === 'Partially Supported'
  const isMisleading = status === 'Misleading or Missing Context'

  const isOutOfDomain =
    status === 'Unclassifiable / Out of Domain' ||
    status === 'Unclassifiable' ||
    result.confidence === null ||
    result.confidence === undefined

  const getStatusBadge = () => {
    if (isSupported) {
      return <PillBadge label="✓ Corroborated / Credible Pattern" variant="success" glowing />
    }
    if (isContradicted) {
      return <PillBadge label="⚠ Refuted / Disputed Pattern" variant="danger" glowing />
    }
    if (isPartiallySupported) {
      return <PillBadge label="◈ Partially Supported" variant="primary" />
    }
    if (isMisleading) {
      return <PillBadge label="⚡ Context Needed / Misleading" variant="warning" glowing />
    }
    return <PillBadge label="? Insufficient Evidence / Out of Domain" variant="neutral" />
  }

  const getStatusDotColor = () => {
    if (isSupported) return 'bg-status-success'
    if (isContradicted) return 'bg-status-danger'
    if (isPartiallySupported) return 'bg-brand-blue'
    if (isMisleading) return 'bg-status-warning'
    return 'bg-content-muted'
  }

  return (
    <GlassCard
      id="analysis-result"
      variant="elevated"
      glowEffect
      className="p-5 sm:p-8 mt-8 overflow-hidden break-words [overflow-wrap:anywhere]"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/80">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-blue">
            Verification Assessment
          </span>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-content-primary mt-0.5 leading-[1.15] overflow-visible break-words">
            Analysis & Evidence Findings
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {result.detectedLanguage && (
            <PillBadge
              label={result.detectedLanguage}
              variant="violet"
              icon={<Icon name="globe" className="w-3 h-3 text-brand-violet" />}
            />
          )}
          {result.latencyMs !== undefined && result.latencyMs !== null && (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-surface-secondary text-content-muted border border-border/60">
              {result.latencyMs} ms
            </span>
          )}
        </div>
      </div>

      {/* Main Status Display */}
      {!status ? (
        <p className="mt-5 text-sm text-content-secondary">
          No verification is available. Please enter a news claim or URL and click Verify News.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {/* Primary Assessment Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-surface-secondary/70 border border-border/70">
            <div>
              <span className="text-xs font-mono text-content-muted uppercase tracking-wider block">
                Result Classification
              </span>
              <div className="flex items-center gap-2.5 mt-1">
                <span className={`w-3.5 h-3.5 rounded-full ${getStatusDotColor()} animate-pulse`} />
                <strong className="font-display font-extrabold text-xl sm:text-2xl text-content-primary">
                  {status}
                </strong>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge()}
            </div>
          </div>

          {/* Calibrated Probability Gauge (Suppressed for Out of Domain) */}
          {!isOutOfDomain && typeof result.confidence === 'number' ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-secondary/50 border border-border/60">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-content-primary uppercase">
                    Calibrated Posterior Probability
                  </span>
                  {result.confidenceTier && (
                    <span className="text-[11px] text-content-secondary">
                      ({result.confidenceTier})
                    </span>
                  )}
                </div>
                <span className="font-mono text-sm font-extrabold text-brand-blue">
                  {result.confidence}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden border border-border/60">
                <div
                  className={`h-full transition-all duration-700 ease-out ${
                    isSupported
                      ? 'bg-gradient-to-r from-brand-blue to-status-success'
                      : 'bg-gradient-to-r from-status-warning to-status-danger'
                  }`}
                  style={{ width: `${Math.min(Math.max(result.confidence, 5), 100)}%` }}
                />
              </div>
            </div>
          ) : isOutOfDomain ? (
            <div className="p-4 rounded-xl bg-surface-secondary/40 border border-border/60 flex items-center gap-3 text-xs text-content-secondary">
              <Icon name="shield" className="w-4 h-4 text-content-muted flex-shrink-0" />
              <span>
                <strong>Out of Domain / Not Applicable:</strong> Confidence scoring is suppressed because the submitted text contains no in-vocabulary tokens.
              </span>
            </div>
          ) : null}

          {/* Claim Checked & Summary */}
          {(result.claimChecked || result.summary) && (
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-secondary/60 border border-border/60 space-y-2">
              {result.claimChecked && (
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted block">
                    Claim Statement
                  </span>
                  <p className="text-sm font-medium text-content-primary mt-0.5 leading-relaxed break-words [overflow-wrap:anywhere]">
                    {result.claimChecked}
                  </p>
                </div>
              )}
              {result.summary && (
                <div className="pt-2 border-t border-border/50">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted block">
                    Core Summary
                  </span>
                  <p className="text-xs sm:text-sm text-content-secondary mt-0.5 leading-relaxed break-words [overflow-wrap:anywhere]">
                    {result.summary}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          {result.explanation && (
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-secondary/80 border border-border/70">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted block mb-1.5">
                Linguistic & Statistical Attribution
              </span>
              <p className="text-sm text-content-primary leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
                {result.explanation}
              </p>
            </div>
          )}

          {/* Supporting Evidence Breakdown */}
          {result.supportingEvidence && result.supportingEvidence.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-status-success/5 border border-status-success/20">
              <div className="flex items-center gap-2 mb-2.5 text-status-success">
                <Icon name="check" className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Supporting Evidence ({result.supportingEvidence.length})
                </span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-content-primary">
                {result.supportingEvidence.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-status-success font-bold mt-0.5">•</span>
                    <span className="leading-relaxed break-words [overflow-wrap:anywhere]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contradictory Evidence Breakdown */}
          {result.contradictoryEvidence && result.contradictoryEvidence.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-status-danger/5 border border-status-danger/20">
              <div className="flex items-center gap-2 mb-2.5 text-status-danger">
                <Icon name="close" className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Contradictory / Disputing Evidence ({result.contradictoryEvidence.length})
                </span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-content-primary">
                {result.contradictoryEvidence.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-status-danger font-bold mt-0.5">•</span>
                    <span className="leading-relaxed break-words [overflow-wrap:anywhere]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Live Web Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="pt-4 border-t border-border/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-content-primary flex items-center gap-2">
                  <Icon name="globe" className="w-4 h-4 text-brand-blue" />
                  <span>Live Web Sources ({result.sources.length})</span>
                </span>
                <span className="text-[11px] text-content-muted">
                  Click to inspect accredited publisher
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {result.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${src.title} from ${src.publisher || 'Web Outlet'} (opens in a new tab)`}
                    className="p-3.5 rounded-xl bg-surface-secondary/60 hover:bg-surface-secondary border border-border/70 hover:border-brand-blue/50 transition duration-150 block group text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-blue/10 text-brand-blue uppercase">
                          {src.publisher || 'Web Outlet'}
                        </span>
                        {src.date && (
                          <span className="text-[10px] text-content-muted font-mono">
                            {src.date}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="sr-only">(opens in a new tab)</span>
                        <Icon name="arrow" className="w-3.5 h-3.5 text-content-muted group-hover:text-brand-blue group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                    <h4 className="font-display font-semibold text-xs sm:text-sm text-content-primary group-hover:text-brand-blue transition mt-1.5 line-clamp-2">
                      {src.title}
                    </h4>
                    {src.snippet && (
                      <p className="text-xs text-content-secondary mt-1 line-clamp-2 leading-relaxed">
                        {src.snippet}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Topical Token Attribution Chips */}
          {result.influentialTokens && result.influentialTokens.length > 0 && (
            <div className="p-4 rounded-xl bg-surface-secondary/50 border border-border/60">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted block mb-2.5">
                Topical Token Attribution (TF-IDF Weighted)
              </span>
              <div className="flex flex-wrap gap-2">
                {result.influentialTokens.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-brand-blue/10 text-brand-blue border-brand-blue/20"
                  >
                    <span className="font-mono text-xs">{t.token}</span>
                    {typeof t.weight === 'number' && (
                      <span className="text-[10px] opacity-75 font-mono">
                        {t.weight > 0 ? `+${t.weight.toFixed(2)}` : t.weight.toFixed(2)}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Non-Dismissible Responsible AI Disclaimer */}
      <div className="mt-6 pt-4 border-t border-border/80 flex items-start gap-2.5 text-xs text-content-secondary leading-relaxed">
        <Icon name="shield" className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
        <span>
          {result.disclaimer ||
            'VeriNews provides AI-assisted evidence analysis based on live web retrieval. Web coverage indicates presence in public discourse, not judicial factual certainty. Always verify critical claims with accredited fact-checking organizations.'}
        </span>
      </div>
    </GlassCard>
  )
}
