import { useState, useCallback } from 'react';
import type { SlangWord } from '../context/DictionaryContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Trash2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlangCardProps {
  word: SlangWord;
  saved?: boolean;
  onToggleSave?: () => void;
  showRemove?: boolean;
  movieTitle?: string;
  variant?: 'grid' | 'list';
}

const difficultyConfig = {
  easy: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', label: 'Easy' },
  medium: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: 'Medium' },
  hard: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: 'Hard' },
};

function AudioButton({ text, size = 32 }: { text: string; size?: number }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [text]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handlePlay();
      }}
      className="flex items-center justify-center rounded-full border border-[#222222] text-[#999999] transition-all duration-200 hover:border-[#E50914] hover:text-[#E50914] shrink-0"
      style={{
        width: size,
        height: size,
      }}
      aria-label={`Play pronunciation of ${text}`}
    >
      <Volume2 size={size === 32 ? 14 : 16} className={isPlaying ? 'animate-pulse' : ''} />
    </button>
  );
}

function DifficultyTag({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const config = difficultyConfig[difficulty];
  return (
    <span
      className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] rounded px-[10px] py-[4px]"
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
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
            <div
              className="fixed inset-0 z-40"
              onClick={() => setConfirming(false)}
            />
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

export default function SlangCard({
  word,
  saved = false,
  onToggleSave,
  showRemove = false,
  movieTitle,
  variant = 'grid',
}: SlangCardProps) {
  const { currentLanguage } = useLanguage();
  const translation = word.translations[currentLanguage] || word.translations['en'] || word.word;

  if (variant === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        className="flex items-center gap-4 rounded-[10px] border border-[#222222] bg-[#111111] px-5 py-4 transition-colors duration-200 hover:border-[rgba(229,9,20,0.3)]"
      >
        <div className="shrink-0">
          <DifficultyTag difficulty={word.difficulty} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[1.125rem] font-bold text-white truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
            {word.word}
          </p>
        </div>
        <p className="text-[0.9375rem] font-medium shrink-0 hidden sm:block" style={{ color: '#E50914', fontFamily: 'Inter, sans-serif' }}>
          {translation}
        </p>
        {movieTitle && (
          <span className="font-mono text-[0.75rem] text-[#666666] shrink-0 hidden md:block">
            {movieTitle}
          </span>
        )}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <AudioButton text={word.word} size={32} />
          {showRemove && onToggleSave ? (
            <DeleteConfirmButton onConfirm={onToggleSave} />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave?.();
              }}
              className="text-[#E50914] transition-all duration-200 hover:scale-110"
              aria-label={saved ? 'Remove from dictionary' : 'Save to dictionary'}
            >
              <Heart size={18} fill={saved ? '#E50914' : 'none'} />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="rounded-xl border border-[#222222] bg-[#111111] p-6 transition-all duration-300 hover:border-[#E50914] hover:shadow-[0_0_20px_rgba(229,9,20,0.15)]"
    >
      {/* Top row: tags + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyTag difficulty={word.difficulty} />
          <TypeTag type={word.type} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AudioButton text={word.word} size={32} />
          {showRemove && onToggleSave ? (
            <DeleteConfirmButton onConfirm={onToggleSave} />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave?.();
              }}
              className="transition-all duration-200 hover:scale-110"
              style={{ color: saved ? '#E50914' : '#666666' }}
              aria-label={saved ? 'Remove from dictionary' : 'Save to dictionary'}
            >
              <Heart size={20} fill={saved ? '#E50914' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* Slang word */}
      <h3
        className="mt-4 text-[2rem] font-extrabold text-white leading-tight break-words"
        style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
      >
        {word.word}
      </h3>

      {/* Movie quote */}
      <div className="mt-3 border-l-[3px] border-l-[#E50914] pl-3">
        <p className="text-[0.9375rem] italic text-[#999999] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          {word.quote}
        </p>
      </div>

      {/* Translation */}
      <p
        className="mt-4 text-[1.25rem] font-semibold leading-snug"
        style={{ color: '#E50914', fontFamily: 'Inter, sans-serif' }}
      >
        {translation}
      </p>

      {/* Source movie */}
      {movieTitle && (
        <p className="mt-4 font-mono text-[0.75rem] text-[#666666] leading-tight">
          {movieTitle}
        </p>
      )}
    </motion.div>
  );
}
