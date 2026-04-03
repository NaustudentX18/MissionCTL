// ─── Hermes Agent Types ────────────────────────────────────────

export type AgentStatus = 'online' | 'offline' | 'busy' | 'error';

export type DeviceType = 'pc' | 'tablet' | 'server' | 'uconsole';

export interface HermesAgent {
  id: string;
  name: string;
  device: DeviceType;
  tailscaleIp: string;
  port: number;
  model: string;       // e.g. "hermes3:latest"
  status: AgentStatus;
  lastSeen: string | null;
  description: string;
  color: string;       // Accent color for this agent's card
}

export interface OllamaModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface RunningModel {
  name: string;
  model: string;
  size: number;
  size_vram: number;
  expires_at: string;
}

export interface AgentHealth {
  agentId: string;
  status: AgentStatus;
  models: OllamaModel[];
  runningModels: RunningModel[];
  checkedAt: string;
}

// ─── Chat types ────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  agentId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  durationMs?: number;
  tokensPerSec?: number;
  promptTokens?: number;
  completionTokens?: number;
  isStreaming?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  input?: Record<string, unknown>;
  output?: string;
  status: 'running' | 'done' | 'error';
  durationMs?: number;
  startedAt: string;
}

export interface ChatSession {
  agentId: string;
  messages: ChatMessage[];
  isStreaming: boolean;
  lastActivity: string | null;
}

// ─── Broadcast ─────────────────────────────────────────────────

export interface BroadcastResult {
  agentId: string;
  content: string;
  isStreaming: boolean;
  error?: string;
}

// ─── Ollama API response shapes ─────────────────────────────────

export interface OllamaChatChunk {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}

export type NavTab = 'dashboard' | 'agents' | 'chat' | 'broadcast' | 'network' | 'settings';

export type Theme = 'dark';
