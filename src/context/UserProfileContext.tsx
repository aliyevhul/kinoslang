import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { doc, setDoc, onSnapshot, getDoc, collection, getDocs, type Unsubscribe } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '../firebase/config';
import { useAuth } from './AuthContext';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  nativeLanguage?: string;
  favoriteGenres?: string[];
  dailyGoal?: number;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  allProfiles: UserProfile[];
  loading: boolean;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  getUserProfile: (uid: string) => Promise<UserProfile | null>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to current user's profile
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    if (user) {
      setLoading(true);
      const userDocRef = doc(db, 'users', user.uid);

      unsubscribe = onSnapshot(userDocRef, async (docSnap: any) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            uid: user.uid,
            displayName: data.displayName || user.displayName || 'User',
            email: data.email || user.email || '',
            photoURL: data.photoURL || user.photoURL || undefined,
            bio: data.bio || '',
            location: data.location || '',
            nativeLanguage: data.nativeLanguage || 'en',
            favoriteGenres: data.favoriteGenres || [],
            dailyGoal: data.dailyGoal || 5,
            isPublic: data.isPublic !== false,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        } else {
          // Create default profile
          const defaultProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'User',
            email: user.email || '',
            isPublic: true,
            dailyGoal: 5,
            favoriteGenres: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, defaultProfile);
          setProfile(defaultProfile);
        }
        setLoading(false);
      }, () => setLoading(false));
    } else {
      setProfile(null);
      setLoading(false);
    }

    return () => { if (unsubscribe) unsubscribe(); };
  }, [user]);

  // Load all profiles for leaderboard
  useEffect(() => {
    getDocs(collection(db, 'users')).then((snapshot: any) => {
      const profiles: UserProfile[] = [];
      snapshot.forEach((d: any) => {
        const data = d.data();
        profiles.push({
          uid: d.id,
          displayName: data.displayName || 'User',
          email: data.email || '',
          photoURL: data.photoURL || undefined,
          bio: data.bio || '',
          location: data.location || '',
          nativeLanguage: data.nativeLanguage || 'en',
          favoriteGenres: data.favoriteGenres || [],
          dailyGoal: data.dailyGoal || 5,
          isPublic: data.isPublic !== false,
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
        });
      });
      setAllProfiles(profiles);
    }).catch(() => {});
  }, []);

  const updateProfileData = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  }, [user]);

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const storageRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    // Update Firebase Auth profile
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL: url });
    }
    // Update Firestore
    await updateProfileData({ photoURL: url });
    return url;
  }, [user, updateProfileData]);

  const getUserProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      uid: docSnap.id,
      displayName: data.displayName || 'User',
      email: data.email || '',
      photoURL: data.photoURL || undefined,
      bio: data.bio || '',
      location: data.location || '',
      nativeLanguage: data.nativeLanguage || 'en',
      favoriteGenres: data.favoriteGenres || [],
      dailyGoal: data.dailyGoal || 5,
      isPublic: data.isPublic !== false,
      createdAt: data.createdAt || '',
      updatedAt: data.updatedAt || '',
    };
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, allProfiles, loading, updateProfileData, uploadAvatar, getUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
}
