import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { doc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { useDictionary } from './DictionaryContext';
import { useUserProfile } from './UserProfileContext';
import { useStreak } from './StreakContext';

export type AchievementCategory = 'words' | 'movies' | 'streak' | 'difficulty' | 'social';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: (s: UserStats) => boolean;
}

export interface UserStats {
  totalWords: number;
  easyWords: number;
  mediumWords: number;
  hardWords: number;
  streetWords: number;
  uniqueMovies: number;
  sessionsCompleted: number;
  streak: number;
  hasPhoto: boolean;
  hasBio: boolean;
  followingCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  unlockedAt?: string;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first-word', title: 'First Steps', description: 'Save your first slang word', icon: 'Footprints', category: 'words', condition: (s) => s.totalWords >= 1 },
  { id: 'word-collector-10', title: 'Word Collector', description: 'Save 10 slang words', icon: 'BookOpen', category: 'words', condition: (s) => s.totalWords >= 10 },
  { id: 'word-hoarder-50', title: 'Word Hoarder', description: 'Save 50 slang words', icon: 'Library', category: 'words', condition: (s) => s.totalWords >= 50 },
  { id: 'word-master-100', title: 'Century Club', description: 'Save 100 slang words', icon: 'Crown', category: 'words', condition: (s) => s.totalWords >= 100 },
  { id: 'movie-explorer', title: 'Movie Explorer', description: 'Save words from 5 different movies', icon: 'Film', category: 'movies', condition: (s) => s.uniqueMovies >= 5 },
  { id: 'movie-buff', title: 'Movie Buff', description: 'Save words from 10 different movies', icon: 'Clapperboard', category: 'movies', condition: (s) => s.uniqueMovies >= 10 },
  { id: 'streak-week', title: 'On Fire', description: 'Maintain a 7-day streak', icon: 'Flame', category: 'streak', condition: (s) => s.streak >= 7 },
  { id: 'streak-month', title: 'Unstoppable', description: 'Maintain a 30-day streak', icon: 'Zap', category: 'streak', condition: (s) => s.streak >= 30 },
  { id: 'hard-nut', title: 'Hard Nut', description: 'Save 10 hard difficulty words', icon: 'Mountain', category: 'difficulty', condition: (s) => s.hardWords >= 10 },
  { id: 'easy-rider', title: 'Easy Rider', description: 'Save 10 easy words', icon: 'Smile', category: 'difficulty', condition: (s) => s.easyWords >= 10 },
  { id: 'street-smart', title: 'Street Smart', description: 'Save 5 street-type words', icon: 'Sunglasses', category: 'difficulty', condition: (s) => s.streetWords >= 5 },
  { id: 'flashcard-rookie', title: 'Flashcard Rookie', description: 'Complete your first flashcard session', icon: 'Brain', category: 'words', condition: (s) => s.sessionsCompleted >= 1 },
  { id: 'flashcard-pro', title: 'Flashcard Pro', description: 'Complete 10 flashcard sessions', icon: 'GraduationCap', category: 'words', condition: (s) => s.sessionsCompleted >= 10 },
  { id: 'profile-complete', title: 'Getting Personal', description: 'Complete your profile with photo and bio', icon: 'UserCheck', category: 'social', condition: (s) => s.hasPhoto && s.hasBio },
  { id: 'social-butterfly', title: 'Social Butterfly', description: 'Follow 5 other users', icon: 'Users', category: 'social', condition: (s) => s.followingCount >= 5 },
];

interface AchievementContextType {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  checkAchievements: () => Promise<void>;
  getAchievementsByCategory: (cat: AchievementCategory | 'all') => Achievement[];
}

const AchievementContext = createContext<AchievementContextType | null>(null);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { dictionary } = useDictionary();
  const { profile } = useUserProfile();
  const { streak } = useStreak();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Load unlocked achievements from Firestore
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (user) {
      const ref = doc(db, 'users', user.uid, 'achievements', 'data');
      unsubscribe = onSnapshot(ref, (snap: any) => {
        const data = snap.exists() ? (snap.data() as Record<string, string>) : {};
        const merged = ACHIEVEMENT_DEFS.map((def) => ({
          id: def.id,
          title: def.title,
          description: def.description,
          icon: def.icon,
          category: def.category,
          unlockedAt: data[def.id] || undefined,
        }));
        setAchievements(merged);
      });
    } else {
      setAchievements(ACHIEVEMENT_DEFS.map((d) => ({ ...d, unlockedAt: undefined })));
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, [user]);

  const checkAchievements = useCallback(async () => {
    if (!user) return;

    const totalWords = dictionary.length;
    const easyWords = dictionary.filter((w) => w.difficulty === 'easy').length;
    const mediumWords = dictionary.filter((w) => w.difficulty === 'medium').length;
    const hardWords = dictionary.filter((w) => w.difficulty === 'hard').length;
    const streetWords = dictionary.filter((w) => w.type.toLowerCase().includes('street')).length;
    const uniqueMovies = new Set(dictionary.map((w) => w.quote)).size; // approximate

    const stats: UserStats = {
      totalWords,
      easyWords,
      mediumWords,
      hardWords,
      streetWords,
      uniqueMovies,
      sessionsCompleted: parseInt(localStorage.getItem('ks_sessions') || '0', 10),
      streak: streak.currentStreak,
      hasPhoto: !!profile?.photoURL,
      hasBio: !!profile?.bio && profile.bio.length > 0,
      followingCount: 0,
    };

    const currentData: Record<string, string> = {};
    achievements.forEach((a) => {
      if (a.unlockedAt) currentData[a.id] = a.unlockedAt;
    });

    let changed = false;
    ACHIEVEMENT_DEFS.forEach((def) => {
      if (!currentData[def.id] && def.condition(stats)) {
        currentData[def.id] = new Date().toISOString();
        changed = true;
      }
    });

    if (changed) {
      const ref = doc(db, 'users', user.uid, 'achievements', 'data');
      await setDoc(ref, currentData, { merge: true });
    }
  }, [user, dictionary, profile, streak, achievements]);

  const getAchievementsByCategory = useCallback((cat: AchievementCategory | 'all') => {
    if (cat === 'all') return achievements;
    return achievements.filter((a) => a.category === cat);
  }, [achievements]);

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <AchievementContext.Provider value={{ achievements, unlockedCount, totalCount: ACHIEVEMENT_DEFS.length, checkAchievements, getAchievementsByCategory }}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementContext);
  if (!ctx) throw new Error('useAchievements must be used within AchievementProvider');
  return ctx;
}
