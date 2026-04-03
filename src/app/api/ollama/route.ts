/**
 * Ollama Proxy API
 *
 * Forwards requests to Ollama instances running on Tailscale IPs.
 * Handles both streaming (chat/generate) and non-streaming endpoints.
 *
 * Body: { ip, port, action, payload? }
 * action: 'tags' | 'ps' | 'chat' | 'generate' | 'ping'
 */

import { NextRequest, NextResponse } from 'next/server';

const TIMEOUT_MS = 8000;   // non-streaming timeout
const STREAM_TIMEOUT_MS = 60000;

export async function POST(req: NextRequest) {
  let body: { ip: string; port: number; action: string; payload?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ip, port, action, payload } = body;

  if (!ip || !port || !action) {
    return NextResponse.json({ error: 'ip, port and action are required' }, { status: 400 });
  }

  // Block obviously invalid IPs in prod — only Tailscale 100.x and localhost
  const validIp = /^(100\.\d{1,3}\.\d{1,3}\.\d{1,3}|127\.0\.0\.1|localhost)$/.test(ip);
  if (!validIp) {
    return NextResponse.json({ error: 'IP not permitted (must be Tailscale 100.x.x.x or localhost)' }, { status: 403 });
  }

  const baseUrl = `http://${ip}:${port}`;
  const isStreaming = action === 'chat' || action === 'generate';

  try {
    if (action === 'ping') {
      // Simple connectivity test — hit the version endpoint
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const r = await fetch(`${baseUrl}/api/version`, { signal: controller.signal });
        clearTimeout(timer);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        return NextResponse.json({ ok: true, version: data.version });
      } finally {
        clearTimeout(timer);
      }
    }

    if (action === 'tags') {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const r = await fetch(`${baseUrl}/api/tags`, { signal: controller.signal });
        clearTimeout(timer);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return NextResponse.json(await r.json());
      } finally {
        clearTimeout(timer);
      }
    }

    if (action === 'ps') {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const r = await fetch(`${baseUrl}/api/ps`, { signal: controller.signal });
        clearTimeout(timer);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return NextResponse.json(await r.json());
      } finally {
        clearTimeout(timer);
      }
    }

    if (isStreaming) {
      // Stream response through to client
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

      const upstream = await fetch(`${baseUrl}/api/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(payload as object), stream: true }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!upstream.ok) {
        const errText = await upstream.text();
        return NextResponse.json(
          { error: `Ollama error: ${upstream.status} — ${errText.slice(0, 200)}` },
          { status: upstream.status }
        );
      }

      // Pass the upstream NDJSON stream directly to the client
      return new Response(upstream.body, {
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Cache-Control': 'no-cache',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });

  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out — is the device reachable on Tailscale?' },
        { status: 504 }
      );
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Connection failed: ${msg}` },
      { status: 502 }
    );
  }
}
