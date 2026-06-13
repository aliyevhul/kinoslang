import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Film } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { movies } from '../data/movies';
import MoviePosterCard from '../components/MoviePosterCard';

gsap.registerPlugin(ScrollTrigger);

const sortOptions = ['Popular', 'Newest', 'A-Z', 'Most Slangs'];

export default function Movies() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');
  const [sortOpen, setSortOpen] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Extract unique genres from movies + merge with defaults
  const movieGenres = useMemo(() => {
    const gSet = new Set<string>();
    movies.forEach((m) => m.genre.forEach((g) => gSet.add(g)));
    return ['All', ...Array.from(gSet).sort()];
  }, []);

  // Filter + sort movies
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.some((g) => g.toLowerCase().includes(q))
      );
    }

    if (activeGenre !== 'All') {
      result = result.filter((m) => m.genre.includes(activeGenre));
    }

    switch (sortBy) {
      case 'Newest':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'A-Z':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'Most Slangs':
        result.sort((a, b) => b.slangWords.length - a.slangWords.length);
        break;
      default:
        // Popular — default order
        break;
    }

    return result;
  }, [searchQuery, activeGenre, sortBy]);

  // Autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase();
    return movies
      .filter((m) => m.title.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery]);

  // Hero entrance animation
  useGSAP(
    () => {
      if (!heroRef.current) return;
      const tl = gsap.timeline();
      tl.fromTo(
        heroRef.current.querySelectorAll('.hero-title, .hero-subtitle'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        }
      ).fromTo(
        heroRef.current.querySelector('.hero-search'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      );
    },
    { scope: heroRef }
  );

  // Filter chips entrance animation
  useGSAP(
    () => {
      if (!filtersRef.current) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        gsap.fromTo(
          filtersRef.current!.querySelectorAll('.filter-chip'),
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            stagger: 0.03,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: filtersRef.current,
              start: 'top 95%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: filtersRef }
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
        setAutocompleteOpen(false);
        setSortOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setSortOpen(false);
      }
    };
    if (sortOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sortOpen]);

  const handleAutocompleteSelect = useCallback(
    (movieId: string) => {
      setAutocompleteOpen(false);
      setSearchQuery('');
      navigate(`/slang/${movieId}`);
    },
    [navigate]
  );

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveGenre('All');
    setSortBy('Popular');
  }, []);

  const showAutocomplete =
    focused && autocompleteOpen && autocompleteSuggestions.length > 0;
  const showAutocompleteEmpty =
    focused && autocompleteOpen && searchQuery.trim().length >= 2 && autocompleteSuggestions.length === 0;

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: '#050505' }}>
      {/* ====== Section 1: Search Hero ====== */}
      <div
        ref={heroRef}
        className="relative flex flex-col items-center justify-center text-center"
        style={{
          height: 'clamp(240px, 40vw, 320px)',
          paddingTop: '72px',
        }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/movie-search-bg.jpg)',
            zIndex: 0,
          }}
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,5,5,0.6) 0%, rgba(5,5,5,0.95) 100%)',
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-[720px]">
          <h1
            className="hero-title font-extrabold tracking-[-0.03em] text-white"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Find Your Movie
          </h1>
          <p
            className="hero-subtitle mt-2 font-normal"
            style={{
              fontSize: '1.125rem',
              color: '#999999',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Search for films and series to discover the slang used inside
          </p>

          {/* Search bar */}
          <div className="hero-search relative w-full mt-8">
            <div
              className="flex items-center w-full"
              style={{
                height: '56px',
                backgroundColor: 'rgba(17,17,17,0.9)',
                backdropFilter: 'blur(12px)',
                borderRadius: '8px',
                border: focused
                  ? '1px solid #E50914'
                  : '1px solid rgba(255,255,255,0.15)',
                boxShadow: focused
                  ? '0 0 0 3px rgba(229,9,20,0.2)'
                  : 'none',
                transition:
                  'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <Search
                size={20}
                className="ml-4 shrink-0"
                style={{ color: '#666666' }}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setAutocompleteOpen(true);
                }}
                onFocus={() => {
                  setFocused(true);
                  setAutocompleteOpen(true);
                }}
                onBlur={() => {
                  setFocused(false);
                  setTimeout(() => setAutocompleteOpen(false), 200);
                }}
                placeholder="Type a movie title..."
                className="flex-1 bg-transparent outline-none ml-3 text-white placeholder:text-[#666666]"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '0.9375rem',
                }}
              />
            </div>

            {/* Autocomplete dropdown */}
            {(showAutocomplete || showAutocompleteEmpty) && (
              <div
                className="absolute left-0 right-0 mt-1 overflow-y-auto"
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid #222222',
                  borderRadius: '8px',
                  maxHeight: '320px',
                  zIndex: 50,
                  animation: 'autoDropdownIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {showAutocompleteEmpty ? (
                  <p
                    className="text-center py-4"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.875rem',
                      color: '#666666',
                    }}
                  >
                    No movies found
                  </p>
                ) : (
                  autocompleteSuggestions.map((movie) => (
                    <button
                      key={movie.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAutocompleteSelect(movie.id)}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 transition-colors duration-150"
                      style={{
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          '#1A1A1A';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          'transparent';
                      }}
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="shrink-0 object-cover"
                        style={{
                          width: '40px',
                          height: '56px',
                          borderRadius: '4px',
                        }}
                      />
                      <span
                        className="flex-1 font-medium truncate"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.9375rem',
                          color: '#FFFFFF',
                        }}
                      >
                        {movie.title}
                      </span>
                      <span
                        className="font-mono shrink-0"
                        style={{
                          fontSize: '0.75rem',
                          color: '#666666',
                        }}
                      >
                        {movie.year}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== Section 2: Filters ====== */}
      <div
        ref={filtersRef}
        className="sticky flex items-center justify-between flex-wrap gap-4"
        style={{
          top: '72px',
          backgroundColor: 'rgba(5,5,5,0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 40,
          borderBottom: '1px solid #222222',
          padding: '1.5rem 0',
        }}
      >
        <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 lg:px-16 flex items-center justify-between flex-wrap gap-4">
          {/* Genre chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {movieGenres.map((genre) => {
              const isActive = activeGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setActiveGenre(genre)}
                  className="filter-chip font-medium transition-colors duration-200"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.8125rem',
                    fontFamily: 'Inter, sans-serif',
                    border: isActive
                      ? '1px solid #E50914'
                      : '1px solid #222222',
                    background: isActive ? '#E50914' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#999999',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        'rgba(255,255,255,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.color = '#999999';
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        '#222222';
                    }
                  }}
                >
                  {genre}
                </button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <div ref={sortDropdownRef} className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 font-medium transition-colors duration-200"
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontFamily: 'Inter, sans-serif',
                border: '1px solid #222222',
                background: 'transparent',
                color: '#999999',
              }}
            >
              Sort by: {sortBy}
              <ChevronDown
                size={14}
                style={{
                  transform: sortOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>

            {sortOpen && (
              <div
                className="absolute right-0 mt-2"
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid #222222',
                  borderRadius: '8px',
                  minWidth: '180px',
                  zIndex: 50,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  animation: 'sortDropdownIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {sortOptions.map((opt) => {
                  const isSelected = sortBy === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setSortOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 transition-colors duration-150"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.875rem',
                        color: isSelected ? '#FFFFFF' : '#999999',
                        background: 'transparent',
                        borderLeft: isSelected
                          ? '3px solid #E50914'
                          : '3px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          '#1A1A1A';
                        (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color =
                          isSelected ? '#FFFFFF' : '#999999';
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== Section 3: Movie Grid ====== */}
      <div
        ref={gridRef}
        className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16"
        style={{ padding: '2rem 0 4rem' }}
      >
        {/* Results count */}
        <p
          className="mb-6 font-normal"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            color: '#999999',
          }}
        >
          {filteredMovies.length} result{filteredMovies.length !== 1 ? 's' : ''}
        </p>

        {filteredMovies.length > 0 ? (
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
            }}
          >
            {filteredMovies.map((movie, i) => (
              <div
                key={movie.id}
                className="sm:col-span-1"
                style={{
                  gridColumn: 'span 1',
                }}
              >
                <MoviePosterCard
                  id={movie.id}
                  title={movie.title}
                  year={movie.year}
                  poster={movie.poster}
                  slangCount={movie.slangWords.length}
                  index={i}
                />
              </div>
            ))}
          </div>
        ) : (
          /* ====== Section 4: Empty State ====== */
          <div
            className="flex flex-col items-center text-center mx-auto"
            style={{ padding: '4rem 0', maxWidth: '480px' }}
          >
            <Film
              size={64}
              style={{ color: '#666666' }}
              strokeWidth={1.5}
            />
            <h3
              className="mt-6 font-bold"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.5rem',
                color: '#FFFFFF',
              }}
            >
              No movies found
            </h3>
            <p
              className="mt-2 font-normal"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                color: '#999999',
              }}
            >
              Try adjusting your search or filters. We&apos;re constantly adding new
              movies!
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 font-semibold uppercase tracking-[0.05em] transition-all duration-200"
              style={{
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontFamily: 'Inter, sans-serif',
                border: '1px solid #222222',
                background: 'transparent',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#E50914';
                (e.currentTarget as HTMLButtonElement).style.color = '#E50914';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#222222';
                (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes autoDropdownIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sortDropdownIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 768px) {
          .grid[style*="grid-template-columns: repeat(2, 1fr)"] {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1.25rem !important;
          }
        }
        @media (min-width: 1024px) {
          .grid[style*="grid-template-columns: repeat(2, 1fr)"] {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 1.5rem !important;
          }
        }
        @media (min-width: 1280px) {
          .grid[style*="grid-template-columns: repeat(2, 1fr)"] {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
