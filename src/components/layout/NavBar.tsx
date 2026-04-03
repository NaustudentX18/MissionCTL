'use client';

import { useHermesStore } from '@/lib/store';
import type { NavTab } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Bot, MessageSquare, Radio, Network, Settings,
  X, ChevronRight,
} from 'lucide-react';
import { useEffect } from 'react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'agents',     label: 'Agents',     icon: Bot             },
  { id: 'chat',       label: 'Chat',       icon: MessageSquare   },
  { id: 'broadcast',  label: 'Broadcast',  icon: Radio           },
  { id: 'network',    label: 'Network',    icon: Network         },
  { id: 'settings',   label: 'Settings',   icon: Settings        },
];

// ─── Top bar (always visible) ──────────────────────────────────
export function TopBar() {
  const { sidebarOpen, setSidebarOpen, activeTab, agents } = useHermesStore();
  const onlineCount = agents.filter(a => a.status === 'online' || a.status === 'busy').length;

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 flex items-center px-4 border-b border-white/[0.07]"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      {/* Hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="w-9 h-9 flex flex-col justify-center items-center gap-[5px] rounded-xl hover:bg-white/10 transition-colors mr-3 flex-shrink-0"
        aria-label="Menu"
      >
        <span className={cn(
          'block w-5 h-0.5 bg-white/80 rounded-full transition-all duration-200',
          sidebarOpen && 'rotate-45 translate-y-[7px]'
        )} />
        <span className={cn(
          'block w-5 h-0.5 bg-white/80 rounded-full transition-all duration-200',
          sidebarOpen && 'opacity-0 scale-x-0'
        )} />
        <span className={cn(
          'block w-5 h-0.5 bg-white/80 rounded-full transition-all duration-200',
          sidebarOpen && '-rotate-45 -translate-y-[7px]'
        )} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #bf5af2, #7c3aed)' }}
        >
          ⚡
        </div>
        <div className="min-w-0">
          <span className="font-semibold text-sm tracking-tight text-white">Hermes</span>
          <span className="text-white/40 text-sm font-light"> · Agent Network</span>
        </div>
      </div>

      {/* Status pill */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
        style={{ background: onlineCount > 0 ? 'rgba(48,209,88,0.12)' : 'rgba(255,255,255,0.06)', border: '1px solid', borderColor: onlineCount > 0 ? 'rgba(48,209,88,0.25)' : 'rgba(255,255,255,0.1)' }}
      >
        <span className={cn('status-dot', onlineCount > 0 ? 'status-online' : 'status-offline')} />
        <span style={{ color: onlineCount > 0 ? '#30d158' : 'rgba(255,255,255,0.4)' }}>
          {onlineCount}/{agents.length}
        </span>
      </div>
    </header>
  );
}

// ─── Slide-in Sidebar ──────────────────────────────────────────
export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, activeTab, setActiveTab, agents } = useHermesStore();

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setSidebarOpen]);

  const navigate = (tab: NavTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 backdrop animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'linear-gradient(180deg, rgba(20,20,28,0.98) 0%, rgba(12,12,16,0.99) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, #bf5af2, #7c3aed)' }}
            >⚡</div>
            <span className="font-semibold text-sm tracking-tight">Hermes</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150',
                  active
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                )}
                style={active ? {
                  background: 'rgba(191,90,242,0.15)',
                  border: '1px solid rgba(191,90,242,0.2)',
                } : { border: '1px solid transparent' }}
              >
                <Icon size={17} style={active ? { color: '#bf5af2' } : {}} className="flex-shrink-0" />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {active && <ChevronRight size={14} style={{ color: '#bf5af2', opacity: 0.7 }} />}
              </button>
            );
          })}
        </nav>

        {/* Agent status summary */}
        <div className="px-3 pb-4 pt-2 border-t border-white/[0.07] space-y-1.5">
          <p className="label-xs px-2 mb-2">Agents</p>
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => navigate('agents')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.05] transition-colors"
            >
              <span className={cn(
                'status-dot',
                agent.status === 'online' ? 'status-online' :
                agent.status === 'busy'   ? 'status-busy'   :
                agent.status === 'error'  ? 'status-error'  : 'status-offline'
              )} />
              <span className="text-xs text-white/60 flex-1 truncate text-left">{agent.name}</span>
              <span className="text-xs text-white/25 font-mono">{agent.tailscaleIp}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

// ─── Bottom tab bar (mobile) ───────────────────────────────────
export function BottomNav() {
  const { activeTab, setActiveTab } = useHermesStore();

  const items = NAV_ITEMS.slice(0, 5); // Show first 5

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex items-center justify-around safe-bottom px-2 pt-2"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {items.map(item => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center gap-1 px-4 py-2 min-w-[60px] transition-all duration-150"
          >
            <Icon
              size={20}
              style={active ? { color: '#bf5af2' } : { color: 'rgba(255,255,255,0.35)' }}
            />
            <span
              className="text-[10px] font-medium"
              style={active ? { color: '#bf5af2' } : { color: 'rgba(255,255,255,0.35)' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
