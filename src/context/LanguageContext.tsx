import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('kinoslang-language') || 'en';
  });

  const setLanguage = useCallback((code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('kinoslang-language', code);
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
