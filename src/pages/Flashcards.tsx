import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDictionary } from '../context/DictionaryContext';
import Flashcard from '../components/Flashcard';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRight,
  Trophy,
  Clock,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type SessionState = 'intro' | 'practicing' | 'complete';

interface CardRating {
  word: string;
  rating: 'got-it' | 'learning';
}

export default function FlashcardsPage() {
  const { dictionary } = useDictionary();

  const [sessionState, setSessionState] = useState<SessionState>(
    dictionary.length === 0 ? 'intro' : 'intro'
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<CardRating[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Flashcard words (shuffle on session start)
  const [sessionWords, setSessionWords] = useState(dictionary);
  const shuffledRef = useRef(false);

  // Stats
  const masteredCount = ratings.filter((r) => r.rating === 'got-it').length;
  const reviewingCount = ratings.filter((r) => r.rating === 'learning').length;

  // Timer effect
  useEffect(() => {
    if (sessionState === 'practicing' && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState, startTime]);

  // Format elapsed time
  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  // Shuffle and start session
  const startSession = useCallback(() => {
    if (dictionary.length === 0) return;

    let words = [...dictionary];
    // Fisher-Yates shuffle
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    setSessionWords(words);
    shuffledRef.current = true;
    setCurrentIndex(0);
    setIsFlipped(false);
    setRatings([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    setSessionState('practicing');
  }, [dictionary]);

  // Navigate to next card
  const goNext = useCallback(() => {
    if (currentIndex < sessionWords.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    }
  }, [currentIndex, sessionWords.length]);

  // Navigate to previous card
  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
    }
  }, [currentIndex]);

  // Handle card rating
  const handleRate = useCallback(
    (rating: 'got-it' | 'learning') => {
      const currentWord = sessionWords[currentIndex];
      if (!currentWord) return;

      setRatings((prev) => {
        const filtered = prev.filter((r) => r.word !== currentWord.word);
        return [...filtered, { word: currentWord.word, rating }];
      });

      // Move to next card after a brief delay
      setTimeout(() => {
        if (currentIndex < sessionWords.length - 1) {
          setIsFlipped(false);
          setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
        } else {
          // Session complete
          if (timerRef.current) clearInterval(timerRef.current);
          setSessionState('complete');

          // Confetti celebration
          setTimeout(() => {
            const duration = 3000;
            const end = Date.now() + duration;
            const colors = ['#E50914', '#FFFFFF', '#22C55E', '#F59E0B'];

            const frame = () => {
              confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors,
              });
              confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors,
              });

              if (Date.now() < end) {
                requestAnimationFrame(frame);
              }
            };
            frame();
          }, 300);
        }
      }, 400);
    },
    [currentIndex, sessionWords]
  );

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionState !== 'practicing') return;

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === '1') {
        e.preventDefault();
        if (isFlipped) handleRate('learning');
      } else if (e.key === '2') {
        e.preventDefault();
        if (isFlipped) handleRate('got-it');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionState, isFlipped, goPrev, goNext, handleRate]);

  // Progress percentage
  const progressPercent = sessionWords.length > 0
    ? ((currentIndex + 1) / sessionWords.length) * 100
    : 0;

  // Empty state
  if (dictionary.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-[#050505] pt-[72px]">
        <div className="max-w-[480px] mx-auto px-4 md:px-8 text-center" style={{ padding: '8rem 1rem' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Layers size={64} className="mx-auto text-[#666666]" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6 text-[1.5rem] font-bold text-white"
            style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
          >
            No Words to Practice
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-3 text-[1rem] text-[#999999] leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Save slang words from movies to your dictionary, then come back here to practice them with flashcards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="mt-8"
          >
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 text-[0.875rem] font-semibold uppercase tracking-[0.05em] text-white px-6 py-3 rounded-md transition-all duration-200 hover:translate-y-[-1px]"
              style={{ backgroundColor: '#E50914', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B20710')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E50914')}
            >
              Explore Movies
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Session Intro
  if (sessionState === 'intro') {
    return (
      <div className="min-h-[100dvh] bg-[#050505] pt-[72px]">
        <div
          className="max-w-[600px] mx-auto px-4 md:px-8 text-center flex flex-col items-center justify-center"
          style={{ minHeight: 'calc(100dvh - 72px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)' }}
            >
              <Layers size={36} style={{ color: '#E50914' }} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] }}
            className="mt-6 text-white"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              letterSpacing: '-0.03em',
            }}
          >
            Flashcard Training
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-3 text-[1.125rem] text-[#999999]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Review your saved slang words with interactive flip cards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-8 grid grid-cols-3 gap-4 w-full max-w-[360px]"
          >
            <div className="flex flex-col items-center rounded-xl border border-[#222222] bg-[#111111] p-4">
              <span className="text-[1.75rem] font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                {dictionary.length}
              </span>
              <span className="mt-1 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[#666666]">
                Cards
              </span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-[#222222] bg-[#111111] p-4">
              <span className="text-[1.75rem] font-bold text-[#22C55E]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {dictionary.filter((w) => w.difficulty === 'easy').length}
              </span>
              <span className="mt-1 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[#666666]">
                Easy
              </span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-[#222222] bg-[#111111] p-4">
              <span className="text-[1.75rem] font-bold text-[#EF4444]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {dictionary.filter((w) => w.difficulty === 'hard').length}
              </span>
              <span className="mt-1 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[#666666]">
                Hard
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="mt-10 flex flex-wrap gap-4 justify-center"
          >
            <button
              onClick={startSession}
              className="inline-flex items-center gap-2 text-[1rem] font-semibold uppercase tracking-[0.05em] text-white px-8 py-3.5 rounded-md transition-all duration-200 hover:translate-y-[-1px]"
              style={{ backgroundColor: '#E50914', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B20710')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E50914')}
            >
              Start Session
              <ArrowRight size={18} />
            </button>
            <Link
              to="/dictionary"
              className="inline-flex items-center gap-2 text-[0.875rem] font-semibold text-[#999999] border border-[#222222] px-6 py-3 rounded-md transition-all duration-200 hover:border-[#E50914] hover:text-[#E50914]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Back to Dictionary
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Session Complete
  if (sessionState === 'complete') {
    return (
      <div className="min-h-[100dvh] bg-[#050505] pt-[72px]">
        <div className="max-w-[520px] mx-auto px-4 md:px-8 text-center" style={{ padding: '4rem 1rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
            }}
          >
            <Trophy size={64} style={{ color: '#E50914', margin: '0 auto' }} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-white"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              letterSpacing: '-0.03em',
            }}
          >
            Session Complete!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-3 font-mono text-[0.875rem] text-[#999999]"
          >
            Time: {formatTime(elapsedTime)}
          </motion.p>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            {[
              { number: sessionWords.length, label: 'Total Cards', color: '#FFFFFF' },
              { number: masteredCount, label: 'Mastered', color: '#22C55E' },
              { number: reviewingCount, label: 'To Review', color: '#F59E0B' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.4 + ['Total Cards', 'Mastered', 'To Review'].indexOf(stat.label) * 0.1,
                  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                }}
                className="flex flex-col items-center rounded-xl border border-[#222222] bg-[#111111] p-4 md:p-6"
              >
                <span
                  className="text-[2rem] font-bold"
                  style={{ color: stat.color, fontFamily: 'Inter, sans-serif' }}
                >
                  {stat.number}
                </span>
                <span className="mt-1 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[#666666]">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            <button
              onClick={startSession}
              className="inline-flex items-center gap-2 text-[0.875rem] font-semibold uppercase tracking-[0.05em] text-white px-6 py-3 rounded-md transition-all duration-200 hover:translate-y-[-1px]"
              style={{ backgroundColor: '#E50914', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B20710')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E50914')}
            >
              <RotateCcw size={16} />
              Practice Again
            </button>
            <Link
              to="/dictionary"
              className="inline-flex items-center gap-2 text-[0.875rem] font-semibold text-[#999999] border border-[#222222] px-6 py-3 rounded-md transition-all duration-200 hover:border-[#E50914] hover:text-[#E50914]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Back to Dictionary
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Practicing state
  const currentWord = sessionWords[currentIndex];

  return (
    <div
      className="min-h-[100dvh] bg-[#050505] pt-[72px] flex flex-col"
      style={{
        background:
          'radial-gradient(circle at center, rgba(229,9,20,0.05) 0%, transparent 60%), #050505',
      }}
    >
      {/* Section 1: Session Header */}
      <div className="max-w-[800px] w-full mx-auto px-4 md:px-8" style={{ padding: '96px 1rem 1.5rem' }}>
        {/* Progress bar */}
        <div className="w-full">
          <div className="w-full h-[6px] rounded-full bg-[#111111]">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: '#E50914' }}
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[0.875rem] font-medium text-[#999999]">
              {currentIndex + 1} / {sessionWords.length}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#999999]" />
                <span className="font-mono text-[0.75rem] font-medium text-[#999999]">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} style={{ color: '#22C55E' }} />
                <span className="font-mono text-[0.75rem] font-medium" style={{ color: '#22C55E' }}>
                  {masteredCount} mastered
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Card Stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-4" style={{ padding: '2rem 1rem 3rem', minHeight: '50vh' }}>
        <AnimatePresence mode="wait">
          {currentWord && (
            <motion.div
              key={currentWord.word}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
              className="w-full flex flex-col items-center gap-8"
            >
              <Flashcard
                word={currentWord}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped((prev) => !prev)}
                onRate={handleRate}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center gap-6">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-[#222222] bg-[#111111] text-[#999999] transition-all duration-200 hover:border-[#E50914] hover:text-[#E50914] disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous card"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              setSessionState('complete');
            }}
            className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[#666666] border border-[#222222] rounded-lg px-4 py-2 transition-all duration-200 hover:border-[#E50914] hover:text-[#E50914]"
          >
            End Session
          </button>

          <button
            onClick={goNext}
            disabled={currentIndex === sessionWords.length - 1}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-[#222222] bg-[#111111] text-[#999999] transition-all duration-200 hover:border-[#E50914] hover:text-[#E50914] disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next card"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <p className="mt-6 font-mono text-[0.6875rem] font-medium tracking-[0.02em] text-[#666666]">
          &larr; &rarr; to navigate &nbsp;&bull;&nbsp; Space to flip &nbsp;&bull;&nbsp; 1/2 to rate
        </p>
      </div>
    </div>
  );
}
