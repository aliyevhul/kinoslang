import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

// Add your admin email(s) here, or set isAdmin: true in Firestore users/{uid}
const ADMIN_EMAILS: string[] = ['kerimov.zulfigar@gmail.com'];

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType>({ isAdmin: false, loading: true });

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const emailIsAdmin = user.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        const data = snap.data();
        setIsAdmin(emailIsAdmin || data?.isAdmin === true || data?.role === 'admin');
        setLoading(false);
      },
      () => {
        setIsAdmin(emailIsAdmin);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <AdminContext.Provider value={{ isAdmin, loading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
