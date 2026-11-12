'use client'

import React from 'react'
import { Icon, type IconName } from '../Icon'
import { GlassCard } from '../ui/GlassCard'
import { PillBadge } from '../ui/PillBadge'

interface TransparencyPrinciple {
  title: string
  badge: string
  badgeVariant: 'primary' | 'violet' | 'success' | 'cyan'
  iconName: IconName
  iconColor: string
  description: string
  technicalDetails: string
}

const principles: TransparencyPrinciple[] = [
  {
    title: 'Zero Content Retention',
    badge: 'Privacy Invariant',
    badgeVariant: 'success',
    iconName: 'lock',
    iconColor: 'text-status-success',
    description:
      'Submitted content is processed in transient application memory. According to audited active routes, the application does not intentionally persist raw submitted content in its database or application logs.',
    technicalDetails: 'Verified schema constraint: SQLAlchemy models define zero columns for raw user text, article excerpts, or submitted content.',
  },
  {
    title: 'Calibrated Probabilistic Scoring',
    badge: 'Platt Sigmoid Scaling',
    badgeVariant: 'primary',
    iconName: 'spark',
    iconColor: 'text-brand-blue',
    description:
      'Raw machine learning outputs can suffer from overconfidence. VeriNews calibrates outputs using Platt scaling to reflect truthful statistical probabilities.',
    technicalDetails: 'CalibratedClassifierCV mapping linear decision boundaries to true empirical posterior probabilities.',
  },
  {
    title: 'Bilingual Script Pipelines',
    badge: 'Dual Script NLP',
    badgeVariant: 'violet',
    iconName: 'globe',
    iconColor: 'text-brand-violet',
    description:
      'Separate lexical tokenizers and feature spaces for English (Latin alphabet) and Hindi (Devanagari script), preventing language contamination.',
    technicalDetails: 'Dedicated Unicode codepoint inspection [\\u0900-\\u097F] and language-hint validation gates.',
  },
]

export function TransparencySection() {
  return (
    <section
      id="transparency"
      aria-labelledby="transparency-title"
      className="py-20 sm:py-28 border-t border-border/70 relative bg-surface-secondary/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-left">
          <PillBadge
            label="Research & Governance"
            variant="violet"
            glowing
            icon={<Icon name="shield" className="w-3.5 h-3.5 text-brand-violet" />}
            className="mb-4"
          />
          <h2
            id="transparency-title"
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-content-primary tracking-tight leading-[1.12] overflow-visible break-words [text-wrap:balance]"
          >
            Transparency, Calibration &{' '}
            <span className="bg-gradient-to-r from-[#5540D9] via-[#356BFF] to-[#0D9488] dark:from-brand-violet dark:via-brand-blue dark:to-brand-cyan bg-clip-text text-transparent">
              Privacy Standards
            </span>
          </h2>
          <p className="text-base sm:text-lg text-content-secondary mt-3 leading-relaxed">
            VeriNews operates under strict scientific constraints. We document our methodology, acknowledge dataset limitations, and preserve user privacy without compromise.
          </p>
        </div>

        {/* 3 Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {principles.map((p, idx) => (
            <GlassCard key={idx} variant="elevated" glowEffect className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className={`w-11 h-11 rounded-xl bg-surface-secondary flex items-center justify-center ${p.iconColor}`}>
                    <Icon name={p.iconName} className="w-5 h-5" />
                  </div>
                  <PillBadge label={p.badge} variant={p.badgeVariant} />
                </div>
                <h3 className="font-display font-bold text-xl text-content-primary mb-2.5">
                  {p.title}
                </h3>
                <p className="text-sm text-content-secondary leading-relaxed mb-6">
                  {p.description}
                </p>
              </div>
              <div className="pt-4 border-t border-border/60">
                <span className="text-[11px] font-mono font-semibold text-content-muted block uppercase tracking-wider mb-1">
                  Technical Architecture
                </span>
                <p className="text-xs text-content-secondary leading-relaxed font-mono">
                  {p.technicalDetails}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Responsible AI Notice Callout */}
        <GlassCard variant="default" className="p-6 sm:p-7 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="shield" className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-content-primary">
                Scientific Limitations & Fact-Checking Disclaimer
              </h4>
              <p className="text-xs sm:text-sm text-content-secondary mt-1 leading-relaxed max-w-3xl">
                NLP classification models evaluate syntactic and linguistic patterns; they do not perform live investigative journalism. Always cross-verify critical health, electoral, or breaking news reports with accredited fact-checkers.
              </p>
            </div>
          </div>
          <a
            href="#analyzer"
            className="px-5 py-2.5 rounded-full bg-surface border border-border hover:border-brand-blue/50 text-content-primary text-xs font-semibold whitespace-nowrap transition duration-150 flex-shrink-0"
          >
            <span>Analyze Headline</span>
            <Icon name="arrow" className="w-3.5 h-3.5 ml-1.5 inline" />
          </a>
        </GlassCard>
      </div>
    </section>
  )
}
