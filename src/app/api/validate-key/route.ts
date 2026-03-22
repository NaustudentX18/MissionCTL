import { NextRequest, NextResponse } from 'next/server';
import type { AIProvider, AccountInfo } from '@/lib/types';

async function validateClaude(key: string): Promise<AccountInfo> {
  // Test by listing models endpoint
  const res = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
  });

  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);

  const data = await res.json();
  const modelCount = data.data?.length ?? 0;

  return {
    tier: 'API Access',
    usageThisMonth: undefined,
    requestsThisMonth: modelCount,
  };
}

async function validateOpenAI(key: string): Promise<AccountInfo> {
  const [modelsRes, usageRes] = await Promise.allSettled([
    fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    }),
    fetch('https://api.openai.com/v1/dashboard/billing/subscription', {
      headers: { Authorization: `Bearer ${key}` },
    }),
  ]);

  if (modelsRes.status === 'rejected' || !modelsRes.value.ok) {
    if (modelsRes.status === 'fulfilled' && modelsRes.value.status === 401) {
      throw new Error('Invalid API key');
    }
    throw new Error('OpenAI API connection failed');
  }

  let creditBalance: number | undefined;
  let tier: string | undefined;

  if (usageRes.status === 'fulfilled' && usageRes.value.ok) {
    const billing = await usageRes.value.json();
    creditBalance = billing.soft_limit_usd ?? billing.hard_limit_usd;
    tier = billing.plan?.title;
  }

  return {
    tier: tier ?? 'API Access',
    creditBalance,
  };
}

async function validateGemini(key: string): Promise<AccountInfo> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
  );

  if (res.status === 400 || res.status === 403) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Google API error: ${res.status}`);

  const data = await res.json();
  const modelCount = data.models?.length ?? 0;

  return {
    tier: 'Google AI Studio',
    requestsThisMonth: modelCount,
  };
}

async function validateGroq(key: string): Promise<AccountInfo> {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (res.status === 401) throw new Error('Invalid API key');
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);

  const data = await res.json();
  const modelCount = data.data?.length ?? 0;

  return {
    tier: 'Groq API',
    requestsThisMonth: modelCount,
  };
}

const VALIDATORS: Record<AIProvider, (key: string) => Promise<AccountInfo>> = {
  claude: validateClaude,
  openai: validateOpenAI,
  gemini: validateGemini,
  groq: validateGroq,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, key } = body as { provider: AIProvider; key: string };

    if (!provider || !key) {
      return NextResponse.json({ error: 'provider and key are required' }, { status: 400 });
    }

    const validator = VALIDATORS[provider];
    if (!validator) {
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    if (key.length < 8) {
      return NextResponse.json({ error: 'API key too short' }, { status: 400 });
    }

    const info = await validator(key);
    return NextResponse.json(info);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Validation failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
