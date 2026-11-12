'use client'

import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

export interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  strength?: number
  className?: string
  href?: string
}

export function MagneticButton({
  children,
  strength = 0.3,
  className = '',
  href,
  onClick,
  disabled,
  ...rest
}: MagneticButtonProps) {
  const elementRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null)
  const xTo = useRef<((value: number) => void) | null>(null)
  const yTo = useRef<((value: number) => void) | null>(null)

  useEffect(() => {
    // If reduced motion is enabled or pointer is coarse (touch screen), skip magnetic effect
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches

    if (prefersReducedMotion || isTouch || !elementRef.current) {
      return
    }

    const el = elementRef.current as HTMLElement

    // Initialize quickTo setters for optimal 60fps performance
    xTo.current = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power2.out' })
    yTo.current = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power2.out' })

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (e.clientX - centerX) * strength
      const deltaY = (e.clientY - centerY) * strength

      if (xTo.current && yTo.current) {
        xTo.current(deltaX)
        yTo.current(deltaY)
      }
    }

    const handleMouseLeave = () => {
      if (xTo.current && yTo.current) {
        xTo.current(0)
        yTo.current(0)
      }
    }

    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
      gsap.killTweensOf(el)
    }
  }, [strength])

  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:opacity-50 disabled:cursor-not-allowed select-none'

  if (href) {
    return (
      <a
        ref={elementRef as React.Ref<HTMLAnchorElement>}
        href={href}
        className={`${baseStyles} ${className}`.trim()}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      ref={elementRef as React.Ref<HTMLButtonElement>}
      type={rest.type || 'button'}
      className={`${baseStyles} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
