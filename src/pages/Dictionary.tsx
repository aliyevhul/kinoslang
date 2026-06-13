import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDictionary } from '../context/DictionaryContext';
import { useLanguage } from '../context/LanguageContext';
import SlangCard from '../components/SlangCard';
import {
  Search,
  Grid3X3,
  List,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const filterChips = ['All', 'Easy', 'Medium', 'Hard'] as const;
type FilterChip = (typeof filterChips)[number];

export default function Dictionary() {
  const { dictionary, removeWord } = useDictionary();
  const { currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const containerRef = useRef<HTMLDivElement>(null);

  // Stats
  const stats = useMemo(() => {
    const total = dictionary.length;
    const hard = dictionary.filter((w) => w.difficulty === 'hard').length;
    const street = dictionary.filter(
      (w) =>
        w.type.toLowerCase().includes('street') ||
        w.type.toLowerCase().includes('slang')
    ).length;
    const mastered = Math.floor(total * 0.6); // Placeholder — no real mastery tracking yet
    return { total, hard, street, mastered };
  }, [dictionary]);

  // Filtered words
  const filteredWords = useMemo(() => {
    let words = [...dictionary];

    if (activeFilter !== 'All') {
      const diff = activeFilter.toLowerCase() as 'easy' | 'medium' | 'hard';
      words = words.filter((w) => w.difficulty === diff);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      words = words.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.quote.toLowerCase().includes(q) ||
          (w.translations[currentLanguage] || '')
            .toLowerCase()
            .includes(q) ||
          w.type.toLowerCase().includes(q)
      );
    }

    return words;
  }, [dictionary, activeFilter, searchQuery, currentLanguage]);

  // GSAP scroll reveals for cards
  useGSAP(
    () => {
      if (filteredWords.length === 0) return;

      const cards = containerRef.current?.querySelectorAll('.dictionary-card');
      if (!cards || cards.length === 0) return;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
          },
        }
      );
    },
    { scope: containerRef, dependencies: [filteredWords.length, viewMode] }
  );

  // Animation for stats on load
  const statsRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const statItems = statsRef.current?.querySelectorAll('.stat-item');
      if (!statItems) return;

      gsap.fromTo(
        statItems,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.2,
        }
      );
    },
    { scope: statsRef }
  );

  const handleRemove = useCallback(
    (word: string) => {
      removeWord(word);
    },
    [removeWord]
  );

  // Empty state
  if (dictionary.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-[#050505] pt-[72px]">
        <div className="max-w-[480px] mx-auto px-4 md:px-8 text-center" style={{ padding: '6rem 1rem' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          >
            {/* Empty illustration using SVG */}
            <svg
              width="240"
              height="180"
              viewBox="0 0 240 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <rect x="40" y="20" width="120" height="150" rx="8" fill="#111111" stroke="#222222" strokeWidth="2" />
              <rect x="55" y="45" width="90" height="6" rx="3" fill="#222222" />
              <rect x="55" y="65" width="70" height="4" rx="2" fill="#1A1A1A" />
              <rect x="55" y="80" width="80" height="4" rx="2" fill="#1A1A1A" />
              <rect x="55" y="95" width="60" height="4" rx="2" fill="#1A1A1A" />
              <rect x="55" y="110" width="75" height="4" rx="2" fill="#1A1A1A" />
              <rect x="55" y="125" width="50" height="4" rx="2" fill="#1A1A1A" />
              <rect x="55" y="140" width="65" height="4" rx="2" fill="#1A1A1A" />
              <rect x="170" y="60" width="50" height="40" rx="4" fill="#111111" stroke="#222222" strokeWidth="2" />
              <rect x="175" y="68" width="40" height="3" rx="1.5" fill="#E50914" opacity="0.5" />
              <rect x="175" y="78" width="30" height="2" rx="1" fill="#222222" />
              <rect x="175" y="86" width="35" height="2" rx="1" fill="#222222" />
              <line x1="180" y1="55" x2="185" y2="60" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
              <line x1="210" y1="55" x2="205" y2="60" stroke="#222222" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            className="mt-8 text-[1.5rem] font-bold text-white"
            style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
          >
            Your Dictionary is Empty
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            className="mt-3 text-[1rem] text-[#999999] leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Start exploring movies and save slang words you want to learn. They'll appear here for easy review and practice.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
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

  return (
    <div className="min-h-[100dvh] bg-[#050505] pt-[72px]">
      {/* Section 1: Page Header */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8" style={{ padding: '120px 1rem 2rem' }}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          {/* Title Block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] }}
          >
            <h1
              className="text-white"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
              }}
            >
              My Dictionary
            </h1>
            <p
              className="mt-1 text-[1.125rem] text-[#999999]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Your personal collection of slang words
            </p>
          </motion.div>

          {/* Stats Row + Practice Button */}
          <div className="flex flex-wrap items-center gap-4">
            <div ref={statsRef} className="flex flex-wrap gap-3">
              {[
                { number: stats.total, label: 'Total Words' },
                { number: stats.hard, label: 'Hard Words' },
                { number: stats.street, label: 'Street Slang' },
                { number: stats.mastered, label: 'Mastered' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="stat-item flex flex-col items-center rounded-[10px] border border-[#222222] bg-[#111111] px-5 py-3"
                >
                  <span
                    className="text-[1.5rem] font-bold"
                    style={{ color: '#E50914', fontFamily: 'Inter, sans-serif' }}
                  >
                    {stat.number}
                  </span>
                  <span className="mt-1 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[#666666]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Link
                to="/flashcards"
                className="inline-flex items-center gap-2 text-[0.875rem] font-semibold uppercase tracking-[0.05em] text-white px-6 py-3 rounded-md transition-all duration-200 hover:translate-y-[-1px]"
                style={{ backgroundColor: '#E50914', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B20710')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E50914')}
              >
                <Layers size={16} />
                Practice Flashcards
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Section 2: Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        className="sticky top-[72px] z-40 border-b border-[#222222]"
        style={{ backgroundColor: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full max-w-[360px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search your words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[44px] bg-[#111111] border border-[#222222] rounded-lg pl-10 pr-4 text-[0.9375rem] text-white placeholder-[#666666] transition-all duration-200 focus:outline-none focus:border-[#E50914]"
              style={{ fontFamily: 'Inter, sans-serif', boxShadow: '0 0 0 2px transparent' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #E5091480')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px transparent')}
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {filterChips.map((chip) => {
                const isActive = activeFilter === chip;
                return (
                  <button
                    key={chip}
                    onClick={() => setActiveFilter(chip)}
                    className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] rounded px-[12px] py-[6px] transition-all duration-200 border"
                    style={{
                      backgroundColor: isActive ? '#E50914' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#999999',
                      borderColor: isActive ? '#E50914' : '#222222',
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            {/* View Toggle */}
            <div className="flex border border-[#222222] rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className="flex items-center justify-center w-9 h-9 transition-all duration-200"
                style={{
                  backgroundColor: viewMode === 'grid' ? '#E50914' : 'transparent',
                  color: viewMode === 'grid' ? '#FFFFFF' : '#666666',
                }}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center justify-center w-9 h-9 transition-all duration-200"
                style={{
                  backgroundColor: viewMode === 'list' ? '#E50914' : 'transparent',
                  color: viewMode === 'list' ? '#FFFFFF' : '#666666',
                }}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 3: Saved Words Grid / List */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8" style={{ padding: '2rem 1rem' }}>
        <AnimatePresence mode="wait">
          {filteredWords.length > 0 ? (
            <motion.div
              key={`${viewMode}-${activeFilter}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'grid' ? (
                <div
                  ref={containerRef}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filteredWords.map((word) => (
                    <div key={word.word} className="dictionary-card">
                      <SlangCard
                        word={word}
                        saved={true}
                        onToggleSave={() => handleRemove(word.word)}
                        showRemove={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div ref={containerRef} className="flex flex-col gap-3">
                  {filteredWords.map((word) => (
                    <div key={word.word} className="dictionary-card">
                      <SlangCard
                        word={word}
                        saved={true}
                        onToggleSave={() => handleRemove(word.word)}
                        showRemove={true}
                        variant="list"
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <p className="text-[1.125rem] text-[#999999]" style={{ fontFamily: 'Inter, sans-serif' }}>
                No words match your search.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('All');
                }}
                className="mt-4 text-[0.875rem] font-medium transition-colors duration-200 hover:text-white"
                style={{ color: '#E50914', fontFamily: 'Inter, sans-serif' }}
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section 4: Practice CTA */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center" style={{ padding: '3rem 1rem 4rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        >
          <h2
            className="text-[1.75rem] font-bold text-white"
            style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
          >
            Ready to Practice?
          </h2>
          <p
            className="mt-2 text-[1rem] text-[#999999]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Turn your saved words into flashcards and test your memory.
          </p>
          <div className="mt-6">
            <Link
              to="/flashcards"
              className="inline-flex items-center gap-2 text-[1rem] font-semibold uppercase tracking-[0.05em] text-white px-8 py-3.5 rounded-md transition-all duration-200 hover:translate-y-[-1px]"
              style={{ backgroundColor: '#E50914', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B20710')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E50914')}
            >
              <Layers size={18} />
              Start Flashcard Training
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
