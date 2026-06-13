import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  uid: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  register: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('kinoslang-user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((email: string, _password: string) => {
    const mockUser: User = {
      name: email.split('@')[0],
      email,
      uid: 'mock-' + Date.now(),
    };
    setUser(mockUser);
    localStorage.setItem('kinoslang-user', JSON.stringify(mockUser));
  }, []);

  const register = useCallback((name: string, email: string, _password: string) => {
    const mockUser: User = { name, email, uid: 'mock-' + Date.now() };
    setUser(mockUser);
    localStorage.setItem('kinoslang-user', JSON.stringify(mockUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('kinoslang-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
