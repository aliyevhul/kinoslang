import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface SlangWord {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  quote: string;
  translations: Record<string, string>;
}

interface DictionaryContextType {
  dictionary: SlangWord[];
  addWord: (word: SlangWord) => void;
  removeWord: (word: string) => void;
  isSaved: (word: string) => boolean;
}

const DictionaryContext = createContext<DictionaryContextType>({
  dictionary: [],
  addWord: () => {},
  removeWord: () => {},
  isSaved: () => false,
});

const STORAGE_KEY = 'kinoslang-dictionary';

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [dictionary, setDictionary] = useState<SlangWord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dictionary));
  }, [dictionary]);

  const addWord = useCallback((word: SlangWord) => {
    setDictionary((prev) => {
      if (prev.some((w) => w.word === word.word)) return prev;
      return [...prev, word];
    });
  }, []);

  const removeWord = useCallback((word: string) => {
    setDictionary((prev) => prev.filter((w) => w.word !== word));
  }, []);

  const isSaved = useCallback(
    (word: string) => dictionary.some((w) => w.word === word),
    [dictionary]
  );

  return (
    <DictionaryContext.Provider value={{ dictionary, addWord, removeWord, isSaved }}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  return useContext(DictionaryContext);
}
