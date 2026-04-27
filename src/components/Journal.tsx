import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, BookOpen, Trash2, Tag, ChevronDown, ChevronUp, Search } from 'lucide-react';
import type { JournalEntry } from '../types';

const MOODS = [
  { value: 1, emoji: '😔', label: 'Rough' },
  { value: 2, emoji: '😐', label: 'Okay' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😊', label: 'Great' },
  { value: 5, emoji: '🔥', label: 'Crushed it' },
];

const PROMPT_STARTERS = [
  "What did I accomplish today?",
  "What was my biggest win today?",
  "What could I have done better?",
  "What am I grateful for?",
  "What did I learn today?",
  "What will I do differently tomorrow?",
  "What did I sacrifice today for my future self?",
];

interface JournalProps {
  journals: JournalEntry[];
  setJournals: (j: JournalEntry[] | ((prev: JournalEntry[]) => JournalEntry[])) => void;
}

export default function Journal({ journals, setJournals }: JournalProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [showForm, setShowForm] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 3 as 1 | 2 | 3 | 4 | 5,
    tags: '',
    date: today,
  });

  const saveEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: newEntry.date,
      title: newEntry.title.trim(),
      content: newEntry.content.trim(),
      mood: newEntry.mood,
      tags: newEntry.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    setJournals(prev => [entry, ...prev]);
    setNewEntry({ title: '', content: '', mood: 3, tags: '', date: today });
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    setJournals(prev => prev.filter(j => j.id !== id));
  };

  const randomPrompt = () => {
    const prompt = PROMPT_STARTERS[Math.floor(Math.random() * PROMPT_STARTERS.length)];
    setNewEntry(p => ({ ...p, title: prompt }));
  };

  const filtered = journals.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.content.toLowerCase().includes(search.toLowerCase()) ||
    j.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Journal</h2>
          <p className="text-white/50 text-sm">{journals.length} entries</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
        >
          <motion.div animate={{ rotate: showForm ? 45 : 0 }}>
            <Plus size={22} className="text-white" />
          </motion.div>
        </motion.button>
      </div>

      {/* Write Entry Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">New Entry</h3>
              <button onClick={randomPrompt} className="text-indigo-400 text-xs border border-indigo-500/30 px-3 py-1.5 rounded-full hover:bg-indigo-500/20 transition-all">
                🎲 Random Prompt
              </button>
            </div>

            <input
              type="date"
              value={newEntry.date}
              onChange={e => setNewEntry(p => ({ ...p, date: e.target.value }))}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />

            <input
              value={newEntry.title}
              onChange={e => setNewEntry(p => ({ ...p, title: e.target.value }))}
              placeholder="Entry title..."
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 font-medium"
            />

            <textarea
              value={newEntry.content}
              onChange={e => setNewEntry(p => ({ ...p, content: e.target.value }))}
              placeholder="Write your thoughts, reflections, wins, struggles... This is your space."
              rows={6}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm resize-none leading-relaxed"
            />

            {/* Mood Selector */}
            <div>
              <p className="text-white/50 text-xs mb-2">How was your day?</p>
              <div className="flex gap-2">
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setNewEntry(p => ({ ...p, mood: m.value as 1 | 2 | 3 | 4 | 5 }))}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all ${newEntry.mood === m.value ? 'bg-indigo-500/30 border-indigo-500/50' : 'bg-white/5 border-white/10'}`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-white/50 text-[10px]">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-white/40" />
              <input
                value={newEntry.tags}
                onChange={e => setNewEntry(p => ({ ...p, tags: e.target.value }))}
                placeholder="Tags (comma separated: study, win, focus)"
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 font-medium">Cancel</button>
              <button onClick={saveEntry} className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-bold">Save Entry</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
        <Search size={16} className="text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search entries..."
          className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm"
        />
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No entries yet</p>
            <p className="text-sm mt-1">Start writing your story!</p>
          </div>
        ) : (
          filtered.map(entry => {
            const mood = MOODS.find(m => m.value === entry.mood) || MOODS[2];
            const isExpanded = expandedEntry === entry.id;
            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{mood.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-semibold text-sm leading-tight">{entry.title}</h3>
                        {isExpanded ? <ChevronUp size={16} className="text-white/30 flex-shrink-0 mt-0.5" /> : <ChevronDown size={16} className="text-white/30 flex-shrink-0 mt-0.5" />}
                      </div>
                      <p className="text-white/40 text-xs mt-1">{format(new Date(entry.date), 'MMMM d, yyyy')}</p>
                      {!isExpanded && (
                        <p className="text-white/50 text-xs mt-2 line-clamp-2">{entry.content}</p>
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                        </div>
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map(tag => (
                              <span key={tag} className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs px-2.5 py-1 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-end">
                          <button onClick={() => deleteEntry(entry.id)} className="flex items-center gap-1.5 text-red-400/60 hover:text-red-400 text-xs transition-colors">
                            <Trash2 size={12} />Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
