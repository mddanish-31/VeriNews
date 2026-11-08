'use client'

import { useEffect, useRef } from 'react'
import { Icon } from './Icon'

export type ModalType = 'methodology' | 'limitations' | 'faq' | 'privacy' | 'terms' | null

interface InfoModalProps {
  type: ModalType
  onClose: () => void
}

const modalContent: Record<
  NonNullable<ModalType>,
  { title: string; subtitle: string; content: React.ReactNode }
> = {
  methodology: {
    title: 'Research Methodology',
    subtitle: 'What this research preview currently does and does not provide',
    content: (
      <div className="space-y-4 text-sm text-content-secondary leading-relaxed">
        <p>
          VeriNews is a research preview designed to study linguistic and stylistic patterns in English and Hindi news text. The analysis service is not connected, so this frontend does not currently evaluate submitted text.
        </p>
        <div className="p-4 rounded-xl bg-surface-secondary border border-border">
          <h4 className="font-semibold text-content-primary mb-1">Research direction</h4>
          <p>
            The project is designed around English and Hindi text analysis. No language-specific model or analysis pipeline is connected in this preview.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-surface-secondary border border-border">
          <h4 className="font-semibold text-content-primary mb-1">Evaluation principles</h4>
          <p>
            Future evaluation should document data provenance, label quality, limitations and reproducible methods. No model or benchmark result is presented here.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-surface-secondary border border-border">
          <h4 className="font-semibold text-content-primary mb-1">No prediction in this preview</h4>
          <p>
            Submitting valid text displays an unavailable-service notice; it does not generate a score, label or factual assessment.
          </p>
        </div>
      </div>
    ),
  },
  limitations: {
    title: 'System Limitations',
    subtitle: 'Clear boundaries on what language analysis can and cannot do',
    content: (
      <div className="space-y-4 text-sm text-content-secondary leading-relaxed">
        <div className="p-3.5 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger">
          <strong>Important:</strong> VeriNews is not a fact-checking database and does not verify
          the truth or falsity of real-world claims.
        </div>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-content-primary">Style ≠ Truth:</strong> A factual report
            written with urgent, emotive language may trigger sensationalism patterns, while a
            carefully crafted falsehood may mimic neutral journalistic tone.
          </li>
          <li>
            <strong className="text-content-primary">Training Distribution Constraints:</strong>{' '}
            No trained model is connected in this preview.
          </li>
          <li>
            <strong className="text-content-primary">Source Leakage:</strong> Stylistic models can
            sometimes memorize publisher-specific formatting rather than generalizable deception
            markers.
          </li>
          <li>
            <strong className="text-content-primary">Out of Scope:</strong> Code-mixed Hinglish and
            multimodal image/video claims are not supported in the initial release.
          </li>
        </ul>
      </div>
    ),
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Common questions about VeriNews research preview',
    content: (
      <div className="space-y-4 text-sm text-content-secondary leading-relaxed">
        <div>
          <h4 className="font-semibold text-content-primary">Is my submitted text saved?</h4>
          <p className="mt-1">
            This frontend preview does not submit article text to a backend service. This describes current frontend behavior only and is not a broader privacy guarantee about hosting or infrastructure.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-content-primary">
            Why does the analyzer say the model service is not connected?
          </h4>
          <p className="mt-1">
            The machine learning analysis service is not connected yet. No prediction is generated when you submit text.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-content-primary">
            Which languages are supported?
          </h4>
          <p className="mt-1">
            The interface is designed for English and Hindi (Devanagari) text. Language auto-detection and analysis are not provided by a connected ML service.
          </p>
        </div>
      </div>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Preview information, not a reviewed privacy policy',
    content: (
      <div className="space-y-4 text-sm text-content-secondary leading-relaxed">
        <p>
          This informational preview is not an officially reviewed privacy policy. The current frontend does not send article text to a backend service when Analyze is selected.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-content-primary">Article text:</strong> The Analyze control only shows an unavailable-service message; no analysis request is made by this frontend.
          </li>
          <li>
            <strong className="text-content-primary">Theme preference:</strong> The selected theme is saved in browser localStorage when available.
          </li>
          <li>
            Hosting, server logs and third-party infrastructure have not been independently reviewed here.
          </li>
        </ul>
      </div>
    ),
  },
  terms: {
    title: 'Terms of Use',
    subtitle: 'Educational and research preview guidelines',
    content: (
      <div className="space-y-4 text-sm text-content-secondary leading-relaxed">
        <p>
          VeriNews is provided as a research preview for educational and academic exploration of NLP
          classification methodologies.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-content-primary">Not Professional Fact-Checking:</strong>{' '}
            Outputs and analyses provided by VeriNews are automated linguistic signals and must not
            be used as sole evidence in legal, medical, financial, or civic determinations.
          </li>
          <li>
            <strong className="text-content-primary">Verification Responsibility:</strong> Users
            remain fully responsible for verifying information through authoritative primary
            sources and credentialed investigative journalism.
          </li>
        </ul>
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
    closeButtonRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-subtitle"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col bg-surface border border-border rounded-2xl shadow-card overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-border bg-surface-secondary/40">
          <div>
            <h3 id="modal-title" className="font-display font-bold text-xl text-content-primary">
              {modal.title}
            </h3>
            <p id="modal-subtitle" className="text-xs text-content-secondary mt-1">{modal.subtitle}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border bg-surface hover:bg-surface-secondary text-content-secondary hover:text-content-primary flex items-center justify-center transition"
            aria-label="Close modal"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">{modal.content}</div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-surface-secondary/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold shadow-soft transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  )
}
