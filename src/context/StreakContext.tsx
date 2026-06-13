import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { doc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  dailyGoal: number;
  todayProgress: number;
  totalStudyDays: number;
}

interface StreakContextType {
  streak: StreakData;
  loading: boolean;
  recordActivity: (wordsStudied?: number) => Promise<void>;
  updateDailyGoal: (goal: number) => Promise<void>;
  isGoalMet: boolean;
}

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  dailyGoal: 5,
  todayProgress: 0,
  totalStudyDays: 0,
};

const StreakContext = createContext<StreakContextType | null>(null);

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function StreakProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData>(DEFAULT_STREAK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (user) {
      setLoading(true);
      const ref = doc(db, 'users', user.uid, 'streak', 'data');
      unsubscribe = onSnapshot(ref, (snap: any) => {
        if (snap.exists()) {
          setStreak(snap.data() as StreakData);
        }
        setLoading(false);
      }, () => setLoading(false));
    } else {
      setStreak(DEFAULT_STREAK);
      setLoading(false);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, [user]);

  const recordActivity = useCallback(async (wordsStudied = 1) => {
    if (!user) return;
    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    setStreak((prev) => {
      let { currentStreak, longestStreak, lastActiveDate, todayProgress, totalStudyDays, dailyGoal } = prev;

      if (lastActiveDate === today) {
        todayProgress += wordsStudied;
      } else if (lastActiveDate === yesterday) {
        currentStreak += 1;
        todayProgress = wordsStudied;
        totalStudyDays += 1;
      } else {
        currentStreak = 1;
        todayProgress = wordsStudied;
        totalStudyDays += 1;
      }

      if (currentStreak > longestStreak) longestStreak = currentStreak;
      lastActiveDate = today;

      const updated = { currentStreak, longestStreak, lastActiveDate, todayProgress, totalStudyDays, dailyGoal };
      const ref = doc(db, 'users', user.uid, 'streak', 'data');
      setDoc(ref, updated, { merge: true }).catch(console.error);
      return updated;
    });
  }, [user]);

  const updateDailyGoal = useCallback(async (goal: number) => {
    if (!user) return;
    setStreak((prev) => {
      const updated = { ...prev, dailyGoal: goal };
      const ref = doc(db, 'users', user.uid, 'streak', 'data');
      setDoc(ref, updated, { merge: true }).catch(console.error);
      return updated;
    });
  }, [user]);

  const isGoalMet = streak.todayProgress >= streak.dailyGoal;

  return (
    <StreakContext.Provider value={{ streak, loading, recordActivity, updateDailyGoal, isGoalMet }}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error('useStreak must be used within StreakProvider');
  return ctx;
}
