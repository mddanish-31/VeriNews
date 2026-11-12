'use client'

import React from 'react'
import { Icon, type IconName } from '../Icon'
import { GlassCard } from '../ui/GlassCard'
import { PillBadge } from '../ui/PillBadge'

interface FeaturePillar {
  title: string
  category: string
  badgeVariant: 'primary' | 'violet' | 'success'
  iconName: IconName
  iconColorClass: string
  bgIconClass: string
  description: string
  details: string[]
}

const pillars: FeaturePillar[] = [
  {
    title: 'Language Analysis',
    category: 'Bilingual NLP',
    badgeVariant: 'primary',
    iconName: 'lightning',
    iconColorClass: 'text-brand-blue',
    bgIconClass: 'bg-brand-blue/10 dark:bg-brand-blue/20',
    description:
      'Studies writing style, grammatical patterns, and lexical distributions across Latin and Devanagari scripts.',
    details: [
      'Unicode script detection for English & Hindi',
      'TF-IDF n-gram tokenization and weighting',
      'Local vocabulary frequency attribution',
    ],
  },
  {
    title: 'Pattern Detection',
    category: 'Stylistic Markers',
    badgeVariant: 'violet',
    iconName: 'layers',
    iconColorClass: 'text-brand-violet',
    bgIconClass: 'bg-brand-violet/10 dark:bg-brand-violet/20',
    description:
      'Identifies structural signals of misleading reporting, sensationalism, and manufactured rhetorical urgency.',
    details: [
      'Exaggerated adjective & punctuation density',
      'Manufactured urgency syntax detection',
      'Statistical correlation against training baselines',
    ],
  },
  {
    title: 'Context First',
    category: 'Epistemic Modesty',
    badgeVariant: 'success',
    iconName: 'shield',
    iconColorClass: 'text-status-success',
    bgIconClass: 'bg-status-success/10 dark:bg-status-success/20',
    description:
      'Encourages critical inquiry rather than trusting algorithmic models as arbiters of factual truth.',
    details: [
      'Models evaluate language, not physical events',
      'Uncertainty calibration via Platt sigmoid scaling',
      'Direct guidance to consult credentialed fact-checkers',
    ],
  },
]

export function WhyVeriNewsSection() {
  return (
    <section
      id="why-verinews"
      aria-labelledby="why-title"
      className="py-20 sm:py-28 border-t border-border/70 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <PillBadge
              label="Core Philosophy"
              variant="cyan"
              glowing
              icon={<Icon name="spark" className="w-3.5 h-3.5 text-brand-cyan" />}
              className="mb-4"
            />
            <h2
              id="why-title"
              className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-content-primary tracking-tight leading-[1.12] overflow-visible break-words [text-wrap:balance]"
            >
              Why{' '}
              <span className="bg-gradient-to-r from-[#5540D9] to-[#2563EB] dark:from-[#8A68FF] dark:to-[#00F0FF] bg-clip-text text-transparent">
                VeriNews?
              </span>
            </h2>
            <p className="text-base sm:text-lg text-content-secondary mt-3 leading-relaxed">
              A transparent, research-driven framework designed to analyze news language patterns without overreaching into factual arbitration.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-content-muted">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            <span>Calibrated Linguistic Framework</span>
          </div>
        </div>

        {/* 3 Interactive Feature Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {pillars.map((pillar, idx) => (
            <GlassCard
              key={idx}
              variant="interactive"
              glowEffect
              className="p-6 sm:p-8 flex flex-col justify-between"
            >
              <div>
                {/* Header Icon + Pill */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl ${pillar.bgIconClass} ${pillar.iconColorClass} flex items-center justify-center shadow-inner`}
                  >
                    <Icon name={pillar.iconName} className="w-6 h-6" />
                  </div>
                  <PillBadge label={pillar.category} variant={pillar.badgeVariant} />
                </div>

                {/* Title & Description */}
                <h3 className="font-display font-bold text-xl sm:text-2xl text-content-primary mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-content-secondary leading-relaxed mb-6">
                  {pillar.description}
                </p>
              </div>

              {/* Sub-Feature Bullets */}
              <div className="pt-5 border-t border-border/60">
                <ul className="space-y-2 text-xs text-content-secondary">
                  {pillar.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2">
                      <span className={`${pillar.iconColorClass} font-bold mt-0.5`}>✓</span>
                      <span className="leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
