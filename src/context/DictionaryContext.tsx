import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  doc,
  setDoc,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

export interface SlangWord {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  quote: string;
  translations: Record<string, string>;
}

interface DictionaryContextType {
  dictionary: SlangWord[];
  addWord: (word: SlangWord) => Promise<void>;
  removeWord: (word: string) => Promise<void>;
  isSaved: (word: string) => boolean;
  loading: boolean;
}

const DictionaryContext = createContext<DictionaryContextType | null>(null);

// Local backup for guests (not logged in)
const GUEST_STORAGE_KEY = 'kinoslang_guest_dictionary';

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [dictionary, setDictionary] = useState<SlangWord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dictionary: Firestore for logged-in users, localStorage for guests
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    if (user) {
      // Logged in: listen to Firestore
      setLoading(true);
      const userDocRef = doc(db, "users", user.uid);
      unsubscribe = onSnapshot(userDocRef, (docSnap: any) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDictionary(data.dictionary || []);
        } else {
          setDictionary([]);
        }
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    } else {
      // Guest: load from localStorage
      try {
        const stored = localStorage.getItem(GUEST_STORAGE_KEY);
        if (stored) {
          setDictionary(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load guest dictionary:", e);
      }
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Persist guest dictionary to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(dictionary));
    }
  }, [dictionary, user]);

  const addWord = useCallback(async (word: SlangWord) => {
    setDictionary((prev) => {
      if (prev.some((w) => w.word === word.word)) return prev;
      const updated = [...prev, word];
      // Async save (don't await to avoid blocking UI)
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        setDoc(userDocRef, { dictionary: updated }, { merge: true }).catch(console.error);
      }
      return updated;
    });
  }, [user]);

  const removeWord = useCallback(async (wordText: string) => {
    setDictionary((prev) => {
      const updated = prev.filter((w) => w.word !== wordText);
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        setDoc(userDocRef, { dictionary: updated }, { merge: true }).catch(console.error);
      }
      return updated;
    });
  }, [user]);

  const isSaved = useCallback((word: string) => {
    return dictionary.some((w) => w.word === word);
  }, [dictionary]);

  return (
    <DictionaryContext.Provider value={{ dictionary, addWord, removeWord, isSaved, loading }}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const ctx = useContext(DictionaryContext);
  if (!ctx) throw new Error("useDictionary must be used within DictionaryProvider");
  return ctx;
}
