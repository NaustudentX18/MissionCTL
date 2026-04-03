'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Monitor, Server, Tablet, Cpu, MessageSquare, RefreshCw, Zap, Clock } from 'lucide-react';
import { useHermesStore } from '@/lib/store';
import type { HermesAgent, OllamaChatChunk } from '@/lib/types';
import { DEVICE_META } from '@/lib/agents';
import { cn, formatBytes, formatRelative, generateId } from '@/lib/utils';
import { SubAgentViz } from './SubAgentViz';

const DEVICE_ICONS: Record<string, React.ElementType> = {
  pc:       Monitor,
  server:   Server,
  tablet:   Tablet,
  uconsole: Cpu,
};

// Status label
const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  online:  { text: 'Online',    cls: 'status-online'  },
  offline: { text: 'Offline',   cls: 'status-offline' },
  busy:    { text: 'Thinking…', cls: 'status-busy'    },
  error:   { text: 'Error',     cls: 'status-error'   },
};

interface AgentCardProps {
  agent: HermesAgent;
  onOpenChat: (agentId: string) => void;
}

export function AgentCard({ agent, onOpenChat }: AgentCardProps) {
  const {
    agentHealth,
    sessions,
    setAgentStatus,
    setAgentHealth,
    addMessage,
    appendStreamChunk,
    finalizeMessage,
    setStreaming,
    updateAgent,
  } = useHermesStore();

  const [pinging, setPinging] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const session = sessions[agent.id];
  const health  = agentHealth[agent.id];
  const lastMsg = session?.messages.at(-1);
  const isStreaming = session?.isStreaming ?? false;

  const DevIcon = DEVICE_ICONS[agent.device] ?? Monitor;
  const statusMeta = STATUS_LABEL[agent.status] ?? STATUS_LABEL.offline;

  const runningModel = health?.runningModels?.[0];
  const loadedModel  = runningModel?.name ?? health?.models?.[0]?.name ?? agent.model;

  // ─── Ping / health check ──────────────────────────────────
  const ping = useCallback(async () => {
    setPinging(true);
    try {
      const [pingRes, tagsRes, psRes] = await Promise.allSettled([
        fetch('/api/ollama', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip: agent.tailscaleIp, port: agent.port, action: 'ping' }),
        }),
        fetch('/api/ollama', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip: agent.tailscaleIp, port: agent.port, action: 'tags' }),
        }),
        fetch('/api/ollama', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip: agent.tailscaleIp, port: agent.port, action: 'ps' }),
        }),
      ]);

      const ok = pingRes.status === 'fulfilled' && pingRes.value.ok;
      const tags = tagsRes.status === 'fulfilled' && tagsRes.value.ok
        ? (await tagsRes.value.json()).models ?? []
        : [];
      const running = psRes.status === 'fulfilled' && psRes.value.ok
        ? (await psRes.value.json()).models ?? []
        : [];

      setAgentHealth(agent.id, {
        agentId: agent.id,
        status: ok ? (running.length > 0 ? 'busy' : 'online') : 'offline',
        models: tags,
        runningModels: running,
        checkedAt: new Date().toISOString(),
      });
    } catch {
      setAgentStatus(agent.id, 'offline');
    } finally {
      setPinging(false);
    }
  }, [agent, setAgentHealth, setAgentStatus]);

  // Auto-ping on mount (staggered by agent index to avoid simultaneous requests)
  useEffect(() => {
    const delay = Math.random() * 1500;
    const t = setTimeout(ping, delay);
    return () => clearTimeout(t);
  }, [ping]);

  // ─── Quick demo prompt from card ──────────────────────────
  const sendQuickPrompt = useCallback(async (promptText: string) => {
    if (isStreaming || agent.status === 'offline') return;

    const msgId = generateId();
    addMessage(agent.id, {
      id: generateId(),
      agentId: agent.id,
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString(),
    });
    addMessage(agent.id, {
      id: msgId,
      agentId: agent.id,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    });

    setStreaming(agent.id, true);
    setAgentStatus(agent.id, 'busy');

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: agent.tailscaleIp,
          port: agent.port,
          action: 'chat',
          payload: {
            model: agent.model,
            messages: [{ role: 'user', content: promptText }],
          },
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let evalCount = 0;
      let evalDuration = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const chunk: OllamaChatChunk = JSON.parse(line);
            if (chunk.message?.content) {
              appendStreamChunk(agent.id, msgId, chunk.message.content);
            }
            if (chunk.done) {
              evalCount = chunk.eval_count ?? 0;
              evalDuration = chunk.eval_duration ?? 0;
            }
          } catch { /* skip malformed lines */ }
        }
      }

      const tps = evalDuration > 0 ? Math.round(evalCount / (evalDuration / 1e9)) : undefined;
      finalizeMessage(agent.id, msgId, {
        tokensPerSec: tps,
        completionTokens: evalCount,
      });
      setAgentStatus(agent.id, 'online');
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        finalizeMessage(agent.id, msgId, { content: '⚠️ Connection error. Check Tailscale.' });
        setAgentStatus(agent.id, 'error');
      }
    } finally {
      setStreaming(agent.id, false);
      abortRef.current = null;
    }
  }, [agent, isStreaming, addMessage, appendStreamChunk, finalizeMessage, setStreaming, setAgentStatus]);

  // ─── Render ───────────────────────────────────────────────
  const isActive = agent.status === 'busy' || isStreaming;
  const isOnline = agent.status === 'online' || agent.status === 'busy';

  return (
    <div
      className={cn(
        'glass-card p-0 flex flex-col overflow-hidden transition-all duration-300 select-none',
        isActive && 'gradient-border-active',
        isOnline && !isActive && 'card-online',
      )}
      style={{ minHeight: 260 }}
    >
      {/* ─ Header ─ */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Device icon bubble */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{
              background: `linear-gradient(135deg, ${agent.color}22, ${agent.color}08)`,
              border: `1px solid ${agent.color}30`,
            }}
          >
            <DevIcon size={18} style={{ color: agent.color }} />
            {isActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500 animate-pulse-ring" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-white/95 tracking-tight truncate">{agent.name}</h3>
            <p className="text-xs text-white/40 mt-0.5 truncate">{DEVICE_META[agent.device].label} · {agent.tailscaleIp}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <span className={cn('status-dot', statusMeta.cls, isOnline && 'animate-pulse-online')} />
          <span className="text-xs text-white/40">{statusMeta.text}</span>
        </div>
      </div>

      {/* ─ Model info ─ */}
      <div className="px-4 mb-3 flex items-center gap-2 flex-wrap">
        {loadedModel && (
          <span className="tool-chip text-white/50" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Zap size={9} style={{ color: agent.color }} />
            {loadedModel}
          </span>
        )}
        {runningModel && (
          <span className="tool-chip text-white/40" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="status-dot status-busy" style={{ width: 5, height: 5 }} />
            {formatBytes(runningModel.size_vram)} VRAM
          </span>
        )}
        {agent.lastSeen && (
          <span className="text-[11px] text-white/25 font-mono ml-auto">
            {formatRelative(agent.lastSeen)}
          </span>
        )}
      </div>

      {/* ─ Live feed ─ */}
      <div className="flex-1 mx-3 mb-3 rounded-xl overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', minHeight: 80 }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05]">
          <span className="label-xs">Live Feed</span>
          {isStreaming && (
            <div className="flex gap-1">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          )}
        </div>

        <div className="p-3 max-h-28 overflow-y-auto">
          {!lastMsg ? (
            <p className="text-xs text-white/20 italic">No activity yet…</p>
          ) : (
            <div className="space-y-1">
              {lastMsg.role === 'user' && (
                <p className="text-[11px] text-white/30 truncate">
                  <span className="text-white/20">You: </span>{lastMsg.content}
                </p>
              )}
              {session?.messages.at(-1)?.role === 'assistant' && (
                <p className={cn(
                  'text-xs text-white/70 leading-relaxed',
                  isStreaming && 'cursor-blink'
                )}>
                  {session.messages.at(-1)?.content || (isStreaming ? '' : '…')}
                </p>
              )}
              {/* Tool calls */}
              {lastMsg.toolCalls && lastMsg.toolCalls.length > 0 && (
                <SubAgentViz toolCalls={lastMsg.toolCalls} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─ Action buttons ─ */}
      <div className="px-3 pb-3 flex items-center gap-2">
        <button
          onClick={() => onOpenChat(agent.id)}
          disabled={!isOnline}
          className={cn(
            'btn btn-ghost flex-1 text-xs py-1.5',
            !isOnline && 'opacity-40 cursor-not-allowed'
          )}
          style={isOnline ? { borderColor: `${agent.color}25`, color: agent.color } : {}}
        >
          <MessageSquare size={13} />
          Chat
        </button>

        <button
          onClick={ping}
          disabled={pinging}
          className="btn btn-ghost px-2.5 py-1.5 text-xs text-white/40"
          title="Ping agent"
        >
          <RefreshCw size={13} className={cn(pinging && 'animate-spin')} />
        </button>

        {isStreaming && (
          <button
            onClick={() => { abortRef.current?.abort(); setStreaming(agent.id, false); setAgentStatus(agent.id, 'online'); }}
            className="btn btn-danger px-2.5 py-1.5 text-xs"
            title="Stop generation"
          >
            ■
          </button>
        )}
      </div>

      {/* Tokens/sec footer */}
      {lastMsg?.tokensPerSec && (
        <div className="px-4 pb-3 flex items-center gap-1.5 text-[11px] text-white/25">
          <Clock size={10} />
          <span>{lastMsg.tokensPerSec} tok/s</span>
          {lastMsg.completionTokens && <span>· {lastMsg.completionTokens} tokens</span>}
        </div>
      )}
    </div>
  );
}
