// ============================================================
// Core Types for MissionCTL
// ============================================================

export type AIProvider =
  | 'claude' | 'openai' | 'gemini' | 'groq'
  | 'openrouter' | 'xai' | 'mistral' | 'cohere' | 'perplexity'
  | 'together' | 'fireworks' | 'huggingface' | 'deepseek'
  | 'ollama' | 'azure' | 'bedrock' | 'replicate';

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  color: string;
  icon: string;
  website: string;
  accent: 'purple' | 'green' | 'blue' | 'amber';
  keyHint: string;
  keyPrefix?: string;
  isLocal?: boolean;
  requiresBaseUrl?: boolean;
}

export interface APIKey {
  provider: AIProvider;
  key: string;
  isValid: boolean | null;
  lastTested: string | null;
  accountInfo?: AccountInfo;
  baseUrl?: string;
}

export interface AccountInfo {
  tier?: string;
  creditBalance?: number;
  currency?: string;
  usageThisMonth?: number;
  requestsThisMonth?: number;
  error?: string;
}

export interface TokenUsage {
  id: string;
  provider: AIProvider;
  model: string;
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  requests: number;
}

export interface DailyUsage {
  date: string;
  claude: number;
  openai: number;
  gemini: number;
  groq: number;
  claudeCost: number;
  openaiCost: number;
  geminiCost: number;
  groqCost: number;
}

export interface ModelInfo {
  id: string;
  provider: AIProvider;
  name: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  contextWindow: number;
  description: string;
  strengths: TaskType[];
  speed: 'fast' | 'medium' | 'slow';
  releasedAt?: string;
}

export type TaskType = 'coding' | 'creative' | 'search' | 'analysis' | 'chat';

export interface EfficiencyScore {
  provider: AIProvider;
  model: string;
  task: TaskType;
  score: number;
  valueRating: string;
  costPerTask: number;
  qualityRating: number;
  speedRating: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  provider: AIProvider | 'general';
  url: string;
  publishedAt: string;
  isNew: boolean;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  category: TaskType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface BridgeResult {
  provider: AIProvider;
  model: string;
  modelName: string;
  estimatedCost: number;
  estimatedTokens: number;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  costBreakdown: string;
}

export interface BridgeQuery {
  prompt: string;
  estimatedOutputMultiplier: number;
}

export type Theme = 'dark' | 'light';

export interface ExportData {
  version: '1';
  exportedAt: string;
  apiKeys: Partial<Record<AIProvider, { key: string; baseUrl?: string }>>;
  prompts: PromptTemplate[];
  enabledProviders: AIProvider[];
}

export interface AppState {
  apiKeys: Record<AIProvider, APIKey>;
  tokenUsage: TokenUsage[];
  dailyUsage: DailyUsage[];
  prompts: PromptTemplate[];
  newsItems: NewsItem[];
  activeTab: string;
  isLoading: boolean;
  enabledProviders: AIProvider[];
  theme: Theme;
}
