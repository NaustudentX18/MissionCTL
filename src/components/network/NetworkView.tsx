'use client';

import { useCallback, useState } from 'react';
import { RefreshCw, Wifi, WifiOff, Server, Monitor, Tablet, Cpu } from 'lucide-react';
import { useHermesStore } from '@/lib/store';
import { cn, formatBytes, formatRelative } from '@/lib/utils';
import { DEVICE_META } from '@/lib/agents';
import type { AgentStatus } from '@/lib/types';

const STATUS_CONFIG: Record<AgentStatus, { label: string; dot: string; color: string }> = {
  online:  { label: 'Online',    dot: 'status-online',  color: '#30d158' },
  offline: { label: 'Offline',   dot: 'status-offline', color: 'rgba(255,255,255,0.2)' },
  busy:    { label: 'Generating',dot: 'status-busy',    color: '#ffd60a' },
  error:   { label: 'Error',     dot: 'status-error',   color: '#ff453a' },
};

export function NetworkView() {
  const { agents, agentHealth, setAgentHealth, setAgentStatus } = useHermesStore();
  const [pinging, setPinging] = useState<Record<string, boolean>>({});

  const pingAgent = useCallback(async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || pinging[agentId]) return;

    setPinging(prev => ({ ...prev, [agentId]: true }));

    try {
      const [pingRes, tagsRes, psRes] = await Promise.allSettled([
        fetch('/api/ollama', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip: agent.tailscaleIp, port: agent.port, action: 'ping' }) }),
        fetch('/api/ollama', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip: agent.tailscaleIp, port: agent.port, action: 'tags' }) }),
        fetch('/api/ollama', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip: agent.tailscaleIp, port: agent.port, action: 'ps' }) }),
      ]);

      const ok = pingRes.status === 'fulfilled' && pingRes.value.ok;
      const tags = tagsRes.status === 'fulfilled' && tagsRes.value.ok
        ? (await tagsRes.value.json()).models ?? [] : [];
      const running = psRes.status === 'fulfilled' && psRes.value.ok
        ? (await psRes.value.json()).models ?? [] : [];

      setAgentHealth(agentId, {
        agentId,
        status: ok ? (running.length > 0 ? 'busy' : 'online') : 'offline',
        models: tags,
        runningModels: running,
        checkedAt: new Date().toISOString(),
      });
    } catch {
      setAgentStatus(agentId, 'offline');
    } finally {
      setPinging(prev => ({ ...prev, [agentId]: false }));
    }
  }, [agents, pinging, setAgentHealth, setAgentStatus]);

  const pingAll = async () => {
    await Promise.allSettled(agents.map(a => pingAgent(a.id)));
  };

  const onlineCount = agents.filter(a => a.status === 'online' || a.status === 'busy').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base tracking-tight">Network Status</h2>
          <p className="text-xs text-white/35 mt-0.5">Hermes agents across Tailscale</p>
        </div>
        <button onClick={pingAll} className="btn btn-ghost text-xs">
          <RefreshCw size={13} />
          Ping All
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold tracking-tight" style={{ color: '#30d158' }}>
            {onlineCount}
          </div>
          <div className="label-xs mt-0.5">Online</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold tracking-tight text-white/60">
            {agents.length - onlineCount}
          </div>
          <div className="label-xs mt-0.5">Offline</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold tracking-tight" style={{ color: '#bf5af2' }}>
            {agents.length}
          </div>
          <div className="label-xs mt-0.5">Total</div>
        </div>
      </div>

      {/* Agent rows */}
      <div className="space-y-3">
        {agents.map(agent => {
          const health = agentHealth[agent.id];
          const statusCfg = STATUS_CONFIG[agent.status];
          const deviceMeta = DEVICE_META[agent.device];
          const isPinging = pinging[agent.id] ?? false;

          return (
            <div key={agent.id} className="glass-card p-4">
              {/* Row header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}25` }}
                >
                  {deviceMeta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-white/90">{agent.name}</span>
                    <span className="text-[11px] text-white/30">{deviceMeta.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn('status-dot', statusCfg.dot)} />
                    <span className="text-xs" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                    {agent.lastSeen && (
                      <span className="text-[11px] text-white/25">· {formatRelative(agent.lastSeen)}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => pingAgent(agent.id)}
                  disabled={isPinging}
                  className="btn btn-ghost px-3 py-1.5 text-xs"
                >
                  <RefreshCw size={12} className={cn(isPinging && 'animate-spin')} />
                  {isPinging ? 'Pinging…' : 'Ping'}
                </button>
              </div>

              {/* Connection details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="label-xs mb-1">Tailscale IP</div>
                  <div className="text-xs font-mono text-white/70">{agent.tailscaleIp}:{agent.port}</div>
                </div>
                <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="label-xs mb-1">Model</div>
                  <div className="text-xs font-mono text-white/70 truncate">{agent.model}</div>
                </div>
                <div className="rounded-xl px-3 py-2 col-span-2 sm:col-span-1" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="label-xs mb-1">Available Models</div>
                  <div className="text-xs text-white/70">{health?.models?.length ?? '—'}</div>
                </div>
              </div>

              {/* Running models */}
              {health?.runningModels && health.runningModels.length > 0 && (
                <div>
                  <p className="label-xs mb-2">Running in Memory</p>
                  <div className="space-y-1.5">
                    {health.runningModels.map(m => (
                      <div key={m.name} className="flex items-center justify-between px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(191,90,242,0.06)', border: '1px solid rgba(191,90,242,0.15)' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="status-dot status-busy animate-pulse-online" />
                          <span className="text-xs font-mono text-white/70">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-white/30 font-mono">
                          <span>{formatBytes(m.size_vram)} VRAM</span>
                          <span>{formatBytes(m.size)} RAM</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available models list */}
              {health?.models && health.models.length > 0 && (
                <div className="mt-3">
                  <p className="label-xs mb-2">Installed Models</p>
                  <div className="flex flex-wrap gap-1.5">
                    {health.models.map(m => (
                      <span key={m.name} className="px-2 py-1 rounded-lg text-[11px] font-mono text-white/40"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Offline hint */}
              {agent.status === 'offline' && (
                <p className="text-[11px] text-white/25 mt-3 flex items-center gap-1.5">
                  <WifiOff size={11} />
                  Not reachable. Check Tailscale is active on that device.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-white/20 text-center">
        All connections routed via Tailscale · Port {agents[0]?.port ?? 11434} (Ollama)
      </p>
    </div>
  );
}
