'use client';

import { Toaster } from 'react-hot-toast';
import { useHermesStore } from '@/lib/store';
import { TopBar, Sidebar, BottomNav } from '@/components/layout/NavBar';
import { DashboardView } from '@/components/views/DashboardView';
import { AgentsView } from '@/components/views/AgentsView';
import { ChatView } from '@/components/views/ChatView';
import { BroadcastChat } from '@/components/chat/BroadcastChat';
import { NetworkView } from '@/components/network/NetworkView';
import { SettingsView } from '@/components/settings/SettingsView';

const VIEWS = {
  dashboard: DashboardView,
  agents:    AgentsView,
  chat:      ChatView,
  broadcast: BroadcastChat,
  network:   NetworkView,
  settings:  SettingsView,
};

export default function Home() {
  const activeTab = useHermesStore(s => s.activeTab);
  const ActiveView = VIEWS[activeTab] ?? DashboardView;

  return (
    <>
      {/* Global ambient gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(191,90,242,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(10,132,255,0.03) 0%, transparent 50%)',
      }} />

      <TopBar />
      <Sidebar />

      {/* Main content */}
      <main
        className="min-h-dvh pt-14 pb-20 lg:pb-8 px-4 sm:px-5"
        style={{ maxWidth: '100%' }}
      >
        <div className="max-w-6xl mx-auto py-5">
          <ActiveView />
        </div>
      </main>

      <BottomNav />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(20,20,25,0.95)',
            color: '#e8e8e8',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          },
          success: { iconTheme: { primary: '#30d158', secondary: '#000' } },
          error:   { iconTheme: { primary: '#ff453a', secondary: '#000' } },
        }}
      />
    </>
  );
}
