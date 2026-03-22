'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useMissionStore } from '@/lib/store';
import { DashboardView } from '@/components/views/DashboardView';
import { VaultView } from '@/components/views/VaultView';
import { InsightsView } from '@/components/views/InsightsView';
import { PromptsView } from '@/components/views/PromptsView';
import { BridgeView } from '@/components/views/BridgeView';
import { SettingsView } from '@/components/views/SettingsView';
import { X, Command } from 'lucide-react';

const VIEWS: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  vault:     VaultView,
  insights:  InsightsView,
  prompts:   PromptsView,
  bridge:    BridgeView,
  settings:  SettingsView,
};

const NAV_SHORTCUTS: { id: string; label: string; key: string }[] = [
  { id: 'dashboard', label: 'Pulse Dashboard',    key: '1' },
  { id: 'vault',     label: 'Universal Vault',    key: '2' },
  { id: 'insights',  label: 'Deep Insights',      key: '3' },
  { id: 'prompts',   label: 'Prompt Library',     key: '4' },
  { id: 'bridge',    label: 'AI Bridge',          key: '5' },
  { id: 'settings',  label: 'Settings',           key: '6' },
];

function QuickNav({ onClose }: { onClose: () => void }) {
  const { setActiveTab } = useMissionStore();

  const navigate = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f18] border border-purple-500/30 rounded-xl w-full max-w-sm shadow-[0_0_60px_rgba(168,85,247,0.2)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 p-4 border-b border-[#1a1a2e]">
          <Command size={14} className="text-purple-400" />
          <span className="text-sm font-mono text-slate-400">Quick Navigation</span>
          <button onClick={onClose} className="ml-auto text-slate-600 hover:text-slate-300">
            <X size={14} />
          </button>
        </div>
        <div className="p-2">
          {NAV_SHORTCUTS.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-mono text-slate-300 hover:bg-purple-500/10 hover:text-white transition-all text-left group"
            >
              <span>{item.label}</span>
              <kbd className="text-xs text-slate-600 group-hover:text-purple-400 border border-[#1a1a2e] group-hover:border-purple-500/30 px-1.5 py-0.5 rounded transition-all">
                ⌘{item.key}
              </kbd>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { activeTab, setActiveTab, theme } = useMissionStore();
  const ActiveView = VIEWS[activeTab] ?? DashboardView;
  const [quickNavOpen, setQuickNavOpen] = useState(false);

  // Apply theme to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
    }
  }, [theme]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Escape to close
      if (e.key === 'Escape') {
        setQuickNavOpen(false);
        return;
      }

      if (!ctrl) return;

      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setQuickNavOpen(v => !v);
        return;
      }

      // Number shortcuts 1-6
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= NAV_SHORTCUTS.length) {
        e.preventDefault();
        setActiveTab(NAV_SHORTCUTS[num - 1].id);
        setQuickNavOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveTab]);

  const isDark = theme === 'dark';

  return (
    <>
      {quickNavOpen && <QuickNav onClose={() => setQuickNavOpen(false)} />}

      {/* Background grid effect */}
      <div className="fixed inset-0 cyber-grid pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/5 via-transparent to-blue-950/5 pointer-events-none" />

      <div className="flex min-h-screen">
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col lg:ml-56">
          <TopBar />
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <ActiveView />
          </main>
        </div>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? '#0f0f18' : '#ffffff',
            color: isDark ? '#e2e8f0' : '#0f172a',
            border: isDark ? '1px solid #1a1a2e' : '1px solid #e2e8f0',
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '12px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: isDark ? '#0f0f18' : '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: isDark ? '#0f0f18' : '#fff' } },
        }}
      />
    </>
  );
}
