'use client';

import { useRef } from 'react';
import toast from 'react-hot-toast';
import { CyberCard } from '@/components/ui/CyberCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { PROVIDER_LIST, PROVIDERS } from '@/lib/providers';
import { useMissionStore } from '@/lib/store';
import { Settings, Download, Upload, Sun, Moon, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';
import type { ExportData } from '@/lib/types';

export function SettingsView() {
  const { enabledProviders, toggleProvider, setEnabledProviders, theme, toggleTheme, exportData, importData } = useMissionStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `missionctl-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported!', { icon: '📦' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as ExportData;
        if (data.version !== '1') throw new Error('Unsupported backup version');
        importData(data);
        toast.success('Settings imported!', { icon: '✅' });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const enableAll = () => {
    setEnabledProviders(PROVIDER_LIST);
    toast.success('All providers enabled');
  };

  const disableAll = () => {
    setEnabledProviders([]);
    toast.success('All providers hidden');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Settings size={20} className="text-purple-400" />
        </div>
        <div>
          <h2 className="font-mono font-bold text-white">Settings</h2>
          <p className="text-xs text-slate-500 font-mono">Provider visibility, theme, import/export</p>
        </div>
      </div>

      {/* Theme */}
      <CyberCard className="p-5">
        <h3 className="font-mono font-semibold text-white text-sm mb-4 flex items-center gap-2">
          {theme === 'dark' ? <Moon size={14} className="text-purple-400" /> : <Sun size={14} className="text-amber-400" />}
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-mono text-slate-300">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </div>
            <div className="text-xs text-slate-600 font-mono mt-0.5">
              {theme === 'dark' ? 'Cyberpunk dark theme (default)' : 'Light theme for daytime use'}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1a1a2e] text-xs font-mono text-slate-400 hover:text-slate-200 hover:border-purple-500/30 transition-all"
          >
            {theme === 'dark' ? (
              <><Sun size={14} className="text-amber-400" /> Switch to Light</>
            ) : (
              <><Moon size={14} className="text-purple-400" /> Switch to Dark</>
            )}
          </button>
        </div>
      </CyberCard>

      {/* Provider visibility */}
      <CyberCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-semibold text-white text-sm flex items-center gap-2">
            <Eye size={14} className="text-blue-400" />
            Provider Visibility
          </h3>
          <div className="flex gap-2">
            <button
              onClick={enableAll}
              className="text-xs font-mono px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              All on
            </button>
            <button
              onClick={disableAll}
              className="text-xs font-mono px-2 py-1 rounded border border-[#1a1a2e] text-slate-600 hover:text-slate-300 transition-all"
            >
              All off
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-600 font-mono mb-4">
          Enabled providers appear in Dashboard, Bridge cost comparison, and Insights scoring.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PROVIDER_LIST.map(provider => {
            const config = PROVIDERS[provider];
            const isEnabled = enabledProviders.includes(provider);
            return (
              <button
                key={provider}
                onClick={() => toggleProvider(provider)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                  isEnabled
                    ? 'border-opacity-40 bg-opacity-10'
                    : 'border-[#1a1a2e] bg-black/20 opacity-60'
                }`}
                style={isEnabled ? {
                  borderColor: `${config.color}40`,
                  backgroundColor: `${config.color}10`,
                } : {}}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base" style={{ color: config.color }}>{config.icon}</span>
                  <div>
                    <div className="text-xs font-mono font-semibold" style={{ color: isEnabled ? config.color : '#64748b' }}>
                      {config.name}
                    </div>
                    {config.isLocal && (
                      <div className="text-xs font-mono text-slate-600">Local</div>
                    )}
                  </div>
                </div>
                {isEnabled
                  ? <ToggleRight size={18} style={{ color: config.color }} />
                  : <ToggleLeft size={18} className="text-slate-600" />
                }
              </button>
            );
          })}
        </div>
      </CyberCard>

      {/* Export / Import */}
      <CyberCard className="p-5">
        <h3 className="font-mono font-semibold text-white text-sm flex items-center gap-2 mb-2">
          <Download size={14} className="text-emerald-400" />
          Backup & Restore
        </h3>
        <p className="text-xs text-slate-600 font-mono mb-4">
          Export your API keys, prompt library, and provider settings as a JSON file.
          Keys are included in plaintext — keep the backup secure.
        </p>
        <div className="flex flex-wrap gap-3">
          <NeonButton variant="green" size="sm" onClick={handleExport}>
            <Download size={13} />
            Export Backup
          </NeonButton>
          <NeonButton variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload size={13} />
            Import Backup
          </NeonButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs font-mono text-amber-400">
          ⚠ Importing a backup will merge API keys and replace your prompt library.
        </div>
      </CyberCard>

      {/* Keyboard shortcuts */}
      <CyberCard className="p-5">
        <h3 className="font-mono font-semibold text-white text-sm mb-4">Keyboard Shortcuts</h3>
        <div className="space-y-2 text-xs font-mono">
          {[
            { key: 'Ctrl/⌘ + K', action: 'Open quick navigation' },
            { key: 'Ctrl/⌘ + 1', action: 'Go to Pulse (Dashboard)' },
            { key: 'Ctrl/⌘ + 2', action: 'Go to Vault' },
            { key: 'Ctrl/⌘ + 3', action: 'Go to Insights' },
            { key: 'Ctrl/⌘ + 4', action: 'Go to Library (Prompts)' },
            { key: 'Ctrl/⌘ + 5', action: 'Go to Bridge' },
            { key: 'Ctrl/⌘ + 6', action: 'Go to Settings' },
            { key: 'Escape', action: 'Close quick nav / modals' },
          ].map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-slate-400">{action}</span>
              <kbd className="px-2 py-0.5 rounded border border-[#1a1a2e] bg-black/30 text-slate-500 text-xs">{key}</kbd>
            </div>
          ))}
        </div>
      </CyberCard>
    </div>
  );
}
