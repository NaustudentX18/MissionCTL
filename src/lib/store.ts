import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AgentHealth,
  AgentStatus,
  BroadcastResult,
  ChatMessage,
  ChatSession,
  HermesAgent,
  NavTab,
  ToolCall,
} from './types';
import { DEFAULT_AGENTS } from './agents';

interface HermesStore {
  // ─── Agents ───────────────────────────────────────────────
  agents: HermesAgent[];
  agentHealth: Record<string, AgentHealth>;
  setAgents: (agents: HermesAgent[]) => void;
  updateAgent: (id: string, updates: Partial<HermesAgent>) => void;
  setAgentHealth: (id: string, health: AgentHealth) => void;
  setAgentStatus: (id: string, status: AgentStatus) => void;

  // ─── Chat sessions ────────────────────────────────────────
  sessions: Record<string, ChatSession>;
  addMessage: (agentId: string, msg: ChatMessage) => void;
  appendStreamChunk: (agentId: string, msgId: string, chunk: string) => void;
  finalizeMessage: (agentId: string, msgId: string, updates: Partial<ChatMessage>) => void;
  addToolCall: (agentId: string, msgId: string, toolCall: ToolCall) => void;
  updateToolCall: (agentId: string, msgId: string, toolCallId: string, updates: Partial<ToolCall>) => void;
  clearSession: (agentId: string) => void;
  setStreaming: (agentId: string, streaming: boolean) => void;

  // ─── Broadcast ────────────────────────────────────────────
  broadcastResults: Record<string, BroadcastResult>;
  setBroadcastResult: (agentId: string, result: BroadcastResult) => void;
  clearBroadcast: () => void;

  // ─── UI state ─────────────────────────────────────────────
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeChatAgentId: string | null;
  setActiveChatAgentId: (id: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function defaultSession(agentId: string): ChatSession {
  return {
    agentId,
    messages: [],
    isStreaming: false,
    lastActivity: null,
  };
}

export const useHermesStore = create<HermesStore>()(
  persist(
    (set, get) => ({
      // ─── Agents ─────────────────────────────────────────────
      agents: DEFAULT_AGENTS,
      agentHealth: {},

      setAgents: (agents) => set({ agents }),

      updateAgent: (id, updates) =>
        set(state => ({
          agents: state.agents.map(a => a.id === id ? { ...a, ...updates } : a),
        })),

      setAgentHealth: (id, health) =>
        set(state => ({
          agentHealth: { ...state.agentHealth, [id]: health },
          agents: state.agents.map(a =>
            a.id === id ? { ...a, status: health.status, lastSeen: health.checkedAt } : a
          ),
        })),

      setAgentStatus: (id, status) =>
        set(state => ({
          agents: state.agents.map(a => a.id === id ? { ...a, status } : a),
        })),

      // ─── Sessions ────────────────────────────────────────────
      sessions: {},

      addMessage: (agentId, msg) =>
        set(state => {
          const session = state.sessions[agentId] ?? defaultSession(agentId);
          return {
            sessions: {
              ...state.sessions,
              [agentId]: {
                ...session,
                messages: [...session.messages, msg],
                lastActivity: new Date().toISOString(),
              },
            },
          };
        }),

      appendStreamChunk: (agentId, msgId, chunk) =>
        set(state => {
          const session = state.sessions[agentId];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [agentId]: {
                ...session,
                messages: session.messages.map(m =>
                  m.id === msgId ? { ...m, content: m.content + chunk } : m
                ),
              },
            },
          };
        }),

      finalizeMessage: (agentId, msgId, updates) =>
        set(state => {
          const session = state.sessions[agentId];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [agentId]: {
                ...session,
                messages: session.messages.map(m =>
                  m.id === msgId ? { ...m, ...updates, isStreaming: false } : m
                ),
              },
            },
          };
        }),

      addToolCall: (agentId, msgId, toolCall) =>
        set(state => {
          const session = state.sessions[agentId];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [agentId]: {
                ...session,
                messages: session.messages.map(m =>
                  m.id === msgId
                    ? { ...m, toolCalls: [...(m.toolCalls ?? []), toolCall] }
                    : m
                ),
              },
            },
          };
        }),

      updateToolCall: (agentId, msgId, toolCallId, updates) =>
        set(state => {
          const session = state.sessions[agentId];
          if (!session) return state;
          return {
            sessions: {
              ...state.sessions,
              [agentId]: {
                ...session,
                messages: session.messages.map(m =>
                  m.id === msgId
                    ? {
                        ...m,
                        toolCalls: m.toolCalls?.map(tc =>
                          tc.id === toolCallId ? { ...tc, ...updates } : tc
                        ),
                      }
                    : m
                ),
              },
            },
          };
        }),

      clearSession: (agentId) =>
        set(state => ({
          sessions: {
            ...state.sessions,
            [agentId]: defaultSession(agentId),
          },
        })),

      setStreaming: (agentId, streaming) =>
        set(state => {
          const session = state.sessions[agentId] ?? defaultSession(agentId);
          return {
            sessions: {
              ...state.sessions,
              [agentId]: { ...session, isStreaming: streaming },
            },
          };
        }),

      // ─── Broadcast ──────────────────────────────────────────
      broadcastResults: {},
      setBroadcastResult: (agentId, result) =>
        set(state => ({
          broadcastResults: { ...state.broadcastResults, [agentId]: result },
        })),
      clearBroadcast: () => set({ broadcastResults: {} }),

      // ─── UI ──────────────────────────────────────────────────
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),
      activeChatAgentId: null,
      setActiveChatAgentId: (id) => set({ activeChatAgentId: id }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'hermes-store',
      partialize: (state) => ({
        agents: state.agents,
        sessions: state.sessions,
      }),
    }
  )
);
