import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIProvider, APIKey, DailyUsage, ExportData, NewsItem, PromptTemplate, Theme, TokenUsage } from './types';
import { generateMockDailyUsage } from './utils';
import { CORE_PROVIDERS, PROVIDER_LIST } from './providers';

interface MissionStore {
  // API Keys
  apiKeys: Record<AIProvider, APIKey>;
  setApiKey: (provider: AIProvider, key: string, baseUrl?: string) => void;
  setKeyValidation: (provider: AIProvider, isValid: boolean, accountInfo?: APIKey['accountInfo']) => void;
  clearApiKey: (provider: AIProvider) => void;

  // Enabled Providers
  enabledProviders: AIProvider[];
  toggleProvider: (provider: AIProvider) => void;
  setEnabledProviders: (providers: AIProvider[]) => void;

  // Usage Data
  tokenUsage: TokenUsage[];
  dailyUsage: DailyUsage[];
  addTokenUsage: (usage: TokenUsage) => void;
  setDailyUsage: (usage: DailyUsage[]) => void;

  // News
  newsItems: NewsItem[];
  setNewsItems: (items: NewsItem[]) => void;
  markNewsRead: (id: string) => void;

  // Prompts
  prompts: PromptTemplate[];
  addPrompt: (prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  updatePrompt: (id: string, updates: Partial<PromptTemplate>) => void;
  deletePrompt: (id: string) => void;
  incrementPromptUsage: (id: string) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Export / Import
  exportData: () => ExportData;
  importData: (data: ExportData) => void;
}

const defaultApiKey = (provider: AIProvider): APIKey => ({
  provider,
  key: '',
  isValid: null,
  lastTested: null,
});

const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'p1',
    title: 'Senior Code Review',
    description: 'Thorough code review with security and performance focus',
    content: `You are a senior software engineer with 15+ years of experience. Review the following code for:
1. Security vulnerabilities (OWASP Top 10)
2. Performance bottlenecks
3. Code smell and maintainability issues
4. Missing error handling
5. Test coverage gaps

Provide specific, actionable feedback with code examples for improvements.

Code to review:
[PASTE CODE HERE]`,
    category: 'coding',
    tags: ['code-review', 'security', 'performance'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'p2',
    title: 'Creative Story Spark',
    description: 'Generate compelling story ideas with rich world-building',
    content: `Create a compelling story concept with the following elements:
- Genre: [GENRE]
- Protagonist: A complex character with a clear flaw and hidden strength
- Core conflict: Something that challenges their worldview
- Setting: Vivid and atmospheric
- Theme: A universal human truth

Provide: premise (2 sentences), protagonist backstory, 3 key plot points, and a surprising twist.`,
    category: 'creative',
    tags: ['storytelling', 'worldbuilding', 'creative-writing'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'p3',
    title: 'Deep Research Analyst',
    description: 'Structured research with sources and confidence levels',
    content: `Research the following topic thoroughly and provide:

Topic: [YOUR TOPIC]

Structure your response as:
## Executive Summary (3 bullets)
## Key Findings (with confidence level: High/Medium/Low)
## Contradicting Evidence
## Knowledge Gaps
## Recommended Next Steps

Be explicit about what you know with high confidence vs. what is uncertain.`,
    category: 'search',
    tags: ['research', 'analysis', 'factual'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  },
  {
    id: 'p4',
    title: 'System Architecture Advisor',
    description: 'Design scalable system architectures with trade-offs',
    content: `As a principal architect, design a system for the following requirements:

Requirements: [YOUR REQUIREMENTS]

Provide:
1. High-level architecture diagram (text-based)
2. Technology stack with justification
3. Data model overview
4. Scaling strategy
5. Top 3 architectural trade-offs
6. Estimated infrastructure cost range

Consider: reliability, scalability, maintainability, and cost optimization.`,
    category: 'analysis',
    tags: ['architecture', 'system-design', 'scalability'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  },
];

const buildDefaultApiKeys = (): Record<AIProvider, APIKey> =>
  Object.fromEntries(
    PROVIDER_LIST.map(p => [p, defaultApiKey(p)])
  ) as Record<AIProvider, APIKey>;

export const useMissionStore = create<MissionStore>()(
  persist(
    (set, get) => ({
      apiKeys: buildDefaultApiKeys(),

      setApiKey: (provider, key, baseUrl) =>
        set(state => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: { ...state.apiKeys[provider], key, isValid: null, lastTested: null, baseUrl },
          },
        })),

      setKeyValidation: (provider, isValid, accountInfo) =>
        set(state => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: {
              ...state.apiKeys[provider],
              isValid,
              lastTested: new Date().toISOString(),
              accountInfo,
            },
          },
        })),

      clearApiKey: (provider) =>
        set(state => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: defaultApiKey(provider),
          },
        })),

      enabledProviders: CORE_PROVIDERS,

      toggleProvider: (provider) =>
        set(state => ({
          enabledProviders: state.enabledProviders.includes(provider)
            ? state.enabledProviders.filter(p => p !== provider)
            : [...state.enabledProviders, provider],
        })),

      setEnabledProviders: (providers) => set({ enabledProviders: providers }),

      tokenUsage: [],
      dailyUsage: generateMockDailyUsage(7),

      addTokenUsage: (usage) =>
        set(state => ({ tokenUsage: [usage, ...state.tokenUsage].slice(0, 500) })),

      setDailyUsage: (usage) => set({ dailyUsage: usage }),

      newsItems: [],
      setNewsItems: (items) => set({ newsItems: items }),
      markNewsRead: (id) =>
        set(state => ({
          newsItems: state.newsItems.map(n => n.id === id ? { ...n, isNew: false } : n),
        })),

      prompts: DEFAULT_PROMPTS,

      addPrompt: (prompt) =>
        set(state => ({
          prompts: [
            ...state.prompts,
            {
              ...prompt,
              id: `p${Date.now()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              usageCount: 0,
            },
          ],
        })),

      updatePrompt: (id, updates) =>
        set(state => ({
          prompts: state.prompts.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deletePrompt: (id) =>
        set(state => ({ prompts: state.prompts.filter(p => p.id !== id) })),

      incrementPromptUsage: (id) =>
        set(state => ({
          prompts: state.prompts.map(p =>
            p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p
          ),
        })),

      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      exportData: () => {
        const state = get();
        const keys: Partial<Record<AIProvider, { key: string; baseUrl?: string }>> = {};
        for (const p of PROVIDER_LIST) {
          if (state.apiKeys[p]?.key) {
            keys[p] = { key: state.apiKeys[p].key, baseUrl: state.apiKeys[p].baseUrl };
          }
        }
        return {
          version: '1',
          exportedAt: new Date().toISOString(),
          apiKeys: keys,
          prompts: state.prompts,
          enabledProviders: state.enabledProviders,
        } satisfies ExportData;
      },

      importData: (data: ExportData) => {
        set(state => {
          const newApiKeys = { ...state.apiKeys };
          for (const [provider, val] of Object.entries(data.apiKeys ?? {})) {
            if (PROVIDER_LIST.includes(provider as AIProvider) && val?.key) {
              newApiKeys[provider as AIProvider] = {
                ...defaultApiKey(provider as AIProvider),
                key: val.key,
                baseUrl: val.baseUrl,
              };
            }
          }
          return {
            apiKeys: newApiKeys,
            prompts: data.prompts ?? state.prompts,
            enabledProviders: data.enabledProviders ?? state.enabledProviders,
          };
        });
      },
    }),
    {
      name: 'missionctl-store',
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        prompts: state.prompts,
        dailyUsage: state.dailyUsage,
        enabledProviders: state.enabledProviders,
        theme: state.theme,
      }),
      merge: (persisted, initial) => {
        const p = persisted as Partial<MissionStore>;
        return {
          ...initial,
          ...p,
          // Ensure all providers have a default key entry even after upgrade
          apiKeys: { ...initial.apiKeys, ...(p.apiKeys ?? {}) },
          enabledProviders: p.enabledProviders ?? initial.enabledProviders,
          theme: p.theme ?? initial.theme,
        };
      },
    }
  )
);
