'use client'

import { useSyncExternalStore } from 'react'
import { Icon } from './Icon'

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => observer.disconnect()
}

function getSnapshot(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function getServerSnapshot(): 'light' | 'dark' {
  return 'light'
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      try {
        localStorage.setItem('verinews-theme', 'dark')
      } catch {
        // ignore storage errors
      }
    } else {
      document.documentElement.classList.remove('dark')
      try {
        localStorage.setItem('verinews-theme', 'light')
      } catch {
        // ignore storage errors
      }
    }
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full border border-border bg-surface hover:bg-surface-secondary text-content-primary flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-brand-blue"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Icon name="moon" className="w-4 h-4 text-brand-blue" />
      ) : (
        <Icon name="sun" className="w-4 h-4 text-amber-500" />
      )}
    </button>
  )
}
