'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CyberCardProps {
  children: ReactNode;
  className?: string;
  accent?: 'purple' | 'green' | 'blue' | 'amber' | 'none';
  onClick?: () => void;
  hoverable?: boolean;
}

const ACCENT_MAP = {
  purple: 'before:from-purple-500/50',
  green: 'before:from-emerald-500/50',
  blue: 'before:from-blue-500/50',
  amber: 'before:from-amber-500/50',
  none: 'before:from-transparent',
};

export function CyberCard({ children, className, accent = 'purple', onClick, hoverable = false }: CyberCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border border-[#1a1a2e] bg-[#0f0f18]',
        'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:to-transparent before:via-white/10',
        ACCENT_MAP[accent],
        hoverable && 'cursor-pointer transition-all duration-200 hover:border-purple-500/30 hover:bg-[#12121f]',
        className
      )}
    >
      {children}
    </div>
  );
}
