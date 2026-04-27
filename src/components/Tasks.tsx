import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, CheckCircle2, Circle, Trash2, BookOpen, Dumbbell, Apple, Target, Brain, ChevronDown, StickyNote } from 'lucide-react';
import type { DailyTask } from '../types';

const CATEGORIES = [
  { value: 'study', label: 'Study', icon: BookOpen, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { value: 'diet', label: 'Diet', icon: Apple, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { value: 'productivity', label: 'Productivity', icon: Target, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { value: 'mindset', label: 'Mindset', icon: Brain, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
];

interface TasksProps {
  tasks: DailyTask[];
  setTasks: (tasks: DailyTask[] | ((prev: DailyTask[]) => DailyTask[])) => void;
}

export default function Tasks({ tasks, setTasks }: TasksProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newTask, setNewTask] = useState({ title: '', category: 'study', notes: '' });
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const filteredTasks = tasks.filter(t => {
    const dateMatch = t.date === selectedDate;
    const catMatch = selectedCategory === 'all' || t.category === selectedCategory;
    return dateMatch && catMatch;
  });

  const completed = filteredTasks.filter(t => t.completed).length;

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: DailyTask = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      category: newTask.category as DailyTask['category'],
      completed: false,
      date: selectedDate,
      notes: newTask.notes.trim() || undefined,
    };
    setTasks(prev => [...prev, task]);
    setNewTask({ title: '', category: 'study', notes: '' });
    setShowForm(false);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getCat = (value: string) => CATEGORIES.find(c => c.value === value) || CATEGORIES[0];

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Daily Tasks</h2>
          <p className="text-white/50 text-sm">{completed}/{filteredTasks.length} completed</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30"
        >
          <motion.div animate={{ rotate: showForm ? 45 : 0 }}>
            <Plus size={22} className="text-white" />
          </motion.div>
        </motion.button>
      </div>

      {/* Date Selector */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <label className="text-white/50 text-xs mb-2 block">Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-sm w-full focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-purple-900/50 to-slate-900 border border-purple-500/30 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-white font-bold text-lg">New Task</h3>
            <input
              value={newTask.title}
              onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
              placeholder="What needs to be done?"
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
              onKeyDown={e => e.key === 'Enter' && addTask()}
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setNewTask(p => ({ ...p, category: cat.value }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${newTask.category === cat.value ? cat.bg : 'bg-white/5 border-white/10 text-white/50'}`}
                >
                  <cat.icon size={12} />
                  {cat.label}
                </button>
              ))}
            </div>
            <textarea
              value={newTask.notes}
              onChange={e => setNewTask(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notes (optional)..."
              rows={2}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 font-medium">Cancel</button>
              <button onClick={addTask} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold">Add Task</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-all ${selectedCategory === 'all' ? 'bg-white/20 border-white/30 text-white' : 'bg-white/5 border-white/10 text-white/50'}`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all ${selectedCategory === cat.value ? cat.bg : 'bg-white/5 border-white/10 text-white/50'}`}
          >
            <cat.icon size={11} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      {filteredTasks.length > 0 && (
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${filteredTasks.length > 0 ? (completed / filteredTasks.length) * 100 : 0}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          />
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <Target size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No tasks yet</p>
            <p className="text-sm mt-1">Add your first task to get started!</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const cat = getCat(task.category);
            const isExpanded = expandedTask === task.id;
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`rounded-2xl border transition-all ${task.completed ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}`}
              >
                <div className="flex items-center gap-3 p-4">
                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                    {task.completed
                      ? <CheckCircle2 size={24} className="text-green-400" />
                      : <Circle size={24} className="text-white/30 hover:text-white/60 transition-colors" />
                    }
                  </button>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                    <cat.icon size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>{task.title}</p>
                    <span className={`text-xs ${cat.bg} border rounded-full px-2 py-0.5 inline-block mt-1`}>{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {task.notes && (
                      <button onClick={() => setExpandedTask(isExpanded ? null : task.id)} className="p-2 text-white/30 hover:text-white/60">
                        <StickyNote size={14} />
                      </button>
                    )}
                    <button onClick={() => setExpandedTask(isExpanded ? null : task.id)} className="p-2 text-white/30 hover:text-white/60">
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <ChevronDown size={14} />
                      </motion.div>
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && task.notes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="bg-white/5 rounded-xl p-3 text-white/60 text-sm">{task.notes}</div>
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
