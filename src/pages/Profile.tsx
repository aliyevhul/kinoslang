import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Zap,
  MessageCircle,
  Flame,
  Star,
  Check,
  RotateCcw,
  ChevronRight,
  Camera,
  LogOut,
  Trophy,
  Heart,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useDictionary } from '../context/DictionaryContext';
import { useModal } from '../context/ModalContext';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── helpers ── */
function getRankTitle(words: number): string {
  if (words >= 1000) return 'Slang Legend';
  if (words >= 500) return 'Slang Master';
  if (words >= 200) return 'Movie Buff';
  if (words >= 50) return 'Legend';
  if (words >= 20) return 'Mafia Don';
  if (words >= 10) return 'Gangster';
  if (words >= 5) return 'Local';
  if (words >= 2) return 'Wanderer';
  return 'Newbie';
}

/* ── activity mock data ── */
const ACTIVITIES = [
  {
    id: 1,
    type: 'saved' as const,
    text: "Saved 'no cap' from Friends",
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'mastered' as const,
    text: "Mastered 'chill' in flashcards",
    time: '5 hours ago',
  },
  {
    id: 3,
    type: 'saved' as const,
    text: "Saved 'FOMO' from Social Media",
    time: '1 day ago',
  },
  {
    id: 4,
    type: 'practiced' as const,
    text: 'Practiced 12 words',
    time: '1 day ago',
  },
  {
    id: 5,
    type: 'saved' as const,
    text: "Saved 'spill the tea' from Internet",
    time: '2 days ago',
  },
  {
    id: 6,
    type: 'mastered' as const,
    text: "Mastered 'ghost' from dating apps",
    time: '3 days ago',
  },
  {
    id: 7,
    type: 'saved' as const,
    text: "Saved 'lit' from The Hangover",
    time: '4 days ago',
  },
];

const ACTIVITY_ICON = {
  saved: { icon: Heart, bg: 'rgba(229,9,20,0.1)', color: '#E50914' },
  mastered: { icon: Check, bg: 'rgba(34,197,94,0.1)', color: '#22C55E' },
  practiced: { icon: RotateCcw, bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
};

/* ── chart helpers ── */

/* ── chart data (from real dictionary) ── */
function getDifficultyData(dictionary: { difficulty: string }[]) {
  const easy = dictionary.filter((w) => w.difficulty === 'easy').length;
  const medium = dictionary.filter((w) => w.difficulty === 'medium').length;
  const hard = dictionary.filter((w) => w.difficulty === 'hard').length;
  return [
    { name: 'Easy', value: easy || 0, color: '#22C55E' },
    { name: 'Medium', value: medium || 0, color: '#F59E0B' },
    { name: 'Hard', value: hard || 0, color: '#EF4444' },
  ];
}

function getTypeData(dictionary: { type: string }[]) {
  const typeCounts: Record<string, number> = {};
  dictionary.forEach((w) => {
    const t = w.type;
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const colors = ['#E50914', '#3B82F6', '#8B5CF6', '#F59E0B', '#22C55E', '#6B7280', '#F97316', '#EC4899'];
  return Object.entries(typeCounts)
    .map(([name, count], i) => ({ name, count, color: colors[i % colors.length] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

/* ── component ── */
export default function Profile() {
  const { user, logout } = useAuth();
  const { dictionary } = useDictionary();
  const { openAuth } = useModal();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [nativeLang, setNativeLang] = useState('en');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  /* refs for GSAP */
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const activityItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* derived stats */
  const totalWords = dictionary.length;
  const hardWords = dictionary.filter((w) => w.difficulty === 'hard').length;
  const streetSlang = dictionary.filter((w) => w.type.toLowerCase().includes('street')).length;
  const rankTitle = getRankTitle(totalWords);
  const streakDays = 15;
  const bestStreak = 28;

  const difficultyData = getDifficultyData(dictionary);
  const typeData = getTypeData(dictionary);

  /* Update displayName when user changes */
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user?.displayName]);

  /* GSAP animations */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* header */
      if (headerRef.current) {
        const children = headerRef.current.children;
        gsap.fromTo(
          children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
        );
      }

      /* stats cards */
      if (statsRef.current) {
        const cards = statsRef.current.querySelectorAll('.stat-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      /* charts section */
      if (chartsRef.current) {
        gsap.fromTo(
          chartsRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: chartsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      /* activity section header */
      if (activityRef.current) {
        const header = activityRef.current.querySelector('.activity-header');
        if (header) {
          gsap.fromTo(
            header,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.4,
              scrollTrigger: {
                trigger: activityRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      }

      /* settings section */
      if (settingsRef.current) {
        gsap.fromTo(
          settingsRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: settingsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  /* activity items scroll reveal */
  useEffect(() => {
    const ctx = gsap.context(() => {
      activityItemRefs.current.forEach((item, i) => {
        if (!item) return;
        gsap.fromTo(
          item,
          { opacity: 0, x: -15 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: 'power2.out',
            delay: i * 0.06,
            scrollTrigger: {
              trigger: item,
              start: 'top 95%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setIsSaving(true);
    setSaveMsg(null);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });
        setSaveMsg('Display name updated!');
        setTimeout(() => setSaveMsg(null), 3000);
      }
    } catch (err) {
      setSaveMsg('Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  /* ── not logged in state ── */
  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-[#050505] flex items-center justify-center px-4">
        <div className="text-center max-w-[400px]">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#111111] border-2 border-[#222222] flex items-center justify-center mb-6">
            <Star size={32} className="text-[#666666]" />
          </div>
          <h2 className="text-[2rem] font-bold text-white tracking-[-0.02em] mb-3">
            Sign In to View Profile
          </h2>
          <p className="text-[#999999] text-[1rem] mb-8 leading-relaxed">
            Track your progress, view your stats, and climb the leaderboard.
          </p>
          <button
            onClick={openAuth}
            className="inline-block bg-[#E50914] text-white font-semibold text-[0.875rem] uppercase tracking-[0.05em] px-8 py-3 rounded-md transition-all duration-200 hover:bg-[#B20710] hover:-translate-y-[1px]"
          >
            Sign In
          </button>
          <p className="mt-6 text-[#666666] text-[0.875rem]">
            or{' '}
            <Link
              to="/leaderboard"
              className="text-[#E50914] font-medium hover:underline"
            >
              view the leaderboard
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#050505]">
      {/* ── Section 1: Profile Header ── */}
      <div className="pt-[120px] pb-8 px-4 md:px-8 lg:px-16">
        <div
          ref={headerRef}
          className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8"
        >
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div
              className="w-[72px] h-[72px] md:w-[96px] md:h-[96px] rounded-full flex items-center justify-center text-[2rem] md:text-[2.5rem] font-bold text-white"
              style={{
                border: '3px solid #E50914',
                boxShadow: '0 0 24px rgba(229,9,20,0.2)',
                backgroundColor: '#111111',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            {/* Edit overlay */}
            <div className="absolute inset-0 rounded-full bg-[rgba(5,5,5,0.6)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
              <Camera size={24} className="text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <h1
              className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white tracking-[-0.02em]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              @{user.displayName || user.email?.split('@')[0] || 'User'}
            </h1>

            {/* Rank Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(229,9,20,0.1)' }}
            >
              <Star size={18} className="text-[#E50914]" />
              <span
                className="text-[0.9375rem] font-semibold text-[#E50914]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {rankTitle}
              </span>
            </div>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <span
                className="text-[0.75rem] text-[#666666]"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              >
                {user.email}
              </span>
              <span
                className="text-[0.75rem] font-medium text-[#E50914]"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              >
                {totalWords} words
              </span>
            </div>

            {/* Leaderboard Link */}
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-1 mt-1 text-[0.875rem] font-medium text-[#E50914] hover:underline transition-colors duration-200"
            >
              <Trophy size={16} />
              View on Leaderboard
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Section 2: Stats Overview ── */}
      <div className="py-8 px-4 md:px-8 lg:px-16">
        <div
          ref={statsRef}
          className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-5"
        >
          {/* Total Words */}
          <div className="stat-card bg-[#111111] border border-[#222222] rounded-xl p-6 flex flex-col gap-3 transition-all duration-300 hover:border-[rgba(229,9,20,0.2)] hover:-translate-y-[2px]">
            <BookOpen size={24} className="text-[#E50914]" />
            <span
              className="text-[2rem] font-extrabold text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {totalWords.toLocaleString()}
            </span>
            <span className="text-[0.875rem] font-medium text-[#999999]">
              Total Words
            </span>
            <span
              className="text-[0.75rem] font-medium text-[#22C55E] mt-auto"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              +24 this week
            </span>
          </div>

          {/* Hard Words */}
          <div className="stat-card bg-[#111111] border border-[#222222] rounded-xl p-6 flex flex-col gap-3 transition-all duration-300 hover:border-[rgba(239,68,68,0.2)] hover:-translate-y-[2px]">
            <Zap size={24} className="text-[#EF4444]" />
            <span
              className="text-[2rem] font-extrabold text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {hardWords}
            </span>
            <span className="text-[0.875rem] font-medium text-[#999999]">
              Hard Words
            </span>
            <span
              className="text-[0.75rem] font-medium text-[#22C55E] mt-auto"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              +3 this week
            </span>
          </div>

          {/* Street Slang */}
          <div className="stat-card bg-[#111111] border border-[#222222] rounded-xl p-6 flex flex-col gap-3 transition-all duration-300 hover:border-[rgba(245,158,11,0.2)] hover:-translate-y-[2px]">
            <MessageCircle size={24} className="text-[#F59E0B]" />
            <span
              className="text-[2rem] font-extrabold text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {streetSlang}
            </span>
            <span className="text-[0.875rem] font-medium text-[#999999]">
              Street Slang
            </span>
            <span
              className="text-[0.75rem] font-medium text-[#22C55E] mt-auto"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              +12 this week
            </span>
          </div>

          {/* Current Streak */}
          <div className="stat-card bg-[#111111] border border-[#222222] rounded-xl p-6 flex flex-col gap-3 transition-all duration-300 hover:border-[rgba(249,115,22,0.2)] hover:-translate-y-[2px]">
            <Flame size={24} className="text-[#F97316]" />
            <span
              className="text-[2rem] font-extrabold text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {streakDays} days
            </span>
            <span className="text-[0.875rem] font-medium text-[#999999]">
              Learning Streak
            </span>
            <span
              className="text-[0.75rem] font-medium text-[#666666] mt-auto"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              Best: {bestStreak} days
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 3: Learning Breakdown (Charts) ── */}
      <div className="py-8 px-4 md:px-8 lg:px-16">
        <div
          ref={chartsRef}
          className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Difficulty Donut Chart */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
            <h3 className="text-[1rem] font-semibold text-white mb-6">
              By Difficulty
            </h3>
            <div className="flex flex-col items-center">
              {totalWords > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={difficultyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {difficultyData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111111',
                          border: '1px solid #222222',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '0.8125rem',
                        }}
                        itemStyle={{ color: '#FFFFFF' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center text */}
                  <div className="absolute mt-[-140px] pointer-events-none">
                    <div className="text-center">
                      <span
                        className="text-[1.5rem] font-bold text-white block"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {totalWords.toLocaleString()}
                      </span>
                      <span
                        className="text-[0.6875rem] text-[#666666] uppercase"
                        style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                      >
                        Words
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-[#666666] text-[0.875rem]">
                  No words saved yet
                </div>
              )}
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {difficultyData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-[0.8125rem] font-medium text-[#999999]">
                      {d.name}
                    </span>
                    <span className="text-[0.8125rem] font-semibold text-white">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slang Type Bar Chart */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
            <h3 className="text-[1rem] font-semibold text-white mb-6">
              By Type
            </h3>
            {totalWords > 0 && typeData.length > 0 ? (
              <div className="space-y-4">
                {typeData.map((t) => {
                  const max = Math.max(...typeData.map((d) => d.count));
                  const pct = max > 0 ? Math.round((t.count / max) * 100) : 0;
                  return (
                    <div key={t.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[0.875rem] font-medium text-white">
                          {t.name}
                        </span>
                        <span className="text-[0.75rem] font-medium text-[#999999]">
                          {t.count} ({totalWords > 0 ? Math.round((t.count / totalWords) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: t.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-[#666666] text-[0.875rem]">
                No words saved yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 4: Recent Activity ── */}
      <div className="py-8 px-4 md:px-8 lg:px-16">
        <div ref={activityRef} className="max-w-[1200px] mx-auto">
          <div className="activity-header flex items-center justify-between mb-6">
            <h2 className="text-[1.5rem] font-bold text-white tracking-[-0.02em]">
              Recent Activity
            </h2>
            <button className="text-[0.875rem] font-medium text-[#E50914] hover:underline transition-colors duration-200">
              View All &rarr;
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {ACTIVITIES.map((act, i) => {
              const cfg = ACTIVITY_ICON[act.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={act.id}
                  ref={(el) => { activityItemRefs.current[i] = el; }}
                  className="flex items-center gap-4 bg-[#111111] border border-[#222222] rounded-xl px-5 py-4 transition-all duration-200 hover:border-[rgba(229,9,20,0.2)] cursor-pointer"
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.9375rem] font-medium text-white truncate">
                      {act.text}
                    </p>
                    <p
                      className="text-[0.75rem] text-[#666666] mt-0.5"
                      style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                    >
                      {act.time}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={16} className="text-[#666666] shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Section 5: Settings ── */}
      <div className="py-8 pb-16 px-4 md:px-8 lg:px-16">
        <div
          ref={settingsRef}
          className="max-w-[600px] mx-auto border-t border-[#222222] pt-8 mt-8"
        >
          <h2 className="text-[1.5rem] font-bold text-white mb-6">
            Account Settings
          </h2>

          <div className="flex flex-col gap-5">
            {/* Display Name */}
            <div>
              <label
                className="block text-[0.875rem] font-medium text-white mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#111111] border border-[#222222] rounded-lg py-3 px-4 text-[0.9375rem] text-white placeholder-[#666666] outline-none transition-all duration-200 focus:border-[#E50914] focus:shadow-[0_0_0_2px_#E5091480]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              {saveMsg && (
                <p className="mt-1.5 text-[0.75rem] font-medium text-[#22C55E]">{saveMsg}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-[0.875rem] font-medium text-white mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Email
              </label>
              <input
                type="email"
                value={user.email || ''}
                readOnly
                className="w-full bg-[#111111] border border-[#222222] rounded-lg py-3 px-4 text-[0.9375rem] text-[#666666] outline-none cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Native Language */}
            <div>
              <label
                className="block text-[0.875rem] font-medium text-white mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Native Language
              </label>
              <select
                value={nativeLang}
                onChange={(e) => setNativeLang(e.target.value)}
                className="w-full bg-[#111111] border border-[#222222] rounded-lg py-3 px-4 text-[0.9375rem] text-white outline-none transition-all duration-200 focus:border-[#E50914] focus:shadow-[0_0_0_2px_#E5091480] appearance-none cursor-pointer"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
                <option value="ru">Russian</option>
              </select>
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleSaveName}
                disabled={isSaving}
                className="bg-[#E50914] text-white font-semibold text-[0.875rem] uppercase tracking-[0.05em] px-6 py-3 rounded-md transition-all duration-200 hover:bg-[#B20710] hover:-translate-y-[1px] disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setDisplayName(user.displayName || '')}
                className="bg-transparent text-white font-semibold text-[0.875rem] uppercase tracking-[0.05em] px-6 py-3 rounded-md border border-[#222222] transition-all duration-200 hover:border-[#E50914] hover:text-[#E50914]"
              >
                Cancel
              </button>
            </div>

            {/* Danger Zone - Logout */}
            <div className="border-t border-[rgba(239,68,68,0.2)] pt-6 mt-6">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="inline-flex items-center gap-2 text-[#EF4444] font-medium text-[0.875rem] px-5 py-2.5 rounded-md border transition-all duration-200 hover:bg-[rgba(239,68,68,0.05)]"
                style={{ borderColor: 'rgba(239,68,68,0.3)' }}
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
