'use client'

import React from 'react'
import Link from 'next/link'
import { Icon } from './Icon'
import type { ModalType } from './InfoModal'

interface FooterProps {
  onOpenModal: (type: ModalType) => void
}

export function Footer({ onOpenModal }: FooterProps) {
  return (
    <footer className="w-full relative z-10 border-t border-border/80 bg-surface/90 dark:bg-surface/75 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-border/70">
          {/* Brand Identity Column */}
          <div className="md:col-span-1 space-y-4">
            <Link
              href="#home"
              className="inline-flex items-center gap-2.5 font-display font-bold text-xl text-content-primary tracking-tight group"
            >
              <div className="flex items-center gap-1 h-6 w-7" aria-hidden="true">
                <span className="w-1.5 h-4.5 bg-brand-blue/70 rounded-full transform -skew-x-12 transition-transform group-hover:scale-y-110" />
                <span className="w-1.5 h-6 bg-brand-blue rounded-full transform -skew-x-12 transition-transform group-hover:scale-y-110" />
                <span className="w-1.5 h-5 bg-brand-violet rounded-full transform -skew-x-12 transition-transform group-hover:scale-y-110" />
              </div>
              <span>
                Veri<span className="text-brand-blue">News</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed max-w-sm">
              Multilingual fake news detection and news language pattern analysis using calibrated NLP and machine learning.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-secondary text-[11px] font-mono font-medium text-content-muted border border-border/60">
                <span className="w-2 h-2 rounded-full bg-status-success" />
                <span>Zero Content Retention</span>
              </span>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-content-primary">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#home" className="text-content-secondary hover:text-brand-blue transition">
                  Home (WebGL Hero)
                </a>
              </li>
              <li>
                <a href="#why-verinews" className="text-content-secondary hover:text-brand-blue transition">
                  Why VeriNews?
                </a>
              </li>
              <li>
                <a href="#analyzer" className="text-content-secondary hover:text-brand-blue transition">
                  News Analyzer
                </a>
              </li>
              <li>
                <a href="#transparency" className="text-content-secondary hover:text-brand-blue transition">
                  Transparency & Privacy
                </a>
              </li>
              <li>
                <a href="#about" className="text-content-secondary hover:text-brand-blue transition">
                  About the Project
                </a>
              </li>
            </ul>
          </div>

          {/* Research & Methodology Column */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-content-primary">
              Research & Science
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenModal('methodology')}
                  className="text-left text-content-secondary hover:text-brand-blue transition cursor-pointer"
                >
                  NLP Methodology
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenModal('limitations')}
                  className="text-left text-content-secondary hover:text-brand-blue transition cursor-pointer"
                >
                  Model Limitations
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenModal('faq')}
                  className="text-left text-content-secondary hover:text-brand-blue transition cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Column */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-content-primary">
              Governance & Terms
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenModal('privacy')}
                  className="text-left text-content-secondary hover:text-brand-blue transition cursor-pointer"
                >
                  Privacy Policy & Retention
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenModal('terms')}
                  className="text-left text-content-secondary hover:text-brand-blue transition cursor-pointer"
                >
                  Terms of Use
                </button>
              </li>
              <li>
                <span className="text-content-muted text-[11px] block mt-1">
                  Responsible AI Research Preview
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-secondary">
          <p>© {new Date().getFullYear()} VeriNews. Research preview for educational & linguistic inquiry.</p>
          <div className="flex items-center gap-1.5 text-content-muted">
            <Icon name="shield" className="w-3.5 h-3.5 text-brand-blue" />
            <span>AI can inform. It cannot verify reality.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

