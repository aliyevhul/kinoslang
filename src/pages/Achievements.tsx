import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Lock, Check, Award } from 'lucide-react';
import { useAchievements, type AchievementCategory } from '../context/AchievementContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const categories: { id: AchievementCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'words', label: 'Words' },
  { id: 'movies', label: 'Movies' },
  { id: 'streak', label: 'Streaks' },
  { id: 'difficulty', label: 'Difficulty' },
  { id: 'social', label: 'Social' },
];


export default function Achievements() {
  const { user } = useAuth();
  const { unlockedCount, totalCount, getAchievementsByCategory } = useAchievements();
  const { openAuth } = useModal();
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');

  const filtered = getAchievementsByCategory(activeCategory);
  const progress = Math.round((unlockedCount / totalCount) * 100);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="text-center">
          <Trophy size={40} className="text-[#E50914] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to track achievements</h2>
          <button onClick={openAuth} className="px-8 py-3 rounded-lg font-semibold text-white mt-4" style={{ background: '#E50914' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#050505', minHeight: '100dvh' }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Trophy size={48} className="text-[#E50914] mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-white mb-2">Your Achievements</h1>
          <p className="text-[#999]">{unlockedCount} of {totalCount} unlocked</p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mt-4">
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#222' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #E50914, #ff6b35)' }} />
            </div>
            <p className="text-sm text-[#666] mt-1">{progress}% complete</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                background: activeCategory === cat.id ? '#E50914' : '#111',
                color: activeCategory === cat.id ? '#fff' : '#999',
                border: activeCategory === cat.id ? 'none' : '1px solid #222',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ach) => {
            const unlocked = !!ach.unlockedAt;
            return (
              <div
                key={ach.id}
                className="rounded-2xl p-5 transition-all"
                style={{
                  background: unlocked ? '#111' : '#0A0A0A',
                  border: unlocked ? '1px solid rgba(229,9,20,0.3)' : '1px solid #1A1A1A',
                  opacity: unlocked ? 1 : 0.5,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: unlocked
                        ? 'linear-gradient(135deg, #E50914, #8B0000)'
                        : '#1A1A1A',
                    }}
                  >
                    {unlocked ? (
                      <Check size={22} className="text-white" />
                    ) : (
                      <Lock size={18} className="text-[#666]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${unlocked ? 'text-white' : 'text-[#666]'}`}>{ach.title}</h3>
                      {unlocked && <Award size={14} className="text-[#E50914]" />}
                    </div>
                    <p className={`text-sm ${unlocked ? 'text-[#999]' : 'text-[#555]'}`}>{ach.description}</p>
                    {unlocked && ach.unlockedAt && (
                      <p className="text-xs text-[#E50914] mt-1">
                        Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                    {!unlocked && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider" style={{ background: '#1A1A1A', color: '#555', border: '1px solid #222' }}>
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-[#666] py-12">No achievements in this category yet.</p>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-[#999] mb-4">Keep learning to unlock more achievements!</p>
          <Link to="/movies" className="inline-block px-8 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90" style={{ background: '#E50914' }}>
            Explore Movies
          </Link>
        </div>
      </div>
    </div>
  );
}
