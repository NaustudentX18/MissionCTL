'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { CyberCard } from '@/components/ui/CyberCard';
import { useMissionStore } from '@/lib/store';
import { formatDate, formatTokens } from '@/lib/utils';

type ViewMode = 'tokens' | 'cost';

const PROVIDER_COLORS = {
  claude: '#a855f7',
  openai: '#10b981',
  gemini: '#3b82f6',
  groq: '#f59e0b',
};

// Custom tooltip
function CustomTooltip({ active, payload, label, mode }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  mode: ViewMode;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#0f0f18] border border-[#1a1a2e] rounded-lg p-3 text-xs font-mono">
      <div className="text-slate-400 mb-2">{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-300 capitalize">{entry.name}:</span>
          <span style={{ color: entry.color }}>
            {mode === 'tokens'
              ? formatTokens(entry.value)
              : `$${entry.value.toFixed(4)}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TokenChart() {
  const dailyUsage = useMissionStore(s => s.dailyUsage);
  const [mode, setMode] = useState<ViewMode>('tokens');

  const chartData = dailyUsage.map(d => ({
    date: formatDate(d.date),
    claude: mode === 'tokens' ? d.claude : d.claudeCost,
    openai: mode === 'tokens' ? d.openai : d.openaiCost,
    gemini: mode === 'tokens' ? d.gemini : d.geminiCost,
    groq: mode === 'tokens' ? d.groq : d.groqCost,
  }));

  return (
    <CyberCard className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-mono font-bold text-white">Token Visualizer</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">7-day usage across all providers</p>
        </div>
        <div className="flex gap-1 bg-black/30 rounded-lg p-1 border border-[#1a1a2e]">
          <button
            onClick={() => setMode('tokens')}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
              mode === 'tokens'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setMode('cost')}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
              mode === 'cost'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Cost $
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            {Object.entries(PROVIDER_COLORS).map(([provider, color]) => (
              <linearGradient key={provider} id={`gradient-${provider}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#4a5568', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#1a1a2e' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#4a5568', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => mode === 'tokens' ? formatTokens(v) : `$${v.toFixed(2)}`}
            width={48}
          />
          <Tooltip content={<CustomTooltip mode={mode} />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#4a5568' }}
          />
          {Object.entries(PROVIDER_COLORS).map(([provider, color]) => (
            <Area
              key={provider}
              type="monotone"
              dataKey={provider}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${provider})`}
              dot={false}
              activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: '#0f0f18' }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </CyberCard>
  );
}
