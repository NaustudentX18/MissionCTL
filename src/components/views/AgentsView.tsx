'use client';

import { useState } from 'react';
import { MessageSquare, BarChart2, Layers } from 'lucide-react';
import { useHermesStore } from '@/lib/store';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { SubAgentViz } from '@/components/dashboard/SubAgentViz';
import { DEVICE_META } from '@/lib/agents';
import { cn, formatRelative, formatBytes } from '@/lib/utils';

export function AgentsView() {
  const { agents, agentHealth, sessions, activeChatAgentId, setActiveChatAgentId } = useHermesStore();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedAgent = agents.find(a => a.id === selected);
  const selectedHealth = selected ? agentHealth[selected] : null;
  const selectedSession = selected ? sessions[selected] : null;

  return (
    <>
      {activeChatAgentId && (
        <ChatPanel agentId={activeChatAgentId} onClose={() => setActiveChatAgentId(null)} />
      )}

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-base tracking-tight">Agents</h2>
          <p className="text-xs text-white/35 mt-0.5">Detailed view of each Hermes instance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Agent list */}
          <div className="space-y-2">
            {agents.map(agent => {
              const health = agentHealth[agent.id];
              const session = sessions[agent.id];
              const meta = DEVICE_META[agent.device];
              const isActive = selected === agent.id;

              return (
                <button
                  key={agent.id}
                  onClick={() => setSelected(isActive ? null : agent.id)}
                  className={cn(
                    'w-full text-left glass-card p-3.5 transition-all duration-200',
                    isActive ? 'ring-1 ring-white/20' : ''
                  )}
                  style={isActive ? { background: 'rgba(255,255,255,0.07)' } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}25` }}
                    >
                      {meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white/85 truncate">{agent.name}</span>
                        <span className={cn('status-dot flex-shrink-0',
                          agent.status === 'online' ? 'status-online' :
                          agent.status === 'busy'   ? 'status-busy'   :
                          agent.status === 'error'  ? 'status-error'  : 'status-offline'
                        )} />
                      </div>
                      <p className="text-[11px] text-white/30 truncate">{agent.model} · {meta.label}</p>
                    </div>
                    {(agent.status === 'online' || agent.status === 'busy') && (
                      <button
                        onClick={e => { e.stopPropagation(); setActiveChatAgentId(agent.id); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                        style={{ color: agent.color }}
                      >
                        <MessageSquare size={14} />
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            {!selectedAgent ? (
              <div className="glass-card p-8 text-center h-full flex flex-col items-center justify-center">
                <Layers size={28} className="text-white/15 mb-3" />
                <p className="text-sm text-white/30">Select an agent to view details</p>
              </div>
            ) : (
              <div className="glass-card p-5 space-y-5">
                {/* Agent header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                      style={{ background: `${selectedAgent.color}18`, border: `1px solid ${selectedAgent.color}30` }}
                    >
                      {DEVICE_META[selectedAgent.device].emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base tracking-tight">{selectedAgent.name}</h3>
                      <p className="text-xs text-white/40 mt-0.5">{selectedAgent.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveChatAgentId(selectedAgent.id)}
                    disabled={selectedAgent.status === 'offline'}
                    className="btn btn-primary text-xs flex-shrink-0"
                    style={{ opacity: selectedAgent.status === 'offline' ? 0.4 : 1 }}
                  >
                    <MessageSquare size={13} />
                    Chat
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Status', value: selectedAgent.status, color: selectedAgent.status === 'online' ? '#30d158' : selectedAgent.status === 'busy' ? '#ffd60a' : 'rgba(255,255,255,0.3)' },
                    { label: 'Last Seen', value: formatRelative(selectedAgent.lastSeen), color: undefined },
                    { label: 'Models', value: selectedHealth?.models?.length?.toString() ?? '—', color: undefined },
                    { label: 'Messages', value: selectedSession?.messages?.length?.toString() ?? '0', color: undefined },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl px-3 py-2.5 text-center"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="label-xs mb-1">{stat.label}</div>
                      <div className="text-sm font-semibold font-mono" style={{ color: stat.color ?? 'rgba(255,255,255,0.7)' }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Running models */}
                {selectedHealth?.runningModels && selectedHealth.runningModels.length > 0 && (
                  <div>
                    <p className="label-xs mb-2">Active in VRAM</p>
                    {selectedHealth.runningModels.map(m => (
                      <div key={m.name} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                        style={{ background: 'rgba(191,90,242,0.07)', border: '1px solid rgba(191,90,242,0.18)' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="status-dot status-busy" />
                          <span className="text-xs font-mono text-white/75">{m.name}</span>
                        </div>
                        <span className="text-xs font-mono text-white/35">{formatBytes(m.size_vram)} VRAM</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent activity */}
                {selectedSession && selectedSession.messages.length > 0 && (
                  <div>
                    <p className="label-xs mb-2">Recent Activity</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedSession.messages.slice(-4).map(msg => (
                        <div key={msg.id} className="flex gap-2.5 px-3 py-2 rounded-xl"
                          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                          <span className="text-[11px] text-white/25 font-mono flex-shrink-0 mt-0.5">
                            {msg.role === 'user' ? 'You' : '⚡'}
                          </span>
                          <p className="text-xs text-white/55 line-clamp-2 flex-1">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tool calls from last message */}
                {selectedSession?.messages.at(-1)?.toolCalls && (
                  <div>
                    <p className="label-xs mb-2">Sub-Agent Activity</p>
                    <SubAgentViz
                      toolCalls={selectedSession.messages.at(-1)!.toolCalls!}
                      compact={false}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
