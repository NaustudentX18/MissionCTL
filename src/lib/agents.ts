import type { DeviceType, HermesAgent } from './types';

// Default agent configurations — user sets real Tailscale IPs in Settings
export const DEFAULT_AGENTS: HermesAgent[] = [
  {
    id: 'hermes-pc',
    name: 'Hermes Prime',
    device: 'pc',
    tailscaleIp: '100.x.x.x',
    port: 11434,
    model: 'hermes3:latest',
    status: 'offline',
    lastSeen: null,
    description: 'Primary hub — PC workstation. Orchestrates all sub-agents.',
    color: '#bf5af2',
  },
  {
    id: 'hermes-server',
    name: 'Hermes Atlas',
    device: 'server',
    tailscaleIp: '100.x.x.x',
    port: 11434,
    model: 'hermes3:latest',
    status: 'offline',
    lastSeen: null,
    description: 'Home server — heavy compute tasks and long-running jobs.',
    color: '#0a84ff',
  },
  {
    id: 'hermes-tablet',
    name: 'Hermes Swift',
    device: 'tablet',
    tailscaleIp: '100.x.x.x',
    port: 11434,
    model: 'hermes3:8b',
    status: 'offline',
    lastSeen: null,
    description: 'Tablet — lightweight queries and on-the-go assistance.',
    color: '#30d158',
  },
  {
    id: 'hermes-uconsole',
    name: 'Hermes Nano',
    device: 'uconsole',
    tailscaleIp: '100.x.x.x',
    port: 11434,
    model: 'hermes3:3b',
    status: 'offline',
    lastSeen: null,
    description: 'uConsole — edge inference. Pocket-sized, always-on.',
    color: '#ffd60a',
  },
];

export const DEVICE_META: Record<DeviceType, { label: string; icon: string; emoji: string }> = {
  pc:       { label: 'PC',       icon: 'Monitor',   emoji: '🖥️'  },
  server:   { label: 'Server',   icon: 'Server',    emoji: '🗄️'  },
  tablet:   { label: 'Tablet',   icon: 'Tablet',    emoji: '📱'  },
  uconsole: { label: 'uConsole', icon: 'Cpu',       emoji: '🎮'  },
};

export const TOOL_META: Record<string, { icon: string; color: string; label: string }> = {
  web_search:      { icon: '🔍', color: '#0a84ff', label: 'Web Search'     },
  code_execute:    { icon: '💻', color: '#30d158', label: 'Run Code'       },
  read_file:       { icon: '📄', color: '#bf5af2', label: 'Read File'      },
  write_file:      { icon: '✏️', color: '#ffd60a', label: 'Write File'     },
  shell_command:   { icon: '⚡', color: '#ff9f0a', label: 'Shell'          },
  memory_store:    { icon: '🧠', color: '#ff6b6b', label: 'Memory'         },
  memory_recall:   { icon: '💭', color: '#a78bfa', label: 'Recall'         },
  http_request:    { icon: '🌐', color: '#06b6d4', label: 'HTTP'           },
  image_generate:  { icon: '🎨', color: '#f472b6', label: 'Image Gen'      },
  calculator:      { icon: '🧮', color: '#84cc16', label: 'Calculate'      },
  default:         { icon: '⚙️', color: '#64748b', label: 'Tool'           },
};
