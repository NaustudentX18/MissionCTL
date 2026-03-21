'use client';

import { CyberCard } from '@/components/ui/CyberCard';
import { StatusDot } from '@/components/ui/StatusDot';
import { PROVIDERS } from '@/lib/providers';
import type { AIProvider } from '@/lib/types';
import { formatCost, formatTokens } from '@/lib/utils';
import { useMissionStore } from '@/lib/store';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProviderStatCardProps {
  provider: AIProvider;
}

const ACCENT_MAP: Record<AIProvider, 'purple' | 'green' | 'blue' | 'amber'> = {
  claude: 'purple',
  openai: 'green',
  gemini: 'blue',
  groq: 'amber',
};

const PROVIDER_MOCK_STATS: Record<AIProvider, {
  tokensUsed: number;
  costThisMonth: number;
  costPerRequest: number;
  requests: number;
  trend: number;
  creditRemaining?: number;
}> = {
  claude: {
    tokensUsed: 2_840_000,
    costThisMonth: 8.52,
    costPerRequest: 0.0032,
    requests: 2661,
    trend: 12.4,
    creditRemaining: 41.48,
  },
  openai: {
    tokensUsed: 1_920_000,
    costThisMonth: 4.80,
    costPerRequest: 0.0028,
    requests: 1714,
    trend: -5.2,
    creditRemaining: 95.20,
  },
  gemini: {
    tokensUsed: 5_100_000,
    costThisMonth: 0.51,
    costPerRequest: 0.0003,
    requests: 1700,
    trend: 28.7,
    creditRemaining: undefined, // Free tier
  },
  groq: {
    tokensUsed: 890_000,
    costThisMonth: 0.18,
    costPerRequest: 0.0001,
    requests: 1800,
    trend: 6.1,
    creditRemaining: undefined, // Free tier
  },
};

export function ProviderStatCard({ provider }: ProviderStatCardProps) {
  const config = PROVIDERS[provider];
  const apiKey = useMissionStore(s => s.apiKeys[provider]);
  const stats = PROVIDER_MOCK_STATS[provider];
  const accent = ACCENT_MAP[provider];

  const isConnected = apiKey.isValid === true;
  const status = apiKey.isValid === true ? 'active' : apiKey.isValid === false ? 'error' : 'inactive';

  const COLOR_CLASS: Record<AIProvider, string> = {
    claude: 'text-purple-400',
    openai: 'text-emerald-400',
    gemini: 'text-blue-400',
    groq: 'text-amber-400',
  };

  const BORDER_COLOR: Record<AIProvider, string> = {
    claude: 'border-purple-500/20',
    openai: 'border-emerald-500/20',
    gemini: 'border-blue-500/20',
    groq: 'border-amber-500/20',
  };

  return (
    <CyberCard accent={accent} className="p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border ${BORDER_COLOR[provider]} bg-black/30`}>
            {config.icon}
          </div>
          <div>
            <h3 className={`font-mono font-bold text-base ${COLOR_CLASS[provider]}`}>
              {config.name}
            </h3>
            <StatusDot status={status} />
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-mono ${stats.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {stats.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(stats.trend)}%
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-xs text-slate-500 font-mono mb-1">TOKENS USED</div>
          <div className={`text-lg font-bold font-mono ${COLOR_CLASS[provider]}`}>
            {isConnected ? formatTokens(stats.tokensUsed) : '—'}
          </div>
          <div className="text-xs text-slate-600 font-mono">this month</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-xs text-slate-500 font-mono mb-1">COST / MTH</div>
          <div className={`text-lg font-bold font-mono ${COLOR_CLASS[provider]}`}>
            {isConnected ? formatCost(stats.costThisMonth) : '—'}
          </div>
          <div className="text-xs text-slate-600 font-mono">USD</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-xs text-slate-500 font-mono mb-1">COST / REQ</div>
          <div className="text-base font-bold font-mono text-slate-300">
            {isConnected ? formatCost(stats.costPerRequest) : '—'}
          </div>
          <div className="text-xs text-slate-600 font-mono">avg</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-xs text-slate-500 font-mono mb-1">
            {stats.creditRemaining !== undefined ? 'CREDITS LEFT' : 'REQUESTS'}
          </div>
          <div className="text-base font-bold font-mono text-slate-300">
            {isConnected
              ? stats.creditRemaining !== undefined
                ? formatCost(stats.creditRemaining)
                : formatTokens(stats.requests)
              : '—'}
          </div>
          <div className="text-xs text-slate-600 font-mono">
            {stats.creditRemaining !== undefined ? 'remaining' : 'this month'}
          </div>
        </div>
      </div>

      {/* Demo notice when not connected */}
      {!isConnected && (
        <div className="mt-3 text-xs text-slate-600 font-mono text-center">
          Add API key in Vault to see live data
        </div>
      )}
    </CyberCard>
  );
}
