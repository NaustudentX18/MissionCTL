'use client';

import { useMissionStore } from '@/lib/store';
import { PROVIDER_LIST, PROVIDERS } from '@/lib/providers';

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Pulse Dashboard', subtitle: 'Real-time AI monitoring & news feed' },
  vault: { title: 'Universal Vault', subtitle: 'Secure API key management' },
  insights: { title: 'Deep Insights', subtitle: 'Efficiency scores & analytics' },
  prompts: { title: 'Prompt Library', subtitle: 'Master prompts at your fingertips' },
  bridge: { title: 'AI Bridge', subtitle: 'Cross-model cost comparison' },
};

export function TopBar() {
  const activeTab = useMissionStore(s => s.activeTab);
  const apiKeys = useMissionStore(s => s.apiKeys);

  const info = TAB_TITLES[activeTab] ?? { title: 'MissionCTL', subtitle: 'AI Command Center' };
  const connectedCount = PROVIDER_LIST.filter(p => apiKeys[p].isValid === true).length;

  return (
    <header className="h-14 border-b border-[#1a1a2e] bg-[#080810]/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h2 className="font-mono font-bold text-white text-sm">{info.title}</h2>
        <p className="text-xs text-slate-600 font-mono">{info.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Provider connection indicators */}
        <div className="hidden sm:flex items-center gap-1.5">
          {PROVIDER_LIST.map(provider => {
            const config = PROVIDERS[provider];
            const key = apiKeys[provider];
            const isConnected = key.isValid === true;

            return (
              <div
                key={provider}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono border"
                style={{
                  borderColor: isConnected ? `${config.color}40` : '#1a1a2e',
                  background: isConnected ? `${config.color}10` : 'transparent',
                  color: isConnected ? config.color : '#4a5568',
                }}
                title={`${config.name}: ${isConnected ? 'Connected' : 'Not connected'}`}
              >
                <span>{config.icon}</span>
                <span className="hidden md:inline">{config.name}</span>
              </div>
            );
          })}
        </div>

        {/* Connected count */}
        <div className="text-xs font-mono text-slate-600">
          <span className={connectedCount > 0 ? 'text-emerald-400' : 'text-slate-600'}>
            {connectedCount}
          </span>
          <span>/{PROVIDER_LIST.length} connected</span>
        </div>
      </div>
    </header>
  );
}
