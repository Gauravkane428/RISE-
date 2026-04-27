import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Target, Trash2, Check, ChevronDown, ChevronUp, BookOpen, Dumbbell, Apple, Brain, DollarSign, CheckCircle2, Circle } from 'lucide-react';
import type { Goal } from '../types';

const CATEGORIES = [
  { value: 'study', label: 'Study', icon: BookOpen, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { value: 'diet', label: 'Diet', icon: Apple, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { value: 'productivity', label: 'Productivity', icon: Target, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { value: 'mindset', label: 'Mindset', icon: Brain, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  { value: 'finance', label: 'Finance', icon: DollarSign, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
];

interface GoalsProps {
  goals: Goal[];
  setGoals: (g: Goal[] | ((prev: Goal[]) => Goal[])) => void;
}

export default function Goals({ goals, setGoals }: GoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: 'study', targetDate: '', milestones: '' });
  const [newMilestone, setNewMilestone] = useState<Record<string, string>>({});

  const addGoal = () => {
    if (!newGoal.title.trim()) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      description: newGoal.description.trim(),
      category: newGoal.category as Goal['category'],
      targetDate: newGoal.targetDate,
      progress: 0,
      milestones: newGoal.milestones
        .split('\n')
        .filter(Boolean)
        .map((text, i) => ({ id: `m${i}${Date.now()}`, text: text.trim(), done: false })),
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [...prev, goal]);
    setNewGoal({ title: '', description: '', category: 'study', targetDate: '', milestones: '' });
    setShowForm(false);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const updated = g.milestones.map(m => m.id === milestoneId ? { ...m, done: !m.done } : m);
      const done = updated.filter(m => m.done).length;
      const progress = updated.length > 0 ? Math.round((done / updated.length) * 100) : g.progress;
      return { ...g, milestones: updated, progress };
    }));
  };

  const updateProgress = (goalId: string, progress: number) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, progress } : g));
  };

  const addMilestone = (goalId: string) => {
    const text = newMilestone[goalId]?.trim();
    if (!text) return;
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      return { ...g, milestones: [...g.milestones, { id: Date.now().toString(), text, done: false }] };
    }));
    setNewMilestone(p => ({ ...p, [goalId]: '' }));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const getCat = (value: string) => CATEGORIES.find(c => c.value === value) || CATEGORIES[0];

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Goals</h2>
          <p className="text-white/50 text-sm">{goals.filter(g => g.progress < 100).length} active</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="w-11 h-11 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30"
        >
          <motion.div animate={{ rotate: showForm ? 45 : 0 }}>
            <Plus size={22} className="text-white" />
          </motion.div>
        </motion.button>
      </div>

      {/* Add Goal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-yellow-900/30 to-slate-900 border border-yellow-500/30 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-white font-bold text-lg">Set a New Goal</h3>
            <input
              value={newGoal.title}
              onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))}
              placeholder="Goal title..."
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500 font-medium"
            />
            <textarea
              value={newGoal.description}
              onChange={e => setNewGoal(p => ({ ...p, description: e.target.value }))}
              placeholder="Why is this goal important to you? Be specific."
              rows={3}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500 text-sm resize-none"
            />
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setNewGoal(p => ({ ...p, category: cat.value }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${newGoal.category === cat.value ? cat.bg : 'bg-white/5 border-white/10 text-white/50'}`}
                >
                  <cat.icon size={11} />{cat.label}
                </button>
              ))}
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Target Date</label>
              <input
                type="date"
                value={newGoal.targetDate}
                onChange={e => setNewGoal(p => ({ ...p, targetDate: e.target.value }))}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Milestones (one per line)</label>
              <textarea
                value={newGoal.milestones}
                onChange={e => setNewGoal(p => ({ ...p, milestones: e.target.value }))}
                placeholder="Complete Chapter 1&#10;Practice 2 hours&#10;Take mock test"
                rows={4}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500 text-sm resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 font-medium">Cancel</button>
              <button onClick={addGoal} className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl text-white font-bold">Set Goal</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <Target size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No goals set yet</p>
            <p className="text-sm mt-1">Dream big. Set goals. Crush them.</p>
          </div>
        ) : (
          goals.map(goal => {
            const cat = getCat(goal.category);
            const isExpanded = expandedGoal === goal.id;
            const completed = goal.progress >= 100;

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border overflow-hidden ${completed ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}`}
              >
                <button
                  onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                      <cat.icon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-bold text-sm ${completed ? 'text-green-400' : 'text-white'}`}>{goal.title}</h3>
                        <div className="flex items-center gap-2">
                          {completed && <Check size={14} className="text-green-400" />}
                          {isExpanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${cat.bg} border rounded-full px-2 py-0.5`}>{cat.label}</span>
                        {goal.targetDate && <span className="text-white/30 text-xs">{format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <span className="text-white/40 text-xs">{goal.progress}%</span>
                      </div>
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
                      <div className="px-4 pb-4 space-y-4">
                        {goal.description && (
                          <p className="text-white/50 text-sm italic">{goal.description}</p>
                        )}

                        {/* Progress Slider */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-white/50 text-xs">Progress</span>
                            <span className="text-white text-xs font-bold">{goal.progress}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={goal.progress}
                            onChange={e => updateProgress(goal.id, Number(e.target.value))}
                            className="w-full accent-purple-500"
                          />
                        </div>

                        {/* Milestones */}
                        {goal.milestones.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-white/50 text-xs font-medium">Milestones</p>
                            {goal.milestones.map(m => (
                              <button
                                key={m.id}
                                onClick={() => toggleMilestone(goal.id, m.id)}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 text-left hover:bg-white/10 transition-all"
                              >
                                {m.done
                                  ? <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                                  : <Circle size={16} className="text-white/30 flex-shrink-0" />
                                }
                                <span className={`text-sm ${m.done ? 'line-through text-white/30' : 'text-white/70'}`}>{m.text}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Add Milestone */}
                        <div className="flex gap-2">
                          <input
                            value={newMilestone[goal.id] || ''}
                            onChange={e => setNewMilestone(p => ({ ...p, [goal.id]: e.target.value }))}
                            placeholder="Add milestone..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500"
                            onKeyDown={e => e.key === 'Enter' && addMilestone(goal.id)}
                          />
                          <button onClick={() => addMilestone(goal.id)} className="px-4 py-2 bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-xl text-sm">
                            Add
                          </button>
                        </div>

                        <button onClick={() => deleteGoal(goal.id)} className="flex items-center gap-1.5 text-red-400/60 hover:text-red-400 text-xs transition-colors">
                          <Trash2 size={12} />Delete Goal
                        </button>
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
