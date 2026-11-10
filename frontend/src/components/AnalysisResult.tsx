import type { AnalysisResultData } from '../types'
import { Icon } from './Icon'

interface AnalysisResultProps {
  result: AnalysisResultData
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  // Support both evidence-assisted verification status and legacy prediction label
  const status = result.status || result.prediction

  const isSupported = status === 'Supported by Available Evidence' || status === 'Credible' || status === 'Real'
  const isContradicted = status === 'Contradicted by Available Evidence' || status === 'Unreliable' || status === 'Fake'
  const isPartiallySupported = status === 'Partially Supported'
  const isMisleading = status === 'Misleading or Missing Context'
  const isInsufficient = status === 'Insufficient Evidence' || status === 'Unable to Verify' || status === 'Unclassifiable'

  const getStatusColorClasses = () => {
    if (isSupported) {
      return 'bg-status-success/15 text-status-success border-status-success/30'
    }
    if (isContradicted) {
      return 'bg-status-warning/15 text-status-warning border-status-warning/30'
    }
    if (isPartiallySupported) {
      return 'bg-brand-blue/15 text-brand-blue border-brand-blue/30'
    }
    if (isMisleading) {
      return 'bg-amber-500/15 text-amber-500 border-amber-500/30'
    }
    return 'bg-brand-violet/15 text-brand-violet border-brand-violet/30'
  }

  const getStatusDotColor = () => {
    if (isSupported) return 'bg-status-success'
    if (isContradicted) return 'bg-status-warning'
    if (isPartiallySupported) return 'bg-brand-blue'
    if (isMisleading) return 'bg-amber-500'
    return 'bg-brand-violet'
  }

  return (
    <article
      className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-card transition-all mt-6"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-content-secondary">
            Live Evidence Verification
          </span>
          <h3 className="font-display font-bold text-lg sm:text-2xl text-content-primary mt-0.5">
            Evidence-Assisted Analysis
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {result.detectedLanguage && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-secondary border border-border text-xs text-content-secondary font-medium">
              <Icon name="globe" className="w-3.5 h-3.5 text-brand-blue" />
              <span>{result.detectedLanguage}</span>
            </span>
          )}
          {result.latencyMs !== undefined && result.latencyMs !== null && (
            <span className="text-[11px] font-mono text-content-muted">
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
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-secondary border border-border/70">
            <div>
              <span className="text-xs text-content-secondary block">Verification Assessment</span>
              <div className="flex items-center gap-2.5 mt-1">
                <span className={`w-3 h-3 rounded-full ${getStatusDotColor()}`} />
                <strong className="font-display font-bold text-lg sm:text-xl text-content-primary">
                  {status}
                </strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColorClasses()}`}>
                {isSupported && '✓ Corroborated'}
                {isContradicted && '⚠ Refuted / Disputed'}
                {isPartiallySupported && '◈ Partial Evidence'}
                {isMisleading && '⚡ Context Needed'}
                {isInsufficient && '? Insufficient Web Records'}
              </span>
            </div>
          </div>

          {/* Claim Checked & Summary */}
          {(result.claimChecked || result.summary) && (
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-surface-secondary/70 border border-border/70">
              {result.claimChecked && (
                <div className="mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary block">
                    Claim Checked
                  </span>
                  <p className="text-sm font-medium text-content-primary mt-0.5 leading-relaxed">
                    {result.claimChecked}
                  </p>
                </div>
              )}
              {result.summary && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary block">
                    Summary
                  </span>
                  <p className="text-xs sm:text-sm text-content-secondary mt-0.5 leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          {result.explanation && (
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-surface-secondary border border-border/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary block mb-1.5">
                Evidence Analysis & Findings
              </span>
              <p className="text-sm text-content-primary leading-relaxed whitespace-pre-line">
                {result.explanation}
              </p>
            </div>
          )}

          {/* Supporting Evidence */}
          {result.supportingEvidence && result.supportingEvidence.length > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-status-success/5 border border-status-success/20">
              <div className="flex items-center gap-2 mb-2 text-status-success">
                <Icon name="check" className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Supporting Evidence ({result.supportingEvidence.length})
                </span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-content-primary pl-1">
                {result.supportingEvidence.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-status-success font-bold">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contradictory Evidence */}
          {result.contradictoryEvidence && result.contradictoryEvidence.length > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-status-warning/5 border border-status-warning/20">
              <div className="flex items-center gap-2 mb-2 text-status-warning">
                <Icon name="close" className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Contradictory / Disputing Evidence ({result.contradictoryEvidence.length})
                </span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-content-primary pl-1">
                {result.contradictoryEvidence.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-status-warning font-bold">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Live Web Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-content-secondary flex items-center gap-1.5">
                  <Icon name="globe" className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Live Web Sources ({result.sources.length})</span>
                </span>
                <span className="text-[11px] text-content-muted">
                  Click to inspect original article
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {result.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 sm:p-3.5 rounded-xl bg-surface-secondary/70 hover:bg-surface-secondary border border-border/80 hover:border-brand-blue/50 transition block group text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-blue/10 text-brand-blue uppercase">
                          {src.publisher || 'Web'}
                        </span>
                        {src.date && (
                          <span className="text-[10px] text-content-muted font-mono">
                            {src.date}
                          </span>
                        )}
                      </div>
                      <Icon name="arrow" className="w-3.5 h-3.5 text-content-muted group-hover:text-brand-blue group-hover:translate-x-0.5 transition" />
                    </div>
                    <h4 className="font-display font-semibold text-xs sm:text-sm text-content-primary group-hover:text-brand-blue transition mt-1 line-clamp-2">
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

          {/* Limitations & Methodology Notice */}
          {result.limitations && result.limitations.length > 0 && (
            <div className="mt-4 p-3.5 rounded-xl bg-surface-secondary/50 border border-border/60 text-xs text-content-secondary">
              <span className="font-semibold text-content-primary block mb-1">
                Important Disclosures & Limitations:
              </span>
              <ul className="space-y-1 pl-1 list-disc list-inside">
                {result.limitations.map((lim, idx) => (
                  <li key={idx} className="leading-relaxed">{lim}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Legacy Influential Tokens (if present in payload) */}
          {result.influentialTokens && result.influentialTokens.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-surface-secondary border border-border/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary block mb-2">
                Influential Topical Tokens
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.influentialTokens.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border bg-brand-blue/10 text-brand-blue border-brand-blue/20"
                  >
                    <span className="font-mono text-[11px]">{t.token}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Responsible AI Notice */}
      <div className="mt-5 pt-3 border-t border-border flex items-start gap-2 text-xs text-content-secondary leading-relaxed">
        <Icon name="shield" className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
        <span>
          {result.disclaimer ||
            'VeriNews provides AI-assisted evidence analysis based on live web retrieval. Web coverage indicates presence in public discourse, not judicial factual certainty. Always verify critical claims with accredited fact-checking organizations.'}
        </span>
      </div>
    </article>
  )
}
