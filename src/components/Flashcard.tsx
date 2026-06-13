import { useState, useCallback } from 'react';
import type { SlangWord } from '../context/DictionaryContext';
import { useLanguage } from '../context/LanguageContext';
import { Volume2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface FlashcardProps {
  word: SlangWord;
  movieTitle?: string;
  onRate?: (rating: 'got-it' | 'learning') => void;
  isFlipped?: boolean;
  onFlip?: () => void;
}

const difficultyConfig = {
  easy: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', label: 'Easy' },
  medium: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: 'Medium' },
  hard: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: 'Hard' },
};

export default function Flashcard({ word, movieTitle, onRate, isFlipped: controlledFlipped, onFlip }: FlashcardProps) {
  const { currentLanguage } = useLanguage();
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped ?? internalFlipped;
  const [borderFlash, setBorderFlash] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const translation = word.translations[currentLanguage] || word.translations['en'] || word.word;
  const diffConfig = difficultyConfig[word.difficulty];

  const handleFlip = useCallback(() => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalFlipped((prev) => !prev);
    }
  }, [onFlip]);

  const handleRate = useCallback(
    (rating: 'got-it' | 'learning') => {
      setBorderFlash(rating === 'got-it' ? '#22C55E' : '#F59E0B');
      setTimeout(() => setBorderFlash(null), 300);
      onRate?.(rating);
    },
    [onRate]
  );

  const handleAudio = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = isFlipped ? translation : word.word;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = isFlipped ? currentLanguage : 'en-US';
        utterance.rate = 0.9;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    },
    [isFlipped, word.word, translation, currentLanguage]
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card container with perspective */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: '1200px', width: 'min(400px, 85vw)', height: 'min(520px, 65vh)' }}
        onClick={handleFlip}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleFlip();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Flashcard. Press Space or Enter to flip."
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 rounded-[20px] flex flex-col items-center p-8 md:p-10"
            style={{
              backfaceVisibility: 'hidden',
              backgroundColor: '#111111',
              border: `2px solid ${borderFlash || '#222222'}`,
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              transition: 'border-color 0.3s ease',
            }}
          >
            {/* Difficulty tag */}
            <span
              className="absolute top-5 right-5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] rounded px-[10px] py-[4px]"
              style={{ backgroundColor: diffConfig.bg, color: diffConfig.color }}
            >
              {diffConfig.label}
            </span>

            {/* Center content */}
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <h2
                className="text-center break-words leading-tight"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                }}
              >
                {word.word}
              </h2>
              <span
                className="mt-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[#999999] border border-[#222222] rounded px-[10px] py-[4px]"
                style={{ backgroundColor: '#1A1A1A' }}
              >
                {word.type}
              </span>
            </div>

            {/* Audio + hint */}
            <div className="mt-auto flex flex-col items-center gap-2">
              <button
                onClick={handleAudio}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[#222222] text-[#666666] transition-all duration-200 hover:border-[#E50914] hover:text-[#E50914]"
                aria-label="Play pronunciation"
              >
                <Volume2 size={18} className={isPlaying ? 'animate-pulse' : ''} />
              </button>
              <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-[#666666]">
                Tap to reveal
              </span>
              <RotateCcw size={16} className="text-[#666666]" />
            </div>
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 rounded-[20px] flex flex-col p-6 md:p-8"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, rgba(229,9,20,0.08) 0%, rgba(139,0,0,0.08) 100%)',
              border: `2px solid ${borderFlash || 'rgba(229,9,20,0.3)'}`,
              boxShadow: '0 12px 40px rgba(229,9,20,0.1)',
              transition: 'border-color 0.3s ease',
            }}
          >
            {/* Translation label */}
            <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[#666666]">
              Translation
            </span>

            {/* Translation */}
            <p
              className="mt-2 break-words leading-tight"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                color: '#E50914',
              }}
            >
              {translation}
            </p>

            {/* Divider */}
            <div className="w-full h-px my-5" style={{ backgroundColor: 'rgba(229,9,20,0.2)' }} />

            {/* Quote label */}
            <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[#666666]">
              Movie Quote
            </span>

            {/* Quote */}
            <div className="mt-2 border-l-[3px] border-l-[#E50914] pl-3">
              <p className="text-[1rem] italic text-[#999999] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                {word.quote}
              </p>
            </div>

            {/* Source movie */}
            {movieTitle && (
              <p className="mt-3 font-mono text-[0.75rem] text-[#666666]">
                {movieTitle}
              </p>
            )}

            {/* Audio button at bottom */}
            <div className="mt-auto flex justify-center pt-4">
              <button
                onClick={handleAudio}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E50914] text-[#E50914] transition-all duration-200 hover:bg-[rgba(229,9,20,0.15)]"
                aria-label="Play pronunciation"
              >
                <Volume2 size={18} className={isPlaying ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rating buttons - only show when flipped */}
      {isFlipped && onRate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRate('learning');
            }}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-[0.875rem] font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: 'rgba(245,158,11,0.15)',
              color: '#F59E0B',
              border: '1px solid rgba(245,158,11,0.3)',
            }}
          >
            <RotateCcw size={16} />
            Still Learning
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRate('got-it');
            }}
            className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-[0.875rem] font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: 'rgba(34,197,94,0.15)',
              color: '#22C55E',
              border: '1px solid rgba(34,197,94,0.3)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Got It!
          </button>
        </motion.div>
      )}
    </div>
  );
}
