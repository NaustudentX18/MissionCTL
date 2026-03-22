'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CyberCard } from '@/components/ui/CyberCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { StatusDot } from '@/components/ui/StatusDot';
import { PROVIDERS } from '@/lib/providers';
import { useMissionStore } from '@/lib/store';
import { testApiKey } from '@/lib/api-clients';
import { maskApiKey, formatCost } from '@/lib/utils';
import type { AIProvider } from '@/lib/types';
import { Eye, EyeOff, Trash2, Wifi, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';

interface ApiKeyFormProps {
  provider: AIProvider;
}

export function ApiKeyForm({ provider }: ApiKeyFormProps) {
  const config = PROVIDERS[provider];
  const { apiKeys, setApiKey, setKeyValidation, clearApiKey, enabledProviders, toggleProvider } = useMissionStore();
  const apiKey = apiKeys[provider] ?? { provider, key: '', isValid: null, lastTested: null };
  const isEnabled = enabledProviders.includes(provider);

  const [inputValue, setInputValue] = useState(apiKey.key);
  const [baseUrlValue, setBaseUrlValue] = useState(apiKey.baseUrl ?? '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);

  const status = testing
    ? 'loading'
    : apiKey.isValid === true
    ? 'active'
    : apiKey.isValid === false
    ? 'error'
    : 'inactive';

  const color = config.color;

  const handleSave = () => {
    setApiKey(provider, inputValue.trim(), baseUrlValue.trim() || undefined);
    toast.success(`${config.name} key saved`, { icon: '🔑' });
  };

  const handleTest = async () => {
    const keyToTest = inputValue.trim() || apiKey.key;
    if (!keyToTest && !config.isLocal) {
      toast.error('Enter an API key first');
      return;
    }
    setTesting(true);
    const toastId = toast.loading(`Testing ${config.name}...`);
    try {
      const info = await testApiKey(provider, keyToTest, baseUrlValue.trim() || undefined);
      setApiKey(provider, keyToTest, baseUrlValue.trim() || undefined);
      setKeyValidation(provider, true, info);
      toast.success(`${config.name} connected!`, { id: toastId, icon: '✅' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setKeyValidation(provider, false, { error: message });
      toast.error(`${config.name}: ${message}`, { id: toastId });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setBaseUrlValue('');
    clearApiKey(provider);
    toast.success(`${config.name} key removed`);
  };

  const displayValue = showKey ? inputValue : (inputValue ? maskApiKey(inputValue) : '');

  return (
    <CyberCard className="p-5" style={{ '--provider-color': color } as React.CSSProperties}>
      {/* Top accent line using provider color */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border bg-black/30 font-mono"
            style={{ borderColor: `${color}30`, color }}
          >
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-bold text-base" style={{ color }}>
                {config.name}
              </h3>
              {config.isLocal && (
                <span className="text-xs text-slate-600 font-mono bg-slate-800/50 border border-slate-700/50 rounded px-1.5">local</span>
              )}
            </div>
            <a
              href={config.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 font-mono transition-colors"
            >
              {config.website.replace('https://', '')}
              <ExternalLink size={9} />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleProvider(provider)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title={isEnabled ? 'Hide from views' : 'Show in all views'}
          >
            {isEnabled
              ? <ToggleRight size={20} style={{ color }} />
              : <ToggleLeft size={20} />
            }
          </button>
          <StatusDot status={status} />
        </div>
      </div>

      {/* Key hint */}
      <p className="text-xs text-slate-600 font-mono mb-3">{config.keyHint}</p>

      {/* Account info if connected */}
      {apiKey.accountInfo && apiKey.isValid && (
        <div className="mb-4 p-3 bg-black/20 rounded-lg border border-[#1a1a2e] text-xs font-mono">
          <div className="text-slate-500 mb-1.5">ACCOUNT INFO</div>
          {apiKey.accountInfo.tier && (
            <div className="flex justify-between">
              <span className="text-slate-500">Tier</span>
              <span className="text-slate-300">{apiKey.accountInfo.tier}</span>
            </div>
          )}
          {apiKey.accountInfo.creditBalance !== undefined && (
            <div className="flex justify-between">
              <span className="text-slate-500">Credits</span>
              <span className="text-emerald-400">{formatCost(apiKey.accountInfo.creditBalance)}</span>
            </div>
          )}
          {apiKey.accountInfo.requestsThisMonth !== undefined && (
            <div className="flex justify-between">
              <span className="text-slate-500">Models</span>
              <span className="text-slate-300">{apiKey.accountInfo.requestsThisMonth}</span>
            </div>
          )}
          {apiKey.lastTested && (
            <div className="flex justify-between mt-1 pt-1 border-t border-[#1a1a2e]">
              <span className="text-slate-600">Verified</span>
              <span className="text-slate-600">{new Date(apiKey.lastTested).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {apiKey.isValid === false && apiKey.accountInfo?.error && (
        <div className="mb-4 p-3 bg-red-500/5 rounded-lg border border-red-500/20 text-xs font-mono text-red-400">
          ✕ {apiKey.accountInfo.error}
        </div>
      )}

      {/* Base URL (for Azure/Ollama) */}
      {config.requiresBaseUrl && (
        <div className="mb-2">
          <input
            type="text"
            value={baseUrlValue}
            onChange={e => setBaseUrlValue(e.target.value)}
            placeholder="https://your-resource.openai.azure.com"
            className="w-full bg-black/30 border border-[#1a1a2e] rounded-lg px-4 py-2.5 text-sm font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-1 transition-all"
            style={{ '--tw-ring-color': `${color}30` } as React.CSSProperties}
          />
        </div>
      )}

      {config.isLocal && (
        <div className="mb-2">
          <input
            type="text"
            value={baseUrlValue}
            onChange={e => setBaseUrlValue(e.target.value)}
            placeholder="http://localhost:11434 (default)"
            className="w-full bg-black/30 border border-[#1a1a2e] rounded-lg px-4 py-2.5 text-sm font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-1 transition-all"
          />
        </div>
      )}

      {/* Key input */}
      {!config.isLocal && (
        <div className="relative mb-3">
          <input
            type={showKey ? 'text' : 'password'}
            value={showKey ? inputValue : displayValue}
            onChange={e => { if (showKey) setInputValue(e.target.value); }}
            onFocus={() => setShowKey(true)}
            placeholder={config.keyPrefix ? `${config.keyPrefix}...` : 'Paste API key...'}
            className="w-full bg-black/30 border border-[#1a1a2e] rounded-lg px-4 py-2.5 pr-10 text-sm font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-1 transition-all"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
            type="button"
            aria-label={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!config.isLocal && (
          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: `${color}40`,
              backgroundColor: `${color}10`,
              color,
            }}
          >
            Save
          </button>
        )}
        <button
          onClick={handleTest}
          disabled={testing || (!inputValue.trim() && !apiKey.key && !config.isLocal)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            borderColor: `${color}40`,
            backgroundColor: `${color}10`,
            color,
          }}
        >
          {testing ? (
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Wifi size={12} />
          )}
          {testing ? 'Testing' : 'Test'}
        </button>
        {(apiKey.key || config.isLocal) && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-xs font-mono rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </CyberCard>
  );
}
