'use client';

import { useState, useMemo } from 'react';
import { CyberCard } from '@/components/ui/CyberCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { calculateBridgeCosts } from '@/lib/utils';
import { MODELS, PROVIDERS } from '@/lib/providers';
import { useMissionStore } from '@/lib/store';
import { Zap, DollarSign, Hash, ChevronRight, SlidersHorizontal, X } from 'lucide-react';

const PROVIDER_RANK_COLOR = ['text-amber-400', 'text-slate-300', 'text-slate-400', 'text-slate-500'];

export function AIBridge() {
  const enabledProviders = useMissionStore(s => s.enabledProviders);
  const [prompt, setPrompt] = useState('');
  const [outputMultiplier, setOutputMultiplier] = useState(3);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showModelFilter, setShowModelFilter] = useState(false);
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(new Set());
  const [splitView, setSplitView] = useState(false);

  // Models available from enabled providers
  const availableModels = useMemo(
    () => MODELS.filter(m => enabledProviders.includes(m.provider)),
    [enabledProviders]
  );

  const results = useMemo(() => {
    if (!prompt.trim()) return [];
    const filterIds = selectedModelIds.size > 0 ? [...selectedModelIds] : undefined;
    return calculateBridgeCosts(prompt, outputMultiplier, enabledProviders, filterIds);
  }, [prompt, outputMultiplier, enabledProviders, selectedModelIds]);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 300);
  };

  const toggleModel = (id: string) => {
    setSelectedModelIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-purple-400" />
            <div>
              <h3 className="font-mono font-bold text-white">AI Bridge</h3>
              <p className="text-xs text-slate-500 font-mono">Compare costs across all enabled models</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSplitView(v => !v)}
              className={`text-xs font-mono px-2 py-1 rounded border transition-all ${
                splitView
                  ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                  : 'border-[#1a1a2e] text-slate-600 hover:text-slate-300'
              }`}
            >
              Split costs
            </button>
            <button
              onClick={() => setShowModelFilter(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border transition-all ${
                showModelFilter || selectedModelIds.size > 0
                  ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                  : 'border-[#1a1a2e] text-slate-600 hover:text-slate-300'
              }`}
            >
              <SlidersHorizontal size={11} />
              Models {selectedModelIds.size > 0 && `(${selectedModelIds.size})`}
            </button>
          </div>
        </div>

        {/* Model filter panel */}
        {showModelFilter && (
          <div className="mb-4 p-3 bg-black/20 border border-[#1a1a2e] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-mono">Filter to specific models (empty = all)</span>
              {selectedModelIds.size > 0 && (
                <button
                  onClick={() => setSelectedModelIds(new Set())}
                  className="text-xs text-slate-600 hover:text-red-400 font-mono flex items-center gap-1"
                >
                  <X size={10} /> Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {availableModels.map(m => {
                const isSelected = selectedModelIds.has(m.id);
                const color = PROVIDERS[m.provider]?.color ?? '#6b7280';
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleModel(m.id)}
                    className="text-xs font-mono px-2 py-0.5 rounded border transition-all"
                    style={{
                      borderColor: isSelected ? `${color}60` : '#1a1a2e',
                      backgroundColor: isSelected ? `${color}15` : 'transparent',
                      color: isSelected ? color : '#64748b',
                    }}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div className="mb-4">
          <label className="block text-xs text-slate-500 font-mono mb-2">
            Type or paste your prompt to estimate costs:
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCalculate(); }}
            placeholder="Paste any prompt here and see the cost across every AI model side by side..."
            rows={5}
            className="w-full bg-black/30 border border-[#1a1a2e] rounded-lg px-4 py-3 text-sm font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 resize-none"
          />
        </div>

        {/* Output ratio */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-500 font-mono">Expected output length</label>
            <span className="text-xs text-purple-400 font-mono">
              {outputMultiplier}× input (~{outputTokens.toLocaleString()} tokens)
            </span>
          </div>
          <input
            type="range" min={1} max={10} step={0.5}
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
          <div className="flex flex-wrap gap-3 p-3 bg-black/20 rounded-lg border border-[#1a1a2e] mb-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Hash size={11} />
              <span>~{inputTokens.toLocaleString()} input</span>
            </div>
            <ChevronRight size={11} className="text-slate-700 mt-0.5" />
            <div className="flex items-center gap-1.5 text-slate-400">
              <Hash size={11} />
              <span>~{outputTokens.toLocaleString()} output</span>
            </div>
            <ChevronRight size={11} className="text-slate-700 mt-0.5" />
            <div className="flex items-center gap-1.5 text-slate-400">
              <Hash size={11} />
              <span>{(inputTokens + outputTokens).toLocaleString()} total</span>
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
          Calculate Costs ({results.length > 0 ? results.length : availableModels.length} models)
        </NeonButton>
      </CyberCard>

      {/* Results */}
      {results.length > 0 && (
        <CyberCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-400" />
              <h3 className="font-mono font-bold text-white">Cost Comparison</h3>
              <span className="text-xs text-slate-600 font-mono">({results.length} models)</span>
            </div>
            {savings > 0 && (
              <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                Save {savings.toFixed(0)}% vs priciest
              </div>
            )}
          </div>

          <div className="space-y-2">
            {results.map((result, idx) => {
              const barWidth = cheapest && result.estimatedCost > 0
                ? Math.min(100, (result.estimatedCost / (mostExpensive?.estimatedCost ?? 1)) * 100)
                : 1;
              const color = PROVIDERS[result.provider]?.color ?? '#6b7280';
              const isFree = result.estimatedCost === 0;

              return (
                <div
                  key={result.model}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    idx === 0 && !isFree
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-[#1a1a2e] bg-black/20'
                  }`}
                >
                  <span className={`text-xs font-mono font-bold w-4 ${PROVIDER_RANK_COLOR[Math.min(idx, 3)]}`}>
                    {idx + 1}
                  </span>
                  <ProviderBadge provider={result.provider} size="sm" showName={false} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-slate-300 truncate">
                        {result.modelName}
                      </span>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                        {splitView ? (
                          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
                            <span className="text-blue-400">{result.inputCost === 0 ? 'free' : `$${result.inputCost.toFixed(6)}`} in</span>
                            <span className="text-slate-700">+</span>
                            <span className="text-amber-400">{result.outputCost === 0 ? 'free' : `$${result.outputCost.toFixed(6)}`} out</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 font-mono hidden sm:block">
                            {result.costBreakdown}
                          </span>
                        )}
                        <span className={`text-sm font-bold font-mono ${
                          isFree ? 'text-emerald-400' : idx === 0 ? 'text-emerald-400' : 'text-slate-300'
                        }`}>
                          {isFree ? 'FREE' : `$${result.estimatedCost.toFixed(6)}`}
                        </span>
                      </div>
                    </div>
                    {!isFree && (
                      <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(1, barWidth)}%`,
                            backgroundColor: idx === 0 ? '#10b981' : color,
                            opacity: 0.7,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {isFree && (
                    <span className="text-xs text-emerald-400 font-mono flex-shrink-0">LOCAL</span>
                  )}
                  {!isFree && idx === 0 && (
                    <span className="text-xs text-emerald-400 font-mono flex-shrink-0">BEST</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1a1a2e] text-xs text-slate-600 font-mono">
            * Estimates based on ~4 chars/token. Actual costs may vary. Local models (Ollama) are free.
          </div>
        </CyberCard>
      )}
    </div>
  );
}
