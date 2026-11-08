'use client'

import { useState } from 'react'
import type { SupportedLanguage } from '../types'
import { Icon } from './Icon'

const MIN_LENGTH = 100
const MAX_LENGTH = 5000

const samples = {
  en: 'The city council has approved a new public library for the east side, with construction expected to begin next spring. The project includes a reading room, community spaces, and expanded access to digital resources. Officials said the final budget and timeline will be published after the next planning meeting.',
  hi: 'नगर परिषद ने शहर के पूर्वी हिस्से में एक नए सार्वजनिक पुस्तकालय के निर्माण को मंजूरी दी है। अधिकारियों के अनुसार, निर्माण अगले वसंत में शुरू होने की उम्मीद है। प्रस्तावित भवन में पढ़ने का कक्ष, सामुदायिक गतिविधियों के लिए स्थान और डिजिटल संसाधनों की सुविधा शामिल होगी। अंतिम बजट और समय-सारणी अगली योजना बैठक के बाद प्रकाशित की जाएगी।',
}

interface AnalyzerProps {
  onAnalyzeUnavailable: () => void
  isAnalyzing?: boolean
}

export function Analyzer({ onAnalyzeUnavailable, isAnalyzing = false }: AnalyzerProps) {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState<SupportedLanguage>('en')
  const [statusMessage, setStatusMessage] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const trimmedText = text.trim()
  const valid =
    trimmedText.length >= MIN_LENGTH &&
    trimmedText.length <= MAX_LENGTH &&
    /[\p{L}\p{N}]/u.test(trimmedText)
  const isTooShort = trimmedText.length > 0 && trimmedText.length < MIN_LENGTH
  const isTooLong = text.length > MAX_LENGTH
  const validationMessage = !trimmedText
    ? 'Enter article text before continuing.'
    : isTooShort
      ? `Add ${MIN_LENGTH - trimmedText.length} more characters to reach the ${MIN_LENGTH}-character minimum.`
      : isTooLong
        ? `Text exceeds the ${MAX_LENGTH.toLocaleString()}-character maximum.`
        : ''

  const clearText = () => {
    setText('')
    setSubmitAttempted(false)
    setStatusMessage('Article text cleared.')
  }

  const insertSample = (targetLanguage?: 'en' | 'hi') => {
    const langToUse = targetLanguage || (language === 'hi' ? 'hi' : 'en')
    setText(samples[langToUse])
    setLanguage(langToUse)
    setSubmitAttempted(false)
    setStatusMessage(
      `${langToUse === 'en' ? 'English' : 'Hindi'} sample text loaded. Ready for inspection.`
    )
  }

  const handleAnalyze = () => {
    setSubmitAttempted(true)
    if (!valid || isAnalyzing) return
    onAnalyzeUnavailable()
    setStatusMessage(
      'The machine learning analysis service is not connected yet. No prediction was generated.'
    )
  }

  return (
    <div className="w-full bg-surface border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-card transition-all duration-200">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
            <Icon name="document" className="w-5 h-5" />
          </div>
          <h2 className="font-display font-bold text-lg sm:text-2xl text-content-primary">
            Analyze a News Article
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-secondary border border-border text-content-secondary text-xs font-medium">
          <Icon name="globe" className="w-3.5 h-3.5 text-brand-blue" />
          <span>Supports English & Hindi</span>
        </div>
      </div>

      {/* Textarea Container */}
      <div className="mt-5 relative">
        <label className="sr-only" htmlFor="article-input">
          News article content
        </label>
        <textarea
          id="article-input"
          lang={language === 'hi' ? 'hi' : undefined}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            if (statusMessage) setStatusMessage('')
          }}
          placeholder="Paste a news article or headline here..."
          maxLength={MAX_LENGTH}
          aria-describedby="text-counter text-hints"
          aria-invalid={submitAttempted && !!validationMessage}
          className={`w-full min-h-[190px] sm:min-h-[220px] p-4 sm:p-5 rounded-xl bg-surface-secondary border text-content-primary text-sm sm:text-base leading-relaxed placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition resize-y ${language === 'hi' ? 'font-[family-name:var(--font-noto-sans-devanagari)] leading-loose' : ''} ${submitAttempted && validationMessage ? 'border-status-danger' : 'border-border/90'}`}
        />

        {/* Textarea Bottom Strip: Hints & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1 text-xs">
          <div id="text-hints" className="text-content-secondary" aria-live="polite">
            {submitAttempted && validationMessage ? (
              <span className="text-status-danger font-medium">
                {validationMessage}
              </span>
            ) : (
              <span>Demonstration text only. No prediction will be generated in this preview.</span>
            )}
          </div>
          <div
            id="text-counter"
            className={`font-mono text-xs tabular-nums ${
              isTooLong ? 'text-status-danger font-semibold' : 'text-content-secondary'
            }`}
          >
            {text.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="mt-5 pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Language Selection */}
        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center">
            <label htmlFor="language-selector" className="sr-only">
              Select analysis language
            </label>
            <div className="absolute left-3 pointer-events-none text-content-secondary">
              <Icon name="globe" className="w-4 h-4 text-brand-blue" />
            </div>
            <select
              id="language-selector"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="appearance-none pl-9 pr-8 py-2 rounded-full border border-border bg-surface-secondary text-content-primary text-xs sm:text-sm font-medium hover:border-brand-blue/50 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 cursor-pointer transition"
            >
              <option value="auto">Auto-detect language</option>
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-content-secondary">
              <Icon name="chevron" className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Buttons: Load Sample, Clear, Analyze */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => insertSample()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border bg-surface hover:bg-surface-secondary text-content-secondary hover:text-content-primary text-xs sm:text-sm font-medium transition active:scale-95"
          >
            <Icon name="spark" className="w-3.5 h-3.5 text-brand-violet" />
            <span>Load Sample</span>
          </button>

          <button
            type="button"
            onClick={clearText}
            disabled={!text}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-content-secondary hover:text-content-primary hover:bg-surface-secondary text-xs sm:text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="close" className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            aria-busy={isAnalyzing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs sm:text-sm font-semibold shadow-soft hover:shadow-glow-blue transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
          >
            <Icon name="spark" className="w-4 h-4" />
            <span>Analyze Article</span>
            <Icon name="arrow" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Reader Status */}
      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>
    </div>
  )
}
