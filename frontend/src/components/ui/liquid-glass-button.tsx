'use client';

import React, { forwardRef } from 'react';

export interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'default';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}

export const LiquidButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, LiquidButtonProps>(
  (
    {
      variant = 'primary',
      size = 'lg',
      href,
      icon,
      iconPosition = 'right',
      className = '',
      children,
      onClick,
      ...rest
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      sm: 'h-9 px-4 text-xs font-semibold gap-1.5 rounded-full',
      md: 'h-11 px-6 text-sm font-semibold gap-2 rounded-full',
      lg: 'h-13 px-8 py-3.5 text-sm sm:text-base font-semibold gap-2.5 rounded-full',
      xl: 'h-15 px-10 py-4 text-base sm:text-lg font-semibold gap-3 rounded-full',
    }[size];

    // Variant classes
    const variantClasses = {
      primary:
        'bg-gradient-to-r from-[#6948F5] via-[#4F56F6] to-[#356BFF] text-white border border-white/30 shadow-[0_0_28px_rgba(105,72,245,0.45),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:shadow-[0_0_36px_rgba(105,72,245,0.65),inset_0_1px_1px_rgba(255,255,255,0.7)]',
      secondary:
        'bg-slate-900/[0.05] dark:bg-white/[0.08] hover:bg-slate-900/[0.10] dark:hover:bg-white/[0.15] text-slate-800 dark:text-white border border-slate-300/80 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-xl',
      outline:
        'bg-transparent hover:bg-white/[0.08] text-white/90 hover:text-white border border-white/25 hover:border-white/50 backdrop-blur-md',
      default:
        'bg-white/[0.1] hover:bg-white/[0.18] text-white border border-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-lg',
    }[variant];

    const baseStyles =
      'group relative inline-flex items-center justify-center select-none overflow-hidden cursor-pointer transition-all duration-300 ease-out active:scale-[0.97] hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black';

    const content = (
      <>
        {/* Specular Liquid Glass Top Reflection */}
        <span
          className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t-full transition-opacity duration-300 group-hover:from-white/45"
          aria-hidden="true"
        />

        {/* Ambient Liquid Sheen Glow */}
        <span
          className="absolute -inset-1 rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out"
          aria-hidden="true"
        />

        {/* Inner Content Label & Icon */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {icon && iconPosition === 'left' && <span className="transition-transform duration-200 group-hover:-translate-x-0.5">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="transition-transform duration-200 group-hover:translate-x-0.5">{icon}</span>}
        </span>
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
          className={`${baseStyles} ${sizeClasses} ${variantClasses} ${className}`}
          role="button"
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={(rest as React.ButtonHTMLAttributes<HTMLButtonElement>).type || 'button'}
        onClick={onClick}
        className={`${baseStyles} ${sizeClasses} ${variantClasses} ${className}`}
        {...rest}
      >
        {content}
      </button>
    );
  }
);

LiquidButton.displayName = 'LiquidButton';

export default LiquidButton;
