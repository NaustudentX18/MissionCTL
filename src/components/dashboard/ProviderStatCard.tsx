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

// Deterministic fake stats based on provider index so each looks different
const MOCK_STATS = [
  { tokensUsed: 2_840_000, costThisMonth: 8.52, costPerRequest: 0.0032, requests: 2661, trend: 12.4, creditRemaining: 41.48 },
  { tokensUsed: 1_920_000, costThisMonth: 4.80, costPerRequest: 0.0028, requests: 1714, trend: -5.2, creditRemaining: 95.20 },
  { tokensUsed: 5_100_000, costThisMonth: 0.51, costPerRequest: 0.0003, requests: 1700, trend: 28.7, creditRemaining: undefined },
  { tokensUsed: 890_000, costThisMonth: 0.18, costPerRequest: 0.0001, requests: 1800, trend: 6.1, creditRemaining: undefined },
  { tokensUsed: 450_000, costThisMonth: 0.22, costPerRequest: 0.0005, requests: 440, trend: 3.2, creditRemaining: 20.0 },
  { tokensUsed: 320_000, costThisMonth: 0.96, costPerRequest: 0.003, requests: 320, trend: -2.1, creditRemaining: undefined },
  { tokensUsed: 670_000, costThisMonth: 0.13, costPerRequest: 0.0002, requests: 650, trend: 18.5, creditRemaining: undefined },
  { tokensUsed: 1_200_000, costThisMonth: 1.80, costPerRequest: 0.0015, requests: 1200, trend: 9.0, creditRemaining: undefined },
  { tokensUsed: 280_000, costThisMonth: 0.28, costPerRequest: 0.001, requests: 280, trend: 4.5, creditRemaining: undefined },
];

import { PROVIDER_LIST } from '@/lib/providers';

export function ProviderStatCard({ provider }: ProviderStatCardProps) {
  const config = PROVIDERS[provider];
  const apiKey = useMissionStore(s => s.apiKeys[provider]);
  const isConnected = apiKey?.isValid === true;
  const status = apiKey?.isValid === true ? 'active' : apiKey?.isValid === false ? 'error' : 'inactive';

  const providerIndex = PROVIDER_LIST.indexOf(provider);
  const stats = MOCK_STATS[providerIndex % MOCK_STATS.length];
  const color = config.color;

  return (
    <CyberCard className="p-5">
      {/* Top accent line */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border bg-black/30"
            style={{ borderColor: `${color}30`, color }}
          >
            {config.icon}
          </div>
          <div>
            <h3 className="font-mono font-bold text-base" style={{ color }}>
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
          <div className="text-lg font-bold font-mono" style={{ color: isConnected ? color : undefined }}>
            {isConnected ? formatTokens(stats.tokensUsed) : '—'}
          </div>
          <div className="text-xs text-slate-600 font-mono">this month</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-xs text-slate-500 font-mono mb-1">COST / MTH</div>
          <div className="text-lg font-bold font-mono" style={{ color: isConnected ? color : undefined }}>
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

      {!isConnected && (
        <div className="mt-3 text-xs text-slate-600 font-mono text-center">
          Add API key in Vault to see live data
        </div>
      )}
    </CyberCard>
  );
}
