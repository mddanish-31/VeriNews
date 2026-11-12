'use client'

import React from 'react'
import InteractiveNeuralVortex from '../ui/interactive-neural-vortex-background'
import { LiquidButton } from '../ui/liquid-glass-button'
import { Icon } from '../Icon'

interface HeroSectionProps {
  onLearnMore?: () => void
}

export function HeroSection({ onLearnMore }: HeroSectionProps) {
  return (
    <section id="home" aria-labelledby="hero-title" className="relative w-full">
      <InteractiveNeuralVortex>
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center px-4 pt-14 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 z-10 animate-seq">
          {/* Main Headline — First element of hero content, Brunson for Line 1, Heading Now for Line 2 */}
          <h1
            id="hero-title"
            className="uppercase tracking-tight sm:tracking-normal leading-[0.95] text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 sm:mb-5 select-none"
          >
            <span className="block font-brunson font-normal text-slate-900 dark:text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_2px_20px_rgba(255,255,255,0.18)] transition-colors duration-500">
              VERIFY NEWS —
            </span>
            <span className="block font-heading-now font-extrabold text-[#5540D9] dark:text-[#8A68FF] drop-shadow-[0_0_25px_rgba(85,64,217,0.25)] dark:drop-shadow-[0_0_35px_rgba(138,104,255,0.65)] transition-colors duration-500">
              READ SMARTER.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-xl mx-auto font-sans text-base sm:text-lg md:text-xl text-slate-700 dark:text-[#C4C9E2]/90 leading-relaxed mb-8 sm:mb-9 transition-colors duration-500">
            The truth deserves more than a headline.
          </p>

          {/* Hero Action Buttons — Liquid Glass Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-10 sm:mb-12 w-full max-w-md mx-auto">
            <LiquidButton
              variant="primary"
              size="lg"
              href="#analyzer"
              icon={<Icon name="arrow" className="w-4 h-4 ml-1" />}
              className="w-full sm:w-auto min-w-[200px]"
            >
              Start Analyzing
            </LiquidButton>
            <LiquidButton
              variant="secondary"
              size="lg"
              href="#why-verinews"
              onClick={onLearnMore}
              className="w-full sm:w-auto min-w-[180px]"
            >
              Explore VeriNews
            </LiquidButton>
          </div>

          {/* Feature Cards — Three Horizontal Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mx-auto mb-8 sm:mb-10 text-left">
            {/* Card 1: AI Analysis */}
            <div className="group rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#0c1024]/65 border border-slate-200/90 dark:border-brand-violet/30 hover:border-brand-violet/50 dark:hover:border-brand-violet/60 transition-all duration-300 backdrop-blur-xl shadow-[0_8px_32px_rgba(17,20,38,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:shadow-[0_12px_40px_rgba(85,64,217,0.2)] hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/15 border border-brand-violet/20 dark:border-brand-violet/30 flex items-center justify-center mb-3.5 text-brand-violet group-hover:scale-110 transition-transform">
                <Icon name="chip" className="w-5 h-5" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-display font-bold text-lg sm:text-xl mb-1.5 tracking-wide transition-colors duration-500">
                AI Analysis
              </h3>
              <p className="text-slate-700 dark:text-[#A7B0C8] text-xs sm:text-sm leading-relaxed transition-colors duration-500">
                Intelligent news examination with contextual understanding.
              </p>
            </div>

            {/* Card 2: Evidence */}
            <div className="group rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#0c1024]/65 border border-slate-200/90 dark:border-brand-violet/30 hover:border-brand-violet/50 dark:hover:border-brand-violet/60 transition-all duration-300 backdrop-blur-xl shadow-[0_8px_32px_rgba(17,20,38,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:shadow-[0_12px_40px_rgba(85,64,217,0.2)] hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/15 border border-brand-violet/20 dark:border-brand-violet/30 flex items-center justify-center mb-3.5 text-brand-violet group-hover:scale-110 transition-transform">
                <Icon name="layers" className="w-5 h-5" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-display font-bold text-lg sm:text-xl mb-1.5 tracking-wide transition-colors duration-500">
                Evidence
              </h3>
              <p className="text-slate-700 dark:text-[#A7B0C8] text-xs sm:text-sm leading-relaxed transition-colors duration-500">
                Sources, claims, and supporting context.
              </p>
            </div>

            {/* Card 3: Multilingual */}
            <div className="group rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#0c1024]/65 border border-slate-200/90 dark:border-brand-violet/30 hover:border-brand-violet/50 dark:hover:border-brand-violet/60 transition-all duration-300 backdrop-blur-xl shadow-[0_8px_32px_rgba(17,20,38,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:shadow-[0_12px_40px_rgba(85,64,217,0.2)] hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/15 border border-brand-violet/20 dark:border-brand-violet/30 flex items-center justify-center mb-3.5 text-brand-violet group-hover:scale-110 transition-transform">
                <Icon name="globe" className="w-5 h-5" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-display font-bold text-lg sm:text-xl mb-1.5 tracking-wide transition-colors duration-500">
                Multilingual
              </h3>
              <p className="text-slate-700 dark:text-[#A7B0C8] text-xs sm:text-sm leading-relaxed transition-colors duration-500">
                Detect and analyze news across multiple languages.
              </p>
            </div>
          </div>

          {/* Bottom Scroll Indicator — Subtle Mouse-shaped Indicator */}
          <div className="flex flex-col items-center justify-center pt-1">
            <a
              href="#why-verinews"
              aria-label="Scroll down to exploration"
              className="group inline-flex flex-col items-center gap-2 text-slate-500/70 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-opacity"
            >
              <div className="w-5 h-9 rounded-full border-2 border-slate-400/50 dark:border-white/30 group-hover:border-slate-700 dark:group-hover:border-white/60 flex items-start justify-center p-1 transition-colors">
                <span className="w-1.5 h-2 rounded-full bg-brand-violet animate-bounce" />
              </div>
            </a>
          </div>
        </div>
      </InteractiveNeuralVortex>
    </section>
  )
}
