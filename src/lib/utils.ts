import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AIProvider, BridgeResult, DailyUsage, EfficiencyScore, ModelInfo, TaskType } from './types';
import { MODELS, PROVIDERS, SPEED_SCORES, TASK_QUALITY_SCORES } from './providers';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCost(usd: number): string {
  if (usd < 0.01) return `$${(usd * 1000).toFixed(3)}m`;
  if (usd < 1) return `$${usd.toFixed(4)}`;
  if (usd < 100) return `$${usd.toFixed(2)}`;
  return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// ============================================================
// Efficiency Score Algorithm
// ============================================================

export function calculateEfficiencyScores(task: TaskType): EfficiencyScore[] {
  const scores: EfficiencyScore[] = [];

  // Assume ~500 input + ~1000 output tokens per average task
  const avgInputTokens = 500;
  const avgOutputTokens = 1000;

  for (const model of MODELS) {
    const qualityScores = TASK_QUALITY_SCORES[model.id];
    if (!qualityScores) continue;

    const qualityScore = qualityScores[task];
    const speedScore = SPEED_SCORES[model.id] ?? 50;

    // Cost per typical task in microdollars
    const costPerTask =
      (avgInputTokens / 1_000_000) * model.inputCostPer1M +
      (avgOutputTokens / 1_000_000) * model.outputCostPer1M;

    // Value = quality / (cost * 1000 + 0.5) - higher quality at lower cost = better value
    // Normalize cost: $0.01 task → cost factor 1.0
    const costFactor = Math.max(0.001, costPerTask * 100);
    const valueRaw = (qualityScore * speedScore) / (costFactor * 10);

    // Normalize to 0-100
    const score = Math.min(100, Math.round(valueRaw));

    let valueRating: string;
    if (score >= 80) valueRating = 'Exceptional';
    else if (score >= 60) valueRating = 'Excellent';
    else if (score >= 40) valueRating = 'Good';
    else if (score >= 20) valueRating = 'Fair';
    else valueRating = 'Poor';

    scores.push({
      provider: model.provider,
      model: model.id,
      task,
      score,
      valueRating,
      costPerTask,
      qualityRating: qualityScore,
      speedRating: speedScore,
    });
  }

  return scores.sort((a, b) => b.score - a.score);
}

// ============================================================
// Token Cost Calculator (AI Bridge)
// ============================================================

export function calculateBridgeCosts(prompt: string, outputMultiplier = 3): BridgeResult[] {
  // Estimate tokens: ~4 chars per token
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(inputTokens * outputMultiplier);
  const results: BridgeResult[] = [];

  for (const model of MODELS) {
    const inputCost = (inputTokens / 1_000_000) * model.inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * model.outputCostPer1M;
    const totalCost = inputCost + outputCost;

    results.push({
      provider: model.provider,
      model: model.id,
      estimatedCost: totalCost,
      estimatedTokens: inputTokens + outputTokens,
      inputTokens,
      outputTokens,
      costBreakdown: `${formatCost(inputCost)} in + ${formatCost(outputCost)} out`,
    });
  }

  return results.sort((a, b) => a.estimatedCost - b.estimatedCost);
}

// ============================================================
// Mock data generators (used when no real API keys)
// ============================================================

export function generateMockDailyUsage(days = 7): DailyUsage[] {
  const usage: DailyUsage[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Simulate realistic usage patterns
    const factor = 0.5 + Math.random() * 1.0;
    const dayOfWeek = date.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.4 : 1;

    usage.push({
      date: dateStr,
      claude: Math.round(45000 * factor * weekendFactor),
      openai: Math.round(32000 * factor * weekendFactor),
      gemini: Math.round(28000 * factor * weekendFactor),
      groq: Math.round(15000 * factor * weekendFactor),
      claudeCost: parseFloat((0.45 * factor * weekendFactor).toFixed(4)),
      openaiCost: parseFloat((0.28 * factor * weekendFactor).toFixed(4)),
      geminiCost: parseFloat((0.08 * factor * weekendFactor).toFixed(4)),
      groqCost: parseFloat((0.03 * factor * weekendFactor).toFixed(4)),
    });
  }

  return usage;
}

export function getProviderColor(provider: AIProvider): string {
  return PROVIDERS[provider].color;
}

export function getModelById(id: string): ModelInfo | undefined {
  return MODELS.find(m => m.id === id);
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '••••••••';
  return key.slice(0, 6) + '•'.repeat(Math.min(20, key.length - 10)) + key.slice(-4);
}

export function classifyProvider(key: string): AIProvider | null {
  if (key.startsWith('sk-ant-')) return 'claude';
  if (key.startsWith('sk-') && !key.startsWith('sk-ant-')) return 'openai';
  if (key.startsWith('AIza')) return 'gemini';
  if (key.startsWith('gsk_')) return 'groq';
  return null;
}
