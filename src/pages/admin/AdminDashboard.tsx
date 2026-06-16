import { Link } from 'react-router-dom';
import { Film, MessageSquare, Plus, ArrowRight } from 'lucide-react';
import { useMovies } from '../../context/MoviesContext';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { movies, loading } = useMovies();

  const totalSlang = movies.reduce((sum, m) => sum + m.slangWords.length, 0);
  const genres = new Set(movies.flatMap((m) => m.genre));

  const stats = [
    { label: 'Total Movies', value: movies.length, icon: Film, color: '#E50914' },
    { label: 'Total Slang Words', value: totalSlang, icon: MessageSquare, color: '#3B82F6' },
    { label: 'Genres', value: genres.size, icon: Film, color: '#10B981' },
  ];

  const recentMovies = [...movies]
    .sort((a, b) => b.year - a.year)
    .slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-[#666] mt-1">Manage your movie slang content</p>
        </div>
        <Link to="/admin/movies/new">
          <Button className="bg-[#E50914] hover:bg-[#B20710] text-white">
            <Plus size={16} />
            Add Movie
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-[#111] border border-[#222] rounded-xl p-6 flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon size={24} style={{ color }} />
            </div>
            <div>
              <p className="text-[#666] text-sm">{label}</p>
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent movies */}
      <div className="bg-[#111] border border-[#222] rounded-xl">
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <h2 className="text-lg font-semibold text-white">Recent Movies</h2>
          <Link
            to="/admin/movies"
            className="text-[#E50914] text-sm flex items-center gap-1 hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-[#666]">Loading...</div>
        ) : recentMovies.length === 0 ? (
          <div className="p-6 text-center text-[#666]">
            No movies yet.{' '}
            <Link to="/admin/movies/new" className="text-[#E50914] hover:underline">
              Add your first movie
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#222]">
            {recentMovies.map((movie) => (
              <Link
                key={movie.id}
                to={`/admin/movies/${movie.id}`}
                className="flex items-center gap-4 p-4 hover:bg-[#1A1A1A] transition-colors"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-10 h-14 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{movie.title}</p>
                  <p className="text-[#666] text-sm">{movie.year} · {movie.genre.join(', ')}</p>
                </div>
                <span className="text-[#666] text-sm shrink-0">
                  {movie.slangWords.length} slang{movie.slangWords.length !== 1 ? 's' : ''}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
