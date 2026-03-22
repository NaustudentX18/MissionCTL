import { NextRequest, NextResponse } from 'next/server';
import type { AIProvider, AccountInfo } from '@/lib/types';

async function validateClaude(key: string): Promise<AccountInfo> {
  const res = await fetch('https://api.anthropic.com/v1/models', {
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
  const data = await res.json();
  return { tier: 'API Access', requestsThisMonth: data.data?.length ?? 0 };
}

async function validateOpenAI(key: string): Promise<AccountInfo> {
  const [modelsRes, billingRes] = await Promise.allSettled([
    fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` } }),
    fetch('https://api.openai.com/v1/dashboard/billing/subscription', { headers: { Authorization: `Bearer ${key}` } }),
  ]);
  if (modelsRes.status === 'rejected' || !modelsRes.value.ok) {
    if (modelsRes.status === 'fulfilled' && modelsRes.value.status === 401) throw new Error('Invalid API key');
    throw new Error('OpenAI connection failed');
  }
  let creditBalance: number | undefined;
  let tier: string | undefined;
  if (billingRes.status === 'fulfilled' && billingRes.value.ok) {
    const billing = await billingRes.value.json();
    creditBalance = billing.soft_limit_usd ?? billing.hard_limit_usd;
    tier = billing.plan?.title;
  }
  return { tier: tier ?? 'API Access', creditBalance };
}

async function validateGemini(key: string): Promise<AccountInfo> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  if (res.status === 400 || res.status === 403) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Google error: ${res.status}`);
  const data = await res.json();
  return { tier: 'Google AI Studio', requestsThisMonth: data.models?.length ?? 0 };
}

async function validateGroq(key: string): Promise<AccountInfo> {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  return { tier: 'Groq API', requestsThisMonth: data.data?.length ?? 0 };
}

async function validateOpenRouter(key: string): Promise<AccountInfo> {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  const data = await res.json();
  // Also try to get credits
  const creditsRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
    headers: { Authorization: `Bearer ${key}` },
  });
  let creditBalance: number | undefined;
  if (creditsRes.ok) {
    const credits = await creditsRes.json();
    creditBalance = credits.data?.limit_remaining;
  }
  return { tier: 'OpenRouter', requestsThisMonth: data.data?.length ?? 0, creditBalance };
}

async function validateXAI(key: string): Promise<AccountInfo> {
  const res = await fetch('https://api.x.ai/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`xAI error: ${res.status}`);
  const data = await res.json();
  return { tier: 'xAI API', requestsThisMonth: data.data?.length ?? 0 };
}

async function validateMistral(key: string): Promise<AccountInfo> {
  const res = await fetch('https://api.mistral.ai/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Mistral error: ${res.status}`);
  const data = await res.json();
  return { tier: 'Mistral API', requestsThisMonth: data.data?.length ?? 0 };
}

async function validateCohere(key: string): Promise<AccountInfo> {
  const res = await fetch('https://api.cohere.com/v1/check-api-key', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Cohere error: ${res.status}`);
  return { tier: 'Cohere API' };
}

async function validatePerplexity(key: string): Promise<AccountInfo> {
  // Perplexity doesn't have a dedicated auth endpoint — test with a minimal chat call
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 }),
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Perplexity error: ${res.status}`);
  return { tier: 'Perplexity API' };
}

async function validateTogether(key: string): Promise<AccountInfo> {
  const res = await fetch('https://api.together.xyz/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Together error: ${res.status}`);
  const data = await res.json();
  return { tier: 'Together AI', requestsThisMonth: Array.isArray(data) ? data.length : 0 };
}

async function validateFireworks(key: string): Promise<AccountInfo> {
  const res = await fetch('https://api.fireworks.ai/inference/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Fireworks error: ${res.status}`);
  const data = await res.json();
  return { tier: 'Fireworks AI', requestsThisMonth: data.data?.length ?? 0 };
}

async function validateHuggingFace(key: string): Promise<AccountInfo> {
  const res = await fetch('https://huggingface.co/api/whoami', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`HuggingFace error: ${res.status}`);
  const data = await res.json();
  return { tier: data.type === 'org' ? 'Organization' : 'Personal', usageThisMonth: undefined };
}

async function validateDeepSeek(key: string): Promise<AccountInfo> {
  const res = await fetch('https://api.deepseek.com/user/balance', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`);
  const data = await res.json();
  const balance = data.balance_infos?.[0]?.total_balance;
  return { tier: 'DeepSeek API', creditBalance: balance ? parseFloat(balance) : undefined };
}

async function validateOllama(key: string, baseUrl?: string): Promise<AccountInfo> {
  const host = baseUrl || 'http://localhost:11434';
  try {
    const res = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`Ollama not reachable at ${host}`);
    const data = await res.json();
    return { tier: 'Local (Ollama)', requestsThisMonth: data.models?.length ?? 0 };
  } catch {
    throw new Error(`Cannot reach Ollama at ${host}. Is it running?`);
  }
}

async function validateAzure(key: string, baseUrl?: string): Promise<AccountInfo> {
  if (!baseUrl) throw new Error('Azure requires a base URL (your resource endpoint)');
  const res = await fetch(`${baseUrl}/openai/models?api-version=2024-02-01`, {
    headers: { 'api-key': key },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Azure error: ${res.status}`);
  const data = await res.json();
  return { tier: 'Azure OpenAI', requestsThisMonth: data.data?.length ?? 0 };
}

async function validateBedrock(key: string): Promise<AccountInfo> {
  // Bedrock uses IAM — we just confirm the key looks valid (no easy test endpoint)
  if (key.length < 16) throw new Error('AWS Access Key ID too short');
  return { tier: 'AWS Bedrock (key saved — IAM auth)' };
}

async function validateReplicate(key: string): Promise<AccountInfo> {
  const res = await fetch('https://api.replicate.com/v1/account', {
    headers: { Authorization: `Token ${key}` },
  });
  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Replicate error: ${res.status}`);
  const data = await res.json();
  return { tier: `Replicate (${data.username ?? 'user'})` };
}

const VALIDATORS: Record<AIProvider, (key: string, baseUrl?: string) => Promise<AccountInfo>> = {
  claude: (k) => validateClaude(k),
  openai: (k) => validateOpenAI(k),
  gemini: (k) => validateGemini(k),
  groq: (k) => validateGroq(k),
  openrouter: (k) => validateOpenRouter(k),
  xai: (k) => validateXAI(k),
  mistral: (k) => validateMistral(k),
  cohere: (k) => validateCohere(k),
  perplexity: (k) => validatePerplexity(k),
  together: (k) => validateTogether(k),
  fireworks: (k) => validateFireworks(k),
  huggingface: (k) => validateHuggingFace(k),
  deepseek: (k) => validateDeepSeek(k),
  ollama: (k, b) => validateOllama(k, b),
  azure: (k, b) => validateAzure(k, b),
  bedrock: (k) => validateBedrock(k),
  replicate: (k) => validateReplicate(k),
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, key, baseUrl } = body as { provider: AIProvider; key: string; baseUrl?: string };

    if (!provider || (!key && provider !== 'ollama')) {
      return NextResponse.json({ error: 'provider and key are required' }, { status: 400 });
    }

    const validator = VALIDATORS[provider];
    if (!validator) {
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    if (key && key.length < 4 && provider !== 'ollama') {
      return NextResponse.json({ error: 'API key too short' }, { status: 400 });
    }

    const info = await validator(key, baseUrl);
    return NextResponse.json(info);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Validation failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
