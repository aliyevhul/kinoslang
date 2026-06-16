import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Movie } from '../data/movies';
import { movies as staticMovies } from '../data/movies';
import {
  fetchMoviesFromFirestore,
  seedMoviesFromStatic,
  saveMovie,
  deleteMovie as deleteMovieService,
  uploadMoviePoster,
} from '../lib/moviesService';
import { useAdmin } from './AdminContext';

interface MoviesContextType {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  getMovieById: (id: string) => Movie | undefined;
  addMovie: (movie: Movie) => Promise<void>;
  updateMovie: (movie: Movie) => Promise<void>;
  removeMovie: (id: string) => Promise<void>;
  uploadPoster: (movieId: string, file: File) => Promise<string>;
  refreshMovies: () => Promise<void>;
}

const MoviesContext = createContext<MoviesContextType | null>(null);

export function MoviesProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdmin();
  const [movies, setMovies] = useState<Movie[]>(staticMovies);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let firestoreMovies = await fetchMoviesFromFirestore();

      if (firestoreMovies.length === 0 && isAdmin) {
        await seedMoviesFromStatic();
        firestoreMovies = await fetchMoviesFromFirestore();
      }

      if (firestoreMovies.length > 0) {
        setMovies(firestoreMovies);
      } else {
        setMovies(staticMovies);
      }
    } catch (err) {
      console.error('Failed to load movies from Firestore, using static data:', err);
      setError('Could not sync with database. Showing cached content.');
      setMovies(staticMovies);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const getMovieById = useCallback(
    (id: string) => movies.find((m) => m.id === id),
    [movies]
  );

  const addMovie = useCallback(async (movie: Movie) => {
    await saveMovie(movie);
    setMovies((prev) => [...prev, movie].sort((a, b) => a.title.localeCompare(b.title)));
  }, []);

  const updateMovie = useCallback(async (movie: Movie) => {
    await saveMovie(movie);
    setMovies((prev) =>
      prev.map((m) => (m.id === movie.id ? movie : m)).sort((a, b) => a.title.localeCompare(b.title))
    );
  }, []);

  const removeMovie = useCallback(async (id: string) => {
    await deleteMovieService(id);
    setMovies((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const uploadPoster = useCallback(async (movieId: string, file: File) => {
    const url = await uploadMoviePoster(movieId, file);
    setMovies((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, poster: url } : m))
    );
    return url;
  }, []);

  return (
    <MoviesContext.Provider
      value={{
        movies,
        loading,
        error,
        getMovieById,
        addMovie,
        updateMovie,
        removeMovie,
        uploadPoster,
        refreshMovies: loadMovies,
      }}
    >
      {children}
    </MoviesContext.Provider>
  );
}

export function useMovies() {
  const ctx = useContext(MoviesContext);
  if (!ctx) throw new Error('useMovies must be used within MoviesProvider');
  return ctx;
}
