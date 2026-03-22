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

const SIZE_MAP = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export function ProviderBadge({ provider, size = 'md', showName = true, className }: ProviderBadgeProps) {
  const config = PROVIDERS[provider];
  if (!config) return null;

  const color = config.color;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-mono font-semibold',
        SIZE_MAP[size],
        className
      )}
      style={{
        color,
        borderColor: `${color}50`,
        backgroundColor: `${color}15`,
      }}
    >
      <span>{config.icon}</span>
      {showName && <span>{config.name}</span>}
    </span>
  );
}
