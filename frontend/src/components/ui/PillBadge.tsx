import React from 'react'

export interface PillBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string
  icon?: React.ReactNode
  variant?: 'primary' | 'cyan' | 'violet' | 'success' | 'warning' | 'danger' | 'neutral'
  glowing?: boolean
  className?: string
}

export const PillBadge = React.forwardRef<HTMLSpanElement, PillBadgeProps>(
  (
    {
      label,
      icon,
      variant = 'primary',
      glowing = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const variantStyles: Record<string, string> = {
      primary:
        'bg-brand-blue/10 text-[#2563EB] border-brand-blue/30 dark:bg-brand-blue/15 dark:text-blue-400 dark:border-brand-blue/40',
      cyan:
        'bg-cyan-500/10 text-[#0E7490] border-cyan-500/30 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/40',
      violet:
        'bg-brand-violet/10 text-[#5540D9] border-brand-violet/30 dark:bg-brand-violet/15 dark:text-purple-300 dark:border-brand-violet/40',
      success:
        'bg-emerald-500/10 text-[#047857] border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40',
      warning:
        'bg-amber-500/10 text-[#B45309] border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40',
      danger:
        'bg-rose-500/10 text-[#B91C1C] border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/40',
      neutral:
        'bg-gray-500/10 text-slate-800 border-gray-300 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700',
    }

    const glowClasses = glowing
      ? variant === 'cyan'
        ? 'shadow-glow-cyan-sm'
        : variant === 'violet'
        ? 'shadow-glow-violet-sm'
        : 'shadow-sm'
      : ''

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border backdrop-blur-md transition-all duration-200 select-none ${variantStyles[variant] || variantStyles.primary} ${glowClasses} ${className}`.trim()}
        {...rest}
      >
        {icon && <span className="flex-shrink-0 flex items-center justify-center">{icon}</span>}
        <span>{label}</span>
      </span>
    )
  }
)

PillBadge.displayName = 'PillBadge'

