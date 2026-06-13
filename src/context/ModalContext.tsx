import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface ModalContextType {
  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
}

const ModalContext = createContext<ModalContextType>({
  isAuthOpen: false,
  openAuth: () => {},
  closeAuth: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const openAuth = useCallback(() => setIsAuthOpen(true), []);
  const closeAuth = useCallback(() => setIsAuthOpen(false), []);
  return (
    <ModalContext.Provider value={{ isAuthOpen, openAuth, closeAuth }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
