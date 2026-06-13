import { useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import {
  Search,
  Film,
  MessageCircle,
  Layers,
  ChevronDown,
  Heart,
  Volume2,
  Globe,
} from 'lucide-react';
import { languages } from '../data/languages';
import { useLanguage } from '../context/LanguageContext';
import { useDictionary } from '../context/DictionaryContext';

gsap.registerPlugin(ScrollTrigger);

/* ─── Difficulty Tag ─── */
function DifficultyTag({ level }: { level: 'easy' | 'medium' | 'hard' }) {
  const colors = {
    easy: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
    medium: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
    hard: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  };
  const c = colors[level];
  return (
    <span
      className="inline-block font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] rounded px-[10px] py-[4px]"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {level}
    </span>
  );
}

/* ─── Type Tag ─── */
function TypeTag({ type }: { type: string }) {
  return (
    <span className="inline-block font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] rounded px-[10px] py-[4px] bg-[#1A1A1A] text-[#999999] border border-[#222222]">
      {type}
    </span>
  );
}

/* ─── Slang Card ─── */
interface SlangCardProps {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  quote: string;
  translation: string;
  movie: string;
}

function SlangCard({ word, difficulty, type, quote, translation, movie }: SlangCardProps) {
  const { addWord, removeWord, isSaved } = useDictionary();
  const saved = isSaved(word);

  const handleHeart = () => {
    if (saved) {
      removeWord(word);
    } else {
      addWord({ word, difficulty, type, quote, translations: { en: translation } });
    }
  };

  return (
    <motion.div
      className="flex-shrink-0 w-[340px] bg-[#111111] border border-[#222222] rounded-[12px] p-6 scroll-snap-align-start transition-all duration-300 hover:border-[#E50914] hover:shadow-[0_0_30px_rgba(229,9,20,0.15)]"
      whileHover={{ y: -4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <DifficultyTag level={difficulty} />
          <TypeTag type={type} />
        </div>
        <button
          onClick={handleHeart}
          className="w-6 h-6 flex items-center justify-center transition-transform duration-200"
          style={{ transform: saved ? 'scale(1.1)' : 'scale(1)' }}
        >
          <Heart
            size={20}
            className="transition-colors duration-200"
            style={{
              color: saved ? '#E50914' : '#666666',
              fill: saved ? '#E50914' : 'none',
            }}
          />
        </button>
      </div>

      <h3 className="text-[2rem] font-extrabold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
        {word}
      </h3>

      <p className="text-[0.875rem] text-[#999999] italic border-l-[3px] border-[#E50914] pl-3 mb-4">
        {quote}
      </p>

      <p className="text-[1.25rem] font-semibold text-[#E50914] mb-4">
        {translation}
      </p>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.75rem] text-[#666666]">{movie}</span>
        <button className="w-8 h-8 rounded-full border border-[#222222] flex items-center justify-center text-[#999999] hover:border-[#E50914] hover:text-[#E50914] transition-colors duration-200">
          <Volume2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Feature Tag ─── */
function FeatureTag({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 border border-white/15 rounded-[20px] px-4 py-[6px] text-[0.8125rem] text-[#999999]">
      {icon}
      {text}
    </span>
  );
}

/* ─── Step Card ─── */
function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative bg-[#111111] border border-[#222222] rounded-[16px] p-10 text-center transition-all duration-300 hover:border-[rgba(229,9,20,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <span
        className="absolute top-6 right-6 text-[4rem] font-black text-[rgba(229,9,20,0.2)] leading-none select-none"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {number}
      </span>
      <div className="flex justify-center mb-6 text-[#E50914]">{icon}</div>
      <h3 className="text-[1.5rem] font-bold text-white mb-3 relative">{title}</h3>
      <p className="text-[1rem] text-[#999999] leading-relaxed relative">{description}</p>
    </div>
  );
}

/* ─── Stat Counter ─── */
function StatCounter({ target, label }: { target: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState('0');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const numericTarget = parseInt(target.replace(/\D/g, ''), 10);
    const suffix = target.replace(/[0-9]/g, '');

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: numericTarget,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            setCount(Math.round(obj.val).toLocaleString() + suffix);
          },
        });
      },
    });

    return () => { trigger.kill(); };
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-[clamp(3rem,8vw,5rem)] font-black text-white leading-none">
        {count}
      </div>
      <div className="mt-2 text-[1rem] font-medium text-white/80 uppercase tracking-[0.1em]">
        {label}
      </div>
    </div>
  );
}

/* ─── Language Item ─── */
function LanguageItem({ flag, name, code }: { flag: string; name: string; code: string }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 py-6 px-4 bg-[#111111] border border-[#222222] rounded-[12px] transition-all duration-200 hover:border-[#E50914] hover:bg-[rgba(229,9,20,0.05)] cursor-default"
      whileHover={{ scale: 1.05 }}
    >
      <span className="text-[2rem]">{flag}</span>
      <span className="text-[0.875rem] font-medium text-white">{name}</span>
      <span className="font-mono text-[0.6875rem] text-[#666666] uppercase">{code}</span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const heroRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const languagesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate('/movies');
      }
    },
    [searchQuery, navigate]
  );

  /* ── Hero entrance GSAP ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-bg', { opacity: 0 }, { opacity: 1, duration: 1.0 })
        .fromTo(
          '.hero-headline',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          0.2
        )
        .fromTo(
          '.hero-tagline',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          0.5
        )
        .fromTo(
          '.hero-search',
          { y: 30, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6 },
          0.7
        )
        .fromTo(
          '.hero-tags .hero-tag',
          { opacity: 0 },
          { opacity: 1, duration: 0.4, stagger: 0.1 },
          0.8
        )
        .fromTo(
          '.hero-scroll',
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          1.0
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  /* ── How It Works scroll ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hiw-label',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          scrollTrigger: { trigger: howItWorksRef.current, start: 'top 85%' },
        }
      );
      gsap.fromTo(
        '.hiw-headline',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.1,
          scrollTrigger: { trigger: howItWorksRef.current, start: 'top 85%' },
        }
      );
      gsap.fromTo(
        '.hiw-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          scrollTrigger: { trigger: '.hiw-grid', start: 'top 80%' },
        }
      );
    }, howItWorksRef);

    return () => ctx.revert();
  }, []);

  /* ── Featured Slangs scroll ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.fs-label, .fs-headline, .fs-sub',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: { trigger: featuredRef.current, start: 'top 85%' },
        }
      );
      gsap.fromTo(
        '.fs-card',
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: { trigger: '.fs-scroll', start: 'top 85%' },
        }
      );
    }, featuredRef);

    return () => ctx.revert();
  }, []);

  /* ── Languages scroll ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.lang-label, .lang-headline, .lang-sub',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: { trigger: languagesRef.current, start: 'top 85%' },
        }
      );
      gsap.fromTo(
        '.lang-item',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          scrollTrigger: { trigger: '.lang-grid', start: 'top 85%' },
        }
      );
    }, languagesRef);

    return () => ctx.revert();
  }, []);

  /* ── Stats scroll ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stats-container',
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 80%' },
        }
      );
    }, statsRef);

    return () => ctx.revert();
  }, []);

  /* ── CTA scroll ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-headline',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' },
        }
      );
      gsap.fromTo(
        '.cta-sub',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.15,
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' },
        }
      );
      gsap.fromTo(
        '.cta-buttons',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.3,
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' },
        }
      );
      gsap.fromTo(
        '.cta-trust',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          delay: 0.5,
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' },
        }
      );
    }, ctaRef);

    return () => ctx.revert();
  }, []);

  /* ── Translation based on current language ── */
  const getTranslation = (word: typeof featuredSlang[0]) => {
    const t = word.translations[currentLanguage as keyof typeof word.translations];
    return t || word.translations.en;
  };

  /* ── Featured slang data ── */
  const featuredSlang = [
    {
      word: 'Binge-watch',
      difficulty: 'easy' as const,
      type: 'Modern',
      quote: '"I\'ve been binge-watching this show all weekend."',
      translations: { en: 'Watch compulsively', ru: 'Смотреть запоем', es: 'Maratón de series', fr: 'Regarder en rafale', de: 'Bingen', it: 'Guardare in maratona', pt: 'Maratonar', ja: '一気見', ko: '정주행', zh: '刷剧', ar: 'مشاهدة متواصلة', hi: 'लगातार देखना', tr: 'Ard arda izlemek', pl: 'Ogladanie na zapas', uk: 'Дивитися запоєм' },
      movie: '— Modern Usage',
    },
    {
      word: 'Chill',
      difficulty: 'easy' as const,
      type: 'Street',
      quote: '"Just chill, man. Everything\'s gonna be fine."',
      translations: { en: 'Relax', ru: 'Расслабься', es: 'Relajate', fr: 'Détends-toi', de: 'Chill mal', it: 'Rilassati', pt: 'Relaxa', ja: '落ち着け', ko: '진정해', zh: '放松', ar: 'هدا', hi: 'शांत रहो', tr: 'Sakin ol', pl: 'Wyluzuj', uk: 'Розслабся' },
      movie: '— The Big Lebowski',
    },
    {
      word: 'Dude',
      difficulty: 'easy' as const,
      type: 'Street',
      quote: '"Dude, where\'s my car?"',
      translations: { en: 'Buddy / Man', ru: 'Чувак', es: 'Tío', fr: 'Mec', de: 'Alter', it: 'Tizio', pt: 'Cara', ja: 'おい', ko: '야', zh: '伙计', ar: 'يا صاح', hi: 'भाई', tr: 'Dostum', pl: 'Ziom', uk: 'Чувак' },
      movie: "— Dude, Where's My Car?",
    },
    {
      word: 'FOMO',
      difficulty: 'medium' as const,
      type: 'Modern',
      quote: '"I have serious FOMO about that party."',
      translations: { en: 'Fear Of Missing Out', ru: 'Страх упустить что-то', es: 'Miedo a perdérselo', fr: 'Peur de manquer', de: 'Angst, etwas zu verpassen', it: 'Paura di perdersi qualcosa', pt: 'Medo de ficar de fora', ja: '取り残される恐怖', ko: '놓칠까봐 두려움', zh: '错失恐惧症', ar: 'الخوف من فوات الأشياء', hi: 'छूटने का डर', tr: 'Kaçırma korkusu', pl: 'Strach przed stratą', uk: 'Страх упустити щось' },
      movie: '— Social Media Era',
    },
    {
      word: 'No cap',
      difficulty: 'medium' as const,
      type: 'Street',
      quote: '"That movie was amazing, no cap."',
      translations: { en: 'No lie / Seriously', ru: 'Без приколов / Честно', es: 'Sin broma', fr: 'Sans mentir', de: 'Ernsthaft', it: 'Sul serio', pt: 'Sério mesmo', ja: 'マジで', ko: '진짜로', zh: '不骗你', ar: 'بجد', hi: 'कोई मजाक नहीं', tr: 'Şaka değil', pl: 'Bez jaj', uk: 'Без жартів' },
      movie: '— Gen Z Slang',
    },
    {
      word: 'Spill the tea',
      difficulty: 'medium' as const,
      type: 'Modern',
      quote: '"Come on, spill the tea! What happened?"',
      translations: { en: 'Share the gossip', ru: 'Выдать секрет / Сплетни', es: 'Soltar la sopa', fr: 'Cracher le morceau', de: 'Die Wahrheit sagen', it: 'Sputare il rospo', pt: 'Contar a fofoca', ja: '情報を漏らす', ko: '떠들어라', zh: '爆料', ar: 'فضح الأسرار', hi: 'राज़ खोलो', tr: 'Dedikodu yay', pl: 'Wygadać się', uk: 'Видати секрет' },
      movie: '— Internet Culture',
    },
  ];

  /* ── Display languages (14) ── */
  const displayLanguages = languages.filter((l) => l.code !== 'en');

  return (
    <div className="bg-[#050505]">
      {/* ═══════════ SECTION 1: HERO ═══════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Background image */}
        <div className="hero-bg absolute inset-0 z-0">
          <img
            src="/hero-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,5,5,0.3) 0%, rgba(5,5,5,0.85) 60%, rgba(5,5,5,1) 100%)',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-[900px] mx-auto">
          {/* Headline */}
          <h1
            className="hero-headline text-white leading-[0.9] tracking-[-0.04em]"
            style={{
              fontSize: 'clamp(4rem, 12vw, 10rem)',
              fontWeight: 900,
              textShadow: '0 0 60px rgba(229,9,20,0.4)',
            }}
          >
            KinoSlang
          </h1>

          {/* Tagline */}
          <p
            className="hero-tagline mt-4 text-[#999999] tracking-[0.02em]"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
          >
            Learn English Slang From the Movies You Love
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hero-search mt-8 w-full max-w-[640px]"
          >
            <div
              className="relative flex items-center rounded-lg border transition-all duration-200 focus-within:border-[#E50914]"
              style={{
                backgroundColor: 'rgba(17,17,17,0.8)',
                backdropFilter: 'blur(8px)',
                borderColor: 'rgba(255,255,255,0.1)',
                height: '56px',
              }}
            >
              <Search
                size={20}
                className="absolute left-4 text-[#666666] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a movie or TV series..."
                className="w-full h-full bg-transparent text-white pl-12 pr-24 text-[0.9375rem] outline-none placeholder:text-[#666666]"
              />
              <button
                type="submit"
                className="absolute right-2 bg-[#E50914] text-white rounded px-5 py-2 text-[0.875rem] font-semibold hover:bg-[#B20710] transition-colors duration-200"
              >
                Go
              </button>
            </div>
          </form>

          {/* Feature Tags */}
          <div className="hero-tags flex flex-wrap justify-center gap-3 mt-6">
            <div className="hero-tag">
              <FeatureTag icon={<Search size={14} />} text="Movie Search" />
            </div>
            <div className="hero-tag">
              <FeatureTag icon={<Globe size={14} />} text="1000+ Slangs" />
            </div>
            <div className="hero-tag">
              <FeatureTag icon={<Globe size={14} />} text="14 Languages" />
            </div>
            <div className="hero-tag">
              <FeatureTag icon={<Heart size={14} />} text="Save Words" />
            </div>
            <div className="hero-tag">
              <FeatureTag icon={<Layers size={14} />} text="Flashcards" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="font-mono text-[0.75rem] text-[#666666] uppercase tracking-wider">
            Scroll to explore
          </span>
          <ChevronDown
            size={20}
            className="text-[#666666] animate-bounce"
            style={{
              animation: 'bounce 2s ease-in-out infinite',
            }}
          />
        </div>
      </section>

      {/* ═══════════ SECTION 2: HOW IT WORKS ═══════════ */}
      <section ref={howItWorksRef} className="py-[8rem] bg-[#050505]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <p className="hiw-label text-center font-mono text-[0.75rem] font-medium uppercase tracking-[0.15em] text-[#666666]">
            HOW IT WORKS
          </p>
          <h2
            className="hiw-headline text-center text-white mt-4"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            Three Steps to Slang Mastery
          </h2>

          <div className="hiw-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div className="hiw-card">
              <StepCard
                number="01"
                icon={<Film size={48} strokeWidth={1.5} />}
                title="Search a Movie"
                description="Find any movie or TV series. Our database contains thousands of films with curated slang collections."
              />
            </div>
            <div className="hiw-card">
              <StepCard
                number="02"
                icon={<MessageCircle size={48} strokeWidth={1.5} />}
                title="Discover Slang"
                description="Explore authentic slang words used in the film. See difficulty levels, usage context, and real movie quotes."
              />
            </div>
            <div className="hiw-card">
              <StepCard
                number="03"
                icon={<Layers size={48} strokeWidth={1.5} />}
                title="Learn & Practice"
                description="Save words to your personal dictionary, get translations in your language, and practice with flashcards."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 3: FEATURED SLANGS ═══════════ */}
      <section
        ref={featuredRef}
        className="py-[8rem]"
        style={{
          background:
            'linear-gradient(180deg, #050505 0%, #0a0a0a 50%, #050505 100%)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <p className="fs-label text-center font-mono text-[0.75rem] font-medium uppercase tracking-[0.15em] text-[#666666]">
            FEATURED SLANG
          </p>
          <h2
            className="fs-headline text-center text-white mt-4"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            Learn From the Biggest Hits
          </h2>
          <p className="fs-sub text-center text-[1.125rem] text-[#999999] mt-2">
            Real slang from popular movies and shows, with translations in 14 languages
          </p>

          <div className="fs-scroll flex gap-6 overflow-x-auto pb-4 mt-8 scrollbar-thin scroll-snap-x mandatory">
            {featuredSlang.map((item) => (
              <div key={item.word} className="fs-card">
                <SlangCard
                  word={item.word}
                  difficulty={item.difficulty}
                  type={item.type}
                  quote={item.quote}
                  translation={getTranslation(item)}
                  movie={item.movie}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 4: SUPPORTED LANGUAGES ═══════════ */}
      <section ref={languagesRef} className="py-[8rem] bg-[#050505]">
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          <p className="lang-label text-center font-mono text-[0.75rem] font-medium uppercase tracking-[0.15em] text-[#666666]">
            14 LANGUAGES
          </p>
          <h2
            className="lang-headline text-center text-white mt-4"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            Learn In Your Native Language
          </h2>
          <p className="lang-sub text-center text-[1.125rem] text-[#999999] mt-2">
            Get instant translations tailored to your language
          </p>

          <div className="lang-grid grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4 mt-12">
            {displayLanguages.map((lang) => (
              <div key={lang.code} className="lang-item">
                <LanguageItem
                  flag={lang.flag}
                  name={lang.name}
                  code={lang.code.toUpperCase()}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 5: STATS ═══════════ */}
      <section ref={statsRef} className="py-16 bg-[#050505] px-4 md:px-8">
        <div
          className="stats-container max-w-[1000px] mx-auto rounded-[16px] py-16 px-8"
          style={{
            background: 'linear-gradient(135deg, #E50914 0%, #8B0000 100%)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StatCounter target="10000" label="Slang Words" />
            <StatCounter target="500" label="Movies & Shows" />
            <StatCounter target="14" label="Languages" />
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 6: CTA ═══════════ */}
      <section ref={ctaRef} className="py-[8rem] bg-[#050505] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(229,9,20,0.08) 0%, transparent 60%)',
          }}
        />
        <div className="relative z-10 max-w-[700px] mx-auto px-4 text-center">
          <h2
            className="cta-headline text-white"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            Start Your Cinematic Journey
          </h2>
          <p className="cta-sub text-[1.125rem] text-[#999999] mt-4 max-w-[560px] mx-auto leading-relaxed">
            Join thousands of learners mastering English slang through movies.
            Create your free account and start building your personal dictionary
            today.
          </p>
          <div className="cta-buttons flex flex-wrap justify-center gap-4 mt-8">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center bg-[#E50914] text-white rounded-md px-6 py-3 text-[0.875rem] font-semibold uppercase tracking-[0.05em] hover:bg-[#B20710] hover:-translate-y-[1px] transition-all duration-200"
            >
              Get Started — It&apos;s Free
            </Link>
            <Link
              to="/movies"
              className="inline-flex items-center justify-center bg-transparent text-white border border-[#222222] rounded-md px-6 py-3 text-[0.875rem] font-semibold uppercase tracking-[0.05em] hover:border-[#E50914] hover:text-[#E50914] transition-all duration-200"
            >
              Explore Movies
            </Link>
          </div>
          <p className="cta-trust mt-6 font-mono text-[0.75rem] text-[#666666]">
            No credit card required &bull; Free forever &bull; Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
