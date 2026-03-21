'use client';

import { useMissionStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Key,
  BarChart3,
  BookOpen,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Pulse',
    icon: LayoutDashboard,
    description: 'Real-time monitoring',
  },
  {
    id: 'vault',
    label: 'Vault',
    icon: Key,
    description: 'API key management',
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: BarChart3,
    description: 'Efficiency & analytics',
  },
  {
    id: 'prompts',
    label: 'Library',
    icon: BookOpen,
    description: 'Prompt library',
  },
  {
    id: 'bridge',
    label: 'Bridge',
    icon: Zap,
    description: 'Cross-model cost tool',
  },
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useMissionStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-[#1a1a2e]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono font-bold text-sm">
            M
          </div>
          <div>
            <h1 className="font-mono font-bold text-white text-sm">MissionCTL</h1>
            <p className="text-xs text-slate-600 font-mono">AI Command Center</p>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="px-4 py-3 border-b border-[#1a1a2e]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-xs text-slate-600 font-mono">System Online</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 btn-haptic text-left group',
                isActive
                  ? 'bg-purple-500/15 border border-purple-500/25 text-purple-300'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon
                size={16}
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-purple-400' : 'text-slate-600 group-hover:text-slate-400'
                )}
              />
              <div className="min-w-0">
                <div className={cn(
                  'text-sm font-mono font-medium',
                  isActive ? 'text-purple-300' : ''
                )}>
                  {item.label}
                </div>
                <div className="text-xs text-slate-600 font-mono truncate">
                  {item.description}
                </div>
              </div>
              {isActive && (
                <div className="ml-auto w-1 h-4 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1a1a2e]">
        <div className="text-xs text-slate-700 font-mono text-center">
          v1.0.0 — Cyber Minimalist
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#0f0f18] border border-[#1a1a2e] text-slate-400"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 bottom-0 w-56 bg-[#080810] border-r border-[#1a1a2e] flex flex-col z-40',
        'transition-transform duration-300',
        'lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <NavContent />
      </aside>
    </>
  );
}
