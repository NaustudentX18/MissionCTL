'use client';

import { useEffect } from 'react';
import { CyberCard } from '@/components/ui/CyberCard';
import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { useMissionStore } from '@/lib/store';
import { fetchNewsItems } from '@/lib/api-clients';
import { formatDateTime } from '@/lib/utils';
import { Rss, ExternalLink, Zap } from 'lucide-react';
import type { AIProvider } from '@/lib/types';

export function NewsFeed() {
  const { newsItems, setNewsItems, markNewsRead } = useMissionStore();

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchNewsItems();
        setNewsItems(items);
      } catch {
        // silently fail - news is non-critical
      }
    };
    load();
    // Refresh every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setNewsItems]);

  const newCount = newsItems.filter(n => n.isNew).length;

  return (
    <CyberCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rss size={16} className="text-purple-400" />
          <h3 className="font-mono font-bold text-white">Live Drop</h3>
          {newCount > 0 && (
            <span className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2 py-0.5 font-mono">
              <Zap size={10} />
              {newCount} new
            </span>
          )}
        </div>
        <span className="text-xs text-slate-600 font-mono">Model releases & updates</span>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {newsItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-600">
            <Rss size={24} className="mb-2 opacity-30" />
            <span className="text-sm font-mono">Loading news feed...</span>
          </div>
        ) : (
          newsItems.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => markNewsRead(item.id)}
              className="block group"
            >
              <div className={`
                relative p-3 rounded-lg border transition-all duration-200
                ${item.isNew
                  ? 'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10'
                  : 'border-[#1a1a2e] bg-black/20 hover:border-purple-500/20 hover:bg-black/30'
                }
              `}>
                {item.isNew && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                )}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.provider !== 'general' && (
                      <ProviderBadge provider={item.provider as AIProvider} size="sm" />
                    )}
                    <span className="text-xs text-slate-500 font-mono">
                      {formatDateTime(item.publishedAt)}
                    </span>
                  </div>
                  <ExternalLink size={12} className="text-slate-600 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-0.5" />
                </div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors mb-1">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {item.summary}
                </p>
              </div>
            </a>
          ))
        )}
      </div>
    </CyberCard>
  );
}
