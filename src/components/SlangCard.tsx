import { useState, useCallback, useRef } from 'react';
import { Volume2, Heart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDictionary } from '../context/DictionaryContext';
import { useLanguage } from '../context/LanguageContext';
import type { SlangWord as SlangWordType } from '../data/movies';

gsap.registerPlugin(ScrollTrigger);

const difficultyConfig = {
  easy: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', label: 'Easy' },
  medium: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: 'Medium' },
  hard: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: 'Hard' },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function DifficultyTag({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const cfg = difficultyConfig[difficulty];
  return (
    <span
      className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] rounded px-[10px] py-[4px]"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function TypeTag({ type }: { type: string }) {
  return (
    <span
      className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] rounded px-[10px] py-[4px] border border-[#222222] text-[#999999]"
      style={{ backgroundColor: '#1A1A1A' }}
    >
      {type}
    </span>
  );
}

function AudioButton({ text, size = 32 }: { text: string; size?: number }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, [text]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handlePlay();
      }}
      className="flex items-center justify-center rounded-full border border-[#222222] text-[#999999] transition-all duration-200 hover:border-[#E50914] hover:text-[#E50914] shrink-0"
      style={{ width: size, height: size }}
      aria-label={`Play pronunciation of ${text}`}
    >
      <Volume2 size={size === 32 ? 14 : 16} className={isPlaying ? 'animate-pulse' : ''} />
    </button>
  );
}

function DeleteConfirmButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setConfirming(true);
        }}
        className="text-[#666666] transition-colors duration-200 hover:text-[#EF4444]"
        aria-label="Remove word"
      >
        <Trash2 size={18} />
      </button>
      <AnimatePresence>
        {confirming && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setConfirming(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 bottom-full mb-2 z-50 bg-[#111111] border border-[#222222] rounded-lg shadow-xl p-3 w-[180px]"
            >
              <p className="text-[0.8125rem] text-[#999999] mb-2">Remove this word?</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirming(false);
                  }}
                  className="flex-1 text-[0.75rem] font-medium text-[#999999] border border-[#222222] rounded px-2 py-1 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirm();
                    setConfirming(false);
                  }}
                  className="flex-1 text-[0.75rem] font-medium text-white rounded px-2 py-1 transition-colors"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface SlangCardProps {
  slang?: SlangWordType;
  word?: SlangWordType;
  movieTitle?: string;
  movieYear?: number;
  translation?: string;
  index?: number;
  variant?: 'grid' | 'list';
  showRemove?: boolean;
  onRemove?: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function SlangCard({
  slang,
  word,
  movieTitle,
  movieYear,
  translation: propTranslation,
  index = 0,
  variant = 'grid',
  showRemove = false,
  onRemove,
  saved: savedProp,
  onToggleSave,
}: SlangCardProps) {
  const { isSaved, addWord, removeWord } = useDictionary();
  const { currentLanguage } = useLanguage();

  const slangData = slang ?? word;
  if (!slangData) return null;

  const saved = savedProp ?? isSaved(slangData.word);

  const translation =
    propTranslation ??
    slangData.translations[currentLanguage] ??
    slangData.translations['en'] ??
    slangData.word;

  const [hovered, setHovered] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  /* GSAP scroll reveal */
  useGSAP(
    () => {
      if (!cardRef.current) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: index * 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
      mm.add('(max-width: 767px)', () => {
        gsap.set(cardRef.current, { opacity: 1, y: 0 });
      });
      return () => mm.revert();
    },
    { scope: cardRef, dependencies: [index] }
  );

  const handleHeartClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onToggleSave) {
        onToggleSave();
        setHeartAnimating(true);
        setTimeout(() => setHeartAnimating(false), 300);
        return;
      }
      setHeartAnimating(true);
      if (saved) {
        removeWord(slangData.word);
      } else {
        addWord(slangData);
      }
      setTimeout(() => setHeartAnimating(false), 300);
    },
    [saved, slangData, addWord, removeWord, onToggleSave]
  );

  /* ---------- LIST variant ---------- */
  if (variant === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
        className="flex items-center gap-4 p-4 rounded-xl border border-[#222222] bg-[#111111] hover:border-[rgba(229,9,20,0.3)] transition-colors duration-200"
      >
        <AudioButton text={slangData.word} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white text-base truncate">{slangData.word}</span>
            <DifficultyTag difficulty={slangData.difficulty as 'easy' | 'medium' | 'hard'} />
            <TypeTag type={slangData.type} />
          </div>
          <p className="text-[#999999] text-sm truncate">{translation}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showRemove && onRemove ? (
            <DeleteConfirmButton onConfirm={onRemove} />
          ) : (
            <button
              onClick={handleHeartClick}
              className="transition-transform duration-200"
              style={{
                transform: heartAnimating ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                color: saved ? '#E50914' : '#666666',
              }}
              aria-label={saved ? 'Remove from dictionary' : 'Save to dictionary'}
            >
              <Heart size={20} fill={saved ? '#E50914' : 'none'} strokeWidth={2} />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  /* ---------- GRID variant (default) ---------- */
  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#111111',
        border: hovered ? '1px solid rgba(229,9,20,0.4)' : '1px solid #222222',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: hovered ? '0 4px 24px rgba(229,9,20,0.08)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition:
          'border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Card header: tags + actions */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyTag difficulty={slangData.difficulty as 'easy' | 'medium' | 'hard'} />
          <TypeTag type={slangData.type} />
        </div>

        <div className="flex items-center gap-2">
          <AudioButton text={slangData.word} />
          {showRemove && onRemove ? (
            <DeleteConfirmButton onConfirm={onRemove} />
          ) : (
            <button
              onClick={handleHeartClick}
              className="flex items-center justify-center transition-colors duration-200"
              style={{
                transform: heartAnimating ? 'scale(1.3)' : 'scale(1)',
                transition:
                  'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s',
                color: saved ? '#E50914' : hovered ? '#E50914' : '#666666',
              }}
              aria-label={saved ? 'Remove from dictionary' : 'Save to dictionary'}
            >
              <Heart size={24} fill={saved ? '#E50914' : 'none'} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Slang word */}
      <h3
        className="text-white mb-2"
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '2rem' }}
      >
        {slangData.word}
      </h3>

      {/* Movie quote */}
      <p
        className="italic mb-4"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          color: '#999999',
          borderLeft: '3px solid #E50914',
          paddingLeft: '12px',
          lineHeight: 1.5,
        }}
      >
        &ldquo;{slangData.quote}&rdquo;
      </p>

      {/* Translation */}
      <p
        className="mb-2"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '1.25rem',
          color: '#E50914',
        }}
      >
        {translation}
      </p>

      {/* Source */}
      <p className="font-mono text-[0.75rem] tracking-[0.02em]" style={{ color: '#666666' }}>
        {movieTitle && `${movieTitle}${movieYear ? ` (${movieYear})` : ''}`}
      </p>
    </div>
  );
}
