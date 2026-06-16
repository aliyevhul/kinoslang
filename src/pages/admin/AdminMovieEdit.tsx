import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Save, Loader2 } from 'lucide-react';
import type { Movie, SlangWord } from '../../data/movies';
import { useMovies } from '../../context/MoviesContext';
import { slugify, createEmptyMovie } from '../../lib/moviesService';
import PosterUpload from '../../components/admin/PosterUpload';
import SlangEditor from '../../components/admin/SlangEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

const COMMON_GENRES = [
  'Action', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Animation', 'Documentary',
];

export default function AdminMovieEdit() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { getMovieById, addMovie, updateMovie, uploadPoster, loading: moviesLoading } = useMovies();

  const isNew = movieId === 'new';
  const existingMovie = !isNew && movieId ? getMovieById(movieId) : undefined;

  const [form, setForm] = useState<Movie>(() =>
    existingMovie || createEmptyMovie(isNew ? '' : movieId)
  );
  const [genreInput, setGenreInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [slangEditorOpen, setSlangEditorOpen] = useState(false);
  const [editingSlang, setEditingSlang] = useState<SlangWord | undefined>();
  const [editingSlangIndex, setEditingSlangIndex] = useState<number>(-1);
  const [deleteSlangIndex, setDeleteSlangIndex] = useState<number>(-1);

  useEffect(() => {
    if (existingMovie) {
      setForm(existingMovie);
    }
  }, [existingMovie]);

  const autoId = useMemo(() => {
    if (!isNew) return form.id;
    return slugify(form.title) || '';
  }, [isNew, form.title, form.id]);

  const updateField = <K extends keyof Movie>(key: K, value: Movie[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addGenre = (genre: string) => {
    const g = genre.trim();
    if (!g || form.genre.includes(g)) return;
    updateField('genre', [...form.genre, g]);
    setGenreInput('');
  };

  const removeGenre = (genre: string) => {
    updateField('genre', form.genre.filter((g) => g !== genre));
  };

  const handlePosterUpload = async (file: File) => {
    const id = autoId || form.id;
    if (!id) {
      toast.error('Enter a movie title first');
      return;
    }
    const url = await uploadPoster(id, file);
    updateField('poster', url);
    toast.success('Poster uploaded');
  };

  const handleSaveSlang = (slang: SlangWord) => {
    if (editingSlangIndex >= 0) {
      const updated = [...form.slangWords];
      updated[editingSlangIndex] = slang;
      updateField('slangWords', updated);
    } else {
      updateField('slangWords', [...form.slangWords, slang]);
    }
    setEditingSlang(undefined);
    setEditingSlangIndex(-1);
  };

  const handleDeleteSlang = () => {
    if (deleteSlangIndex < 0) return;
    updateField(
      'slangWords',
      form.slangWords.filter((_, i) => i !== deleteSlangIndex)
    );
    setDeleteSlangIndex(-1);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const id = isNew ? autoId : form.id;
    if (!id) {
      toast.error('Could not generate ID from title');
      return;
    }

    setSaving(true);
    try {
      const movie: Movie = { ...form, id };
      if (isNew) {
        await addMovie(movie);
        toast.success('Movie created');
        navigate(`/admin/movies/${id}`, { replace: true });
      } else {
        await updateMovie(movie);
        toast.success('Movie saved');
      }
    } catch {
      toast.error('Failed to save. Check Firestore rules.');
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && !moviesLoading && movieId && !existingMovie) {
    return (
      <div className="text-center py-16">
        <p className="text-white text-lg">Movie not found</p>
        <Link to="/admin/movies" className="text-[#E50914] mt-4 inline-block hover:underline">
          Back to movies
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/movies">
          <Button variant="ghost" size="icon-sm" className="text-[#666] hover:text-white">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
            {isNew ? 'Add Movie' : 'Edit Movie'}
          </h1>
          {!isNew && (
            <p className="text-[#666] text-sm mt-0.5">ID: {form.id}</p>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#E50914] hover:bg-[#B20710] text-white shrink-0"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Poster */}
        <div className="lg:col-span-1">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">Poster</h2>
            <PosterUpload
              posterUrl={form.poster}
              title={form.title}
              onUpload={handlePosterUpload}
            />
            <div className="mt-4 space-y-2">
              <Label className="text-[#999] text-xs">Or paste URL</Label>
              <Input
                value={form.poster}
                onChange={(e) => updateField('poster', e.target.value)}
                placeholder="/posters/movie.jpg"
                className="bg-[#0A0A0A] border-[#222] text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right: Details + Slang */}
        <div className="lg:col-span-2 space-y-6">
          {/* Movie details */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
            <h2 className="text-white font-semibold">Details</h2>

            <div className="space-y-2">
              <Label className="text-[#999]">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="The Wolf of Wall Street"
                className="bg-[#0A0A0A] border-[#222] text-white"
              />
              {isNew && autoId && (
                <p className="text-xs text-[#666]">ID will be: <code className="text-[#999]">{autoId}</code></p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[#999]">Year</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => updateField('year', parseInt(e.target.value) || new Date().getFullYear())}
                min={1900}
                max={2100}
                className="bg-[#0A0A0A] border-[#222] text-white w-32"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#999]">Genres</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.genre.map((g) => (
                  <Badge
                    key={g}
                    variant="outline"
                    className="border-[#222] text-[#999] cursor-pointer hover:border-red-500 hover:text-red-500"
                    onClick={() => removeGenre(g)}
                  >
                    {g} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre(genreInput))}
                  placeholder="Add genre..."
                  className="bg-[#0A0A0A] border-[#222] text-white flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addGenre(genreInput)}
                  className="border-[#222] text-[#999]"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {COMMON_GENRES.filter((g) => !form.genre.includes(g)).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => addGenre(g)}
                    className="text-xs px-2 py-1 rounded border border-[#222] text-[#666] hover:text-white hover:border-[#444] transition-colors"
                  >
                    + {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Slang words */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">
                Slang Words ({form.slangWords.length})
              </h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditingSlang(undefined);
                  setEditingSlangIndex(-1);
                  setSlangEditorOpen(true);
                }}
                className="bg-[#E50914] hover:bg-[#B20710] text-white"
              >
                <Plus size={14} />
                Add Slang
              </Button>
            </div>

            {form.slangWords.length === 0 ? (
              <p className="text-[#666] text-sm text-center py-8">
                No slang words yet. Click "Add Slang" to create one.
              </p>
            ) : (
              <div className="space-y-2">
                {form.slangWords.map((slang, i) => (
                  <div
                    key={`${slang.word}-${i}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-[#222] hover:border-[#333] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{slang.word}</p>
                      <p className="text-[#666] text-xs truncate">
                        {slang.type} · {slang.difficulty}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs border-[#222] ${
                        slang.difficulty === 'easy'
                          ? 'text-green-500'
                          : slang.difficulty === 'medium'
                            ? 'text-yellow-500'
                            : 'text-red-500'
                      }`}
                    >
                      {slang.difficulty}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-[#666] hover:text-[#E50914]"
                      onClick={() => {
                        setEditingSlang(slang);
                        setEditingSlangIndex(i);
                        setSlangEditorOpen(true);
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-[#666] hover:text-red-500"
                      onClick={() => setDeleteSlangIndex(i)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-[#666] mt-4">
              Remember to click "Save" at the top to persist slang changes to the database.
            </p>
          </div>
        </div>
      </div>

      <SlangEditor
        open={slangEditorOpen}
        onOpenChange={setSlangEditorOpen}
        slang={editingSlang}
        onSave={handleSaveSlang}
      />

      <AlertDialog open={deleteSlangIndex >= 0} onOpenChange={() => setDeleteSlangIndex(-1)}>
        <AlertDialogContent className="bg-[#111] border-[#222] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete slang word?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#999]">
              Remove "{form.slangWords[deleteSlangIndex]?.word}" from this movie?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#222] text-[#999] bg-transparent">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSlang} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
