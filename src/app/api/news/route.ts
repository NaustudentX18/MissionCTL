import { NextResponse } from 'next/server';
import type { NewsItem } from '@/lib/types';

// Static curated news items that represent recent AI model releases
// In production these would be pulled from RSS feeds / APIs
const STATIC_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Claude Opus 4.6 Now Available',
    summary: 'Anthropic releases Claude Opus 4.6 with enhanced reasoning and 200K context window. Significantly improved coding and analysis capabilities.',
    provider: 'claude',
    url: 'https://www.anthropic.com/news',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: true,
  },
  {
    id: 'n2',
    title: 'Gemini 2.5 Pro with 2M Token Context',
    summary: 'Google DeepMind launches Gemini 2.5 Pro featuring a massive 2 million token context window and top-tier coding performance.',
    provider: 'gemini',
    url: 'https://deepmind.google/technologies/gemini/',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: true,
  },
  {
    id: 'n3',
    title: 'OpenAI o3 API Now Active',
    summary: 'OpenAI\'s advanced reasoning model o3 is now available via API. Achieves near-perfect scores on competition mathematics.',
    provider: 'openai',
    url: 'https://platform.openai.com/docs',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    id: 'n4',
    title: 'Groq Launches Llama 3.3 70B',
    summary: 'Groq now serves Meta\'s Llama 3.3 70B at unprecedented speeds. Benchmark: 2,000+ tokens/second for real-time AI applications.',
    provider: 'groq',
    url: 'https://console.groq.com',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    id: 'n5',
    title: 'Claude Sonnet 4.6 Price Reduction',
    summary: 'Anthropic cuts Claude Sonnet 4.6 pricing by 30%, making high-intelligence AI more accessible for production workloads.',
    provider: 'claude',
    url: 'https://www.anthropic.com/pricing',
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    id: 'n6',
    title: 'GPT-4o Vision API Upgrades',
    summary: 'OpenAI enhances GPT-4o multimodal capabilities with improved document analysis, chart reading, and fine-grained image understanding.',
    provider: 'openai',
    url: 'https://platform.openai.com',
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    id: 'n7',
    title: 'Gemini 2.0 Flash Thinking Mode',
    summary: 'Google adds a "thinking" mode to Gemini 2.0 Flash enabling step-by-step reasoning while maintaining its speed advantage.',
    provider: 'gemini',
    url: 'https://aistudio.google.com',
    publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
];

export async function GET() {
  try {
    // In a production app, you'd fetch from RSS feeds here:
    // - https://www.anthropic.com/news.rss
    // - https://openai.com/news/rss.xml
    // - etc.
    // For now, return curated static data to avoid CORS and rate limit issues

    return NextResponse.json(STATIC_NEWS);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
