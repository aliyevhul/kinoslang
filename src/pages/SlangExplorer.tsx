import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Globe } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMovies } from '../context/MoviesContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { languages } from '../data/languages';
import SlangCard from '../components/SlangCard';

gsap.registerPlugin(ScrollTrigger);

export default function SlangExplorer() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMovieById, loading: moviesLoading } = useMovies();
  const { currentLanguage, setLanguage } = useLanguage();

  const headerRef = useRef<HTMLDivElement>(null);
  const langBarRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const langDropdownPanelRef = useRef<HTMLDivElement>(null);

  const movie = useMemo(
    () => (movieId ? getMovieById(movieId) : undefined),
    [movieId, getMovieById]
  );

  // Current language info
  const currentLang = useMemo(
    () => languages.find((l) => l.code === currentLanguage) || languages[0],
    [currentLanguage]
  );

  // Language change flash effect
  const [flashKey, setFlashKey] = useState(0);
  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    setLangDropdownOpen(false);
    setFlashKey((k) => k + 1);
  };

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        langDropdownPanelRef.current &&
        langDropdownTriggerRef.current &&
        !langDropdownPanelRef.current.contains(e.target as Node) &&
        !langDropdownTriggerRef.current.contains(e.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    };
    if (langDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [langDropdownOpen]);

  // Header entrance animation
  useGSAP(
    () => {
      if (!headerRef.current || !movie) return;
      const tl = gsap.timeline();
      tl.fromTo(
        headerRef.current.querySelector('.header-poster'),
        { opacity: 0, x: -30, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          ease: 'cubic-bezier(0.65, 0, 0.35, 1)',
        }
      )
        .fromTo(
          headerRef.current.querySelector('.header-title'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.45'
        )
        .fromTo(
          headerRef.current.querySelector('.header-meta'),
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.25'
        )
        .fromTo(
          headerRef.current.querySelector('.header-desc'),
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          '-=0.15'
        )
        .fromTo(
          headerRef.current.querySelector('.header-buttons'),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          '-=0.15'
        );
    },
    { scope: headerRef, dependencies: [movie] }
  );

  // Language bar entrance animation
  useGSAP(
    () => {
      if (!langBarRef.current || !movie) return;
      gsap.fromTo(
        langBarRef.current,
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
          delay: 0.5,
        }
      );
    },
    { scope: langBarRef, dependencies: [movie] }
  );

  // CTA entrance animation
  useGSAP(
    () => {
      if (!ctaRef.current || !movie) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: ctaRef, dependencies: [movie] }
  );

  // Flash effect on language change
  useGSAP(
    () => {
      if (!gridRef.current || flashKey === 0) return;
      const cards = gridRef.current.querySelectorAll('.slang-card-wrapper');
      gsap.fromTo(
        cards,
        { backgroundColor: 'rgba(229,9,20,0.05)' },
        {
          backgroundColor: 'rgba(229,9,20,0)',
          duration: 0.3,
          ease: 'power2.out',
        }
      );
    },
    { scope: gridRef, dependencies: [flashKey] }
  );

  if (moviesLoading) {
    return (
      <div
        className="min-h-[100dvh] flex items-center justify-center"
        style={{ backgroundColor: '#050505' }}
      >
        <p className="text-[#666]">Loading...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center text-center px-4"
        style={{ backgroundColor: '#050505' }}
      >
        <h1
          className="font-bold text-white"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.5rem',
          }}
        >
          Movie not found
        </h1>
        <p
          className="mt-2"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: '#999999',
          }}
        >
          The movie you&apos;re looking for doesn&apos;t exist in our database.
        </p>
        <button
          onClick={() => navigate('/movies')}
          className="mt-6 flex items-center gap-2 font-semibold uppercase tracking-[0.05em] text-[0.875rem] transition-colors duration-200"
          style={{
            padding: '12px 24px',
            borderRadius: '6px',
            border: '1px solid #222222',
            background: 'transparent',
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
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
          <ArrowLeft size={16} />
          Back to Movies
        </button>
      </div>
    );
  }

  const genreString = movie.genre.join(' / ');

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: '#050505' }}>
      {/* ====== Section 1: Movie Header ====== */}
      <div
        ref={headerRef}
        className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12"
        style={{ padding: '120px 0 3rem' }}
      >
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* Poster */}
          <div className="header-poster shrink-0 mx-auto md:mx-0">
            <img
              src={movie.poster}
              alt={movie.title}
              className="object-cover"
              style={{
                width: 'clamp(160px, 30vw, 280px)',
                height: 'auto',
                aspectRatio: '2/3',
                borderRadius: '12px',
                border: '1px solid #222222',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            />
          </div>

          {/* Info block */}
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            {/* Title */}
            <h1
              className="header-title font-extrabold text-white tracking-[-0.03em]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              }}
            >
              {movie.title}
            </h1>

            {/* Meta row */}
            <div className="header-meta flex items-center gap-3 flex-wrap">
              <span
                className="font-mono font-medium text-[0.75rem] rounded px-2.5 py-1"
                style={{
                  color: '#999999',
                  border: '1px solid #222222',
                }}
              >
                {movie.year}
              </span>
              <span
                className="font-mono font-medium text-[0.75rem] rounded px-2.5 py-1"
                style={{
                  color: '#999999',
                  border: '1px solid #222222',
                }}
              >
                {genreString}
              </span>
            </div>

            {/* Slang count badge */}
            <div
              className="flex items-center gap-2 self-start"
              style={{
                backgroundColor: 'rgba(229,9,20,0.1)',
                border: '1px solid rgba(229,9,20,0.3)',
                borderRadius: '20px',
                padding: '6px 14px',
              }}
            >
              <Globe size={14} style={{ color: '#E50914' }} />
              <span
                className="font-semibold text-[0.8125rem]"
                style={{ color: '#E50914', fontFamily: 'Inter, sans-serif' }}
              >
                {movie.slangWords.length} slang
                {movie.slangWords.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Description */}
            <p
              className="header-desc font-normal leading-relaxed max-w-[600px]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                color: '#999999',
                lineHeight: 1.6,
              }}
            >
              Explore the slang words and expressions from {movie.title} ({movie.year}).
              Click the heart icon to save words to your personal dictionary, or listen
              to the pronunciation using the audio button.
            </p>

            {/* Action buttons */}
            <div className="header-buttons flex items-center gap-4 mt-2 flex-wrap">
              <Link
                to={`/flashcards?movie=${movie.id}`}
                className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.05em] text-[0.875rem] transition-all duration-200"
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  backgroundColor: '#E50914',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#B20710';
                  (e.currentTarget as HTMLAnchorElement).style.transform =
                    'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#E50914';
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                }}
              >
                <GraduationCap size={16} />
                Start Training
              </Link>
              <button
                onClick={() => navigate('/movies')}
                className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.05em] text-[0.875rem] transition-all duration-200"
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  border: '1px solid #222222',
                  background: 'transparent',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
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
                <ArrowLeft size={16} />
                Back to Movies
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====== Section 2: Language Selector Bar ====== */}
      <div
        ref={langBarRef}
        className="sticky"
        style={{
          top: '72px',
          backgroundColor: 'rgba(5,5,5,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #222222',
          padding: '1rem 0',
          zIndex: 40,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between flex-wrap gap-4">
          {/* Current language label */}
          <div className="flex items-center gap-2">
            <span className="text-[1.25rem]">{currentLang.flag}</span>
            <span
              className="font-medium text-[0.9375rem] text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Translation:{" "}
              <span style={{ color: '#999999' }}>
                {currentLang.flag} {currentLang.name}
              </span>
            </span>
          </div>

          {/* Language dropdown trigger */}
          <div className="relative">
            <button
              ref={langDropdownTriggerRef}
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="font-medium transition-colors duration-200"
              style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontFamily: 'Inter, sans-serif',
                borderRadius: '6px',
                border: '1px solid #222222',
                background: 'transparent',
                color: '#999999',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#E50914';
                (e.currentTarget as HTMLButtonElement).style.color = '#E50914';
              }}
              onMouseLeave={(e) => {
                if (!langDropdownOpen) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#222222';
                  (e.currentTarget as HTMLButtonElement).style.color = '#999999';
                }
              }}
            >
              Change Language
            </button>

            {langDropdownOpen && (
              <div
                ref={langDropdownPanelRef}
                className="absolute right-0 mt-2 overflow-y-auto"
                style={{
                  top: '100%',
                  backgroundColor: '#111111',
                  border: '1px solid #222222',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  minWidth: '220px',
                  maxHeight: '360px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  zIndex: 50,
                  animation:
                    'langPanelIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {languages.map((lang) => {
                  const isActive = lang.code === currentLanguage;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className="flex items-center gap-3 w-full text-left transition-colors duration-150"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: isActive
                          ? 'rgba(229,9,20,0.1)'
                          : 'transparent',
                        borderLeft: isActive
                          ? '3px solid #E50914'
                          : '3px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = '#1A1A1A';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span className="text-[1.25rem] shrink-0">
                        {lang.flag}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium text-[0.875rem] truncate"
                          style={{
                            color: '#FFFFFF',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          {lang.name}
                        </p>
                      </div>
                      {isActive && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="shrink-0"
                        >
                          <path
                            d="M3 8L6.5 11.5L13 4.5"
                            stroke="#E50914"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== Section 3: Slang Cards Grid ====== */}
      <div
        ref={gridRef}
        className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12"
        style={{ padding: '2rem 0 4rem' }}
      >
        {movie.slangWords.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {movie.slangWords.map((slang, i) => (
              <div
                key={slang.word}
                className="slang-card-wrapper"
                style={{ borderRadius: '16px' }}
              >
                <SlangCard
                  slang={slang}
                  movieTitle={movie.title}
                  movieYear={movie.year}
                  translation={
                    slang.translations[currentLanguage] ||
                    slang.translations['en'] ||
                    slang.word
                  }
                  index={i}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center text-center py-16">
            <p
              className="font-bold text-[1.25rem] text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              No slang words yet
            </p>
            <p
              className="mt-2 text-[0.9375rem]"
              style={{ color: '#999999', fontFamily: 'Inter, sans-serif' }}
            >
              We&apos;re still adding slang words for this movie. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* ====== Section 4: CTA Banner ====== */}
      <div
        ref={ctaRef}
        style={{
          background:
            'linear-gradient(135deg, rgba(229,9,20,0.1) 0%, rgba(139,0,0,0.1) 100%)',
          borderTop: '1px solid #222222',
          borderBottom: '1px solid #222222',
          padding: '3rem 0',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2
              className="font-bold text-[1.5rem] text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Save These Words to Your Dictionary
            </h2>
            <p
              className="mt-1 text-[0.9375rem]"
              style={{
                color: '#999999',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Create a free account to save slang words, track your progress,
              and practice with flashcards.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!user && (
              <Link
                to="/profile"
                className="font-semibold uppercase tracking-[0.05em] text-[0.875rem] transition-all duration-200"
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  backgroundColor: '#E50914',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    '#B20710';
                  (e.currentTarget as HTMLAnchorElement).style.transform =
                    'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    '#E50914';
                  (e.currentTarget as HTMLAnchorElement).style.transform =
                    'translateY(0)';
                }}
              >
                Sign Up Free
              </Link>
            )}
            <Link
              to="/dictionary"
              className="font-semibold uppercase tracking-[0.05em] text-[0.875rem] transition-all duration-200"
              style={{
                padding: '12px 24px',
                borderRadius: '6px',
                border: '1px solid #222222',
                background: 'transparent',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E50914';
                (e.currentTarget as HTMLAnchorElement).style.color = '#E50914';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#222222';
                (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF';
              }}
            >
              Go to Dictionary
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes langPanelIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
