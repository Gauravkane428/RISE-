import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Plus, Flame, Trash2, BookOpen, Dumbbell, Apple, Target, Brain, Check } from 'lucide-react';
import type { HabitRecord } from '../types';

const CATEGORIES = [
  { value: 'study', label: 'Study', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
  { value: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'from-orange-500 to-red-500' },
  { value: 'diet', label: 'Diet', icon: Apple, color: 'from-green-500 to-emerald-500' },
  { value: 'productivity', label: 'Productivity', icon: Target, color: 'from-purple-500 to-violet-500' },
  { value: 'mindset', label: 'Mindset', icon: Brain, color: 'from-pink-500 to-rose-500' },
];

const PRESET_HABITS = [
  { name: 'Morning Workout', category: 'fitness', icon: '💪' },
  { name: 'Read 30 mins', category: 'study', icon: '📖' },
  { name: 'Drink 3L Water', category: 'diet', icon: '💧' },
  { name: 'No Junk Food', category: 'diet', icon: '🥗' },
  { name: 'Meditate 10 mins', category: 'mindset', icon: '🧘' },
  { name: 'Study 2 Hours', category: 'study', icon: '📚' },
  { name: 'Cold Shower', category: 'mindset', icon: '🚿' },
  { name: 'No Social Media', category: 'productivity', icon: '📵' },
  { name: 'Sleep before 11PM', category: 'mindset', icon: '😴' },
  { name: 'Daily Journal', category: 'mindset', icon: '✍️' },
];

interface HabitsProps {
  habits: HabitRecord[];
  setHabits: (habits: HabitRecord[] | ((prev: HabitRecord[]) => HabitRecord[])) => void;
}

export default function Habits({ habits, setHabits }: HabitsProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [showForm, setShowForm] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', category: 'study', icon: '⭐' });

  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const alreadyDone = h.completedDates.includes(today);
      const newDates = alreadyDone
        ? h.completedDates.filter(d => d !== today)
        : [...h.completedDates, today];

      // Calculate streak
      let streak = 0;
      const checkDate = new Date();
      for (let i = 0; i < 365; i++) {
        const dateStr = format(subDays(checkDate, i), 'yyyy-MM-dd');
        if (newDates.includes(dateStr)) {
          streak++;
        } else {
          break;
        }
      }
      return { ...h, completedDates: newDates, streak };
    }));
  };

  const addHabit = (name: string, category: string, icon: string) => {
    const habit: HabitRecord = {
      id: Date.now().toString(),
      name,
      category: category as HabitRecord['category'],
      icon,
      color: '',
      targetDays: 66,
      completedDates: [],
      streak: 0,
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, habit]);
    setNewHabit({ name: '', category: 'study', icon: '⭐' });
    setShowForm(false);
    setShowPresets(false);
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const getCat = (value: string) => CATEGORIES.find(c => c.value === value) || CATEGORIES[0];

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Habit Tracker</h2>
          <p className="text-white/50 text-sm">{completedToday}/{habits.length} done today</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30"
        >
          <motion.div animate={{ rotate: showForm ? 45 : 0 }}>
            <Plus size={22} className="text-white" />
          </motion.div>
        </motion.button>
      </div>

      {/* Add Habit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-orange-900/40 to-slate-900 border border-orange-500/30 rounded-2xl p-5 space-y-4"
          >
            <div className="flex gap-3">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex-1 py-2.5 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-xl text-sm font-medium"
              >
                📋 Use Preset
              </button>
              <button
                onClick={() => setShowPresets(false)}
                className="flex-1 py-2.5 bg-white/10 border border-white/10 text-white/60 rounded-xl text-sm font-medium"
              >
                ✏️ Custom
              </button>
            </div>

            {showPresets ? (
              <div className="grid grid-cols-2 gap-2">
                {PRESET_HABITS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => addHabit(p.name, p.category, p.icon)}
                    className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-all"
                  >
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-white text-xs font-medium leading-tight">{p.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <input
                    value={newHabit.icon}
                    onChange={e => setNewHabit(p => ({ ...p, icon: e.target.value }))}
                    placeholder="🎯"
                    className="w-14 bg-white/10 border border-white/10 rounded-xl px-2 py-3 text-white text-center text-xl focus:outline-none focus:border-orange-500"
                  />
                  <input
                    value={newHabit.name}
                    onChange={e => setNewHabit(p => ({ ...p, name: e.target.value }))}
                    placeholder="Habit name..."
                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setNewHabit(p => ({ ...p, category: cat.value }))}
                      className={`p-2 rounded-xl border text-xs font-medium transition-all text-center ${newHabit.category === cat.value ? `bg-gradient-to-br ${cat.color} border-transparent text-white` : 'bg-white/5 border-white/10 text-white/50'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 font-medium">Cancel</button>
                  <button onClick={() => addHabit(newHabit.name, newHabit.category, newHabit.icon)} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white font-bold">Add Habit</button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <Flame size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No habits yet</p>
            <p className="text-sm mt-1">Start building your daily rituals!</p>
          </div>
        ) : (
          habits.map(habit => {
            const cat = getCat(habit.category);
            const doneToday = habit.completedDates.includes(today);
            const progressPercent = Math.min((habit.completedDates.length / habit.targetDays) * 100, 100);

            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-2xl border p-4 transition-all ${doneToday ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-all ${doneToday ? 'bg-green-500 shadow-lg shadow-green-500/30' : `bg-gradient-to-br ${cat.color} opacity-60`}`}
                  >
                    {doneToday ? <Check size={22} className="text-white" /> : habit.icon}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm ${doneToday ? 'text-green-400' : 'text-white'}`}>{habit.name}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white/40 text-xs capitalize">{habit.category}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-orange-400 text-xs flex items-center gap-1">
                        <Flame size={10} />{habit.streak} day streak
                      </span>
                    </div>
                  </div>
                  <button onClick={() => deleteHabit(habit.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* 7-day view */}
                <div className="flex gap-1.5 mb-3">
                  {last7Days.map(d => (
                    <div
                      key={d}
                      className={`flex-1 h-7 rounded-lg flex items-center justify-center ${habit.completedDates.includes(d) ? `bg-gradient-to-b ${cat.color}` : 'bg-white/5'}`}
                    >
                      {habit.completedDates.includes(d) && <Check size={10} className="text-white" />}
                    </div>
                  ))}
                </div>

                {/* Progress to 66 days */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-white/30 text-xs">{habit.completedDates.length}/66 days</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
