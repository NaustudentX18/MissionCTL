'use client';

import { ProviderStatCard } from '@/components/dashboard/ProviderStatCard';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { TokenChart } from '@/components/dashboard/TokenChart';
import { PROVIDER_LIST } from '@/lib/providers';
import { useMissionStore } from '@/lib/store';
import { formatCost, formatTokens } from '@/lib/utils';
import { Activity, TrendingUp, Cpu, DollarSign } from 'lucide-react';

export function DashboardView() {
  const dailyUsage = useMissionStore(s => s.dailyUsage);

  // Aggregate weekly totals
  const weeklyTotals = dailyUsage.reduce(
    (acc, d) => ({
      claude: acc.claude + d.claude,
      openai: acc.openai + d.openai,
      gemini: acc.gemini + d.gemini,
      groq: acc.groq + d.groq,
      claudeCost: acc.claudeCost + d.claudeCost,
      openaiCost: acc.openaiCost + d.openaiCost,
      geminiCost: acc.geminiCost + d.geminiCost,
      groqCost: acc.groqCost + d.groqCost,
    }),
    { claude: 0, openai: 0, gemini: 0, groq: 0, claudeCost: 0, openaiCost: 0, geminiCost: 0, groqCost: 0 }
  );

  const totalTokens = weeklyTotals.claude + weeklyTotals.openai + weeklyTotals.gemini + weeklyTotals.groq;
  const totalCost = weeklyTotals.claudeCost + weeklyTotals.openaiCost + weeklyTotals.geminiCost + weeklyTotals.groqCost;

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0f0f18] border border-[#1a1a2e] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-purple-400" />
            <span className="text-xs text-slate-500 font-mono">TOTAL TOKENS</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">{formatTokens(totalTokens)}</div>
          <div className="text-xs text-slate-600 font-mono">last 7 days (demo)</div>
        </div>
        <div className="bg-[#0f0f18] border border-[#1a1a2e] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-emerald-400" />
            <span className="text-xs text-slate-500 font-mono">TOTAL SPEND</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">{formatCost(totalCost)}</div>
          <div className="text-xs text-slate-600 font-mono">last 7 days (demo)</div>
        </div>
        <div className="bg-[#0f0f18] border border-[#1a1a2e] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-xs text-slate-500 font-mono">AVG COST/DAY</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatCost(totalCost / Math.max(1, dailyUsage.length))}
          </div>
          <div className="text-xs text-slate-600 font-mono">across all providers</div>
        </div>
        <div className="bg-[#0f0f18] border border-[#1a1a2e] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={14} className="text-amber-400" />
            <span className="text-xs text-slate-500 font-mono">ACTIVE APIs</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {PROVIDER_LIST.length}
          </div>
          <div className="text-xs text-slate-600 font-mono">providers monitored</div>
        </div>
      </div>

      {/* Provider cards */}
      <div>
        <h2 className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-3">
          Provider Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {PROVIDER_LIST.map(provider => (
            <ProviderStatCard key={provider} provider={provider} />
          ))}
        </div>
      </div>

      {/* Charts + News */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <TokenChart />
        </div>
        <div>
          <NewsFeed />
        </div>
      </div>
    </div>
  );
}
