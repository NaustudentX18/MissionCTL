'use client';

import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'purple' | 'green' | 'blue' | 'amber' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_MAP = {
  purple: 'bg-purple-500/10 border-purple-500/40 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
  green: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  blue: 'bg-blue-500/10 border-blue-500/40 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  amber: 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  ghost: 'bg-transparent border-[#1a1a2e] text-slate-400 hover:bg-[#1a1a2e] hover:text-slate-200',
  danger: 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20 hover:border-red-500/60',
};

const SIZE_MAP = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function NeonButton({
  variant = 'purple',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: NeonButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border font-mono font-medium',
        'transition-all duration-200 btn-haptic',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        VARIANT_MAP[variant],
        SIZE_MAP[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
