'use client';

import type { ToolCall } from '@/lib/types';
import { TOOL_META } from '@/lib/agents';
import { formatDuration } from '@/lib/utils';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface SubAgentVizProps {
  toolCalls: ToolCall[];
  compact?: boolean;
}

export function SubAgentViz({ toolCalls, compact = true }: SubAgentVizProps) {
  if (toolCalls.length === 0) return null;

  return (
    <div className="space-y-1.5 mt-2">
      {toolCalls.map(tc => {
        const meta = TOOL_META[tc.name] ?? TOOL_META.default;
        return (
          <div
            key={tc.id}
            className="animate-slide-up flex items-start gap-2 px-2.5 py-2 rounded-lg"
            style={{
              background: `${meta.color}08`,
              border: `1px solid ${meta.color}20`,
            }}
          >
            {/* Icon */}
            <span className="text-sm flex-shrink-0 mt-0.5">{meta.icon}</span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium" style={{ color: meta.color }}>
                  {meta.label}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {tc.status === 'running' && (
                    <Loader size={10} className="animate-spin text-white/40" />
                  )}
                  {tc.status === 'done' && (
                    <CheckCircle size={10} style={{ color: '#30d158' }} />
                  )}
                  {tc.status === 'error' && (
                    <XCircle size={10} style={{ color: '#ff453a' }} />
                  )}
                  {tc.durationMs && (
                    <span className="text-[10px] text-white/25 font-mono">
                      {formatDuration(tc.durationMs)}
                    </span>
                  )}
                </div>
              </div>

              {!compact && tc.input && (
                <p className="text-[11px] text-white/35 font-mono mt-0.5 truncate">
                  {JSON.stringify(tc.input)}
                </p>
              )}

              {tc.output && !compact && (
                <p className="text-[11px] text-white/50 mt-0.5 line-clamp-2">
                  {tc.output}
                </p>
              )}

              {compact && tc.input && (
                <p className="text-[11px] text-white/30 font-mono mt-0.5 truncate">
                  {typeof tc.input === 'object'
                    ? Object.values(tc.input)[0] as string
                    : String(tc.input)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
