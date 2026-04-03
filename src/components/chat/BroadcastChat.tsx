'use client';

import { useCallback, useRef, useState } from 'react';
import { Radio, Send, StopCircle, Trash2 } from 'lucide-react';
import { useHermesStore } from '@/lib/store';
import type { OllamaChatChunk } from '@/lib/types';
import { cn, generateId } from '@/lib/utils';
import { DEVICE_META } from '@/lib/agents';

export function BroadcastChat() {
  const {
    agents, broadcastResults,
    setBroadcastResult, clearBroadcast,
    setAgentStatus,
  } = useHermesStore();

  const [input, setInput] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const abortRefs = useRef<Map<string, AbortController>>(new Map());

  const onlineAgents = agents.filter(a => a.status === 'online' || a.status === 'busy');

  const broadcast = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBroadcasting || onlineAgents.length === 0) return;

    setInput('');
    clearBroadcast();
    setIsBroadcasting(true);

    // Initialise results
    for (const agent of onlineAgents) {
      setBroadcastResult(agent.id, { agentId: agent.id, content: '', isStreaming: true });
    }

    await Promise.allSettled(
      onlineAgents.map(async (agent) => {
        const ctrl = new AbortController();
        abortRefs.current.set(agent.id, ctrl);
        setAgentStatus(agent.id, 'busy');

        try {
          const res = await fetch('/api/ollama', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ip: agent.tailscaleIp,
              port: agent.port,
              action: 'chat',
              payload: { model: agent.model, messages: [{ role: 'user', content: trimmed }] },
            }),
            signal: ctrl.signal,
          });

          if (!res.ok || !res.body) {
            const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            setBroadcastResult(agent.id, { agentId: agent.id, content: '', isStreaming: false, error: err.error });
            setAgentStatus(agent.id, 'error');
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let full = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const lines = decoder.decode(value).split('\n').filter(Boolean);
            for (const line of lines) {
              try {
                const chunk: OllamaChatChunk = JSON.parse(line);
                if (chunk.message?.content) {
                  full += chunk.message.content;
                  setBroadcastResult(agent.id, { agentId: agent.id, content: full, isStreaming: true });
                }
              } catch { /* skip */ }
            }
          }

          setBroadcastResult(agent.id, { agentId: agent.id, content: full, isStreaming: false });
          setAgentStatus(agent.id, 'online');
        } catch (err: unknown) {
          if ((err as Error).name !== 'AbortError') {
            setBroadcastResult(agent.id, { agentId: agent.id, content: '', isStreaming: false, error: 'Connection failed' });
            setAgentStatus(agent.id, 'error');
          }
        } finally {
          abortRefs.current.delete(agent.id);
        }
      })
    );

    setIsBroadcasting(false);
  }, [isBroadcasting, onlineAgents, setBroadcastResult, clearBroadcast, setAgentStatus]);

  const stopAll = () => {
    abortRefs.current.forEach(ctrl => ctrl.abort());
    abortRefs.current.clear();
    setIsBroadcasting(false);
    for (const agent of onlineAgents) setAgentStatus(agent.id, 'online');
  };

  const results = Object.values(broadcastResults);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(191,90,242,0.15)', border: '1px solid rgba(191,90,242,0.25)' }}
        >
          <Radio size={18} style={{ color: '#bf5af2' }} />
        </div>
        <div>
          <h2 className="font-semibold text-base tracking-tight">Broadcast</h2>
          <p className="text-xs text-white/35">Send one prompt to all online agents simultaneously</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2 flex-wrap">
        <div className="px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)', color: '#30d158' }}>
          {onlineAgents.length} agent{onlineAgents.length !== 1 ? 's' : ''} online
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs text-white/35" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {agents.length - onlineAgents.length} offline
        </div>
      </div>

      {/* Input */}
      <div className="glass-card p-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) broadcast(input); }}
          placeholder="Type a prompt to broadcast to all online agents…"
          rows={4}
          className="input-glass w-full mb-3"
          style={{ resize: 'none', minHeight: 100 }}
          disabled={isBroadcasting}
        />
        <div className="flex items-center gap-2">
          {isBroadcasting ? (
            <button onClick={stopAll} className="btn btn-danger flex-1">
              <StopCircle size={15} />
              Stop All
            </button>
          ) : (
            <button
              onClick={() => broadcast(input)}
              disabled={!input.trim() || onlineAgents.length === 0}
              className="btn btn-primary flex-1"
              style={{ opacity: (!input.trim() || onlineAgents.length === 0) ? 0.4 : 1 }}
            >
              <Radio size={15} />
              Broadcast to {onlineAgents.length} agent{onlineAgents.length !== 1 ? 's' : ''}
            </button>
          )}
          {results.length > 0 && (
            <button onClick={clearBroadcast} className="btn btn-ghost px-3">
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <p className="text-[11px] text-white/20 text-center mt-2">⌘+Enter to broadcast</p>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map(result => {
            const agent = agents.find(a => a.id === result.agentId);
            if (!agent) return null;
            const deviceMeta = DEVICE_META[agent.device];

            return (
              <div key={result.agentId} className="glass-card p-4 animate-slide-up">
                {/* Agent header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{deviceMeta.emoji}</span>
                  <div>
                    <p className="text-xs font-medium text-white/80">{agent.name}</p>
                    <p className="text-[11px] text-white/30 font-mono">{agent.model}</p>
                  </div>
                  <div className="ml-auto">
                    {result.isStreaming && (
                      <div className="flex gap-1">
                        <span className="thinking-dot" />
                        <span className="thinking-dot" />
                        <span className="thinking-dot" />
                      </div>
                    )}
                    {result.error && (
                      <span className="text-[11px]" style={{ color: '#ff453a' }}>
                        ⚠️ {result.error}
                      </span>
                    )}
                  </div>
                </div>

                {/* Response */}
                <div className="rounded-xl px-3 py-2.5 min-h-[60px]"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className={cn(
                    'text-xs text-white/70 leading-relaxed',
                    result.isStreaming && 'cursor-blink'
                  )}>
                    {result.content || (result.isStreaming ? '' : result.error ? '' : '…')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && onlineAgents.length === 0 && (
        <div className="glass-card p-8 text-center">
          <p className="text-2xl mb-2">📡</p>
          <p className="text-sm text-white/40">No agents online</p>
          <p className="text-xs text-white/20 mt-1">Go to Settings to configure your Tailscale IPs, then ping each agent</p>
        </div>
      )}
    </div>
  );
}
