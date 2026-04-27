import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useReminder(enabled: boolean, time: string, userName: string) {
  useEffect(() => {
    if (!enabled || !('Notification' in window)) return;

    Notification.requestPermission().then(permission => {
      if (permission !== 'granted') return;
    });

    const checkAndNotify = () => {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      const diff = Math.abs(now.getTime() - target.getTime());
      if (diff < 60000) {
        const lastNotified = localStorage.getItem('lastNotified');
        const today = now.toDateString();
        if (lastNotified !== today) {
          new Notification(`⚡ Rise Up, ${userName || 'Champion'}!`, {
            body: `It's time to crush your goals. Every rep, every page, every healthy meal — it's shaping who you're becoming. Let's go! 🔥`,
            icon: '/favicon.ico',
          });
          localStorage.setItem('lastNotified', today);
        }
      }
    };

    const interval = setInterval(checkAndNotify, 30000);
    return () => clearInterval(interval);
  }, [enabled, time, userName]);
}
