'use client'

import { useEffect, useRef } from 'react'
import { Icon } from './Icon'
import { PillBadge } from './ui/PillBadge'

export type ModalType = 'methodology' | 'limitations' | 'faq' | 'privacy' | 'terms' | null

interface InfoModalProps {
  type: ModalType
  onClose: () => void
}

interface ModalItem {
  title: string
  subtitle: string
  category: string
  badgeVariant: 'primary' | 'violet' | 'cyan' | 'success' | 'warning'
  content: React.ReactNode
}

const modalContent: Record<NonNullable<ModalType>, ModalItem> = {
  methodology: {
    title: 'Research & Verification Methodology',
    subtitle: 'Bilingual NLP architecture, probability calibration, and live web evidence retrieval',
    category: 'Scientific Methodology',
    badgeVariant: 'primary',
    content: (
      <div className="space-y-4 text-sm text-content-secondary leading-relaxed">
        <p>
          VeriNews combines classical natural language processing with live multi-source evidence retrieval to analyze news content in English and Hindi. The system is designed to evaluate linguistic styles, syntactic structures, and corroborating reporting without acting as an infallible arbiter of physical truth.
        </p>

        <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border/80 space-y-2">
          <div className="flex items-center gap-2 text-brand-blue font-semibold text-xs uppercase tracking-wider font-mono">
            <Icon name="globe" className="w-4 h-4" />
            <span>01 / Dual-Script Bilingual Routing</span>
          </div>
          <p className="text-xs text-content-secondary">
            Incoming text undergoes Unicode script detection (<code className="font-mono text-xs">[\u0900-\u097F]</code>). Latin text routes to the English lexical tokenizer; Devanagari text routes to Hindi character n-gram tokenization, preventing cross-language contamination.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border/80 space-y-2">
          <div className="flex items-center gap-2 text-brand-violet font-semibold text-xs uppercase tracking-wider font-mono">
            <Icon name="spark" className="w-4 h-4" />
            <span>02 / Platt Sigmoid Calibration</span>
          </div>
          <p className="text-xs text-content-secondary">
            Raw linear classification boundaries often produce uncalibrated score distributions. VeriNews applies Platt scaling via scikit-learn&apos;s <code className="font-mono text-xs">CalibratedClassifierCV(method=&apos;sigmoid&apos;)</code>, mapping raw decision distances to truthful empirical posterior probabilities.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 font-semibold text-xs uppercase tracking-wider font-mono">
            <Icon name="check" className="w-4 h-4" />
            <span>03 / Evidence-Assisted Multi-Source Verification</span>
          </div>
          <p className="text-xs text-content-secondary">
            Through <code className="font-mono text-xs">/api/verify</code>, claim statements are queried against live independent news outlets over HTTPS. Retrieved coverage provides corroborating and disputing context, credited publishers, and direct external links, while backend metrics record only latency and character count.
          </p>
        </div>
      </div>
    ),
  },
  limitations: {
    title: 'System Limitations & Epistemic Boundaries',
    subtitle: 'Clear, documented boundaries on what language analysis can and cannot arbitrate',
    category: 'Scientific Boundaries',
    badgeVariant: 'warning',
    content: (
      <div className="space-y-4 text-sm text-content-secondary leading-relaxed">
        <div className="p-4 rounded-2xl bg-status-danger/10 border border-status-danger/30 text-status-danger flex items-start gap-3">
          <Icon name="shield" className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="font-semibold block text-sm mb-0.5">Critical Principle:</strong>
            VeriNews is an NLP research platform, not an investigative news agency. It evaluates syntactic and lexical signals, not physical reality or real-time ground events.
          </div>
        </div>

        <ul className="space-y-3">
          <li className="p-3.5 rounded-xl bg-surface-secondary/60 border border-border/70 text-xs">
            <strong className="text-content-primary font-semibold block mb-1">1. Stylistic Tone ≠ Objective Truth</strong>
            An honest breaking report written with emotive urgency may trigger sensationalism patterns, while sophisticated disinformation can mimic sober journalistic neutrality.
          </li>
          <li className="p-3.5 rounded-xl bg-surface-secondary/60 border border-border/70 text-xs">
            <strong className="text-content-primary font-semibold block mb-1">2. Domain Distribution Bounds (20–500 chars)</strong>
            Classical models are trained primarily on Indian news headlines and short claims. Submissions outside this domain (e.g. poetry, gibberish, code) are flagged as Unclassifiable / Out of Domain and confidence scoring is suppressed.
          </li>
          <li className="p-3.5 rounded-xl bg-surface-secondary/60 border border-border/70 text-xs">
            <strong className="text-content-primary font-semibold block mb-1">3. Publisher Lexical Memorization</strong>
            Linguistic models can inadvertently correlate specific publisher formatting with credibility rather than universal deception cues. VeriNews mitigates this with conservative stop-word filtering.
          </li>
          <li className="p-3.5 rounded-xl bg-surface-secondary/60 border border-border/70 text-xs">
            <strong className="text-content-primary font-semibold block mb-1">4. Scope Constraints</strong>
            Code-mixed Hinglish, deepfakes, and multimodal image/video forensics are outside current system scope. Critical claims must be verified with credentialed human fact-checkers.
          </li>
        </ul>
      </div>
    ),
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Common questions regarding VeriNews, privacy, and technology',
    category: 'Platform FAQ',
    badgeVariant: 'cyan',
    content: (
      <div className="space-y-4 text-sm text-content-secondary leading-relaxed">
        <div className="p-4 rounded-2xl bg-surface-secondary/60 border border-border/70">
          <h4 className="font-semibold text-content-primary text-sm">Is my submitted headline or article saved?</h4>
          <p className="mt-1.5 text-xs text-content-secondary leading-relaxed">
            <strong>Raw content is not persisted.</strong> VeriNews enforces Zero Content Retention for raw submitted text. Submitted headlines, article bodies, and URLs are processed in transient application memory. According to audited active routes, the application does not intentionally persist raw submitted content in its database or application logs, nor does it store word tokens or extracted claims. Backend logging records only verified non-content fields (character length and language hint).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-secondary/60 border border-border/70">
          <h4 className="font-semibold text-content-primary text-sm">What does &quot;Calibrated Posterior Probability&quot; mean?</h4>
          <p className="mt-1.5 text-xs text-content-secondary leading-relaxed">
            Rather than showing an arbitrary confidence percentage, Platt scaling aligns the model output so that among headlines assigned an 80% score, approximately 80% historically belonged to that linguistic pattern class in cross-validation splits.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-secondary/60 border border-border/70">
          <h4 className="font-semibold text-content-primary text-sm">Why are confidence scores suppressed on some inputs?</h4>
          <p className="mt-1.5 text-xs text-content-secondary leading-relaxed">
            When input text contains no recognized vocabulary or exhibits extreme out-of-domain patterns, VeriNews flags the result as &quot;Unclassifiable / Out of Domain&quot; and deliberately hides the confidence gauge to avoid misleading users with synthetic certainty.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-secondary/60 border border-border/70">
          <h4 className="font-semibold text-content-primary text-sm">Which languages and formats are supported?</h4>
          <p className="mt-1.5 text-xs text-content-secondary leading-relaxed">
            English (Latin script) and Hindi (Devanagari script) headlines (10–500 chars), full-length articles (up to 10,000 chars), and live news article URLs.
          </p>
        </div>
      </div>
    ),
  },
  privacy: {
    title: 'Privacy Policy & Data Invariants',
    subtitle: 'Zero Content Retention: Architectural focus on non-persistence of raw content',
    category: 'Privacy Invariants',
    badgeVariant: 'success',
    content: (
      <div className="space-y-4 text-sm text-content-secondary leading-relaxed">
        <p>
          VeriNews is built with privacy by architecture. We believe that curiosity and fact-checking should never require surrendering your personal reading habits or submitted texts.
        </p>

        <div className="p-4 rounded-2xl bg-status-success/10 border border-status-success/30 space-y-2">
          <div className="flex items-center gap-2 text-status-success font-semibold text-xs uppercase tracking-wider font-mono">
            <Icon name="shield" className="w-4 h-4" />
            <span>Strict Zero Content Retention</span>
          </div>
          <p className="text-xs text-content-primary leading-relaxed">
            The database schema contains zero columns for raw user headlines, article bodies, URLs, token vectors, or free-text comments. Submitted content is processed in transient application memory, and the application does not intentionally persist raw submitted content in its database or application logs, according to audited active routes.
          </p>
        </div>

        <ul className="space-y-2.5 text-xs">
          <li className="flex items-start gap-2">
            <span className="text-brand-blue font-bold mt-0.5">•</span>
            <span><strong className="text-content-primary">Transient Application Memory:</strong> In the browser, your input text exists in transient component state and is cleared when you click Clear, navigate away, or reload. On the backend, text is processed in transient application memory for the duration of the request. Physical memory management is handled by standard runtime processes without specific claims of secure physical memory erasure.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-blue font-bold mt-0.5">•</span>
            <span><strong className="text-content-primary">Database Schema & Operational Metadata:</strong> Non-content operational metadata columns (such as character count, language routing method, prediction label, confidence tier, and processing latency) exist in the database schema; however, the audited active guest routes (<code className="font-mono text-xs">/api/verify</code> and <code className="font-mono text-xs">/api/predict</code>) do not currently write analysis records to the database. Application logs record only verified non-content fields (character length and language hint).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-blue font-bold mt-0.5">•</span>
            <span><strong className="text-content-primary">Third-Party Evidence Search:</strong> In verification mode (<code className="font-mono text-xs">/api/verify</code>), claim keywords are queried against external search indexes over encrypted TLS/HTTPS to locate corroborating public news coverage.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-blue font-bold mt-0.5">•</span>
            <span><strong className="text-content-primary">No Client Tracking:</strong> We do not load third-party analytics scripts, advertising pixels, or telemetry beacons.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-blue font-bold mt-0.5">•</span>
            <span><strong className="text-content-primary">Local Theme Storage Only:</strong> Only your light/dark theme preference (<code className="font-mono text-xs">verinews-theme</code>) is stored in browser localStorage. No article or query history is ever stored in browser storage.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-blue font-bold mt-0.5">•</span>
            <span><strong className="text-content-primary">Encrypted In Transit:</strong> All communication between frontend and backend is transmitted securely over TLS/HTTPS.</span>
          </li>
        </ul>
      </div>
    ),
  },
  terms: {
    title: 'Terms of Use & Research Preview',
    subtitle: 'Guidelines for responsible use of an educational research preview',
    category: 'Governance & Terms',
    badgeVariant: 'violet',
    content: (
      <div className="space-y-4 text-sm text-content-secondary leading-relaxed">
        <p>
          VeriNews is provided as an open educational and research preview exploring natural language processing and machine learning applications in media literacy.
        </p>

        <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border/80 space-y-2">
          <h4 className="font-semibold text-content-primary text-xs uppercase tracking-wider font-mono">
            1. Educational & Linguistic Exploration Only
          </h4>
          <p className="text-xs text-content-secondary">
            VeriNews outputs must not be used as authoritative evidence in legal, electoral, medical, or financial matters. Automated linguistic detection is probabilistic and cannot replace human journalistic investigation.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border/80 space-y-2">
          <h4 className="font-semibold text-content-primary text-xs uppercase tracking-wider font-mono">
            2. User Responsibility
          </h4>
          <p className="text-xs text-content-secondary">
            Users remain solely responsible for validating critical claims across multiple accredited primary news sources and credentialed fact-checking organizations before taking action or sharing information.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border/80 space-y-2">
          <h4 className="font-semibold text-content-primary text-xs uppercase tracking-wider font-mono">
            3. Disclaimer of Warranties
          </h4>
          <p className="text-xs text-content-secondary">
            The service is provided &quot;as is&quot; without warranties of any kind regarding accuracy, uninterrupted availability, or fitness for specific judicial or journalistic determinations.
          </p>
        </div>
      </div>
    ),
  },
}

export function InfoModal({ type, onClose }: InfoModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!type) return

    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'

    // Focus close button initially
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'))

        if (focusable.length > 0) {
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [type, onClose])

  if (!type) return null

  const modal = modalContent[type]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-subtitle"
        className="flex max-h-[88dvh] w-full max-w-2xl flex-col bg-surface/95 dark:bg-surface/90 border border-border/80 backdrop-blur-2xl rounded-3xl shadow-glow-blue/15 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border/80 bg-surface-secondary/30">
          <div className="pr-4">
            <PillBadge label={modal.category} variant={modal.badgeVariant} className="mb-2.5" />
            <h3 id="modal-title" className="font-display font-extrabold text-lg sm:text-2xl text-content-primary tracking-tight leading-[1.15] overflow-visible break-words">
              {modal.title}
            </h3>
            <p id="modal-subtitle" className="text-xs text-content-secondary mt-1 leading-relaxed">
              {modal.subtitle}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-border bg-surface hover:bg-surface-secondary text-content-secondary hover:text-content-primary flex items-center justify-center flex-shrink-0 transition focus-visible:ring-2 focus-visible:ring-brand-blue"
            aria-label="Close dialog"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7 leading-relaxed">
          {modal.content}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border/80 bg-surface-secondary/20 flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-content-muted">
            VeriNews Research Platform
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold shadow-soft hover:shadow-glow-blue transition"
          >
            Close & Return
          </button>
        </div>
      </div>
    </div>
  )
}
