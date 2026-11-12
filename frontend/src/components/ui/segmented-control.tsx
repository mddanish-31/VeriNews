'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  href?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  label = 'Navigation',
  className = '',
  size = 'md',
}: SegmentedControlProps<T>) {
  const [internalValue, setInternalValue] = useState<T>(
    value ?? defaultValue ?? options[0]?.value
  );

  const activeValue = value !== undefined ? value : internalValue;

  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Map<string, HTMLButtonElement | HTMLAnchorElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Track active item position for smooth sliding pill
  useEffect(() => {
    const activeEl = itemsRef.current.get(activeValue);
    const container = containerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
        opacity: 1,
      });
    }
  }, [activeValue, options]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      const activeEl = itemsRef.current.get(activeValue);
      const container = containerRef.current;
      if (activeEl && container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        setIndicatorStyle({
          left: elRect.left - containerRect.left,
          width: elRect.width,
          opacity: 1,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeValue]);

  const handleSelect = (newValue: T, href?: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);

    if (href && typeof window !== 'undefined') {
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Keyboard roving navigation
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = options.length - 1;
    }

    if (nextIndex !== currentIndex) {
      const nextOption = options[nextIndex];
      if (nextOption && !nextOption.disabled) {
        handleSelect(nextOption.value, nextOption.href);
        itemsRef.current.get(nextOption.value)?.focus();
      }
    }
  };

  const sizeClasses = {
    sm: 'text-[11px] py-1 px-3',
    md: 'text-[13px] sm:text-[14px] py-2 px-4 sm:px-5',
    lg: 'text-sm py-2.5 px-6',
  }[size];

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label}
      className={`group/nav relative inline-flex items-center rounded-full p-1 select-none overflow-hidden transition-all duration-300
        bg-white/80 dark:bg-[#0c101d]/85
        backdrop-blur-xl
        border border-slate-300/80 dark:border-white/[0.14]
        shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)]
        ${className}`}
    >
      {/* Sliding Active Inset Capsule matching exact reference design */}
      <span
        className="absolute top-1 bottom-1 rounded-full pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          bg-slate-900 dark:bg-[#111525]
          border border-slate-900/90 dark:border-white
          shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
        style={{
          transform: `translateX(${indicatorStyle.left}px)`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
        }}
        aria-hidden="true"
      />

      {/* Options */}
      {options.map((option, index) => {
        const isSelected = activeValue === option.value;
        const Tag = option.href ? 'a' : 'button';

        return (
          <Tag
            key={option.value}
            ref={(el: HTMLButtonElement | HTMLAnchorElement | null) => {
              if (el) itemsRef.current.set(option.value, el);
              else itemsRef.current.delete(option.value);
            }}
            href={option.href}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            disabled={option.disabled}
            onClick={(e) => {
              if (option.href && option.href.startsWith('#')) {
                e.preventDefault();
              }
              if (!option.disabled) {
                handleSelect(option.value, option.href);
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`relative z-10 rounded-full font-medium transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${sizeClasses} ${
              isSelected
                ? 'text-white dark:text-white font-semibold'
                : 'text-slate-600 dark:text-[#9099AE] hover:text-slate-950 dark:hover:text-white'
            } ${option.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {option.label}
          </Tag>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
