import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Flame, Target, BookOpen, Dumbbell, Apple, Brain, TrendingUp,
  CheckCircle2, Clock, Star, Zap, ChevronRight, BarChart2
} from 'lucide-react';
import type { DailyTask, HabitRecord, JournalEntry, Goal, UserProfile } from '../types';

interface DashboardProps {
  tasks: DailyTask[];
  habits: HabitRecord[];
  journals: JournalEntry[];
  goals: Goal[];
  profile: UserProfile;
  onNavigate: (tab: string) => void;
}

const categoryColors = {
  study: 'from-blue-500 to-cyan-500',
  fitness: 'from-orange-500 to-red-500',
  diet: 'from-green-500 to-emerald-500',
  productivity: 'from-purple-500 to-violet-500',
  mindset: 'from-pink-500 to-rose-500',
  finance: 'from-yellow-500 to-amber-500',
};

const categoryIcons = {
  study: BookOpen,
  fitness: Dumbbell,
  diet: Apple,
  productivity: Target,
  mindset: Brain,
};

const motivationalQuotes = [
  "The man you want to become is built one day at a time. Don't miss today.",
  "Discipline is choosing between what you want now and what you want most.",
  "Hard work beats talent when talent doesn't work hard.",
  "Your future self is watching you through your memories. Make him proud.",
  "Success is not owned, it's leased. And the rent is due every day.",
  "Pain is temporary. The pride of having pushed through it lasts forever.",
  "You don't rise to the level of your goals. You fall to the level of your systems.",
  "Every day is a new chance to get closer to who you're meant to be.",
  "The iron never lies to you. That's why the gym is sacred.",
  "Champions are made from something deep inside them — a desire, a dream, a vision.",
];

export default function Dashboard({ tasks, habits, journals, goals, profile, onNavigate }: DashboardProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quote = motivationalQuotes[dayOfYear % motivationalQuotes.length];

  const todayTasks = tasks.filter(t => t.date === today);
  const completedToday = todayTasks.filter(t => t.completed).length;
  const taskPercent = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  const todayHabits = habits.filter(h => h.completedDates.includes(today));
  const habitPercent = habits.length > 0 ? Math.round((todayHabits.length / habits.length) * 100) : 0;

  const activeGoals = goals.filter(g => g.progress < 100);
  const avgGoalProgress = goals.length > 0 ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length) : 0;

  const todayWritten = journals.some(j => j.date === today);

  const categoryStats = useMemo(() => {
    const cats = ['study', 'fitness', 'diet', 'productivity', 'mindset'] as const;
    return cats.map(cat => {
      const catTasks = todayTasks.filter(t => t.category === cat);
      const catDone = catTasks.filter(t => t.completed).length;
      return {
        category: cat,
        total: catTasks.length,
        done: catDone,
        percent: catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0,
      };
    }).filter(c => c.total > 0);
  }, [todayTasks]);

  const overallScore = Math.round(
    (taskPercent * 0.4) + (habitPercent * 0.3) + (todayWritten ? 20 : 0) + (avgGoalProgress * 0.1)
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border border-white/10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.3),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-purple-300 text-sm font-medium mb-1">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
              <h1 className="text-3xl font-black text-white leading-tight">
                Rise Up,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {profile.name || 'Champion'} 🔥
                </span>
              </h1>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-white">{overallScore}</div>
              <div className="text-purple-300 text-xs font-medium">Today's Score</div>
            </div>
          </div>
          <p className="text-purple-200 text-sm leading-relaxed italic">"{quote}"</p>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Tasks Done', value: `${completedToday}/${todayTasks.length}`, percent: taskPercent, icon: CheckCircle2, color: 'from-blue-500 to-cyan-500', tab: 'tasks' },
          { label: 'Habits Done', value: `${todayHabits.length}/${habits.length}`, percent: habitPercent, icon: Flame, color: 'from-orange-500 to-red-500', tab: 'habits' },
          { label: 'Best Streak', value: `${maxStreak} days`, percent: Math.min(maxStreak * 10, 100), icon: Zap, color: 'from-yellow-500 to-amber-500', tab: 'habits' },
          { label: 'Goals Progress', value: `${avgGoalProgress}%`, percent: avgGoalProgress, icon: Target, color: 'from-purple-500 to-violet-500', tab: 'goals' },
        ].map((stat, i) => (
          <motion.button
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onNavigate(stat.tab)}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left hover:bg-white/10 transition-all active:scale-95"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} className="text-white" />
            </div>
            <div className="text-white font-bold text-lg leading-none mb-1">{stat.value}</div>
            <div className="text-white/50 text-xs mb-2">{stat.label}</div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.percent}%` }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.8 }}
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
              />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Today's Focus */}
      {todayTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Clock size={18} className="text-purple-400" />
              Today's Tasks
            </h2>
            <button onClick={() => onNavigate('tasks')} className="text-purple-400 text-sm flex items-center gap-1 hover:text-purple-300">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {todayTasks.slice(0, 4).map(task => {
              const Icon = categoryIcons[task.category];
              return (
                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl ${task.completed ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/5'}`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${categoryColors[task.category]} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <span className={`text-sm font-medium flex-1 ${task.completed ? 'text-green-400 line-through' : 'text-white'}`}>{task.title}</span>
                  {task.completed && <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-purple-400" />
            Category Progress
          </h2>
          <div className="space-y-3">
            {categoryStats.map(stat => {
              const Icon = categoryIcons[stat.category];
              return (
                <div key={stat.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-white/60" />
                      <span className="text-white/70 text-sm capitalize">{stat.category}</span>
                    </div>
                    <span className="text-white/50 text-xs">{stat.done}/{stat.total}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.percent}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full bg-gradient-to-r ${categoryColors[stat.category]} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Active Goals Preview */}
      {activeGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Star size={18} className="text-yellow-400" />
              Active Goals
            </h2>
            <button onClick={() => onNavigate('goals')} className="text-purple-400 text-sm flex items-center gap-1 hover:text-purple-300">
              All goals <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {activeGoals.slice(0, 3).map(goal => (
              <div key={goal.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-white text-sm font-medium">{goal.title}</span>
                    <span className="text-white/50 text-xs">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${categoryColors[goal.category] || 'from-purple-500 to-violet-500'} rounded-full transition-all`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Vision Statement */}
      {profile.vision && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-purple-900/50 to-pink-900/30 border border-purple-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Your Vision</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed italic">"{profile.vision}"</p>
        </motion.div>
      )}

      {/* Journal CTA */}
      {!todayWritten && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => onNavigate('journal')}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 flex items-center justify-between hover:opacity-90 transition-opacity active:scale-95"
        >
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-white" />
            <div className="text-left">
              <div className="text-white font-semibold">Write Today's Entry</div>
              <div className="text-white/60 text-xs">Reflect on your day</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/60" />
        </motion.button>
      )}
    </div>
  );
}
