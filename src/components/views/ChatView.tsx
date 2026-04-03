'use client';

import { useHermesStore } from '@/lib/store';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { MessageSquare } from 'lucide-react';
import { DEVICE_META } from '@/lib/agents';
import { cn } from '@/lib/utils';

export function ChatView() {
  const { agents, activeChatAgentId, setActiveChatAgentId } = useHermesStore();
  const onlineAgents = agents.filter(a => a.status === 'online' || a.status === 'busy');

  if (activeChatAgentId) {
    return <ChatPanel agentId={activeChatAgentId} onClose={() => setActiveChatAgentId(null)} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-base tracking-tight">Chat</h2>
        <p className="text-xs text-white/35 mt-0.5">Select an agent to start a conversation</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {agents.map(agent => {
          const meta = DEVICE_META[agent.device];
          const isOnline = agent.status === 'online' || agent.status === 'busy';

          return (
            <button
              key={agent.id}
              onClick={() => isOnline && setActiveChatAgentId(agent.id)}
              className={cn(
                'glass-card p-5 text-left transition-all duration-200 group',
                isOnline
                  ? 'hover:ring-1 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              )}
              style={isOnline ? { '--tw-ring-color': `${agent.color}30` } as React.CSSProperties : {}}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}25` }}
                >
                  {meta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{agent.name}</span>
                    <span className={cn('status-dot',
                      agent.status === 'online' ? 'status-online' :
                      agent.status === 'busy'   ? 'status-busy'   :
                      agent.status === 'error'  ? 'status-error'  : 'status-offline'
                    )} />
                  </div>
                  <p className="text-xs text-white/35 font-mono mt-0.5">{agent.model}</p>
                </div>
                <MessageSquare
                  size={16}
                  className={cn(
                    'flex-shrink-0 transition-colors',
                    isOnline ? 'text-white/25 group-hover:text-white/60' : 'text-white/15'
                  )}
                />
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{agent.description}</p>
              {!isOnline && (
                <p className="text-[11px] text-white/20 mt-2">Offline — configure in Settings</p>
              )}
            </button>
          );
        })}
      </div>

      {onlineAgents.length === 0 && (
        <div className="glass-card p-6 text-center">
          <MessageSquare size={24} className="text-white/15 mx-auto mb-2" />
          <p className="text-sm text-white/35">No agents online</p>
          <p className="text-xs text-white/20 mt-1">Ping your agents in the Network tab</p>
        </div>
      )}
    </div>
  );
}
