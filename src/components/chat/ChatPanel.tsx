'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Send, Trash2, StopCircle, ChevronDown } from 'lucide-react';
import { useHermesStore } from '@/lib/store';
import type { HermesAgent, OllamaChatChunk } from '@/lib/types';
import { cn, formatTime, generateId } from '@/lib/utils';
import { SubAgentViz } from '@/components/dashboard/SubAgentViz';

interface ChatPanelProps {
  agentId: string;
  onClose: () => void;
}

export function ChatPanel({ agentId, onClose }: ChatPanelProps) {
  const {
    agents, sessions,
    addMessage, appendStreamChunk, finalizeMessage,
    setStreaming, setAgentStatus, clearSession,
  } = useHermesStore();

  const agent = agents.find(a => a.id === agentId) as HermesAgent;
  const session = sessions[agentId];
  const messages = session?.messages ?? [];
  const isStreaming = session?.isStreaming ?? false;

  const [input, setInput] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages.length, scrollToBottom]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 80);
  };

  // Build history for context
  const buildHistory = () =>
    messages
      .filter(m => !m.isStreaming)
      .map(m => ({ role: m.role, content: m.content }));

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming || !agent) return;

    setInput('');

    const userMsgId = generateId();
    const asstMsgId = generateId();

    addMessage(agentId, {
      id: userMsgId, agentId, role: 'user',
      content: trimmed, timestamp: new Date().toISOString(),
    });
    addMessage(agentId, {
      id: asstMsgId, agentId, role: 'assistant',
      content: '', timestamp: new Date().toISOString(), isStreaming: true,
    });

    setStreaming(agentId, true);
    setAgentStatus(agentId, 'busy');

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const history = [
      ...buildHistory(),
      { role: 'user', content: trimmed },
    ];

    try {
      const res = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: agent.tailscaleIp,
          port: agent.port,
          action: 'chat',
          payload: { model: agent.model, messages: history },
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let evalCount = 0, evalDuration = 0, promptTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const chunk: OllamaChatChunk = JSON.parse(line);
            if (chunk.message?.content) appendStreamChunk(agentId, asstMsgId, chunk.message.content);
            if (chunk.done) {
              evalCount = chunk.eval_count ?? 0;
              evalDuration = chunk.eval_duration ?? 0;
              promptTokens = chunk.prompt_eval_count ?? 0;
            }
          } catch { /* skip */ }
        }
      }

      const tps = evalDuration > 0 ? Math.round(evalCount / (evalDuration / 1e9)) : undefined;
      finalizeMessage(agentId, asstMsgId, {
        tokensPerSec: tps,
        completionTokens: evalCount,
        promptTokens,
      });
      setAgentStatus(agentId, 'online');
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        const msg = err instanceof Error ? err.message : 'Connection failed';
        finalizeMessage(agentId, asstMsgId, {
          content: `⚠️ ${msg}`,
        });
        setAgentStatus(agentId, 'error');
      }
    } finally {
      setStreaming(agentId, false);
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [agentId, agent, isStreaming, buildHistory, addMessage, appendStreamChunk, finalizeMessage, setStreaming, setAgentStatus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setStreaming(agentId, false);
    setAgentStatus(agentId, 'online');
  };

  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(24px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.07] flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: `${agent.color}18`, border: `1px solid ${agent.color}30` }}
          >
            ⚡
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight truncate">{agent.name}</p>
            <p className="text-[11px] text-white/35 font-mono">{agent.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => { if (confirm('Clear conversation?')) clearSession(agentId); }}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-white/35 hover:text-white/70 hover:bg-white/[0.08] transition-colors"
            title="Clear chat"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-white/35 hover:text-white/70 hover:bg-white/[0.08] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}25` }}
            >⚡</div>
            <div>
              <p className="text-white/60 font-medium text-sm">{agent.name} is ready</p>
              <p className="text-white/25 text-xs mt-1">{agent.description}</p>
            </div>
            {/* Quick starters */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {['What can you do?', 'Check system status', 'Tell me about yourself'].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 rounded-full text-xs text-white/50 hover:text-white/80 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3 animate-slide-up max-w-3xl',
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            )}
          >
            {/* Avatar */}
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                style={{ background: `${agent.color}18`, border: `1px solid ${agent.color}25`, color: agent.color }}
              >
                ⚡
              </div>
            )}

            <div className="flex flex-col gap-1 max-w-[80%]">
              <div
                className={cn('px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed', msg.isStreaming && 'cursor-blink')}
                style={
                  msg.role === 'user'
                    ? { background: `${agent.color}20`, border: `1px solid ${agent.color}30`, color: 'rgba(255,255,255,0.9)' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }
                }
              >
                {msg.content || (msg.isStreaming ? '' : '…')}
              </div>

              {/* Tool calls */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <SubAgentViz toolCalls={msg.toolCalls} compact={false} />
              )}

              {/* Metadata */}
              <div className={cn('flex items-center gap-2 text-[10px] text-white/20 px-1', msg.role === 'user' && 'flex-row-reverse')}>
                <span>{formatTime(msg.timestamp)}</span>
                {msg.tokensPerSec && <span>· {msg.tokensPerSec} tok/s</span>}
                {msg.completionTokens && <span>· {msg.completionTokens} tokens</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'rgba(191,90,242,0.8)', boxShadow: '0 4px 12px rgba(191,90,242,0.3)' }}
        >
          <ChevronDown size={16} />
        </button>
      )}

      {/* Input bar */}
      <div className="px-4 pb-4 pt-3 flex-shrink-0 border-t border-white/[0.07]"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agent.name}…`}
            rows={1}
            disabled={agent.status === 'offline'}
            className="input-glass flex-1 min-h-[42px] max-h-32 overflow-y-auto leading-relaxed"
            style={{ resize: 'none', paddingTop: 10, paddingBottom: 10 }}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 128) + 'px';
            }}
          />

          {isStreaming ? (
            <button onClick={stopGeneration} className="btn btn-danger p-2.5 flex-shrink-0">
              <StopCircle size={18} />
            </button>
          ) : (
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || agent.status === 'offline'}
              className="btn btn-primary p-2.5 flex-shrink-0"
              style={{ opacity: (!input.trim() || agent.status === 'offline') ? 0.4 : 1 }}
            >
              <Send size={18} />
            </button>
          )}
        </div>
        <p className="text-center text-[10px] text-white/20 mt-2">
          Enter to send · Shift+Enter for newline · Routed via Tailscale
        </p>
      </div>
    </div>
  );
}
