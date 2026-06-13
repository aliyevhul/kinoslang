import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase/config';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      let msg = "Login failed";
      if (err.code === 'auth/user-not-found') msg = "No account found with this email";
      else if (err.code === 'auth/wrong-password') msg = "Wrong password";
      else if (err.code === 'auth/invalid-credential') msg = "Invalid email or password";
      else if (err.code === 'auth/too-many-requests') msg = "Too many failed attempts. Try again later.";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // Create user document in Firestore
      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name,
        email: email,
        dictionary: [],
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      let msg = "Registration failed";
      if (err.code === 'auth/email-already-in-use') msg = "An account with this email already exists";
      else if (err.code === 'auth/weak-password') msg = "Password must be at least 6 characters";
      else if (err.code === 'auth/invalid-email') msg = "Invalid email address";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    await signOut(auth);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, error, clearError }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
