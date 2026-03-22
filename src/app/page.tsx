'use client';

import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useMissionStore } from '@/lib/store';
import { DashboardView } from '@/components/views/DashboardView';
import { VaultView } from '@/components/views/VaultView';
import { InsightsView } from '@/components/views/InsightsView';
import { PromptsView } from '@/components/views/PromptsView';
import { BridgeView } from '@/components/views/BridgeView';

const VIEWS: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  vault: VaultView,
  insights: InsightsView,
  prompts: PromptsView,
  bridge: BridgeView,
};

export default function Home() {
  const activeTab = useMissionStore(s => s.activeTab);
  const ActiveView = VIEWS[activeTab] ?? DashboardView;

  return (
    <>
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
            background: '#0f0f18',
            color: '#e2e8f0',
            border: '1px solid #1a1a2e',
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '12px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#0f0f18' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0f0f18' },
          },
        }}
      />
    </>
  );
}
