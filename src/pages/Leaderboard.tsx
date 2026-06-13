import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Crown, Star, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── types ── */
interface LeaderboardUser {
  rank: number;
  name: string;
  words: number;
  avatar: string;
}

/* ── helpers ── */
function getRankTitle(words: number): string {
  if (words >= 1000) return 'Slang Legend';
  if (words >= 500) return 'Slang Master';
  if (words >= 200) return 'Movie Buff';
  if (words >= 50) return 'Word Hunter';
  if (words >= 20) return 'Gangster';
  if (words >= 10) return 'Local';
  if (words >= 5) return 'Wanderer';
  if (words >= 2) return 'Explorer';
  return 'Newbie';
}

function getTitleColor(rank: number, words: number): string {
  if (rank === 1) return '#FFD700';
  if (rank <= 3) return '#E50914';
  if (rank <= 10) return '#999999';
  return '#666666';
}

/* ── mock data ── */
const ALL_USERS: LeaderboardUser[] = [
  { rank: 1, name: 'cinephile99', words: 1247, avatar: 'C' },
  { rank: 2, name: 'slangKing', words: 1102, avatar: 'S' },
  { rank: 3, name: 'movieNerd', words: 987, avatar: 'M' },
  { rank: 4, name: 'englishPro', words: 856, avatar: 'E' },
  { rank: 5, name: 'wordWizard', words: 743, avatar: 'W' },
  { rank: 6, name: 'filmFanatic', words: 698, avatar: 'F' },
  { rank: 7, name: 'slangSeeker', words: 621, avatar: 'S' },
  { rank: 8, name: 'tvAddict', words: 534, avatar: 'T' },
  { rank: 9, name: 'phraseHunter', words: 487, avatar: 'P' },
  { rank: 10, name: 'dialogueDiva', words: 412, avatar: 'D' },
  { rank: 11, name: 'bingeWatcher', words: 389, avatar: 'B' },
  { rank: 12, name: 'subtitleSage', words: 356, avatar: 'S' },
  { rank: 13, name: 'cinemaSavant', words: 298, avatar: 'C' },
  { rank: 14, name: 'popcornPolyglot', words: 245, avatar: 'P' },
  { rank: 15, name: 'reelRookie', words: 187, avatar: 'R' },
  { rank: 16, name: 'screenScribe', words: 156, avatar: 'S' },
  { rank: 17, name: 'flickFan', words: 134, avatar: 'F' },
  { rank: 18, name: 'showScholar', words: 112, avatar: 'S' },
  { rank: 19, name: 'episodeAce', words: 89, avatar: 'E' },
  { rank: 20, name: 'streamStrider', words: 67, avatar: 'S' },
];

const WEEK_USERS: LeaderboardUser[] = [
  { rank: 1, name: 'slangKing', words: 42, avatar: 'S' },
  { rank: 2, name: 'cinephile99', words: 38, avatar: 'C' },
  { rank: 3, name: 'movieNerd', words: 31, avatar: 'M' },
  { rank: 4, name: 'wordWizard', words: 27, avatar: 'W' },
  { rank: 5, name: 'englishPro', words: 24, avatar: 'E' },
  { rank: 6, name: 'tvAddict', words: 22, avatar: 'T' },
  { rank: 7, name: 'filmFanatic', words: 19, avatar: 'F' },
  { rank: 8, name: 'phraseHunter', words: 16, avatar: 'P' },
  { rank: 9, name: 'slangSeeker', words: 14, avatar: 'S' },
  { rank: 10, name: 'dialogueDiva', words: 11, avatar: 'D' },
  { rank: 11, name: 'bingeWatcher', words: 9, avatar: 'B' },
  { rank: 12, name: 'subtitleSage', words: 7, avatar: 'S' },
  { rank: 13, name: 'cinemaSavant', words: 6, avatar: 'C' },
  { rank: 14, name: 'popcornPolyglot', words: 4, avatar: 'P' },
  { rank: 15, name: 'reelRookie', words: 3, avatar: 'R' },
];

const MONTH_USERS: LeaderboardUser[] = [
  { rank: 1, name: 'cinephile99', words: 156, avatar: 'C' },
  { rank: 2, name: 'slangKing', words: 142, avatar: 'S' },
  { rank: 3, name: 'movieNerd', words: 128, avatar: 'M' },
  { rank: 4, name: 'englishPro', words: 115, avatar: 'E' },
  { rank: 5, name: 'wordWizard', words: 98, avatar: 'W' },
  { rank: 6, name: 'filmFanatic', words: 87, avatar: 'F' },
  { rank: 7, name: 'slangSeeker', words: 76, avatar: 'S' },
  { rank: 8, name: 'tvAddict', words: 65, avatar: 'T' },
  { rank: 9, name: 'phraseHunter', words: 58, avatar: 'P' },
  { rank: 10, name: 'dialogueDiva', words: 52, avatar: 'D' },
  { rank: 11, name: 'bingeWatcher', words: 48, avatar: 'B' },
  { rank: 12, name: 'subtitleSage', words: 41, avatar: 'S' },
  { rank: 13, name: 'cinemaSavant', words: 35, avatar: 'C' },
  { rank: 14, name: 'popcornPolyglot', words: 28, avatar: 'P' },
  { rank: 15, name: 'reelRookie', words: 22, avatar: 'R' },
];

const TIME_DATA: Record<string, LeaderboardUser[]> = {
  'All Time': ALL_USERS,
  'This Week': WEEK_USERS,
  'This Month': MONTH_USERS,
};

/* ── shimmer keyframes ── */
const shimmerCSS = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

/* ── component ── */
export default function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Time');
  const [search, setSearch] = useState('');

  const headerRef = useRef<HTMLDivElement>(null);
  const podiumRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const tableRowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentUsers = TIME_DATA[activeFilter] || ALL_USERS;

  /* derive top 3 + rest */
  const top3 = currentUsers.slice(0, 3);
  const rest = currentUsers.slice(3);

  /* search filter */
  const filtered = useMemo(() => {
    if (!search.trim()) return rest;
    return rest.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [rest, search]);

  /* current user mock rank */
  const currentUserWords = 156;
  const currentUserRank = 42;

  /* GSAP animations */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* header entrance */
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          }
        );
      }

      /* podium entrance */
      if (podiumRef.current) {
        const cols = podiumRef.current.querySelectorAll('.podium-col');
        gsap.fromTo(
          cols,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out',
            delay: 0.3,
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  /* table row scroll reveal */
  useEffect(() => {
    if (!tableRowRefs.current.length) return;

    const ctx = gsap.context(() => {
      tableRowRefs.current.forEach((row, i) => {
        if (!row) return;
        gsap.fromTo(
          row,
          { opacity: 0, x: -15 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 95%',
              toggleActions: 'play none none none',
            },
            delay: i * 0.04,
          }
        );
      });
    });

    return () => ctx.revert();
  }, [filtered]);

  /* ── podium config ── */
  const podiumConfig = [
    {
      place: 2,
      user: top3[1],
      height: 120,
      width: 160,
      color: '#C0C0C0',
      colorFrom: '#C0C0C0',
      colorTo: '#A0A0A0',
      avatarSize: 60,
      trophySize: 40,
      badgeSize: 28,
      fontSize: '1rem',
      weight: 600,
      glow: '0 0 16px rgba(192,192,192,0.2)',
      bgGradient: 'linear-gradient(180deg, rgba(192,192,192,0.12) 0%, rgba(192,192,192,0.04) 100%)',
      borderColor: 'rgba(192,192,192,0.2)',
    },
    {
      place: 1,
      user: top3[0],
      height: 160,
      width: 180,
      color: '#FFD700',
      colorFrom: '#FFD700',
      colorTo: '#FFA500',
      avatarSize: 72,
      trophySize: 48,
      badgeSize: 32,
      fontSize: '1.125rem',
      weight: 700,
      glow: '0 0 20px rgba(255,215,0,0.3)',
      bgGradient: 'linear-gradient(180deg, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%)',
      borderColor: 'rgba(255,215,0,0.3)',
    },
    {
      place: 3,
      user: top3[2],
      height: 100,
      width: 160,
      color: '#CD7F32',
      colorFrom: '#CD7F32',
      colorTo: '#A0522D',
      avatarSize: 60,
      trophySize: 40,
      badgeSize: 28,
      fontSize: '1rem',
      weight: 600,
      glow: '0 0 16px rgba(205,127,50,0.2)',
      bgGradient: 'linear-gradient(180deg, rgba(205,127,50,0.12) 0%, rgba(205,127,50,0.04) 100%)',
      borderColor: 'rgba(205,127,50,0.2)',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#050505]">
      <style>{shimmerCSS}</style>

      {/* ── Section 1: Header ── */}
      <div className="pt-[120px] pb-8 px-4 md:px-8 lg:px-16">
        <div ref={headerRef} className="max-w-[800px] mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy size={36} className="text-[#FFD700]" />
            <h1
              className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-white tracking-[-0.03em]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Global Rankings
            </h1>
          </div>
          <p className="text-[1.125rem] text-[#999999] max-w-[560px] mx-auto mt-2 leading-relaxed">
            See who&apos;s mastered the most slang. Climb the ranks by learning words from your favorite movies.
          </p>

          {/* Time Filter Tabs */}
          <div className="inline-flex mt-6 bg-[#111111] border border-[#222222] rounded-lg overflow-hidden">
            {['This Week', 'This Month', 'All Time'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className="px-6 py-2.5 text-[0.875rem] font-medium transition-all duration-200"
                style={{
                  backgroundColor: activeFilter === tab ? '#E50914' : 'transparent',
                  color: activeFilter === tab ? '#FFFFFF' : '#999999',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Your Rank Banner */}
          {user && (
            <div
              className="mt-8 mx-auto max-w-[480px] flex items-center gap-4 px-6 py-4 rounded-xl cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(229,9,20,0.1) 0%, rgba(139,0,0,0.05) 100%)',
                border: '1px solid rgba(229,9,20,0.2)',
              }}
              onClick={() => {
                const el = document.getElementById('rankings-table');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold text-white shrink-0"
                style={{ border: '2px solid #E50914' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-[0.9375rem] text-[#FFFFFF]">
                You are ranked{' '}
                <span className="text-[#E50914] font-bold">#{currentUserRank}</span> with{' '}
                <span className="text-[#E50914] font-bold">{currentUserWords} words</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Top 3 Podium ── */}
      <div className="py-12 px-4 md:px-8 lg:px-16">
        <div
          ref={podiumRef}
          className="max-w-[700px] mx-auto flex items-end justify-center gap-4 md:gap-6"
        >
          {podiumConfig.map((cfg) => (
            <div
              key={cfg.place}
              className="podium-col flex flex-col items-center"
            >
              {/* Trophy */}
              <div className="mb-3">
                {cfg.place === 1 ? (
                  <Crown size={cfg.trophySize} style={{ color: cfg.color }} />
                ) : (
                  <Trophy size={cfg.trophySize} style={{ color: cfg.color }} />
                )}
              </div>

              {/* Avatar */}
              <div
                className="rounded-full flex items-center justify-center font-bold text-white"
                style={{
                  width: cfg.avatarSize,
                  height: cfg.avatarSize,
                  border: `3px solid ${cfg.color}`,
                  boxShadow: cfg.glow,
                  fontSize: cfg.avatarSize === 72 ? '1.5rem' : '1.25rem',
                  backgroundColor: '#111111',
                }}
              >
                {cfg.user?.avatar}
              </div>

              {/* Name */}
              <span
                className="mt-3 text-white"
                style={{
                  fontSize: cfg.fontSize,
                  fontWeight: cfg.weight,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                @{cfg.user?.name}
              </span>

              {/* Words */}
              <span
                className="mt-1 font-semibold text-[#E50914]"
                style={{
                  fontSize: cfg.avatarSize === 72 ? '0.9375rem' : '0.875rem',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {cfg.user?.words} words
              </span>

              {/* Rank badge */}
              <div
                className="mt-2 rounded-full flex items-center justify-center font-extrabold"
                style={{
                  width: cfg.badgeSize,
                  height: cfg.badgeSize,
                  background: `linear-gradient(135deg, ${cfg.colorFrom}, ${cfg.colorTo})`,
                  color: cfg.place === 3 ? '#FFF' : '#000',
                  fontSize: cfg.badgeSize === 32 ? '0.875rem' : '0.8125rem',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {cfg.place}
              </div>

              {/* Podium base */}
              <div
                className="mt-4 rounded-t-xl flex items-center justify-center"
                style={{
                  width: cfg.width,
                  height: cfg.height,
                  background: cfg.bgGradient,
                  border: `1px solid ${cfg.borderColor}`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Rankings Table ── */}
      <div id="rankings-table" className="pb-16 px-4 md:px-8 lg:px-16">
        <div ref={tableRef} className="max-w-[800px] mx-auto">
          {/* Search */}
          <div className="mb-6 relative max-w-[360px]">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]"
            />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-[#222222] rounded-lg py-3 pl-11 pr-4 text-[0.9375rem] text-white placeholder-[#666666] outline-none transition-all duration-200 focus:border-[#E50914] focus:shadow-[0_0_0_2px_#E5091480]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {/* Table Header */}
          <div
            className="sticky top-[72px] z-30 grid grid-cols-[60px_1fr_120px_100px] gap-4 px-5 py-3 border-b border-[#222222] bg-[#050505]"
            style={{ fontFamily: 'IBM Plex Mono, monospace' }}
          >
            <span className="text-[0.6875rem] font-medium uppercase text-[#666666] tracking-[0.08em]">
              Rank
            </span>
            <span className="text-[0.6875rem] font-medium uppercase text-[#666666] tracking-[0.08em]">
              User
            </span>
            <span className="text-[0.6875rem] font-medium uppercase text-[#666666] tracking-[0.08em] text-right">
              Words
            </span>
            <span className="text-[0.6875rem] font-medium uppercase text-[#666666] tracking-[0.08em] text-right">
              Title
            </span>
          </div>

          {/* Table Rows */}
          <div className="flex flex-col mt-2">
            {filtered.map((u, idx) => {
              const rank = u.rank;
              const isCurrentUser = user && u.name === user.name;
              const title = getRankTitle(u.words);
              const titleColor = getTitleColor(rank, u.words);

              return (
                <div
                  key={u.name + rank}
                  ref={(el) => { tableRowRefs.current[idx] = el; }}
                  className="grid grid-cols-[60px_1fr_120px_100px] gap-4 items-center px-5 py-3.5 rounded-lg transition-colors duration-200 cursor-pointer"
                  style={{
                    backgroundColor: isCurrentUser
                      ? 'rgba(229,9,20,0.05)'
                      : 'transparent',
                    border: isCurrentUser
                      ? '1px solid rgba(229,9,20,0.15)'
                      : '1px solid transparent',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrentUser) {
                      e.currentTarget.style.backgroundColor = '#1A1A1A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrentUser) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={() => {
                    navigate(`/profile/${u.name}`);
                  }}
                >
                  {/* Rank */}
                  <div className="flex items-center gap-1">
                    {rank <= 10 && rank > 3 && (
                      <Star size={12} className="text-[#666666]" />
                    )}
                    <span
                      className="font-bold text-[1rem] font-mono"
                      style={{
                        color: rank <= 10 ? '#FFFFFF' : '#666666',
                        fontFamily: 'IBM Plex Mono, monospace',
                      }}
                    >
                      {rank <= 3 ? (
                        <span>
                          {rank === 1 && '🥇'}
                          {rank === 2 && '🥈'}
                          {rank === 3 && '🥉'}
                        </span>
                      ) : (
                        `#${rank}`
                      )}
                    </span>
                  </div>

                  {/* User */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold text-white shrink-0"
                      style={{
                        backgroundColor: '#111111',
                        border: '2px solid #222222',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {u.avatar}
                    </div>
                    <span className="text-[0.9375rem] font-medium text-white">
                      @{u.name}
                    </span>
                    {isCurrentUser && (
                      <span
                        className="text-[0.625rem] font-medium bg-[#E50914] text-white rounded px-1.5 py-0.5 uppercase tracking-wide"
                        style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                      >
                        YOU
                      </span>
                    )}
                  </div>

                  {/* Words */}
                  <span className="text-[1rem] font-bold text-white text-right">
                    {u.words.toLocaleString()}
                  </span>

                  {/* Title */}
                  <span
                    className="text-[0.75rem] font-medium uppercase text-right"
                    style={{
                      color: titleColor,
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  >
                    {title}
                  </span>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#666666] text-[0.9375rem]">
              No users found matching &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
