'use client';

import { PROVIDERS } from '@/lib/providers';
import type { AIProvider } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProviderBadgeProps {
  provider: AIProvider;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const COLOR_MAP: Record<AIProvider, { text: string; border: string; bg: string }> = {
  claude: {
    text: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
  },
  openai: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
  },
  gemini: {
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
  },
  groq: {
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
  },
};

const SIZE_MAP = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export function ProviderBadge({ provider, size = 'md', showName = true, className }: ProviderBadgeProps) {
  const colors = COLOR_MAP[provider];
  const config = PROVIDERS[provider];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-mono font-semibold',
        colors.text,
        colors.border,
        colors.bg,
        SIZE_MAP[size],
        className
      )}
    >
      <span>{config.icon}</span>
      {showName && <span>{config.name}</span>}
    </span>
  );
}
