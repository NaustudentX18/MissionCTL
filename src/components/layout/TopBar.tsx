'use client';

import { useMissionStore } from '@/lib/store';
import { PROVIDER_LIST, PROVIDERS } from '@/lib/providers';

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Pulse Dashboard',  subtitle: 'Real-time AI monitoring & news feed' },
  vault:     { title: 'Universal Vault',  subtitle: 'Secure API key management' },
  insights:  { title: 'Deep Insights',    subtitle: 'Efficiency scores & analytics' },
  prompts:   { title: 'Prompt Library',   subtitle: 'Master prompts at your fingertips' },
  bridge:    { title: 'AI Bridge',        subtitle: 'Cross-model cost comparison' },
  settings:  { title: 'Settings',         subtitle: 'Providers, theme & backup' },
};

export function TopBar() {
  const activeTab = useMissionStore(s => s.activeTab);
  const apiKeys = useMissionStore(s => s.apiKeys);
  const enabledProviders = useMissionStore(s => s.enabledProviders);

  const info = TAB_TITLES[activeTab] ?? { title: 'MissionCTL', subtitle: 'AI Command Center' };

  // Only show connected badge for enabled providers
  const connectedCount = enabledProviders.filter(p => apiKeys[p]?.isValid === true).length;

  return (
    <header className="h-14 border-b border-[#1a1a2e] bg-[#080810]/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="min-w-0">
        <h2 className="font-mono font-bold text-white text-sm truncate">{info.title}</h2>
        <p className="text-xs text-slate-600 font-mono hidden sm:block">{info.subtitle}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-3">
        {/* Provider dots (enabled providers only, max 8 shown) */}
        <div className="hidden sm:flex items-center gap-1">
          {enabledProviders.slice(0, 8).map(provider => {
            const config = PROVIDERS[provider];
            const key = apiKeys[provider];
            const isConnected = key?.isValid === true;

            return (
              <div
                key={provider}
                className="w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all"
                style={{
                  borderColor: isConnected ? `${config.color}60` : '#1a1a2e',
                  background: isConnected ? `${config.color}20` : 'transparent',
                  color: isConnected ? config.color : '#374151',
                }}
                title={`${config.name}: ${isConnected ? 'Connected' : 'Not connected'}`}
              >
                {config.icon}
              </div>
            );
          })}
          {enabledProviders.length > 8 && (
            <span className="text-xs text-slate-600 font-mono">+{enabledProviders.length - 8}</span>
          )}
        </div>

        {/* Connected count */}
        <div className="text-xs font-mono text-slate-600 whitespace-nowrap">
          <span className={connectedCount > 0 ? 'text-emerald-400' : 'text-slate-600'}>
            {connectedCount}
          </span>
          <span>/{enabledProviders.length}</span>
        </div>
      </div>
    </header>
  );
}
