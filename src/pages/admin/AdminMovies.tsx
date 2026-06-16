import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useMovies } from '../../context/MoviesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function AdminMovies() {
  const { movies, loading, removeMovie } = useMovies();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return movies;
    const q = search.toLowerCase();
    return movies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genre.some((g) => g.toLowerCase().includes(q))
    );
  }, [movies, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await removeMovie(deleteId);
      toast.success('Movie deleted');
    } catch {
      toast.error('Failed to delete movie');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Movies</h1>
          <p className="text-[#666] mt-1">{movies.length} movies in catalog</p>
        </div>
        <Link to="/admin/movies/new">
          <Button className="bg-[#E50914] hover:bg-[#B20710] text-white w-full sm:w-auto">
            <Plus size={16} />
            Add Movie
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movies..."
          className="pl-10 bg-[#111] border-[#222] text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#666]">Loading movies...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-[#666]">
            {search ? 'No movies match your search' : 'No movies yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#222] text-left">
                  <th className="p-4 text-[#666] text-xs font-medium uppercase tracking-wider">Movie</th>
                  <th className="p-4 text-[#666] text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Year</th>
                  <th className="p-4 text-[#666] text-xs font-medium uppercase tracking-wider hidden md:table-cell">Genre</th>
                  <th className="p-4 text-[#666] text-xs font-medium uppercase tracking-wider">Slang</th>
                  <th className="p-4 text-[#666] text-xs font-medium uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filtered.map((movie) => (
                  <tr key={movie.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded shrink-0"
                        />
                        <span className="text-white font-medium truncate max-w-[200px]">
                          {movie.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-[#999] hidden sm:table-cell">{movie.year}</td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {movie.genre.slice(0, 2).map((g) => (
                          <span
                            key={g}
                            className="text-xs px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#999] border border-[#222]"
                          >
                            {g}
                          </span>
                        ))}
                        {movie.genre.length > 2 && (
                          <span className="text-xs text-[#666]">+{movie.genre.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-[#999]">{movie.slangWords.length}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/slang/${movie.id}`} target="_blank">
                          <Button variant="ghost" size="icon-sm" className="text-[#666] hover:text-white">
                            <ExternalLink size={16} />
                          </Button>
                        </Link>
                        <Link to={`/admin/movies/${movie.id}`}>
                          <Button variant="ghost" size="icon-sm" className="text-[#666] hover:text-[#E50914]">
                            <Pencil size={16} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-[#666] hover:text-red-500"
                          onClick={() => setDeleteId(movie.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[#111] border-[#222] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete movie?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#999]">
              This will permanently delete the movie and all its slang words. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#222] text-[#999] hover:text-white bg-transparent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
