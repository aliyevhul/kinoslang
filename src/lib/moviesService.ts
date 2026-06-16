import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import type { Movie, SlangWord } from '../data/movies';
import { movies as staticMovies } from '../data/movies';

const COLLECTION = 'movies';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function fetchMoviesFromFirestore(): Promise<Movie[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  if (snapshot.empty) return [];

  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Movie))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function seedMoviesFromStatic(): Promise<void> {
  const batch = writeBatch(db);
  for (const movie of staticMovies) {
    batch.set(doc(db, COLLECTION, movie.id), {
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      poster: movie.poster,
      slangWords: movie.slangWords,
      updatedAt: new Date().toISOString(),
    });
  }
  await batch.commit();
}

export async function saveMovie(movie: Movie): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, movie.id),
    {
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      poster: movie.poster,
      slangWords: movie.slangWords,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function deleteMovie(movieId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, movieId));
}

export async function uploadMoviePoster(movieId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const storageRef = ref(storage, `posters/${movieId}.${ext}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteMoviePoster(posterUrl: string): Promise<void> {
  if (!posterUrl.includes('firebasestorage.googleapis.com')) return;
  try {
    const storageRef = ref(storage, posterUrl);
    await deleteObject(storageRef);
  } catch {
    // Poster may already be deleted or stored locally
  }
}

export function createEmptySlangWord(): SlangWord {
  const translations: Record<string, string> = {};
  for (const lang of ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr', 'pl', 'uk', 'ru']) {
    translations[lang] = '';
  }
  return {
    word: '',
    difficulty: 'easy',
    type: 'Slang',
    quote: '',
    translations,
  };
}

export function createEmptyMovie(id?: string): Movie {
  return {
    id: id || '',
    title: '',
    year: new Date().getFullYear(),
    genre: [],
    poster: '/og-image.jpg',
    slangWords: [],
  };
}
