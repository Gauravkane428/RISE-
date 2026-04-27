export interface DailyTask {
  id: string;
  title: string;
  category: 'study' | 'fitness' | 'diet' | 'productivity' | 'mindset';
  completed: boolean;
  date: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface HabitRecord {
  id: string;
  name: string;
  category: 'study' | 'fitness' | 'diet' | 'productivity' | 'mindset';
  icon: string;
  color: string;
  targetDays: number;
  completedDates: string[];
  streak: number;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'study' | 'fitness' | 'diet' | 'productivity' | 'mindset' | 'finance';
  targetDate: string;
  progress: number;
  milestones: { id: string; text: string; done: boolean }[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  motivation: string;
  vision: string;
  wakeTime: string;
  sleepTime: string;
  reminderEnabled: boolean;
  reminderTime: string;
  joinedAt: string;
}

export interface DailyStats {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  journalWritten: boolean;
  habitsCompleted: number;
  habitsTotal: number;
  studyMinutes: number;
  workoutDone: boolean;
}

export type TabType = 'dashboard' | 'tasks' | 'habits' | 'journal' | 'goals' | 'chat' | 'profile';
