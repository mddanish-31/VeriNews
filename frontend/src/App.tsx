'use client'

import { useState } from 'react'
import { NavBar } from './components/NavBar'
import { HeroIllustration } from './components/HeroIllustration'
import { Analyzer } from './components/Analyzer'
import { HistoryItem } from './components/HistoryItem'
import { Icon } from './components/Icon'
import { InfoModal, type ModalType } from './components/InfoModal'
import type { HistoryEntryData } from './types'

export default function App() {
  const [notice, setNotice] = useState('')
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [historyEntries] = useState<HistoryEntryData[]>([])

  const handleAnalyzeUnavailable = () => {
    setNotice(
      'The machine learning analysis service is not connected yet. No prediction was generated.'
    )
    window.setTimeout(() => setNotice(''), 7000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-main text-content-primary">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Header / Navbar */}
      <NavBar />

      <main id="main-content" className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section
          id="home"
          aria-labelledby="hero-title"
          className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28"
        >
          {/* Subtle Ambient Glow behind Hero */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none opacity-40 dark:opacity-60 hero-glow-light dark:hero-glow-dark -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headlines & Actions */}
              <div className="lg:col-span-7 flex flex-col items-start">
                {/* AI Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-secondary border border-border text-content-secondary text-xs font-semibold mb-6 shadow-xs">
                  <Icon name="shield" className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Research Preview · English & Hindi</span>
                </div>

                {/* Main Headline */}
                <h1
                  id="hero-title"
                  className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[64px] tracking-tight leading-[1.08] text-content-primary mb-6"
                >
                  Verify News.
                  <br />
                  <span className="bg-gradient-to-r from-brand-blue via-brand-blue to-brand-violet bg-clip-text text-transparent">
                    Read Smarter.
                  </span>
                </h1>

                {/* Subtitle / Description */}
                <p className="text-base sm:text-lg text-content-secondary max-w-xl leading-relaxed mb-8">
                  A research-based tool that analyzes the language and patterns in news articles to
                  help you spot potential misinformation in English and Hindi.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <a
                    href="#analyzer"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-sm sm:text-base font-semibold shadow-soft hover:shadow-glow-blue transition duration-150 active:scale-95"
                  >
                    <span>Explore the Analyzer</span>
                    <Icon name="arrow" className="w-4 h-4" />
                  </a>

                  <a
                    href="#why-verinews"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-surface border border-border hover:border-brand-blue/50 text-content-primary text-sm sm:text-base font-semibold shadow-xs hover:bg-surface-secondary transition duration-150"
                  >
                    <Icon name="play" className="w-3.5 h-3.5 text-brand-blue" />
                    <span>How It Works</span>
                  </a>
                </div>

                {/* Language Pills */}
                <div
                  className="flex flex-wrap items-center gap-2.5 pt-2"
                  aria-label="Supported languages"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-content-secondary text-xs font-medium shadow-xs">
                    <Icon name="globe" className="w-3.5 h-3.5 text-brand-blue" />
                    <span>English</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-content-secondary text-xs font-medium shadow-xs">
                    <Icon name="globe" className="w-3.5 h-3.5 text-brand-violet" />
                    <span>हिंदी · Hindi</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Hero Illustration */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHY VERINEWS? SECTION ================= */}
        <section
          id="why-verinews"
          aria-labelledby="why-title"
          className="py-16 sm:py-20 border-t border-border/70 bg-surface-secondary/40"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <h2
                  id="why-title"
                  className="font-display font-extrabold text-3xl sm:text-4xl text-content-primary tracking-tight"
                >
                  Why <span className="text-brand-blue">VeriNews?</span>
                </h2>
              </div>
              <p className="text-sm sm:text-base text-content-secondary max-w-md">
                A simple, transparent and research-driven approach to understand news content.
              </p>
            </div>

            {/* 3 Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Language Analysis */}
              <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-soft hover:shadow-card hover:border-brand-blue/40 transition duration-200">
                <div className="w-11 h-11 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-5">
                  <Icon name="lightning" className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-content-primary mb-2">
                  Language Analysis
                </h3>
                <p className="text-sm text-content-secondary leading-relaxed">
                  Studies writing style and linguistic patterns across grammatical structure,
                  lexicon, and tone.
                </p>
              </div>

              {/* Card 2: Pattern Detection */}
              <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-soft hover:shadow-card hover:border-brand-violet/40 transition duration-200">
                <div className="w-11 h-11 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center mb-5">
                  <Icon name="layers" className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-content-primary mb-2">
                  Pattern Detection
                </h3>
                <p className="text-sm text-content-secondary leading-relaxed">
                  Identifies common signals of misleading content, sensationalism, and manufactured
                  urgency.
                </p>
              </div>

              {/* Card 3: Context First */}
              <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-soft hover:shadow-card hover:border-status-success/40 transition duration-200">
                <div className="w-11 h-11 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center mb-5">
                  <Icon name="shield" className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-content-primary mb-2">
                  Context First
                </h3>
                <p className="text-sm text-content-secondary leading-relaxed">
                  Encourages a more informed and critical reading habit rather than treating models
                  as arbiters of truth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ANALYZER SECTION ================= */}
        <section
          id="analyzer"
          aria-labelledby="analyzer-title"
          className="py-16 sm:py-24 border-t border-border/70"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <Analyzer onAnalyzeUnavailable={handleAnalyzeUnavailable} />

            {/* Optional Analysis Result (if result exists) */}
            {/* Trust and Transparency Strip */}
            <div className="mt-12 pt-10 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Item 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-surface-secondary text-brand-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="book" className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-content-primary">Research-driven</h4>
                  <p className="text-xs text-content-secondary mt-0.5 leading-relaxed">
                    Designed around established NLP research and transparent evaluation principles.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-surface-secondary text-brand-violet flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="eye" className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-content-primary">Transparent</h4>
                  <p className="text-xs text-content-secondary mt-0.5 leading-relaxed">
                    Clear about this preview’s limitations; the analysis service is not connected.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-surface-secondary text-status-success flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="lock" className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-content-primary">Preview behavior</h4>
                  <p className="text-xs text-content-secondary mt-0.5 leading-relaxed">
                    This frontend preview does not submit article text to a backend service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HISTORY SECTION ================= */}
        <section
          id="history"
          aria-labelledby="history-title"
          className="py-16 sm:py-20 border-t border-border/70 bg-surface-secondary/30"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-brand-blue">
                  Your reading space
                </span>
                <h2
                  id="history-title"
                  className="font-display font-extrabold text-2xl sm:text-3xl text-content-primary mt-1"
                >
                  Recent reads.
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-content-secondary">
                <Icon name="clock" className="w-3.5 h-3.5 text-brand-blue" />
                <span>No analysis history is available in this preview</span>
              </div>
            </div>

            {historyEntries.length > 0 ? (
              <div className="space-y-3">
                {historyEntries.map((entry) => (
                  <HistoryItem key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-secondary text-brand-blue flex items-center justify-center flex-shrink-0">
                    <Icon name="clock" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-content-primary">
                      Your history starts here.
                    </h3>
                    <p className="text-xs sm:text-sm text-content-secondary mt-1">
                      The analysis service is not connected, so no real analysis history is available or stored.
                    </p>
                  </div>
                </div>
                <a
                  href="#analyzer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface hover:bg-surface-secondary text-content-primary text-xs font-semibold flex-shrink-0 transition"
                >
                  <span>Go to Analyzer</span>
                  <Icon name="arrow" className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ================= ABOUT SECTION ================= */}
        <section
          id="about"
          aria-labelledby="about-title"
          className="py-16 sm:py-24 border-t border-border/70"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-violet">
                About VeriNews
              </span>
              <h2
                id="about-title"
                className="font-display font-extrabold text-3xl sm:text-4xl text-content-primary mt-1 mb-4"
              >
                Curious about the story.{' '}
                <span className="text-brand-blue">Careful about the answer.</span>
              </h2>
              <p className="text-sm sm:text-base text-content-secondary max-w-2xl leading-relaxed">
                VeriNews is a research-oriented tool for exploring how news is written. It is built
                to make room for curiosity, clear scientific limitations, and your own critical
                judgment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-soft">
                <span className="text-[11px] font-mono font-bold tracking-wider text-brand-blue block mb-3">
                  01 / WHAT IT DOES
                </span>
                <h3 className="font-display font-bold text-lg text-content-primary mb-2">
                  Looks at language.
                </h3>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                  The project is designed to study linguistic and stylistic patterns in English and Hindi news text. The analysis service is not connected in this preview.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6 shadow-soft">
                <span className="text-[11px] font-mono font-bold tracking-wider text-brand-violet block mb-3">
                  02 / WHAT IT DOESN’T
                </span>
                <h3 className="font-display font-bold text-lg text-content-primary mb-2">
                  It doesn’t fact-check.
                </h3>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                  A style-based model cannot investigate physical sources, verify real-time events,
                  or determine whether an underlying claim is factually true.
                </p>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6 shadow-soft">
                <span className="text-[11px] font-mono font-bold tracking-wider text-status-success block mb-3">
                  03 / WHY IT MATTERS
                </span>
                <h3 className="font-display font-bold text-lg text-content-primary mb-2">
                  Context is essential.
                </h3>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                  Topic, source formatting, and training data shape model outputs. Treat every
                  result as a prompt to verify claims across multiple independent outlets.
                </p>
              </div>
            </div>

            {/* Caution Callout */}
            <div className="rounded-2xl bg-surface-secondary/70 border border-border p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-status-warning/15 text-status-warning flex items-center justify-center flex-shrink-0">
                  <Icon name="shield" className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm text-content-secondary">
                  For critical health, civic, or breaking-news claims, always consult multiple
                  reputable sources and credentialed fact-checkers.
                </p>
              </div>
              <a
                href="#analyzer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border hover:border-brand-blue/50 text-content-primary text-xs font-semibold flex-shrink-0 transition"
              >
                <span>Try the Analyzer</span>
                <Icon name="arrow" className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-border bg-surface text-content-primary transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Column 1: Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 font-display font-bold text-xl text-content-primary">
                <div className="flex items-center gap-1 h-5 w-6" aria-hidden="true">
                  <span className="w-1.5 h-4 bg-brand-blue/70 rounded-full transform -skew-x-12" />
                  <span className="w-1.5 h-5 bg-brand-blue rounded-full transform -skew-x-12" />
                  <span className="w-1.5 h-4.5 bg-brand-violet rounded-full transform -skew-x-12" />
                </div>
                <span>
                  Veri<span className="text-brand-blue">News</span>
                </span>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
                Read with curiosity.
                <br />
                Think with care.
              </p>
            </div>

            {/* Column 2: Explore */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-content-primary mb-3">
                Explore
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-content-secondary">
                <li>
                  <a href="#home" className="hover:text-brand-blue transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#why-verinews" className="hover:text-brand-blue transition">
                    Why VeriNews?
                  </a>
                </li>
                <li>
                  <a href="#analyzer" className="hover:text-brand-blue transition">
                    Analyze
                  </a>
                </li>
                <li>
                  <a href="#history" className="hover:text-brand-blue transition">
                    History
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-brand-blue transition">
                    About
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources (Opens Modals) */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-content-primary mb-3">
                Resources
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-content-secondary">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('methodology')}
                    className="hover:text-brand-blue transition text-left"
                  >
                    Methodology
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('limitations')}
                    className="hover:text-brand-blue transition text-left"
                  >
                    Limitations
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('faq')}
                    className="hover:text-brand-blue transition text-left"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal (Opens Modals) */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-content-primary mb-3">
                Legal
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-content-secondary">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="hover:text-brand-blue transition text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="hover:text-brand-blue transition text-left"
                  >
                    Terms of Use
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-content-secondary">
            <span>© 2026 VeriNews — Research Preview</span>
            <span className="text-content-muted">AI can inform. It cannot verify reality.</span>
          </div>
        </div>
      </footer>

      {/* Info Modal for Methodology, Limitations, FAQ, Legal */}
      <InfoModal type={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  )
}
