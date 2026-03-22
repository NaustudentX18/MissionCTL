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
import { Eye, EyeOff, Trash2, Wifi, WifiOff } from 'lucide-react';

interface ApiKeyFormProps {
  provider: AIProvider;
}

const ACCENT_MAP: Record<AIProvider, 'purple' | 'green' | 'blue' | 'amber'> = {
  claude: 'purple',
  openai: 'green',
  gemini: 'blue',
  groq: 'amber',
};

const VARIANT_MAP: Record<AIProvider, 'purple' | 'green' | 'blue' | 'amber'> = {
  claude: 'purple',
  openai: 'green',
  gemini: 'blue',
  groq: 'amber',
};

const COLOR_CLASS: Record<AIProvider, string> = {
  claude: 'text-purple-400 focus:ring-purple-500/30 focus:border-purple-500/50',
  openai: 'text-emerald-400 focus:ring-emerald-500/30 focus:border-emerald-500/50',
  gemini: 'text-blue-400 focus:ring-blue-500/30 focus:border-blue-500/50',
  groq: 'text-amber-400 focus:ring-amber-500/30 focus:border-amber-500/50',
};

const PLACEHOLDER_MAP: Record<AIProvider, string> = {
  claude: 'sk-ant-api03-...',
  openai: 'sk-proj-...',
  gemini: 'AIzaSy...',
  groq: 'gsk_...',
};

export function ApiKeyForm({ provider }: ApiKeyFormProps) {
  const config = PROVIDERS[provider];
  const { apiKeys, setApiKey, setKeyValidation, clearApiKey } = useMissionStore();
  const apiKey = apiKeys[provider];

  const [inputValue, setInputValue] = useState(apiKey.key);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);

  const status = testing
    ? 'loading'
    : apiKey.isValid === true
    ? 'active'
    : apiKey.isValid === false
    ? 'error'
    : 'inactive';

  const handleSave = () => {
    setApiKey(provider, inputValue.trim());
    toast.success(`${config.name} key saved`, { icon: '🔑' });
  };

  const handleTest = async () => {
    const keyToTest = inputValue.trim() || apiKey.key;
    if (!keyToTest) {
      toast.error('Enter an API key first');
      return;
    }

    setTesting(true);
    const toastId = toast.loading(`Testing ${config.name} connection...`);

    try {
      const info = await testApiKey(provider, keyToTest);
      setApiKey(provider, keyToTest);
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
    clearApiKey(provider);
    toast.success(`${config.name} key removed`);
  };

  const displayValue = showKey ? inputValue : (inputValue ? maskApiKey(inputValue) : '');

  return (
    <CyberCard accent={ACCENT_MAP[provider]} className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className={`font-mono font-bold text-base ${COLOR_CLASS[provider].split(' ')[0]}`}>
              {config.name}
            </h3>
            <a
              href={config.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-600 hover:text-slate-400 font-mono transition-colors"
            >
              {config.website.replace('https://', '')} ↗
            </a>
          </div>
        </div>
        <StatusDot status={status} />
      </div>

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
              <span className="text-slate-500">Models Available</span>
              <span className="text-slate-300">{apiKey.accountInfo.requestsThisMonth}</span>
            </div>
          )}
          {apiKey.lastTested && (
            <div className="flex justify-between mt-1 pt-1 border-t border-[#1a1a2e]">
              <span className="text-slate-600">Last verified</span>
              <span className="text-slate-600">
                {new Date(apiKey.lastTested).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {apiKey.isValid === false && apiKey.accountInfo?.error && (
        <div className="mb-4 p-3 bg-red-500/5 rounded-lg border border-red-500/20 text-xs font-mono text-red-400">
          ✕ {apiKey.accountInfo.error}
        </div>
      )}

      {/* Key input */}
      <div className="relative mb-3">
        <input
          type={showKey ? 'text' : 'password'}
          value={showKey ? inputValue : displayValue}
          onChange={(e) => {
            if (showKey) setInputValue(e.target.value);
          }}
          onFocus={() => setShowKey(true)}
          placeholder={PLACEHOLDER_MAP[provider]}
          className={`
            w-full bg-black/30 border border-[#1a1a2e] rounded-lg px-4 py-2.5 pr-10
            text-sm font-mono text-slate-300 placeholder:text-slate-700
            focus:outline-none focus:ring-1 transition-all
            ${COLOR_CLASS[provider]}
          `}
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

      {/* Actions */}
      <div className="flex gap-2">
        <NeonButton
          variant={VARIANT_MAP[provider]}
          size="sm"
          onClick={handleSave}
          disabled={!inputValue.trim()}
          className="flex-1"
        >
          Save Key
        </NeonButton>
        <NeonButton
          variant={VARIANT_MAP[provider]}
          size="sm"
          loading={testing}
          onClick={handleTest}
          disabled={!inputValue.trim() && !apiKey.key}
        >
          {testing ? 'Testing' : (
            <>
              <Wifi size={12} />
              Test
            </>
          )}
        </NeonButton>
        {apiKey.key && (
          <NeonButton
            variant="danger"
            size="sm"
            onClick={handleClear}
          >
            <Trash2 size={12} />
          </NeonButton>
        )}
      </div>
    </CyberCard>
  );
}
