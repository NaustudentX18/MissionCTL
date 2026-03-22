'use client';

import { EfficiencyScorer } from '@/components/insights/EfficiencyScorer';
import { TokenChart } from '@/components/dashboard/TokenChart';
import { MODELS, PROVIDERS } from '@/lib/providers';
import { CyberCard } from '@/components/ui/CyberCard';
import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { formatCost } from '@/lib/utils';
import type { AIProvider } from '@/lib/types';
import { Database, TrendingUp } from 'lucide-react';

export function InsightsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <EfficiencyScorer />

        <div className="space-y-4">
          <TokenChart />

          {/* Model pricing reference */}
          <CyberCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database size={16} className="text-blue-400" />
              <h3 className="font-mono font-bold text-white">Model Pricing Reference</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1a1a2e]">
                    <th className="text-left text-slate-500 pb-2">Model</th>
                    <th className="text-right text-slate-500 pb-2">Input/1M</th>
                    <th className="text-right text-slate-500 pb-2">Output/1M</th>
                    <th className="text-right text-slate-500 pb-2">Context</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {MODELS.map(model => (
                    <tr key={model.id} className="border-b border-[#0f0f18] hover:bg-white/2">
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          <ProviderBadge provider={model.provider} size="sm" showName={false} />
                          <span className="text-slate-300 truncate max-w-[120px]">{model.name}</span>
                        </div>
                      </td>
                      <td className="py-2 text-right" style={{ color: PROVIDERS[model.provider].color }}>
                        {formatCost(model.inputCostPer1M)}
                      </td>
                      <td className="py-2 text-right" style={{ color: PROVIDERS[model.provider].color }}>
                        {formatCost(model.outputCostPer1M)}
                      </td>
                      <td className="py-2 text-right text-slate-500">
                        {model.contextWindow >= 1_000_000
                          ? `${(model.contextWindow / 1_000_000).toFixed(1)}M`
                          : `${(model.contextWindow / 1_000).toFixed(0)}K`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CyberCard>
        </div>
      </div>
    </div>
  );
}
