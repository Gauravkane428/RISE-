import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Clock, Eye, Heart, Save, Shield } from 'lucide-react';
import type { UserProfile } from '../types';

interface ProfileProps {
  profile: UserProfile;
  setProfile: (p: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
}

export default function Profile({ profile, setProfile }: ProfileProps) {
  const [local, setLocal] = useState(profile);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setProfile(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          setLocal(p => ({ ...p, reminderEnabled: true }));
        }
      });
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h2 className="text-2xl font-black text-white">Your Profile</h2>
        <p className="text-white/50 text-sm">Customize your accountability journey</p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center py-6 bg-gradient-to-br from-purple-900/50 to-slate-900 border border-purple-500/20 rounded-3xl">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-black text-white mb-3 shadow-xl shadow-purple-500/30">
          {local.name ? local.name[0].toUpperCase() : '?'}
        </div>
        <h3 className="text-white font-bold text-xl">{local.name || 'Set your name'}</h3>
        <p className="text-white/40 text-sm">Member since {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Personal Info */}
      <Section title="Personal Info" icon={User} color="text-blue-400">
        <Field label="Your Name">
          <input
            value={local.name}
            onChange={e => setLocal(p => ({ ...p, name: e.target.value }))}
            placeholder="What should I call you?"
            className="input-field"
          />
        </Field>
        <Field label="Your Motivation — Why are you doing this?">
          <textarea
            value={local.motivation}
            onChange={e => setLocal(p => ({ ...p, motivation: e.target.value }))}
            placeholder="I want to become financially free, build the body I've dreamed of..."
            rows={3}
            className="input-field resize-none"
          />
        </Field>
      </Section>

      {/* Vision */}
      <Section title="Your Vision" icon={Eye} color="text-purple-400">
        <Field label="Where do you see yourself in 3 years?">
          <textarea
            value={local.vision}
            onChange={e => setLocal(p => ({ ...p, vision: e.target.value }))}
            placeholder="Describe the man/woman you want to become in vivid detail..."
            rows={4}
            className="input-field resize-none"
          />
        </Field>
      </Section>

      {/* Schedule */}
      <Section title="Daily Schedule" icon={Clock} color="text-green-400">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Wake Up Time">
            <input
              type="time"
              value={local.wakeTime}
              onChange={e => setLocal(p => ({ ...p, wakeTime: e.target.value }))}
              className="input-field"
            />
          </Field>
          <Field label="Sleep Time">
            <input
              type="time"
              value={local.sleepTime}
              onChange={e => setLocal(p => ({ ...p, sleepTime: e.target.value }))}
              className="input-field"
            />
          </Field>
        </div>
      </Section>

      {/* Reminders */}
      <Section title="Reminders" icon={Bell} color="text-orange-400">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">Daily Reminder</p>
              <p className="text-white/40 text-xs">Get a push notification to stay on track</p>
            </div>
            <button
              onClick={() => {
                if (!local.reminderEnabled) {
                  requestNotificationPermission();
                } else {
                  setLocal(p => ({ ...p, reminderEnabled: false }));
                }
              }}
              className={`relative w-12 h-6 rounded-full transition-all ${local.reminderEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/20'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${local.reminderEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          {local.reminderEnabled && (
            <Field label="Reminder Time">
              <input
                type="time"
                value={local.reminderTime}
                onChange={e => setLocal(p => ({ ...p, reminderTime: e.target.value }))}
                className="input-field"
              />
            </Field>
          )}
        </div>
      </Section>

      {/* Data & Privacy */}
      <Section title="Data & Privacy" icon={Shield} color="text-green-400">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
          <p className="text-green-400 text-xs leading-relaxed">
            🔒 <strong>Your data is 100% private.</strong> Everything is stored locally on your device. No servers, no cloud, no tracking. Your personal data never leaves your browser.
          </p>
        </div>
      </Section>

      {/* Quote */}
      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-purple-500/20 rounded-2xl p-5 text-center">
        <Heart size={20} className="text-pink-400 mx-auto mb-2" />
        <p className="text-white/70 text-sm italic leading-relaxed">
          "The man at the top of the mountain didn't fall there. He climbed, one step at a time. Every habit you build, every goal you chase — it's all leading to the version of you that you're proud of."
        </p>
      </div>

      {/* Save Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={save}
        className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-lg shadow-lg transition-all ${saved ? 'bg-green-500 shadow-green-500/30' : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/30'}`}
      >
        <Save size={20} />
        {saved ? '✅ Profile Saved!' : 'Save Profile'}
      </motion.button>
    </div>
  );
}

function Section({ title, icon: Icon, color, children }: { title: string; icon: React.FC<{ size?: number; className?: string }>; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Icon size={16} className={color} />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-white/50 text-xs">{label}</label>
      {children}
    </div>
  );
}
