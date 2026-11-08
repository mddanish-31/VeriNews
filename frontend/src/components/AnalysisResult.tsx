import type { AnalysisResultData } from '../types'
import { Icon } from './Icon'

interface AnalysisResultProps {
  result: AnalysisResultData
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const confidencePercent = typeof result.confidence === 'number'
    ? Math.round(Math.min(100, Math.max(0, result.confidence)))
    : null

  return (
    <article
      className="bg-surface border border-border rounded-2xl p-6 shadow-card transition-all"
      aria-live="polite"
    >
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-content-secondary">
            Analysis result
          </span>
          <h3 className="font-display font-bold text-lg sm:text-xl text-content-primary mt-0.5">
            Patterns to consider
          </h3>
        </div>
        <div className="w-9 h-9 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center">
          <Icon name="spark" className="w-5 h-5" />
        </div>
      </div>

      {!result.prediction ? (
        <p className="mt-5 text-sm text-content-secondary">
          No prediction is available. The machine learning analysis service is not connected yet.
        </p>
      ) : <div className="grid grid-cols-2 gap-4 mt-5">
        <div className="flex flex-col">
          <span className="text-xs text-content-secondary">Pattern Prediction</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
            <strong className="font-display font-bold text-lg text-content-primary">
              {result.prediction}
            </strong>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs text-content-secondary">Model confidence</span>
          <strong className="font-display font-bold text-lg text-content-primary mt-1">
            {confidencePercent === null ? 'Not available' : `${confidencePercent}%`}
          </strong>
        </div>
      </div>}

      {result.prediction && confidencePercent !== null && (
        <div
          className="w-full h-1.5 bg-surface-secondary rounded-full overflow-hidden mt-3"
          aria-hidden="true"
        >
          <div
            className="h-full bg-gradient-to-r from-brand-blue to-brand-violet rounded-full transition-all duration-300"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      )}

      {result.prediction && <div className="flex items-center justify-between text-xs text-content-secondary mt-4 pt-3 border-t border-border">
        <span className="flex items-center gap-1.5">
          <Icon name="globe" className="w-3.5 h-3.5 text-brand-blue" />
          <span>{result.detectedLanguage ?? 'Not available'}</span>
        </span>
        <span>Language-specific analysis</span>
      </div>}

      {result.explanation && <div className="mt-4 p-4 rounded-xl bg-surface-secondary border border-border/60">
        <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary block mb-1">
          Linguistic context
        </span>
        <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
          {result.explanation}
        </p>
      </div>}

      <p className="flex items-start gap-2 text-xs text-content-secondary mt-4 leading-relaxed">
        <Icon name="shield" className="w-4 h-4 text-status-warning flex-shrink-0 mt-0.5" />
        <span>
          {result.prediction
            ? 'A model prediction reflects linguistic patterns; it is not proof of factual truth or an independent fact-check.'
            : 'The analysis service is not connected. No prediction or factual verification was generated.'}
        </span>
      </p>
    </article>
  )
}
