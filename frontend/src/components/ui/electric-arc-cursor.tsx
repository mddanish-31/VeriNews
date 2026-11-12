'use client'

import React, { useEffect, useRef } from 'react'

export interface ElectricArcCursorProps {
  enabled?: boolean;
  interactive?: boolean;
  intensity?: number;
  trailLength?: number;
  branchCount?: number;
  glowIntensity?: number;
  clickDischarge?: boolean;
  className?: string;
}

interface Point {
  x: number;
  y: number;
  time?: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface DischargeBurst {
  x: number;
  y: number;
  startTime: number;
  duration: number;
  branches: Point[][];
}

export function ElectricArcCursor({
  enabled = true,
  interactive = true,
  intensity = 1.0,
  trailLength = 12,
  branchCount = 3,
  glowIntensity = 1.0,
  clickDischarge = true,
  className = '',
}: ElectricArcCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Fast mutable refs to avoid React re-renders during 60/120fps animation
  const pointerRef = useRef({
    x: -100,
    y: -100,
    prevX: -100,
    prevY: -100,
    speed: 0,
    smoothedSpeed: 0,
    isVisible: false,
    isDown: false,
  })

  const historyRef = useRef<Point[]>([])
  const sparksRef = useRef<Spark[]>([])
  const dischargesRef = useRef<DischargeBurst[]>([])
  const animFrameRef = useRef<number | null>(null)
  const isDarkRef = useRef(true)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Accessibility & touch detection
    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Check dark/light theme
    const updateThemeState = () => {
      isDarkRef.current = document.documentElement.classList.contains('dark')
    }
    updateThemeState()

    const themeObserver = new MutationObserver(updateThemeState)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Pointer events (passive, window-level, non-blocking)
    const handlePointerMove = (e: PointerEvent) => {
      const p = pointerRef.current
      const currentX = e.clientX
      const currentY = e.clientY

      if (!p.isVisible) {
        p.prevX = currentX
        p.prevY = currentY
        p.isVisible = true
      }

      const dx = currentX - p.x
      const dy = currentY - p.y
      p.speed = Math.hypot(dx, dy)
      p.x = currentX
      p.y = currentY

      const now = performance.now()
      historyRef.current.push({ x: currentX, y: currentY, time: now })

      // Keep recent samples (up to 160ms)
      const maxAge = 160
      while (historyRef.current.length > 0 && now - (historyRef.current[0].time || 0) > maxAge) {
        historyRef.current.shift()
      }

      // Spawn movement sparks on energetic movements
      if (!prefersReducedMotion && p.speed > 8 && sparksRef.current.length < 35) {
        const sparkCount = Math.min(Math.floor(p.speed / 12), 3)
        for (let i = 0; i < sparkCount; i++) {
          const angle = Math.random() * Math.PI * 2
          const sparkSpeed = 1.0 + Math.random() * 2.5
          sparksRef.current.push({
            x: currentX + (Math.random() - 0.5) * 6,
            y: currentY + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * sparkSpeed - dx * 0.05,
            vy: Math.sin(angle) * sparkSpeed - dy * 0.05,
            life: 1.0,
            maxLife: 200 + Math.random() * 200,
            size: 1 + Math.random() * 1.8,
            color: isDarkRef.current ? (Math.random() > 0.5 ? '#A78BFA' : '#5227FF') : '#6179F5',
          })
        }
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      pointerRef.current.isDown = true
      if (!clickDischarge || prefersReducedMotion) return

      const cx = e.clientX
      const cy = e.clientY
      const now = performance.now()

      // Generate 7-10 radial lightning bolts
      const boltCount = 8 + Math.floor(Math.random() * 4)
      const burstBranches: Point[][] = []

      for (let i = 0; i < boltCount; i++) {
        const baseAngle = (i / boltCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
        const boltLength = 35 + Math.random() * 45
        const targetX = cx + Math.cos(baseAngle) * boltLength
        const targetY = cy + Math.sin(baseAngle) * boltLength

        const branchPoints = generateLightningSegments({ x: cx, y: cy }, { x: targetX, y: targetY }, 3, 14)
        burstBranches.push(branchPoints)
      }

      dischargesRef.current.push({
        x: cx,
        y: cy,
        startTime: now,
        duration: 280,
        branches: burstBranches,
      })

      // Spawn radial sparks
      const sparkTotal = 16
      for (let i = 0; i < sparkTotal; i++) {
        const angle = Math.random() * Math.PI * 2
        const spd = 2.0 + Math.random() * 4.5
        sparksRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 1.0,
          maxLife: 260 + Math.random() * 180,
          size: 1.2 + Math.random() * 2.2,
          color: isDarkRef.current ? '#FFFFFF' : '#7048E8',
        })
      }
    }

    const handlePointerUp = () => {
      pointerRef.current.isDown = false
    }

    const handlePointerLeave = () => {
      pointerRef.current.isVisible = false
      historyRef.current = []
    }

    const handlePointerEnter = () => {
      pointerRef.current.isVisible = true
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    document.addEventListener('mouseleave', handlePointerLeave)
    document.addEventListener('mouseenter', handlePointerEnter)

    // Midpoint displacement procedural lightning generator
    function generateLightningSegments(p1: Point, p2: Point, depth: number, maxDisplace: number): Point[] {
      if (depth <= 0) {
        return [p1, p2]
      }

      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const len = Math.hypot(dx, dy)
      if (len < 2) return [p1, p2]

      // Perpendicular normal vector
      const nx = -dy / len
      const ny = dx / len
      const displacement = (Math.random() - 0.5) * maxDisplace

      const mid: Point = {
        x: (p1.x + p2.x) * 0.5 + nx * displacement,
        y: (p1.y + p2.y) * 0.5 + ny * displacement,
      }

      const left = generateLightningSegments(p1, mid, depth - 1, maxDisplace * 0.58)
      const right = generateLightningSegments(mid, p2, depth - 1, maxDisplace * 0.58)

      return left.slice(0, -1).concat(right)
    }

    // Animation & Rendering Loop
    let lastTime = performance.now()

    const render = (time: number) => {
      const dt = Math.min(time - lastTime, 40)
      lastTime = time

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(dpr, dpr)

      const p = pointerRef.current
      const isDark = isDarkRef.current

      // Smooth the speed metric for organic elasticity
      p.smoothedSpeed += (p.speed - p.smoothedSpeed) * 0.15
      p.speed *= 0.88 // Decelerate when mouse stops

      // Filter expired history points
      const now = time
      const maxAge = prefersReducedMotion ? 60 : 150
      while (historyRef.current.length > 0 && now - (historyRef.current[0].time || 0) > maxAge) {
        historyRef.current.shift()
      }

      // Set blend mode: Dark uses luminous additive glow, Light uses crisp saturated strokes
      ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over'

      // 1. Render Click Discharges
      if (dischargesRef.current.length > 0) {
        dischargesRef.current = dischargesRef.current.filter((d) => {
          const age = now - d.startTime
          if (age >= d.duration) return false
          const progress = age / d.duration
          const alpha = (1 - progress) * (1 - progress)

          ctx.lineWidth = isDark ? 2.5 * (1 - progress * 0.5) : 2.0
          ctx.strokeStyle = isDark
            ? `rgba(255, 255, 255, ${alpha})`
            : `rgba(112, 72, 232, ${alpha * 0.95})`
          ctx.shadowColor = isDark ? '#7B5CFF' : '#5227FF'
          ctx.shadowBlur = isDark ? 16 * (1 - progress) : 6

          for (const branch of d.branches) {
            if (branch.length < 2) continue
            ctx.beginPath()
            ctx.moveTo(branch[0].x, branch[0].y)
            for (let i = 1; i < branch.length; i++) {
              ctx.lineTo(branch[i].x, branch[i].y)
            }
            ctx.stroke()
          }

          // Core flash ring
          ctx.beginPath()
          ctx.arc(d.x, d.y, 4 + progress * 24, 0, Math.PI * 2)
          ctx.strokeStyle = isDark
            ? `rgba(167, 139, 250, ${alpha * 0.7})`
            : `rgba(97, 121, 245, ${alpha * 0.7})`
          ctx.lineWidth = 1.5
          ctx.stroke()

          return true
        })
      }

      // 2. Render Sparks
      if (sparksRef.current.length > 0) {
        sparksRef.current = sparksRef.current.filter((s) => {
          s.x += s.vx
          s.y += s.vy
          s.vx *= 0.93
          s.vy *= 0.93
          s.life -= dt / s.maxLife
          if (s.life <= 0) return false

          const alpha = s.life
          ctx.fillStyle = s.color
          ctx.globalAlpha = alpha
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.size * alpha, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1.0
          return true
        })
      }

      // 3. Render Electric Arc Trail (connecting recent points to current pointer)
      if (p.isVisible && historyRef.current.length > 1 && !isCoarse) {
        const hist = historyRef.current
        const pts: Point[] = []

        // Sample points along history
        const step = Math.max(1, Math.floor(hist.length / Math.min(hist.length, trailLength)))
        for (let i = 0; i < hist.length; i += step) {
          pts.push(hist[i])
        }
        if (pts[pts.length - 1] !== hist[hist.length - 1]) {
          pts.push(hist[hist.length - 1])
        }

        // Generate jagged electric segments between consecutive history nodes
        const lightningPath: Point[] = []
        for (let i = 0; i < pts.length - 1; i++) {
          const segDist = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y)
          const displace = Math.min(segDist * 0.35, 12) * intensity
          const segs = generateLightningSegments(pts[i], pts[i + 1], 2, displace)
          if (i === 0) {
            lightningPath.push(...segs)
          } else {
            lightningPath.push(...segs.slice(1))
          }
        }

        if (lightningPath.length > 1) {
          const speedFactor = Math.min(p.smoothedSpeed / 15, 1.0)

          // Outer Glow Pass
          ctx.beginPath()
          ctx.moveTo(lightningPath[0].x, lightningPath[0].y)
          for (let i = 1; i < lightningPath.length; i++) {
            ctx.lineTo(lightningPath[i].x, lightningPath[i].y)
          }
          ctx.strokeStyle = isDark ? 'rgba(82, 39, 255, 0.45)' : 'rgba(97, 121, 245, 0.35)'
          ctx.lineWidth = (3.5 + speedFactor * 2.5) * intensity
          ctx.shadowColor = isDark ? '#7B5CFF' : '#5227FF'
          ctx.shadowBlur = isDark ? 14 * glowIntensity : 6 * glowIntensity
          ctx.stroke()

          // Main Electric Filament Pass
          ctx.beginPath()
          ctx.moveTo(lightningPath[0].x, lightningPath[0].y)
          for (let i = 1; i < lightningPath.length; i++) {
            ctx.lineTo(lightningPath[i].x, lightningPath[i].y)
          }
          ctx.strokeStyle = isDark ? '#A78BFA' : '#7048E8'
          ctx.lineWidth = (2.0 + speedFactor * 1.0) * intensity
          ctx.shadowBlur = isDark ? 8 : 2
          ctx.stroke()

          // Inner Bright Filament Pass
          ctx.beginPath()
          ctx.moveTo(lightningPath[0].x, lightningPath[0].y)
          for (let i = 1; i < lightningPath.length; i++) {
            ctx.lineTo(lightningPath[i].x, lightningPath[i].y)
          }
          ctx.strokeStyle = isDark ? '#FFFFFF' : '#FAF5FF'
          ctx.lineWidth = 1.0
          ctx.shadowBlur = 0
          ctx.stroke()

          // 4. Branching Electric Filaments
          if (!prefersReducedMotion && speedFactor > 0.15) {
            const actualBranches = Math.min(branchCount, Math.floor(lightningPath.length / 4))
            for (let b = 0; b < actualBranches; b++) {
              const idx = Math.floor(
                (lightningPath.length * (b + 1)) / (actualBranches + 1)
              )
              const root = lightningPath[idx]
              if (!root) continue

              const branchAngle =
                Math.random() * Math.PI * 2
              const branchLen = (12 + Math.random() * 18 * speedFactor) * intensity
              const target: Point = {
                x: root.x + Math.cos(branchAngle) * branchLen,
                y: root.y + Math.sin(branchAngle) * branchLen,
              }
              const branchPts = generateLightningSegments(root, target, 2, 7)

              ctx.beginPath()
              ctx.moveTo(branchPts[0].x, branchPts[0].y)
              for (let j = 1; j < branchPts.length; j++) {
                ctx.lineTo(branchPts[j].x, branchPts[j].y)
              }
              ctx.strokeStyle = isDark
                ? 'rgba(167, 139, 250, 0.75)'
                : 'rgba(112, 72, 232, 0.85)'
              ctx.lineWidth = 1.0
              ctx.stroke()
            }
          }
        }
      }

      // 5. Electric Central Core (at Pointer)
      if (p.isVisible && !isCoarse) {
        const coreRadius = (3.5 + Math.min(p.smoothedSpeed / 10, 2.5)) * intensity

        // Outer Aura
        const auraGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, coreRadius * 4.5)
        if (isDark) {
          auraGrad.addColorStop(0, 'rgba(123, 92, 255, 0.7)')
          auraGrad.addColorStop(0.4, 'rgba(82, 39, 255, 0.25)')
          auraGrad.addColorStop(1, 'rgba(82, 39, 255, 0)')
        } else {
          auraGrad.addColorStop(0, 'rgba(112, 72, 232, 0.45)')
          auraGrad.addColorStop(0.5, 'rgba(97, 121, 245, 0.18)')
          auraGrad.addColorStop(1, 'rgba(97, 121, 245, 0)')
        }
        ctx.fillStyle = auraGrad
        ctx.beginPath()
        ctx.arc(p.x, p.y, coreRadius * 4.5, 0, Math.PI * 2)
        ctx.fill()

        // Filament Micro-Tendrils on Core
        if (!prefersReducedMotion) {
          ctx.strokeStyle = isDark ? '#A78BFA' : '#7048E8'
          ctx.lineWidth = 1.0
          for (let i = 0; i < 3; i++) {
            const a = (i * Math.PI * 2) / 3 + time * 0.005 + (Math.random() - 0.5) * 0.4
            const len = coreRadius * (1.6 + Math.random() * 0.8)
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p.x + Math.cos(a) * len, p.y + Math.sin(a) * len)
            ctx.stroke()
          }
        }

        // Hot Inner Electric Core
        ctx.beginPath()
        ctx.arc(p.x, p.y, coreRadius, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? '#FFFFFF' : '#FAF5FF'
        ctx.shadowColor = isDark ? '#7B5CFF' : '#5227FF'
        ctx.shadowBlur = isDark ? 10 * glowIntensity : 4 * glowIntensity
        ctx.fill()

        if (!isDark) {
          // Sharp edge contrast outline in light mode
          ctx.strokeStyle = 'rgba(112, 72, 232, 0.9)'
          ctx.lineWidth = 1.0
          ctx.stroke()
        }
      }

      ctx.restore()
      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('mouseleave', handlePointerLeave)
      document.removeEventListener('mouseenter', handlePointerEnter)
      themeObserver.disconnect()

      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [enabled, interactive, intensity, trailLength, branchCount, glowIntensity, clickDischarge])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      id="electric-arc-cursor"
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[9999] h-full w-full select-none ${className}`}
    />
  )
}

export default ElectricArcCursor

