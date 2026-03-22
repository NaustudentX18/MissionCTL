'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CyberCard } from '@/components/ui/CyberCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { useMissionStore } from '@/lib/store';
import type { PromptTemplate, TaskType } from '@/lib/types';
import { BookOpen, Copy, Plus, Trash2, Edit3, Search, Tag, X } from 'lucide-react';

const CATEGORY_COLORS: Record<TaskType, string> = {
  coding: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  creative: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  search: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  analysis: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  chat: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
};

const CATEGORY_ICONS: Record<TaskType, string> = {
  coding: '💻',
  creative: '🎨',
  search: '🔍',
  analysis: '📊',
  chat: '💬',
};

interface PromptCardProps {
  prompt: PromptTemplate;
  onCopy: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

function PromptCard({ prompt, onCopy, onDelete, onEdit }: PromptCardProps) {
  return (
    <CyberCard hoverable className="p-4 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-mono font-semibold text-white text-sm truncate">{prompt.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{prompt.description}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
            title="Edit"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${CATEGORY_COLORS[prompt.category]}`}>
          {CATEGORY_ICONS[prompt.category]} {prompt.category}
        </span>
        {prompt.tags.map(tag => (
          <span key={tag} className="text-xs text-slate-600 font-mono">#{tag}</span>
        ))}
      </div>

      <div className="bg-black/30 rounded-lg p-2.5 mb-3 max-h-20 overflow-hidden relative">
        <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed line-clamp-3">
          {prompt.content}
        </pre>
        <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-[#050508] to-transparent rounded-b-lg" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600 font-mono">
          Used {prompt.usageCount} times
        </span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono hover:bg-purple-500/20 transition-all btn-haptic"
        >
          <Copy size={11} />
          Copy
        </button>
      </div>
    </CyberCard>
  );
}

interface AddPromptModalProps {
  onSave: (data: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  onClose: () => void;
  initial?: PromptTemplate;
}

function AddPromptModal({ onSave, onClose, initial }: AddPromptModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [category, setCategory] = useState<TaskType>(initial?.category ?? 'coding');
  const [tagInput, setTagInput] = useState(initial?.tags.join(', ') ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      category,
      tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f18] border border-[#1a1a2e] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#1a1a2e]">
          <h3 className="font-mono font-bold text-white">
            {initial ? 'Edit Prompt' : 'New Prompt'}
          </h3>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-500 font-mono mb-1">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="My Awesome Prompt"
              required
              className="w-full bg-black/30 border border-[#1a1a2e] rounded-lg px-3 py-2 text-sm font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-mono mb-1">Description</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What this prompt does..."
              className="w-full bg-black/30 border border-[#1a1a2e] rounded-lg px-3 py-2 text-sm font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-mono mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as TaskType)}
              className="w-full bg-black/30 border border-[#1a1a2e] rounded-lg px-3 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-purple-500/50"
            >
              {(['coding', 'creative', 'search', 'analysis', 'chat'] as TaskType[]).map(c => (
                <option key={c} value={c} className="bg-[#0f0f18]">
                  {CATEGORY_ICONS[c]} {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-mono mb-1">Tags (comma-separated)</label>
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="coding, review, python"
              className="w-full bg-black/30 border border-[#1a1a2e] rounded-lg px-3 py-2 text-sm font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-mono mb-1">Prompt Content *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Your master prompt goes here..."
              required
              rows={8}
              className="w-full bg-black/30 border border-[#1a1a2e] rounded-lg px-3 py-2 text-sm font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 resize-y"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <NeonButton variant="purple" type="submit" className="flex-1">
              {initial ? 'Update Prompt' : 'Save Prompt'}
            </NeonButton>
            <NeonButton variant="ghost" type="button" onClick={onClose}>
              Cancel
            </NeonButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PromptLibrary() {
  const { prompts, addPrompt, updatePrompt, deletePrompt, incrementPromptUsage } = useMissionStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<TaskType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);

  const filtered = prompts.filter(p => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleCopy = (prompt: PromptTemplate) => {
    navigator.clipboard.writeText(prompt.content);
    incrementPromptUsage(prompt.id);
    toast.success('Prompt copied!', { icon: '📋' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this prompt?')) {
      deletePrompt(id);
      toast.success('Prompt deleted');
    }
  };

  const handleSave = (data: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, data);
      toast.success('Prompt updated!');
    } else {
      addPrompt(data);
      toast.success('Prompt saved!');
    }
    setShowModal(false);
    setEditingPrompt(null);
  };

  return (
    <>
      {showModal && (
        <AddPromptModal
          initial={editingPrompt ?? undefined}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingPrompt(null); }}
        />
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-purple-400" />
            <h3 className="font-mono font-bold text-white">Prompt Library</h3>
            <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full px-2 py-0.5 font-mono">
              {prompts.length}
            </span>
          </div>
          <NeonButton
            variant="purple"
            size="sm"
            onClick={() => setShowModal(true)}
          >
            <Plus size={12} />
            New Prompt
          </NeonButton>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search prompts..."
              className="w-full bg-black/30 border border-[#1a1a2e] rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-purple-500/30"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'coding', 'creative', 'search', 'analysis', 'chat'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-1.5 rounded-lg text-xs font-mono border transition-all btn-haptic ${
                  filterCategory === cat
                    ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                    : 'border-[#1a1a2e] text-slate-600 hover:text-slate-300 hover:border-purple-500/20'
                }`}
              >
                {cat === 'all' ? 'All' : `${CATEGORY_ICONS[cat]} ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600">
            <BookOpen size={32} className="mb-2 opacity-30" />
            <span className="text-sm font-mono">No prompts found</span>
            <span className="text-xs font-mono mt-1">
              {search ? 'Try a different search' : 'Add your first master prompt'}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(prompt => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={() => handleCopy(prompt)}
                onDelete={() => handleDelete(prompt.id)}
                onEdit={() => { setEditingPrompt(prompt); setShowModal(true); }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
