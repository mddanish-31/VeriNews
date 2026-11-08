'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Icon } from './Icon'
import { ThemeToggle } from './ThemeToggle'

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#why-verinews', label: 'Why VeriNews?' },
  { href: '#analyzer', label: 'Analyze' },
  { href: '#history', label: 'History' },
  { href: '#about', label: 'About' },
]

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('#home')
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const handleLinkClick = (href: string) => {
    setActiveLink(href)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-main/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="#home"
          className="flex items-center gap-2.5 font-display font-bold text-xl sm:text-2xl text-content-primary tracking-tight group focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg"
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

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 lg:gap-2" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive = activeLink === link.href
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => handleLinkClick(link.href)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-surface-secondary text-content-primary shadow-xs'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary/60'
                }`}
                aria-current={isActive ? 'location' : undefined}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        {/* Right Action Cluster: Theme Toggle + CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <a
            href="#analyzer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold shadow-soft hover:shadow-glow-blue transition-all duration-150 active:scale-95"
          >
            <span>Try the Analyzer</span>
            <Icon name="arrow" className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Menu Controls */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            type="button"
            className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center text-content-primary hover:bg-surface-secondary focus-visible:ring-2 focus-visible:ring-brand-blue"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="lg:hidden border-b border-border bg-surface px-4 pt-3 pb-6 shadow-card animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-content-secondary hover:text-content-primary hover:bg-surface-secondary transition-colors"
                aria-current={activeLink === link.href ? 'location' : undefined}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-1 border-t border-border">
              <a
                href="#analyzer"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold shadow-soft"
              >
                <span>Try the Analyzer</span>
                <Icon name="arrow" className="w-4 h-4" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
