'use client';

import { useState } from 'react';
import { Save, RotateCcw, Info, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHermesStore } from '@/lib/store';
import { DEVICE_META } from '@/lib/agents';
import { DEFAULT_AGENTS } from '@/lib/agents';
import type { HermesAgent } from '@/lib/types';

export function SettingsView() {
  const { agents, setAgents } = useHermesStore();
  const [drafts, setDrafts] = useState<HermesAgent[]>(agents);

  const update = (id: string, field: keyof HermesAgent, value: string) => {
    setDrafts(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const updatePort = (id: string, value: string) => {
    const n = parseInt(value, 10);
    if (!isNaN(n) && n > 0 && n <= 65535) {
      setDrafts(prev => prev.map(a => a.id === id ? { ...a, port: n } : a));
    }
  };

  const save = () => {
    setAgents(drafts);
    toast.success('Settings saved', {
      style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
    });
  };

  const resetDefaults = () => {
    if (!confirm('Reset to default configuration?')) return;
    const defaults = DEFAULT_AGENTS.map(d => ({ ...d, status: 'offline' as const }));
    setDrafts(defaults);
    setAgents(defaults);
    toast.success('Reset to defaults');
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="font-semibold text-base tracking-tight">Settings</h2>
        <p className="text-xs text-white/35 mt-0.5">Configure your Hermes agent network</p>
      </div>

      {/* Info notice */}
      <div className="flex gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)' }}
      >
        <Info size={16} style={{ color: '#0a84ff', flexShrink: 0, marginTop: 1 }} />
        <div className="text-xs leading-relaxed text-white/55">
          <strong className="text-white/70">Tailscale IPs</strong> — find them in the Tailscale app on each device
          (format: <span className="font-mono">100.x.x.x</span>). Ollama runs on port 11434 by default.
          Make sure Ollama is running on each device and the Hermes model is pulled.
        </div>
      </div>

      {/* Agent settings */}
      <div className="space-y-3">
        {drafts.map(agent => {
          const meta = DEVICE_META[agent.device];
          return (
            <div key={agent.id} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}25` }}
                >
                  {meta.emoji}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/85">{meta.label}</p>
                  <p className="text-[11px] text-white/30">{agent.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="label-xs mb-1.5 block">Agent Name</label>
                  <input
                    value={agent.name}
                    onChange={e => update(agent.id, 'name', e.target.value)}
                    placeholder="Hermes Prime"
                    className="input-glass text-sm"
                  />
                </div>

                {/* Tailscale IP */}
                <div>
                  <label className="label-xs mb-1.5 block">Tailscale IP</label>
                  <input
                    value={agent.tailscaleIp}
                    onChange={e => update(agent.id, 'tailscaleIp', e.target.value)}
                    placeholder="100.x.x.x"
                    className="input-glass font-mono text-sm"
                    spellCheck={false}
                  />
                </div>

                {/* Port */}
                <div>
                  <label className="label-xs mb-1.5 block">Ollama Port</label>
                  <input
                    type="number"
                    value={agent.port}
                    onChange={e => updatePort(agent.id, e.target.value)}
                    min={1}
                    max={65535}
                    className="input-glass font-mono text-sm"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="label-xs mb-1.5 block">Default Model</label>
                  <input
                    value={agent.model}
                    onChange={e => update(agent.id, 'model', e.target.value)}
                    placeholder="hermes3:latest"
                    className="input-glass font-mono text-sm"
                    spellCheck={false}
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="label-xs mb-1.5 block">Description</label>
                  <input
                    value={agent.description}
                    onChange={e => update(agent.id, 'description', e.target.value)}
                    placeholder="What this agent does…"
                    className="input-glass text-sm"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save / reset */}
      <div className="flex gap-2">
        <button onClick={save} className="btn btn-primary flex-1">
          <Save size={14} />
          Save Settings
        </button>
        <button onClick={resetDefaults} className="btn btn-ghost px-4">
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Security note */}
      <div className="flex gap-2.5 p-3.5 rounded-xl"
        style={{ background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.15)' }}
      >
        <Shield size={14} style={{ color: '#30d158', flexShrink: 0, marginTop: 2 }} />
        <p className="text-[11px] text-white/40 leading-relaxed">
          All connections are direct Tailscale P2P — no data leaves your network.
          Settings stored locally in your browser. API keys not required.
        </p>
      </div>

      {/* Ollama setup help */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-white/60 mb-3">Quick Setup Checklist</p>
        <div className="space-y-2 text-[12px] text-white/40">
          {[
            ['Install Tailscale on all devices and join the same network', '✓'],
            ['Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh', '✓'],
            ['Pull Hermes 3: ollama pull hermes3', '✓'],
            ['Allow remote access: OLLAMA_HOST=0.0.0.0 ollama serve', '✓'],
            ['Enter each device\'s Tailscale IP above and click Save', '→'],
            ['Click Ping All in the Network tab to verify connections', '→'],
          ].map(([step, icon]) => (
            <div key={step} className="flex items-start gap-2">
              <span className="flex-shrink-0 text-white/30">{icon}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2.5 rounded-lg text-[11px] font-mono text-white/35"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {`# On each device:\nOLLAMA_HOST=0.0.0.0 ollama serve\nollama pull hermes3`}
        </div>
      </div>
    </div>
  );
}
