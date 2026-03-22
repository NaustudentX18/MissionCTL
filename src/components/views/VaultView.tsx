'use client';

import { ApiKeyForm } from '@/components/vault/ApiKeyForm';
import { PROVIDER_LIST } from '@/lib/providers';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

export function VaultView() {
  return (
    <div className="space-y-6">
      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-mono font-semibold text-amber-400 mb-1">Security Notice</div>
          <p className="text-xs text-slate-500 font-mono leading-relaxed">
            API keys are stored locally in your browser&apos;s localStorage and never sent to any server.
            Key validation calls are routed through the local Next.js API to prevent CORS issues.
            Never share your API keys with third parties.
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
          <p className="text-xs text-slate-500 font-mono">Manage and validate your AI provider API keys</p>
        </div>
      </div>

      {/* API key forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROVIDER_LIST.map(provider => (
          <ApiKeyForm key={provider} provider={provider} />
        ))}
      </div>

      {/* Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            provider: 'Claude',
            icon: '◆',
            url: 'console.anthropic.com/keys',
            hint: 'Starts with sk-ant-api03-',
            color: 'text-purple-400',
          },
          {
            provider: 'OpenAI',
            icon: '⬡',
            url: 'platform.openai.com/api-keys',
            hint: 'Starts with sk-proj- or sk-',
            color: 'text-emerald-400',
          },
          {
            provider: 'Gemini',
            icon: '✦',
            url: 'aistudio.google.com/app/apikey',
            hint: 'Starts with AIzaSy',
            color: 'text-blue-400',
          },
          {
            provider: 'Groq',
            icon: '⚡',
            url: 'console.groq.com/keys',
            hint: 'Starts with gsk_',
            color: 'text-amber-400',
          },
        ].map(item => (
          <div key={item.provider} className="flex items-center gap-3 p-3 bg-[#0f0f18] border border-[#1a1a2e] rounded-lg">
            <Lock size={14} className="text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={item.color}>{item.icon}</span>
                <span className="text-xs font-mono text-slate-400">{item.provider}:</span>
                <span className="text-xs font-mono text-slate-600 truncate">{item.hint}</span>
              </div>
              <span className="text-xs text-slate-700 font-mono">{item.url}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
