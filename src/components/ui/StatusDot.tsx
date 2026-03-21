'use client';

import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: 'active' | 'inactive' | 'error' | 'loading';
  label?: string;
  className?: string;
}

const STATUS_MAP = {
  active: { dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]', text: 'text-emerald-400', label: 'Active' },
  inactive: { dot: 'bg-slate-600', text: 'text-slate-500', label: 'Not Connected' },
  error: { dot: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]', text: 'text-red-400', label: 'Error' },
  loading: { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400', label: 'Testing...' },
};

export function StatusDot({ status, label, className }: StatusDotProps) {
  const config = STATUS_MAP[status];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('w-2 h-2 rounded-full pulse-dot', config.dot)} />
      <span className={cn('text-xs font-mono', config.text)}>
        {label ?? config.label}
      </span>
    </div>
  );
}
