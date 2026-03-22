'use client';

import { useState } from 'react';
import { CyberCard } from '@/components/ui/CyberCard';
import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { calculateEfficiencyScores } from '@/lib/utils';
import { MODELS, PROVIDERS } from '@/lib/providers';
import { useMissionStore } from '@/lib/store';
import type { TaskType } from '@/lib/types';
import { Zap, Trophy, DollarSign, Star } from 'lucide-react';

const TASKS: { id: TaskType; label: string; icon: string; description: string }[] = [
  { id: 'coding', label: 'Coding', icon: '💻', description: 'Bug fixes, code generation, reviews' },
  { id: 'creative', label: 'Creative', icon: '🎨', description: 'Writing, storytelling, brainstorming' },
  { id: 'search', label: 'Fast Search', icon: '🔍', description: 'Quick lookups, summarization' },
  { id: 'analysis', label: 'Analysis', icon: '📊', description: 'Deep reasoning, research' },
  { id: 'chat', label: 'Chat', icon: '💬', description: 'Conversations, Q&A' },
];

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-blue-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
};

const SCORE_BAR_COLOR = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

export function EfficiencyScorer() {
  const enabledProviders = useMissionStore(s => s.enabledProviders);
  const [selectedTask, setSelectedTask] = useState<TaskType>('coding');
  const scores = calculateEfficiencyScores(selectedTask, enabledProviders);
  const top3 = scores.slice(0, 3);

  return (
    <CyberCard className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <Trophy size={16} className="text-amber-400" />
        <div>
          <h3 className="font-mono font-bold text-white">Efficiency Score</h3>
          <p className="text-xs text-slate-500 font-mono">Best value AI for each task type ({scores.length} models)</p>
        </div>
      </div>

      {/* Task selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TASKS.map(task => (
          <button
            key={task.id}
            onClick={() => setSelectedTask(task.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all btn-haptic
              ${selectedTask === task.id
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-black/20 border-[#1a1a2e] text-slate-500 hover:border-purple-500/20 hover:text-slate-300'
              }
            `}
            title={task.description}
          >
            <span>{task.icon}</span>
            {task.label}
          </button>
        ))}
      </div>

      {/* Top 3 winners */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          {top3.map((item, idx) => {
            const model = MODELS.find(m => m.id === item.model);
            const color = PROVIDERS[item.provider]?.color ?? '#6b7280';
            return (
              <div
                key={item.model}
                className={`relative p-3 rounded-lg border text-center ${
                  idx === 0 ? 'border-amber-500/40 bg-amber-500/5' : 'border-[#1a1a2e] bg-black/20'
                }`}
              >
                {idx === 0 && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm">🏆</span>}
                {idx === 1 && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm">🥈</span>}
                {idx === 2 && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm">🥉</span>}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base mx-auto mb-1.5 border"
                  style={{ borderColor: `${color}30`, backgroundColor: `${color}15`, color }}
                >
                  {PROVIDERS[item.provider]?.icon}
                </div>
                <div className={`text-xl font-bold font-mono ${SCORE_COLOR(item.score)}`}>
                  {item.score}
                </div>
                <div className="text-xs text-slate-600 font-mono truncate">
                  {model?.name.replace(/\s+\d+\.\d+/, '') ?? item.model}
                </div>
                <div className="text-xs text-slate-500 font-mono">{item.valueRating}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranking */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {scores.map((item, idx) => {
          const model = MODELS.find(m => m.id === item.model);
          const color = PROVIDERS[item.provider]?.color ?? '#6b7280';
          return (
            <div key={item.model} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-mono w-4 text-right flex-shrink-0">{idx + 1}</span>
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0"
                style={{ color, backgroundColor: `${color}15` }}
              >
                {PROVIDERS[item.provider]?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-mono text-slate-300 truncate">
                    {model?.name ?? item.model}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <DollarSign size={10} />
                      <span className="font-mono">{item.costPerTask === 0
                        ? 'free'
                        : item.costPerTask < 0.001
                        ? `$${(item.costPerTask * 1000).toFixed(3)}m`
                        : `$${item.costPerTask.toFixed(4)}`}
                      </span>
                    </div>
                    <span className={`text-xs font-bold font-mono ${SCORE_COLOR(item.score)}`}>
                      {item.score}
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%`, backgroundColor: SCORE_BAR_COLOR(item.score), opacity: 0.8 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1a1a2e] text-xs text-slate-600 font-mono">
        <div className="flex items-center gap-1 mb-1">
          <Zap size={10} className="text-amber-400" />
          Score = (Quality × Speed) / Cost — higher is better value
        </div>
        <div className="flex items-center gap-1">
          <Star size={10} className="text-purple-400" />
          Based on expert quality ratings and current API pricing
        </div>
      </div>
    </CyberCard>
  );
}
