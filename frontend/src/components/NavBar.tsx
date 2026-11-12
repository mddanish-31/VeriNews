'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Icon } from './Icon'
import CinematicThemeSwitcher from './ui/cinematic-theme-switcher'
import { LiquidButton } from './ui/liquid-glass-button'
import SegmentedControl from './ui/segmented-control'

interface NavLinkItem {
  href: string
  label: string
}

const navLinks: NavLinkItem[] = [
  { href: '#home', label: 'Home' },
  { href: '#why-verinews', label: 'Why VeriNews?' },
  { href: '#analyzer', label: 'Analyze' },
  { href: '#transparency', label: 'Transparency' },
  { href: '#about', label: 'About' },
]

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('#home')
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  // 1. Keyboard accessibility: Escape dismiss and circular Tab focus trapping
  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      } else if (event.key === 'Tab' && drawerRef.current) {
        const focusable = [
          menuButtonRef.current,
          ...Array.from(
            drawerRef.current.querySelectorAll<HTMLElement>(
              'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ),
        ].filter((el): el is HTMLElement => el !== null && !el.hasAttribute('disabled'))

        if (focusable.length > 0) {
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  // 2. Scroll Spy with IntersectionObserver to track active section
  useEffect(() => {
    const sectionIds = navLinks.map((item) => item.href.replace('#', ''))
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible section with highest intersection ratio
        const visibleEntry = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visibleEntry?.target?.id) {
          setActiveLink(`#${visibleEntry.target.id}`)
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0.1, 0.3, 0.6],
      }
    )

    sections.forEach((sec) => observer.observe(sec))
    return () => observer.disconnect()
  }, [])

  const handleLinkClick = (href: string) => {
    setActiveLink(href)
    setMenuOpen(false)
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 w-full bg-transparent border-none pointer-events-none transition-all duration-300">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between">
        {/* LEFT: VeriNews Logo */}
        <div className="flex-1 flex items-center justify-start pointer-events-auto">
          <Link
            href="#home"
            className="flex items-center gap-2.5 font-display font-bold text-xl sm:text-2xl text-content-primary tracking-tight group focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg select-none"
            onClick={() => handleLinkClick('#home')}
            aria-label="VeriNews Home"
          >
            {/* 3 Slanted Pill Stripes */}
            <div className="flex items-center gap-1 h-6 w-7" aria-hidden="true">
              <span className="w-1.5 h-4.5 bg-brand-blue/70 rounded-full transform -skew-x-12 transition-transform group-hover:scale-y-110" />
              <span className="w-1.5 h-6 bg-brand-blue rounded-full transform -skew-x-12 transition-transform group-hover:scale-y-110" />
              <span className="w-1.5 h-5 bg-brand-violet rounded-full transform -skew-x-12 transition-transform group-hover:scale-y-110" />
            </div>
            <span>
              Veri<span className="text-brand-blue">News</span>
            </span>
          </Link>
        </div>

        {/* CENTER: Navigation Capsule (Segmented Control matching reference image 3) */}
        <nav className="hidden lg:flex items-center justify-center flex-shrink-0 pointer-events-auto" aria-label="Main navigation">
          <SegmentedControl
            options={navLinks.map((link) => ({
              value: link.href,
              label: link.label,
              href: link.href,
            }))}
            value={activeLink}
            onValueChange={(val) => {
              setActiveLink(val)
              const target = document.querySelector(val)
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            label="Main navigation"
            size="md"
          />
        </nav>

        {/* RIGHT: Theme Switcher + Liquid Glass CTA Button */}
        <div className="hidden lg:flex flex-1 items-center justify-end gap-3.5 pointer-events-auto">
          <CinematicThemeSwitcher id="desktop-theme-switcher" />
          <LiquidButton
            id="nav-analyzer-cta"
            variant="primary"
            size="sm"
            href="#analyzer"
            icon={<Icon name="arrow" className="w-3.5 h-3.5 ml-1" />}
          >
            Try the Analyzer
          </LiquidButton>
        </div>

        {/* MOBILE: Theme Switcher + Hamburger Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2 pointer-events-auto">
          <CinematicThemeSwitcher id="mobile-theme-switcher" size="sm" />
          <button
            ref={menuButtonRef}
            type="button"
            className="w-10 h-10 rounded-full border border-slate-300/80 dark:border-white/20 bg-white/70 dark:bg-[#0c1024]/70 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center text-content-primary hover:bg-white/90 dark:hover:bg-[#151a36] focus-visible:ring-2 focus-visible:ring-brand-blue"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Glassmorphism */}
      {menuOpen && (
        <div
          ref={drawerRef}
          role="region"
          aria-label="Mobile navigation menu"
          className="lg:hidden pointer-events-auto max-w-md mx-4 mt-1 rounded-2xl border border-slate-300/80 dark:border-white/20 bg-white/85 dark:bg-[#0c1024]/90 backdrop-blur-2xl px-4 pt-3 pb-6 shadow-[0_12px_40px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => handleLinkClick(link.href)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeLink === link.href
                    ? 'bg-surface-secondary text-brand-blue font-semibold'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
                }`}
                aria-current={activeLink === link.href ? 'location' : undefined}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-1 border-t border-border">
              <LiquidButton
                variant="primary"
                size="md"
                href="#analyzer"
                onClick={() => setMenuOpen(false)}
                icon={<Icon name="arrow" className="w-4 h-4 ml-1" />}
                className="w-full"
              >
                Try the Analyzer
              </LiquidButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
