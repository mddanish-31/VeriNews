'use client'

import { useState } from 'react'
import type { InputType, SupportedLanguage } from '../types'
import { Icon } from './Icon'
import { GlassCard } from './ui/GlassCard'
import { PillBadge } from './ui/PillBadge'
import { MagneticButton } from './ui/MagneticButton'

const HEADLINE_MIN = 10
const HEADLINE_MAX = 500
const ARTICLE_MIN = 20
const ARTICLE_MAX = 10000

const detectClientLanguage = (input: string): SupportedLanguage => {
  const trimmed = input.trim()
  if (!trimmed) return 'auto'

  const devanagariCount = (trimmed.match(/[\u0900-\u097F]/g) || []).length
  const latinCount = (trimmed.match(/[a-zA-Z]/g) || []).length

  if (devanagariCount > 0 && devanagariCount >= latinCount) {
    return 'hi'
  }

  if (latinCount > 0) {
    const tokens = new Set(trimmed.toLowerCase().split(/[^a-zA-Z]+/))
    const hindiWords = [
      'hai', 'hain', 'nahi', 'nahin', 'kya', 'kyun', 'kyon', 'liye',
      'gaya', 'gaye', 'gayi', 'raha', 'rahe', 'rahi', 'hoga', 'hogi',
      'hota', 'hoti', 'kiya', 'bharat', 'sarkar', 'khabar', 'desh',
      'jhooth', 'sach', 'aur', 'yeh', 'woh', 'kaise', 'jaise'
    ]
    let matches = 0
    for (const w of hindiWords) {
      if (tokens.has(w)) matches++
    }
    if (matches >= 2) {
      return 'hi'
    }
    return 'en'
  }

  return 'auto'
}

const samples = {
  headline: {
    en: 'ISRO Chandrayaan mission successfully explores the lunar surface',
    hi: 'भारतीय अंतरिक्ष अनुसंधान संगठन इसरो ने चंद्रयान मिशन प्रक्षेपित किया',
  },
  article: {
    en: 'The Indian Space Research Organisation (ISRO) has reported substantial progress in its lunar exploration program, with continuous telemetry confirming scientific data reception from specialized onboard payloads. Mission control in Bengaluru confirmed that thermal and geological measurements are proceeding according to scheduled mission parameters, contributing valuable insights for future deep-space exploration initiatives.',
    hi: 'भारतीय अंतरिक्ष अनुसंधान संगठन (इसरो) ने अपने चंद्र अन्वेषण कार्यक्रम के तहत चंद्रयान मिशन को सफलतापूर्वक आगे बढ़ाया है। वैज्ञानिकों और मिशन नियंत्रण केंद्र के अनुसार सभी पेलोड सामान्य रूप से कार्य कर रहे हैं तथा वैज्ञानिक डेटा निरंतर प्राप्त हो रहा है। यह उपलब्धि भारत के अंतरिक्ष विज्ञान के क्षेत्र में एक महत्वपूर्ण मील का पत्थर साबित होगी।',
  },
  url: {
    en: 'https://en.wikipedia.org/wiki/Chandrayaan_programme',
    hi: 'https://www.isro.gov.in/ISRO_HINDI/Chandrayaan_1.html',
  },
}

export interface AnalyzePayload {
  text?: string
  url?: string
  inputType: InputType
  language: SupportedLanguage
}

interface AnalyzerProps {
  onAnalyzeUnavailable?: () => void
  onAnalyze?: (
    payload: AnalyzePayload | string,
    language?: SupportedLanguage
  ) => void
  onClear?: () => void
  isAnalyzing?: boolean
}

export function Analyzer({
  onAnalyzeUnavailable,
  onAnalyze,
  onClear,
  isAnalyzing = false,
}: AnalyzerProps) {
  const [mode, setMode] = useState<InputType>('headline')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [language, setLanguage] = useState<SupportedLanguage>('auto')
  const [isManualOverride, setIsManualOverride] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const trimmedText = text.trim()
  const trimmedUrl = url.trim()

  // Mode-specific validation
  let valid = false
  let validationMessage = ''

  if (mode === 'url') {
    const isHttp = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(trimmedUrl)
    valid = isHttp && trimmedUrl.length >= 10
    if (!trimmedUrl) {
      validationMessage = 'Enter a news article web URL (e.g. https://example.com/article).'
    } else if (!isHttp) {
      validationMessage = 'Please enter a valid web URL starting with http:// or https://'
    }
  } else if (mode === 'article') {
    valid = trimmedText.length >= ARTICLE_MIN && trimmedText.length <= ARTICLE_MAX && /[\p{L}\p{N}]/u.test(trimmedText)
    if (!trimmedText) {
      validationMessage = 'Paste the full news article body text before analyzing.'
    } else if (trimmedText.length < ARTICLE_MIN) {
      validationMessage = `Add ${ARTICLE_MIN - trimmedText.length} more characters to reach the ${ARTICLE_MIN}-character article minimum.`
    } else if (trimmedText.length > ARTICLE_MAX) {
      validationMessage = `Article text exceeds the ${ARTICLE_MAX.toLocaleString()}-character limit.`
    }
  } else {
    // Headline mode
    valid = trimmedText.length >= HEADLINE_MIN && trimmedText.length <= HEADLINE_MAX && /[\p{L}\p{N}]/u.test(trimmedText)
    if (!trimmedText) {
      validationMessage = 'Enter a news headline or claim statement before continuing.'
    } else if (trimmedText.length < HEADLINE_MIN) {
      validationMessage = `Add ${HEADLINE_MIN - trimmedText.length} more characters to reach the ${HEADLINE_MIN}-character minimum.`
    } else if (trimmedText.length > HEADLINE_MAX) {
      validationMessage = `Headline exceeds the ${HEADLINE_MAX.toLocaleString()}-character limit.`
    }
  }

  const clearInput = () => {
    setText('')
    setUrl('')
    setIsManualOverride(false)
    setLanguage('auto')
    setSubmitAttempted(false)
    setStatusMessage('Input cleared.')
    if (onClear) {
      onClear()
    }
  }

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang)
    setIsManualOverride(true)
  }

  const handleTextChange = (newText: string) => {
    setText(newText)
    if (statusMessage) setStatusMessage('')
    if (!isManualOverride) {
      const detected = detectClientLanguage(newText)
      setLanguage(detected)
    }
  }

  const insertSample = (targetLanguage?: 'en' | 'hi') => {
    const langToUse = targetLanguage || (language === 'hi' ? 'hi' : 'en')
    setLanguage(langToUse)
    setIsManualOverride(true)
    setSubmitAttempted(false)

    if (mode === 'url') {
      setUrl(samples.url[langToUse])
      setStatusMessage(`${langToUse === 'en' ? 'English' : 'Hindi'} sample URL loaded.`)
    } else if (mode === 'article') {
      setText(samples.article[langToUse])
      setStatusMessage(`${langToUse === 'en' ? 'English' : 'Hindi'} sample article loaded.`)
    } else {
      setText(samples.headline[langToUse])
      setStatusMessage(`${langToUse === 'en' ? 'English' : 'Hindi'} sample headline loaded.`)
    }
  }

  const handleAnalyze = () => {
    setSubmitAttempted(true)
    if (!valid || isAnalyzing) return

    if (onAnalyze) {
      if (mode === 'url') {
        onAnalyze({ url: trimmedUrl, inputType: 'url', language })
      } else {
        onAnalyze({ text: trimmedText, inputType: mode, language })
      }
    } else if (onAnalyzeUnavailable) {
      onAnalyzeUnavailable()
      setStatusMessage('The verification service is not connected yet.')
    }
  }

  return (
    <GlassCard variant="elevated" glowEffect className="w-full p-5 sm:p-8 transition-all duration-200">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue flex items-center justify-center shadow-inner">
            <Icon name="document" className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg sm:text-2xl text-content-primary tracking-tight leading-[1.15] overflow-visible break-words">
              Verify News with Live Web Evidence
            </h2>
            <p className="text-xs text-content-secondary mt-0.5">
              AI-assisted multi-source verification for English & Hindi headlines
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PillBadge
            label="Bilingual Pipeline"
            variant="cyan"
            icon={<Icon name="globe" className="w-3 h-3 text-brand-cyan" />}
          />
          <PillBadge
            label="Zero Storage"
            variant="neutral"
            icon={<Icon name="shield" className="w-3 h-3 text-status-success" />}
          />
        </div>
      </div>

      {/* Input Mode Selector Tabs */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 mt-5 p-1 bg-surface-secondary/70 dark:bg-surface-secondary/50 rounded-xl border border-border/70 max-w-full overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setMode('headline')
            setSubmitAttempted(false)
          }}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[36px] transition flex-1 sm:flex-initial ${
            mode === 'headline'
              ? 'bg-surface text-brand-blue shadow-xs border border-border/70'
              : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          <Icon name="spark" className="w-3.5 h-3.5 text-brand-blue" />
          <span>Headline / Claim</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('article')
            setSubmitAttempted(false)
          }}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[36px] transition flex-1 sm:flex-initial ${
            mode === 'article'
              ? 'bg-surface text-brand-violet shadow-xs border border-border/70'
              : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          <Icon name="document" className="w-3.5 h-3.5 text-brand-violet" />
          <span>Full Article</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('url')
            setSubmitAttempted(false)
          }}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[36px] transition flex-1 sm:flex-initial ${
            mode === 'url'
              ? 'bg-surface text-emerald-500 shadow-xs border border-border/70'
              : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          <Icon name="globe" className="w-3.5 h-3.5 text-emerald-500" />
          <span>News URL</span>
        </button>
      </div>

      {/* Input Field Container */}
      <div className="mt-4 relative">
        {mode === 'url' ? (
          <div>
            <label className="sr-only" htmlFor="url-input">
              News article URL to verify
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-content-muted">
                <Icon name="globe" className="w-5 h-5" />
              </div>
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (statusMessage) setStatusMessage('')
                }}
                placeholder="https://example.com/news/article-headline..."
                aria-invalid={submitAttempted && !valid}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-secondary/60 dark:bg-surface-secondary/40 border text-content-primary text-sm sm:text-base placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition ${
                  submitAttempted && validationMessage ? 'border-status-danger' : 'border-border/90'
                }`}
              />
            </div>
            <div className="flex items-center justify-between gap-2 mt-2 px-1 text-xs">
              <span className="text-content-secondary">
                {submitAttempted && validationMessage ? (
                  <span className="text-status-danger font-medium">{validationMessage}</span>
                ) : (
                  'VeriNews securely fetches the article headline and checks live independent reporting.'
                )}
              </span>
            </div>
          </div>
        ) : (
          <div>
            <label className="sr-only" htmlFor="article-input">
              {mode === 'article' ? 'Full news article body text' : 'News headline or statement content'}
            </label>
            <textarea
              id="article-input"
              lang={language === 'hi' ? 'hi' : undefined}
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={
                mode === 'article'
                  ? 'Paste the full article body text here (up to 10,000 characters). VeriNews will analyze core claims and search live web evidence...'
                  : 'Enter a news headline, breaking claim, or statement (10–500 characters)...'
              }
              maxLength={mode === 'article' ? ARTICLE_MAX : HEADLINE_MAX}
              aria-describedby="text-counter text-hints"
              aria-invalid={submitAttempted && !!validationMessage}
              className={`w-full ${
                mode === 'article' ? 'min-h-[220px] sm:min-h-[260px]' : 'min-h-[170px] sm:min-h-[190px]'
              } p-4 sm:p-5 rounded-xl bg-surface-secondary/60 dark:bg-surface-secondary/40 border text-content-primary text-sm sm:text-base leading-relaxed placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition resize-y ${
                language === 'hi' ? 'font-[family-name:var(--font-noto-sans-devanagari)] leading-loose' : ''
              } ${submitAttempted && validationMessage ? 'border-status-danger' : 'border-border/90'}`}
            />

            {/* Counter Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1 text-xs">
              <div id="text-hints" className="text-content-secondary" aria-live="polite">
                {submitAttempted && validationMessage ? (
                  <span className="text-status-danger font-medium">{validationMessage}</span>
                ) : (
                  <span>
                    {mode === 'article'
                      ? 'Full-length article text supported up to 10,000 characters.'
                      : 'News headlines, breaking claims, and short statements (10–500 characters).'}
                  </span>
                )}
              </div>
              <div
                id="text-counter"
                className={`font-mono text-xs tabular-nums ${
                  trimmedText.length > (mode === 'article' ? ARTICLE_MAX : HEADLINE_MAX)
                    ? 'text-status-danger font-semibold'
                    : 'text-content-secondary'
                }`}
              >
                {trimmedText.length.toLocaleString()} / {(mode === 'article' ? ARTICLE_MAX : HEADLINE_MAX).toLocaleString()} chars
              </div>
            </div>
          </div>
        )}

        {/* Responsible AI Notice */}
        <div className="mt-3 p-3 rounded-xl bg-surface-secondary/40 border border-border/60 flex items-start gap-2.5 text-xs text-content-secondary">
          <Icon name="shield" className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-content-primary font-medium">Evidence-Assisted Verification:</strong> Claims are verified against live web search results from accredited publishers. Web reporting indicates discourse and consensus, not an empirical judicial guarantee of truth.
          </p>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="mt-5 pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Language Selection & Detected Pill */}
        <div className="flex items-center gap-3">
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
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="appearance-none pl-9 pr-8 py-2 rounded-full border border-border bg-surface-secondary/80 text-content-primary text-xs sm:text-sm font-medium hover:border-brand-blue/50 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 cursor-pointer transition"
            >
              <option value="auto">Auto-detect language</option>
              <option value="en">English (Latin)</option>
              <option value="hi">हिंदी (Devanagari)</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-content-secondary">
              <Icon name="chevron" className="w-3.5 h-3.5" />
            </div>
          </div>
          {language !== 'auto' && (
            <PillBadge
              label={language === 'hi' ? 'Hindi Detected' : 'English Detected'}
              variant={language === 'hi' ? 'violet' : 'primary'}
            />
          )}
        </div>

        {/* Buttons: Load Sample, Clear, Analyze */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => insertSample('en')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-surface-secondary text-content-secondary hover:text-content-primary text-xs font-medium transition active:scale-95"
          >
            <Icon name="spark" className="w-3 h-3 text-brand-blue" />
            <span>English Sample</span>
          </button>

          <button
            type="button"
            onClick={() => insertSample('hi')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-surface-secondary text-content-secondary hover:text-content-primary text-xs font-medium transition active:scale-95"
          >
            <Icon name="spark" className="w-3 h-3 text-brand-violet" />
            <span>हिंदी Sample</span>
          </button>

          <button
            type="button"
            onClick={clearInput}
            disabled={mode === 'url' ? !url : !text}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-content-secondary hover:text-content-primary hover:bg-surface-secondary text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="close" className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <MagneticButton
            id="analyzer-submit-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            aria-busy={isAnalyzing}
            className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs sm:text-sm font-semibold shadow-soft hover:shadow-glow-blue transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Icon name="spark" className={`w-4 h-4 mr-1.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Searching Web Evidence...' : 'Verify News'}</span>
            {!isAnalyzing && <Icon name="arrow" className="w-4 h-4 ml-1.5" />}
          </MagneticButton>
        </div>
      </div>

      {/* Screen Reader Status */}
      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>
    </GlassCard>
  )
}
