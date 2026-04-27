import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Flame, BookOpen, Target, MessageCircle, User } from 'lucide-react';

import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Habits from './components/Habits';
import Journal from './components/Journal';
import Goals from './components/Goals';
import ChatBot from './components/ChatBot';
import Profile from './components/Profile';

import { useLocalStorage, useReminder } from './hooks/useStorage';
import type { TabType, DailyTask, HabitRecord, JournalEntry, Goal, ChatConversation, UserProfile } from './types';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  motivation: '',
  vision: '',
  wakeTime: '06:00',
  sleepTime: '23:00',
  reminderEnabled: false,
  reminderTime: '08:00',
  joinedAt: new Date().toISOString(),
};

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'habits', icon: Flame, label: 'Habits' },
  { id: 'journal', icon: BookOpen, label: 'Journal' },
  { id: 'goals', icon: Target, label: 'Goals' },
  { id: 'chat', icon: MessageCircle, label: 'Coach' },
  { id: 'profile', icon: User, label: 'Profile' },
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [tasks, setTasks] = useLocalStorage<DailyTask[]>('rise_tasks', []);
  const [habits, setHabits] = useLocalStorage<HabitRecord[]>('rise_habits', []);
  const [journals, setJournals] = useLocalStorage<JournalEntry[]>('rise_journals', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('rise_goals', []);
  const [conversations, setConversations] = useLocalStorage<ChatConversation[]>('rise_conversations', []);
  const [profile, setProfile] = useLocalStorage<UserProfile>('rise_profile', DEFAULT_PROFILE);

  useReminder(profile.reminderEnabled, profile.reminderTime, profile.name);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tasks={tasks} habits={habits} journals={journals} goals={goals} profile={profile} onNavigate={(tab) => setActiveTab(tab as TabType)} />;
      case 'tasks':
        return <Tasks tasks={tasks} setTasks={setTasks} />;
      case 'habits':
        return <Habits habits={habits} setHabits={setHabits} />;
      case 'journal':
        return <Journal journals={journals} setJournals={setJournals} />;
      case 'goals':
        return <Goals goals={goals} setGoals={setGoals} />;
      case 'chat':
        return <ChatBot conversations={conversations} setConversations={setConversations} profile={profile} tasks={tasks} habits={habits} goals={goals} />;
      case 'profile':
        return <Profile profile={profile} setProfile={setProfile} />;
      default:
        return null;
    }
  };

  const getTabGradient = (id: string) => {
    const map: Record<string, string> = {
      dashboard: 'from-purple-500 to-violet-500',
      tasks: 'from-blue-500 to-cyan-500',
      habits: 'from-orange-500 to-red-500',
      journal: 'from-indigo-500 to-purple-500',
      goals: 'from-yellow-500 to-amber-500',
      chat: 'from-pink-500 to-rose-500',
      profile: 'from-teal-500 to-green-500',
    };
    return map[id] || 'from-purple-500 to-pink-500';
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a14] flex flex-col overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40">
            <span className="text-white text-sm font-black">R</span>
          </div>
          <span className="text-white font-black text-xl tracking-tight">RISE</span>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-xs">Welcome back,</p>
          <p className="text-white font-semibold text-sm">{profile.name || 'Champion'} 👋</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto px-4 pt-2"
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="relative z-10 flex-shrink-0 bg-[#0a0a14]/80 backdrop-blur-xl border-t border-white/5 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            const gradient = getTabGradient(item.id);
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-1 py-1 px-2 relative"
              >
                <div className={`relative flex items-center justify-center w-10 h-9 rounded-2xl transition-all duration-200 ${isActive ? `bg-gradient-to-br ${gradient} shadow-lg` : ''}`}>
                  <item.icon
                    size={isActive ? 18 : 19}
                    className={isActive ? 'text-white' : 'text-white/35'}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-md opacity-60 -z-10`}
                    />
                  )}
                </div>
                <span className={`text-[10px] font-semibold transition-all ${isActive ? 'text-white' : 'text-white/30'}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
