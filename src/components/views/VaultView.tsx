'use client';

import { useState } from 'react';
import { ApiKeyForm } from '@/components/vault/ApiKeyForm';
import { PROVIDER_LIST, PROVIDERS } from '@/lib/providers';
import { useMissionStore } from '@/lib/store';
import { Shield, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

export function VaultView() {
  const enabledProviders = useMissionStore(s => s.enabledProviders);
  const [showMore, setShowMore] = useState(false);

  const activeProviders = PROVIDER_LIST.filter(p => enabledProviders.includes(p));
  const inactiveProviders = PROVIDER_LIST.filter(p => !enabledProviders.includes(p));

  return (
    <div className="space-y-6">
      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-mono font-semibold text-amber-400 mb-1">Security Notice</div>
          <p className="text-xs text-slate-500 font-mono leading-relaxed">
            API keys are stored locally in your browser&apos;s localStorage and never sent to any server.
            Validation calls are proxied through Next.js to prevent CORS issues. Never share your keys.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Shield size={20} className="text-purple-400" />
        </div>
        <div>
          <h2 className="font-mono font-bold text-white">Universal Vault</h2>
          <p className="text-xs text-slate-500 font-mono">
            {activeProviders.length} active · {PROVIDER_LIST.length} total providers — toggle to show/hide in all views
          </p>
        </div>
      </div>

      {/* Active providers */}
      {activeProviders.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-3">
            Active Providers ({activeProviders.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProviders.map(provider => (
              <ApiKeyForm key={provider} provider={provider} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive / hidden providers */}
      {inactiveProviders.length > 0 && (
        <div>
          <button
            onClick={() => setShowMore(v => !v)}
            className="flex items-center gap-2 text-xs text-slate-500 font-mono uppercase tracking-wider mb-3 hover:text-slate-300 transition-colors"
          >
            {showMore ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            More Providers ({inactiveProviders.length} hidden)
          </button>

          {showMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inactiveProviders.map(provider => (
                <ApiKeyForm key={provider} provider={provider} />
              ))}
            </div>
          )}

          {!showMore && (
            <div className="flex flex-wrap gap-2">
              {inactiveProviders.map(p => {
                const config = PROVIDERS[p];
                return (
                  <div
                    key={p}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#1a1a2e] text-xs font-mono text-slate-600"
                  >
                    <span style={{ color: config.color }}>{config.icon}</span>
                    {config.name}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
