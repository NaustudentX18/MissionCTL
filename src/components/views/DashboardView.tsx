'use client';

import { useHermesStore } from '@/lib/store';
import { AgentCard } from '@/components/dashboard/AgentCard';
import { ChatPanel } from '@/components/chat/ChatPanel';

export function DashboardView() {
  const { agents, activeChatAgentId, setActiveChatAgentId, setActiveTab } = useHermesStore();

  const onlineCount = agents.filter(a => a.status === 'online' || a.status === 'busy').length;

  return (
    <>
      {/* Chat panel overlay */}
      {activeChatAgentId && (
        <ChatPanel
          agentId={activeChatAgentId}
          onClose={() => setActiveChatAgentId(null)}
        />
      )}

      <div className="space-y-5">
        {/* Welcome header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="heading text-xl text-white">Agent Network</h1>
            <p className="text-sm text-white/40 mt-1">
              {onlineCount > 0
                ? `${onlineCount} of ${agents.length} agents active on Tailscale`
                : 'Configure agents in Settings, then ping to connect'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="btn btn-ghost text-xs flex-shrink-0"
          >
            ⚙️ Configure
          </button>
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onOpenChat={setActiveChatAgentId}
            />
          ))}
        </div>

        {/* Empty state help */}
        {onlineCount === 0 && (
          <div className="glass-card p-6 text-center space-y-3">
            <div className="text-3xl">🌐</div>
            <div>
              <p className="text-sm font-medium text-white/60">No agents reachable yet</p>
              <p className="text-xs text-white/30 mt-1 max-w-sm mx-auto">
                Set your Tailscale IPs in Settings, make sure Ollama is running on each device,
                and the cards will ping automatically.
              </p>
            </div>
            <button onClick={() => setActiveTab('settings')} className="btn btn-primary text-sm mx-auto">
              Open Settings
            </button>
          </div>
        )}
      </div>
    </>
  );
}
