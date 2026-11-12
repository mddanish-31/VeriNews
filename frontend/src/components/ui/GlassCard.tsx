import React from 'react'

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'interactive'
  glowEffect?: boolean
  className?: string
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      variant = 'default',
      glowEffect = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const variantStyles = {
      default: 'glass-panel backdrop-blur-md rounded-2xl',
      elevated: 'glass-panel-elevated backdrop-blur-lg rounded-2xl',
      interactive:
        'glass-panel glass-panel-interactive backdrop-blur-md rounded-2xl cursor-pointer hover:-translate-y-0.5 transition-all duration-200',
    }[variant]

    const glowStyles = glowEffect
      ? 'relative before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-r before:from-brand-blue/20 before:via-brand-violet/20 before:to-brand-cyan/20 before:-z-10 before:blur-sm before:transition-opacity before:duration-300'
      : ''

    return (
      <div
        ref={ref}
        className={`${variantStyles} ${glowStyles} ${className}`.trim()}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

