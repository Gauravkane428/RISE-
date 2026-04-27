import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Plus, Trash2, ChevronLeft, Sparkles, Copy, Check } from 'lucide-react';
import type { ChatConversation, ChatMessage, UserProfile, DailyTask, HabitRecord, Goal } from '../types';
import { format } from 'date-fns';

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (messages: unknown, options?: unknown) => Promise<unknown>;
      };
    };
  }
}

interface ChatBotProps {
  conversations: ChatConversation[];
  setConversations: (c: ChatConversation[] | ((prev: ChatConversation[]) => ChatConversation[])) => void;
  profile: UserProfile;
  tasks: DailyTask[];
  habits: HabitRecord[];
  goals: Goal[];
}

const QUICK_PROMPTS = [
  "Hold me accountable right now 🔥",
  "Give me a harsh reality check",
  "What should I focus on today?",
  "Help me create a study plan",
  "I'm feeling lazy, motivate me",
  "Analyze my progress and give feedback",
  "Create a daily routine for me",
  "I'm struggling, what should I do?",
];

function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^### (.*$)/gim, '<h3 class="text-white font-bold text-base mt-3 mb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-white font-bold text-lg mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-white font-bold text-xl mt-4 mb-2">$1</h1>')
    .replace(/^\- (.*$)/gim, '<div class="flex gap-2 my-1"><span class="text-purple-400 mt-1">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.*$)/gim, '<div class="flex gap-2 my-1"><span class="text-purple-400 font-bold">→</span><span>$1</span></div>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function ChatBot({ conversations, setConversations, profile, tasks, habits, goals }: ChatBotProps) {
  const [activeConvId, setActiveConvId] = useState<string | null>(
    conversations.length > 0 ? conversations[0].id : null
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showList, setShowList] = useState(conversations.length === 0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const getSystemPrompt = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTasks = tasks.filter(t => t.date === today);
    const completedTasks = todayTasks.filter(t => t.completed);
    const todayHabits = habits.filter(h => h.completedDates.includes(today));
    const activeGoals = goals.filter(g => g.progress < 100);

    return `You are RISE — an elite AI accountability coach and life mentor. You are the user's most trusted advisor, combining the wisdom of a therapist, the fire of a drill sergeant, and the intelligence of a life strategist.

USER PROFILE:
- Name: ${profile.name || 'Champion'}
- Vision: ${profile.vision || 'Not set yet'}
- Motivation: ${profile.motivation || 'Not set yet'}

TODAY'S DATA (${today}):
- Tasks: ${completedTasks.length}/${todayTasks.length} completed
  ${todayTasks.map(t => `  - [${t.completed ? 'DONE' : 'PENDING'}] ${t.title} (${t.category})`).join('\n')}
- Habits done today: ${todayHabits.length}/${habits.length}
  ${habits.map(h => `  - [${h.completedDates.includes(today) ? 'DONE' : 'PENDING'}] ${h.name} (streak: ${h.streak} days)`).join('\n')}
- Active Goals: ${activeGoals.length}
  ${activeGoals.map(g => `  - ${g.title} (${g.progress}% done, category: ${g.category})`).join('\n')}

YOUR PERSONALITY:
1. You are DIRECT and HONEST — you don't sugarcoat. If the user is slacking, you call it out.
2. You are DEEPLY CARING — you want them to win. Every response comes from love for their growth.
3. You are INTELLIGENT — you give specific, actionable advice, not generic fluff.
4. You REMEMBER context — use the data above to personalize every response.
5. You use POWERFUL language that motivates and inspires.
6. You ask PENETRATING questions that make them think deeper.
7. When you see they're behind on tasks/habits, you address it with urgency.
8. You treat them like the person they WANT to become, not who they are today.

RULES:
- Always end with a challenge or call to action
- Use emojis sparingly but powerfully
- Give specific, practical advice
- Reference their actual data (tasks, habits, goals) when relevant
- Be their best friend who tells them the hard truth with love`;
  };

  const createNewConversation = () => {
    const conv: ChatConversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations(prev => [conv, ...prev]);
    setActiveConvId(conv.id);
    setShowList(false);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
      setShowList(true);
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    let convId = activeConvId;
    if (!convId) {
      const conv: ChatConversation = {
        id: Date.now().toString(),
        title: messageText.slice(0, 50),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConversations(prev => [conv, ...prev]);
      convId = conv.id;
      setActiveConvId(conv.id);
      setShowList(false);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      const isFirst = c.messages.length === 0;
      return {
        ...c,
        title: isFirst ? messageText.slice(0, 50) : c.title,
        messages: [...c.messages, userMsg],
        updatedAt: new Date().toISOString(),
      };
    }));

    setInput('');
    setIsLoading(true);

    try {
      const currentConv = conversations.find(c => c.id === convId);
      const history = currentConv?.messages || [];

      const messagesPayload = [
        { role: 'system', content: getSystemPrompt() },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: messageText },
      ];

      const response = await window.puter.ai.chat(messagesPayload, {
        model: 'gemini-2.5-flash',
        stream: false,
      });

      let assistantText = '';
      if (typeof response === 'string') {
        assistantText = response;
      } else if (response && typeof response === 'object') {
        const r = response as { message?: { content?: string }; content?: string; text?: string };
        assistantText = r?.message?.content || r?.content || r?.text || JSON.stringify(response);
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantText,
        timestamp: new Date().toISOString(),
      };

      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c;
        return { ...c, messages: [...c.messages, assistantMsg], updatedAt: new Date().toISOString() };
      }));
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Make sure you're online and try again. Remember: even when the tools break, YOUR commitment to growth doesn't. Keep pushing! 💪",
        timestamp: new Date().toISOString(),
      };
      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c;
        return { ...c, messages: [...c.messages, errorMsg], updatedAt: new Date().toISOString() };
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Show conversation list
  if (showList || !activeConvId) {
    return (
      <div className="space-y-5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">AI Coach</h2>
            <p className="text-white/50 text-sm">Powered by Gemini 2.5</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={createNewConversation}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-medium shadow-lg shadow-purple-500/30"
          >
            <Plus size={18} />New Chat
          </motion.button>
        </div>

        <motion.button
          onClick={createNewConversation}
          className="w-full bg-gradient-to-br from-purple-900/60 to-pink-900/40 border border-purple-500/30 rounded-2xl p-6 text-center hover:bg-purple-900/70 transition-all"
        >
          <Sparkles size={32} className="text-purple-400 mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg mb-2">Start a Conversation</h3>
          <p className="text-white/50 text-sm">Your AI accountability coach is ready to push you to greatness.</p>
        </motion.button>

        {conversations.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-white/50 text-sm font-medium px-1">Past Conversations</h3>
            {conversations.map(conv => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all"
              >
                <button
                  onClick={() => { setActiveConvId(conv.id); setShowList(false); }}
                  className="flex-1 text-left"
                >
                  <Bot size={16} className="text-purple-400 mb-1" />
                  <p className="text-white font-medium text-sm line-clamp-1">{conv.title}</p>
                  <p className="text-white/40 text-xs mt-1">
                    {conv.messages.length} messages • {format(new Date(conv.updatedAt), 'MMM d, h:mm a')}
                  </p>
                </button>
                <button onClick={() => deleteConversation(conv.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={() => setShowList(true)} className="p-2 text-white/50 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{activeConv?.title || 'RISE Coach'}</p>
          <p className="text-green-400 text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
            Gemini 2.5 Flash • Online
          </p>
        </div>
        <button onClick={() => deleteConversation(activeConvId)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {!activeConv || activeConv.messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
                <Bot size={28} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-lg">Hey {profile.name || 'Champion'}!</h3>
              <p className="text-white/50 text-sm mt-1">I'm RISE, your personal accountability coach.<br />I'm here to push you to become who you're meant to be.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/70 text-xs text-left hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeConv.messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-indigo-500 to-blue-500'}`}>
                  {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
                </div>
                <div className={`max-w-[82%] group ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm' : 'bg-white/8 border border-white/10 text-white/85 rounded-tl-sm'}`}>
                    {msg.role === 'assistant' ? (
                      <div
                        className="text-sm leading-relaxed prose-sm"
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 mt-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-white/30 text-xs">{format(new Date(msg.timestamp), 'h:mm a')}</span>
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/60"
                    >
                      {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 pt-3">
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your coach anything..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm px-2 py-1 resize-none max-h-32"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 shadow-lg shadow-purple-500/30"
          >
            <Send size={16} className="text-white" />
          </motion.button>
        </div>
        <p className="text-white/20 text-xs text-center mt-2">Powered by Puter.js + Gemini 2.5 Flash • Free & No API Key needed</p>
      </div>
    </div>
  );
}
