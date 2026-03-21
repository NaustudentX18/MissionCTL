/**
 * API Client utilities for testing keys and fetching account info.
 * All calls are made through our Next.js API routes to avoid CORS issues
 * and to keep API keys server-side.
 */

import type { AIProvider, AccountInfo } from './types';

export async function testApiKey(provider: AIProvider, key: string): Promise<AccountInfo> {
  const res = await fetch('/api/validate-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, key }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchNewsItems() {
  const res = await fetch('/api/news');
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}
