'use client'

import React, { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  if (typeof document === 'undefined') return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => observer.disconnect()
}

function getSnapshot(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function getServerSnapshot(): 'light' | 'dark' {
  return 'dark'
}

export interface CinematicThemeSwitcherProps {
  id?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function CinematicThemeSwitcher({
  id = 'cinematic-theme-switcher',
  className = '',
  size = 'md',
}: CinematicThemeSwitcherProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const isDark = theme === 'dark'

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      try {
        localStorage.setItem('verinews-theme', 'dark')
      } catch {}
    } else {
      document.documentElement.classList.remove('dark')
      try {
        localStorage.setItem('verinews-theme', 'light')
      } catch {}
    }
  }

  // Dimension variants
  const trackSize =
    size === 'sm'
      ? 'w-14 h-7 p-[2px]'
      : size === 'lg'
      ? 'w-20 h-10 p-[4px]'
      : 'w-16 h-8 p-[3px]'

  const thumbSize =
    size === 'sm'
      ? 'w-5 h-5'
      : size === 'lg'
      ? 'w-8 h-8'
      : 'w-6 h-6'

  const thumbTranslate =
    size === 'sm'
      ? isDark ? 'translate-x-[26px]' : 'translate-x-0'
      : size === 'lg'
      ? isDark ? 'translate-x-[38px]' : 'translate-x-0'
      : isDark ? 'translate-x-[30px]' : 'translate-x-0'

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to daylight studio mode' : 'Switch to midnight cinema mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className={`relative inline-flex items-center rounded-full transition-all duration-500 ease-in-out cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${trackSize} ${
        isDark
          ? 'bg-gradient-to-r from-[#0d1124] via-[#141a36] to-[#1c1a3e] border border-brand-violet/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_0_15px_rgba(105,72,245,0.25)]'
          : 'bg-gradient-to-r from-[#E2E8F8] via-[#EFF2FF] to-[#FDE68A]/30 border border-border shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_0_15px_rgba(245,158,11,0.2)]'
      } ${className}`}
    >
      {/* Cinematic Ambient Track Lighting & Celestial Particles */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        {/* Dark Mode Celestial Stars */}
        <span
          className={`absolute left-2.5 top-1.5 w-1 h-1 rounded-full bg-white transition-opacity duration-500 ${
            isDark ? 'opacity-85 animate-pulse' : 'opacity-0'
          }`}
        />
        <span
          className={`absolute left-5 bottom-1.5 w-0.5 h-0.5 rounded-full bg-brand-cyan transition-opacity duration-500 ${
            isDark ? 'opacity-75' : 'opacity-0'
          }`}
        />
        <span
          className={`absolute left-3.5 bottom-2.5 w-0.5 h-0.5 rounded-full bg-brand-violet transition-opacity duration-500 ${
            isDark ? 'opacity-70' : 'opacity-0'
          }`}
        />

        {/* Light Mode Soft Rays & Warmth */}
        <span
          className={`absolute right-2.5 top-1.5 w-2.5 h-1.5 rounded-full bg-amber-400/30 blur-[1px] transition-opacity duration-500 ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`absolute right-5 bottom-1.5 w-2 h-1 rounded-full bg-brand-blue/20 blur-[1px] transition-opacity duration-500 ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      {/* Sliding Celestial Thumb */}
      <span
        className={`relative z-10 flex items-center justify-center rounded-full transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${thumbSize} ${thumbTranslate} ${
          isDark
            ? 'bg-gradient-to-tr from-brand-violet via-indigo-600 to-brand-blue text-white shadow-[0_0_12px_rgba(105,72,245,0.7),0_2px_4px_rgba(0,0,0,0.4)]'
            : 'bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-white shadow-[0_0_12px_rgba(245,158,11,0.65),0_2px_4px_rgba(0,0,0,0.15)]'
        }`}
      >
        {isDark ? (
          /* Moon / Crescent Icon */
          <svg
            className="w-3.5 h-3.5 text-white transition-transform duration-500 rotate-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          /* Sun Icon */
          <svg
            className="w-3.5 h-3.5 text-amber-950 transition-transform duration-500 rotate-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        )}
      </span>
    </button>
  )
}

export { CinematicThemeSwitcher }
