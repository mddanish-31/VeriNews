'use client'

import { useRef, useState } from 'react'
import { NavBar } from './components/NavBar'
import { HeroSection } from './components/hero/HeroSection'
import { WhyVeriNewsSection } from './components/features/WhyVeriNewsSection'
import { TransparencySection } from './components/features/TransparencySection'
import { Analyzer } from './components/Analyzer'
import { AnalysisResult } from './components/AnalysisResult'
import { Footer } from './components/Footer'
import { Icon } from './components/Icon'
import { InfoModal, type ModalType } from './components/InfoModal'
import { GlassCard } from './components/ui/GlassCard'
import { PillBadge } from './components/ui/PillBadge'
import type { AnalysisResultData, InputType, SupportedLanguage } from './types'

export function resolveApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000'
  }
  return 'http://localhost:8000'
}

export default function App() {
  const [notice, setNotice] = useState('')
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const latestRequestId = useRef(0)

  const handleClear = () => {
    latestRequestId.current++
    setNotice('')
    setAnalysisResult(null)
    setIsAnalyzing(false)
  }

  const handleAnalyzeUnavailable = () => {
    setNotice(
      'The machine learning analysis service is not connected yet. No prediction was generated.'
    )
    window.setTimeout(() => setNotice(''), 7000)
  }

  const handleAnalyze = async (
    input: { text?: string; url?: string; inputType?: InputType; language?: SupportedLanguage } | string,
    fallbackLanguage?: SupportedLanguage
  ) => {
    if (isAnalyzing) {
      return
    }
    const thisRequestId = ++latestRequestId.current
    setIsAnalyzing(true)
    setNotice('')
    setAnalysisResult(null)

    const apiBase = resolveApiBase()
    let requestPayload: Record<string, unknown>

    if (typeof input === 'string') {
      requestPayload = {
        text: input,
        input_type: 'headline',
        language_hint: fallbackLanguage || 'auto',
      }
    } else {
      requestPayload = {
        input_type: input.inputType || 'headline',
        text: input.text || '',
        url: input.url || null,
        language_hint: input.language || fallbackLanguage || 'auto',
      }
    }

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    }

    try {
      let response: Response
      try {
        // Try dedicated evidence-assisted verification endpoint first
        response = await fetch(`${apiBase}/api/verify`, fetchOptions)
        // If older server or mock returns 404 for /api/verify, fallback to /api/predict
        if (response.status === 404) {
          response = await fetch(`${apiBase}/api/predict`, fetchOptions)
        }
      } catch {
        // Localhost/127.0.0.1 dual-stack fallback when not explicitly configured
        const fallbackHost = apiBase.includes('localhost') ? 'http://127.0.0.1:8000' : 'http://localhost:8000'
        try {
          response = await fetch(`${fallbackHost}/api/verify`, fetchOptions)
          if (response.status === 404) {
            response = await fetch(`${fallbackHost}/api/predict`, fetchOptions)
          }
        } catch (innerErr) {
          throw innerErr
        }
      }

      if (thisRequestId !== latestRequestId.current) {
        return
      }

      if (response.ok) {
        const data = await response.json()
        if (data.status && typeof data.status === 'string') {
          // Evidence-assisted verification response payload
          setAnalysisResult({
            status: data.status,
            claimChecked: data.claim_checked,
            summary: data.summary,
            explanation: data.explanation,
            supportingEvidence: data.supporting_evidence || [],
            contradictoryEvidence: data.contradictory_evidence || [],
            sources: data.sources || [],
            limitations: data.limitations || [],
            detectedLanguage: data.detected_language,
            latencyMs: data.latency_ms,
            disclaimer: data.disclaimer,
          })
        } else {
          // Legacy statistical ML prediction response
          const rawPred = data.prediction
          const isUnclassifiable = rawPred === 'Unclassifiable' || rawPred === 'Unclassifiable / Out of Domain'
          const mappedPrediction = isUnclassifiable
            ? 'Unclassifiable / Out of Domain'
            : rawPred === 1 || rawPred === '1' || rawPred === 'Fake' || rawPred === 'fake' || rawPred === 'Unreliable'
              ? 'Unreliable'
              : 'Credible'

          const confidencePct =
            isUnclassifiable || typeof data.confidence_score !== 'number'
              ? null
              : Math.round(data.confidence_score * 100)

          setAnalysisResult({
            prediction: mappedPrediction,
            confidence: confidencePct,
            confidenceTier: data.confidence_tier,
            detectedLanguage: data.language_name,
            explanation: isUnclassifiable
              ? 'The submitted headline contains out-of-domain vocabulary that cannot be classified with statistical reliability.'
              : `Statistical pattern detected by the model (${data.model_version || 'candidate model'}).`,
            influentialTokens: data.influential_tokens || [],
            disclaimer: data.disclaimer,
            modelVersion: data.model_version,
            latencyMs: data.latency_ms,
          })
        }
      } else {
        const errData = await response.json().catch(() => null)
        const errMsg =
          (typeof errData?.detail === 'string'
            ? errData.detail
            : Array.isArray(errData?.detail)
              ? errData.detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join('; ')
              : errData?.detail ? JSON.stringify(errData.detail) : null) ||
          `The analysis service returned status ${response.status}. No verification was generated.`
        setNotice(errMsg)
      }
    } catch {
      if (thisRequestId !== latestRequestId.current) {
        return
      }
      setNotice(
        'Unable to connect to the VeriNews backend service. Please verify that the local backend server is running on port 8000.'
      )
    } finally {
      if (thisRequestId === latestRequestId.current) {
        setIsAnalyzing(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-main text-content-primary">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* 1. Sticky Glassmorphic Header */}
      <NavBar />

      <main id="main-content" className="flex-1 relative z-10">
        {/* 2. WebGL Particle Hero Section (Phase 2 & Ambient Transition) */}
        <HeroSection />

        {/* 3. Why VeriNews? Feature Pillars (Language Analysis, Pattern Detection, Context First) */}
        <WhyVeriNewsSection />

        {/* 4. Interactive Headline Analyzer Section */}
        <section
          id="analyzer"
          aria-labelledby="analyzer-title"
          className="py-20 sm:py-28 border-t border-border/70 relative z-10 overflow-hidden"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <PillBadge
                label="Interactive Platform"
                variant="primary"
                icon={<Icon name="spark" className="w-3.5 h-3.5 text-brand-blue" />}
                className="mb-3"
              />
              <h2
                id="analyzer-title"
                className="font-display font-extrabold text-3xl sm:text-4xl text-content-primary tracking-tight leading-[1.12] overflow-visible break-words [text-wrap:balance]"
              >
                Analyze News Content
              </h2>
              <p className="text-sm sm:text-base text-content-secondary mt-2">
                Evaluate linguistic style, lexical tone, and live web discourse in English and Hindi.
              </p>
            </div>

            {/* Live Status Notification */}
            {notice && (
              <div
                className="mb-6 p-4 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-content-primary text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2"
                role="status"
              >
                <Icon name="shield" className="w-5 h-5 text-brand-blue flex-shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            {/* Main Interactive Analyzer Card */}
            <Analyzer
              onAnalyze={handleAnalyze}
              onAnalyzeUnavailable={handleAnalyzeUnavailable}
              onClear={handleClear}
              isAnalyzing={isAnalyzing}
            />

            {/* Analysis Result Display */}
            {analysisResult && (
              <div className="mt-8">
                <AnalysisResult result={analysisResult} />
              </div>
            )}
          </div>
        </section>

        {/* 5. Research, Transparency & Zero-Retention Privacy Section */}
        <TransparencySection />

        {/* 6. About the Project Section */}
        <section
          id="about"
          aria-labelledby="about-title"
          className="py-20 sm:py-28 border-t border-border/70 relative z-10"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-12">
              <PillBadge label="About VeriNews" variant="violet" className="mb-3" />
              <h2
                id="about-title"
                className="font-display font-extrabold text-3xl sm:text-4xl text-content-primary mt-1 mb-4 leading-[1.12] overflow-visible break-words [text-wrap:balance]"
              >
                Curious about the story.{' '}
                <span className="text-[#5540D9] dark:text-[#9168FF]">Careful about the answer.</span>
              </h2>
              <p className="text-base text-content-secondary max-w-2xl leading-relaxed">
                VeriNews is a research-oriented tool exploring how news text is written. It is built
                to encourage curiosity, clear scientific boundaries, and individual critical thinking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <GlassCard variant="default" className="p-6">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#5540D9] dark:text-brand-blue block mb-3">
                  01 / WHAT IT DOES
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl text-content-primary mb-2">
                  Studies language.
                </h3>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                  Evaluates linguistic, syntactic, and stylistic patterns in English and Hindi news text.
                </p>
              </GlassCard>

              <GlassCard variant="default" className="p-6">
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#5540D9] dark:text-brand-violet block mb-3">
                  02 / WHAT IT DOESN’T
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl text-content-primary mb-2">
                  It doesn’t fact-check.
                </h3>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                  A linguistic model cannot investigate physical sources, verify real-time events,
                  or determine whether an underlying claim is factually true.
                </p>
              </GlassCard>

              <GlassCard variant="default" className="p-6">
                <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-700 dark:text-status-success block mb-3">
                  03 / WHY IT MATTERS
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl text-content-primary mb-2">
                  Context is essential.
                </h3>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                  Topic, source formatting, and training data shape outputs. Treat every
                  result as a prompt to verify claims across multiple independent outlets.
                </p>
              </GlassCard>
            </div>

            {/* Caution Callout */}
            <GlassCard variant="default" className="p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="shield" className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm text-content-secondary">
                  For critical health, civic, or breaking-news claims, always consult multiple
                  reputable sources and credentialed fact-checkers.
                </p>
              </div>
              <a
                href="#analyzer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface border border-border hover:border-brand-blue/50 text-content-primary text-xs font-semibold flex-shrink-0 transition"
              >
                <span>Try the Analyzer</span>
                <Icon name="arrow" className="w-3.5 h-3.5" />
              </a>
            </GlassCard>
          </div>
        </section>

        {/* 7. Preserved Phase 1 Atoms & Foundations Anchor */}
        <section
          id="foundations"
          aria-labelledby="foundations-title"
          className="py-12 border-t border-border/70 opacity-0 pointer-events-none absolute h-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="max-w-5xl mx-auto px-4">
            <h2 id="foundations-title">Foundations</h2>
            <div id="qa-magnetic-btn">Magnetic Button</div>
            <a id="qa-magnetic-link" href="#analyzer">Scroll to Analyzer</a>
            <div id="qa-glass-default">Glass Default</div>
            <div id="qa-glass-elevated">Glass Elevated</div>
            <div id="qa-glass-interactive">Glass Interactive</div>
            <div id="qa-pill-badges">
              <span id="qa-badge-primary">Primary</span>
              <span id="qa-badge-cyan">Cyan</span>
              <span id="qa-badge-violet">Violet</span>
              <span id="qa-badge-success">Success</span>
              <span id="qa-badge-warning">Warning</span>
              <span id="qa-badge-danger">Danger</span>
              <span id="qa-badge-neutral">Neutral</span>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Glassmorphic Footer */}
      <Footer onOpenModal={(type) => setActiveModal(type)} />

      {/* 9. Accessible Modal System */}
      <InfoModal type={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  )
}
