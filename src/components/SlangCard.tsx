import { useState, useCallback, useRef } from 'react';
import { Volume2, Heart } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDictionary } from '../context/DictionaryContext';
import type { SlangWord as SlangWordType } from '../data/movies';

gsap.registerPlugin(ScrollTrigger);

const difficultyStyles: Record<string, { bg: string; color: string }> = {
  easy: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
  medium: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  hard: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
};

interface SlangCardProps {
  slang: SlangWordType;
  movieTitle: string;
  movieYear: number;
  translation: string;
  index?: number;
}

export default function SlangCard({
  slang,
  movieTitle,
  movieYear,
  translation,
  index = 0,
}: SlangCardProps) {
  const { isSaved, addWord, removeWord } = useDictionary();
  const saved = isSaved(slang.word);
  const [hovered, setHovered] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
      setHeartAnimating(true);
      if (saved) {
        removeWord(slang.word);
      } else {
        addWord(slang);
      }
      setTimeout(() => setHeartAnimating(false), 300);
    },
    [saved, slang, addWord, removeWord]
  );

  const handleAudio = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (playing) return;
      setPlaying(true);
      const utterance = new SpeechSynthesisUtterance(slang.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
    },
    [playing, slang.word]
  );

  const diffStyle = difficultyStyles[slang.difficulty] || difficultyStyles.medium;

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
        transition: 'border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Card header: tags + heart */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty tag */}
          <span
            className="font-mono font-medium text-[0.6875rem] uppercase tracking-[0.08em] rounded px-2.5 py-1"
            style={{ backgroundColor: diffStyle.bg, color: diffStyle.color }}
          >
            {slang.difficulty}
          </span>
          {/* Type tag */}
          <span
            className="font-mono font-medium text-[0.6875rem] uppercase tracking-[0.08em] rounded px-2.5 py-1"
            style={{
              backgroundColor: '#1A1A1A',
              color: '#999999',
              border: '1px solid #222222',
            }}
          >
            {slang.type}
          </span>
        </div>

        {/* Heart button */}
        <button
          onClick={handleHeartClick}
          className="flex items-center justify-center transition-colors duration-200"
          style={{
            transform: heartAnimating ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s',
            color: saved ? '#E50914' : hovered ? '#E50914' : '#666666',
          }}
          aria-label={saved ? 'Remove from dictionary' : 'Save to dictionary'}
        >
          <Heart
            size={24}
            fill={saved ? '#E50914' : 'none'}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Slang word */}
      <h3
        className="mt-4 font-extrabold text-[2rem] tracking-[-0.02em] text-white"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {slang.word}
      </h3>

      {/* Movie quote */}
      <blockquote
        className="mt-3 pl-3 text-[1rem] italic leading-relaxed"
        style={{
          borderLeft: '3px solid #E50914',
          color: '#999999',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {slang.quote}
      </blockquote>

      {/* Translation section */}
      <div
        className="mt-4 pt-4"
        style={{ borderTop: '1px solid #222222' }}
      >
        <span
          className="font-mono font-medium text-[0.6875rem] uppercase tracking-[0.08em]"
          style={{ color: '#666666' }}
        >
          Translation
        </span>
        <p
          className="mt-1 font-semibold text-[1.25rem]"
          style={{ color: '#E50914', fontFamily: 'Inter, sans-serif' }}
        >
          {translation}
        </p>
      </div>

      {/* Audio button */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleAudio}
          className="flex items-center justify-center rounded-full transition-colors duration-200"
          style={{
            width: '32px',
            height: '32px',
            border: playing ? '1px solid #E50914' : '1px solid #222222',
            background: 'transparent',
            color: playing ? '#E50914' : '#666666',
          }}
          onMouseEnter={(e) => {
            if (!playing) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#E50914';
              (e.currentTarget as HTMLButtonElement).style.color = '#E50914';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(229,9,20,0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!playing) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#222222';
              (e.currentTarget as HTMLButtonElement).style.color = '#666666';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }
          }}
          aria-label="Listen to pronunciation"
        >
          <Volume2 size={16} />
        </button>
        <span
          className="text-[0.8125rem]"
          style={{ color: '#666666', fontFamily: 'Inter, sans-serif' }}
        >
          Listen
        </span>
      </div>

      {/* Source */}
      <p
        className="mt-3 font-mono text-[0.75rem]"
        style={{ color: '#666666' }}
      >
        — {movieTitle} ({movieYear})
      </p>
    </div>
  );
}
