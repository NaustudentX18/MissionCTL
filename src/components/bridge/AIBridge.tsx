'use client';

import { useState, useMemo } from 'react';
import { CyberCard } from '@/components/ui/CyberCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { calculateBridgeCosts } from '@/lib/utils';
import { MODELS } from '@/lib/providers';
import { Zap, DollarSign, Hash, ChevronRight } from 'lucide-react';

const PROVIDER_RANK_COLOR = ['text-amber-400', 'text-slate-300', 'text-slate-400', 'text-slate-500'];

export function AIBridge() {
  const [prompt, setPrompt] = useState('');
  const [outputMultiplier, setOutputMultiplier] = useState(3);
  const [isCalculating, setIsCalculating] = useState(false);

  const results = useMemo(() => {
    if (!prompt.trim()) return [];
    return calculateBridgeCosts(prompt, outputMultiplier);
  }, [prompt, outputMultiplier]);

  const handleCalculate = () => {
    setIsCalculating(true);
    // Simulate processing delay for UX
    setTimeout(() => setIsCalculating(false), 400);
  };

  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(inputTokens * outputMultiplier);

  const cheapest = results[0];
  const mostExpensive = results[results.length - 1];
  const savings = mostExpensive && cheapest
    ? ((mostExpensive.estimatedCost - cheapest.estimatedCost) / Math.max(mostExpensive.estimatedCost, 0.000001)) * 100
    : 0;

  return (
    <div className="space-y-4">
      <CyberCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-purple-400" />
          <div>
            <h3 className="font-mono font-bold text-white">AI Bridge</h3>
            <p className="text-xs text-slate-500 font-mono">Compare costs across all models instantly</p>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-4">
          <label className="block text-xs text-slate-500 font-mono mb-2">
            Type your prompt to estimate costs:
          </label>
          <textarea
            value={prompt}
            onChange={e => { setPrompt(e.target.value); }}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleCalculate(); }}
            placeholder="Paste or type any prompt here and see the cost across every AI model side by side..."
            rows={5}
            className="w-full bg-black/30 border border-[#1a1a2e] rounded-lg px-4 py-3 text-sm font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 resize-none"
          />
        </div>

        {/* Output ratio control */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-500 font-mono">
              Expected output length
            </label>
            <span className="text-xs text-purple-400 font-mono">
              {outputMultiplier}× input ({outputTokens} tokens)
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={outputMultiplier}
            onChange={e => setOutputMultiplier(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-700 font-mono mt-1">
            <span>Short (1×)</span>
            <span>Medium (3×)</span>
            <span>Long (10×)</span>
          </div>
        </div>

        {/* Token estimate */}
        {prompt && (
          <div className="flex gap-3 p-3 bg-black/20 rounded-lg border border-[#1a1a2e] mb-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Hash size={11} />
              <span>~{inputTokens} input tokens</span>
            </div>
            <ChevronRight size={11} className="text-slate-700 mt-0.5" />
            <div className="flex items-center gap-1.5 text-slate-400">
              <Hash size={11} />
              <span>~{outputTokens} output tokens</span>
            </div>
            <ChevronRight size={11} className="text-slate-700 mt-0.5" />
            <div className="flex items-center gap-1.5 text-slate-400">
              <Hash size={11} />
              <span>{inputTokens + outputTokens} total</span>
            </div>
          </div>
        )}

        <NeonButton
          variant="purple"
          onClick={handleCalculate}
          loading={isCalculating}
          disabled={!prompt.trim()}
          className="w-full"
        >
          <Zap size={14} />
          Calculate Costs Across All Models
        </NeonButton>
      </CyberCard>

      {/* Results */}
      {results.length > 0 && (
        <CyberCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-400" />
              <h3 className="font-mono font-bold text-white">Cost Comparison</h3>
            </div>
            {savings > 0 && (
              <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                Save {savings.toFixed(0)}% vs most expensive
              </div>
            )}
          </div>

          <div className="space-y-2">
            {results.map((result, idx) => {
              const model = MODELS.find(m => m.id === result.model);
              const barWidth = cheapest && result.estimatedCost > 0
                ? Math.min(100, (result.estimatedCost / (mostExpensive?.estimatedCost ?? 1)) * 100)
                : 1;

              return (
                <div
                  key={result.model}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all
                    ${idx === 0
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-[#1a1a2e] bg-black/20'
                    }
                  `}
                >
                  <span className={`text-xs font-mono font-bold w-4 ${PROVIDER_RANK_COLOR[Math.min(idx, 3)]}`}>
                    {idx + 1}
                  </span>
                  <ProviderBadge provider={result.provider} size="sm" showName={false} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-slate-300 truncate">
                        {model?.name ?? result.model}
                      </span>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                        <span className="text-xs text-slate-600 font-mono hidden sm:block">
                          {result.costBreakdown}
                        </span>
                        <span className={`text-sm font-bold font-mono ${
                          idx === 0 ? 'text-emerald-400' : 'text-slate-300'
                        }`}>
                          ${result.estimatedCost.toFixed(6)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          idx === 0 ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${Math.max(1, barWidth)}%` }}
                      />
                    </div>
                  </div>
                  {idx === 0 && (
                    <span className="text-xs text-emerald-400 font-mono flex-shrink-0">BEST</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1a1a2e] text-xs text-slate-600 font-mono">
            * Estimates based on ~4 chars/token. Actual costs may vary slightly by model.
          </div>
        </CyberCard>
      )}
    </div>
  );
}
