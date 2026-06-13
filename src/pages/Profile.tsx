import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Zap, MessageCircle, Flame, Trophy, Check, X, Pencil,
  MapPin, Calendar, Award, TrendingUp, Target,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, LineChart, Line, CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useDictionary } from '../context/DictionaryContext';
import { useUserProfile } from '../context/UserProfileContext';
import { useStreak } from '../context/StreakContext';
import { useAchievements } from '../context/AchievementContext';
import { useModal } from '../context/ModalContext';
import AvatarUpload from '../components/AvatarUpload';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function getRankTitle(words: number): string {
  if (words >= 100) return 'Slang Legend';
  if (words >= 50) return 'Word Master';
  if (words >= 20) return 'Movie Buff';
  if (words >= 10) return 'Word Hunter';
  if (words >= 5) return 'Local';
  return 'Newbie';
}

const DIFF_COLORS = { easy: '#22C55E', medium: '#F59E0B', hard: '#EF4444' };

export default function Profile() {
  const { user } = useAuth();
  const { dictionary } = useDictionary();
  const { profile, updateProfileData, uploadAvatar } = useUserProfile();
  const { streak, isGoalMet } = useStreak();
  const { achievements, checkAchievements } = useAchievements();
  const { openAuth } = useModal();
  const pageRef = useRef<HTMLDivElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [bioValue, setBioValue] = useState('');
  const [locValue, setLocValue] = useState('');

  useEffect(() => {
    checkAchievements().catch(() => {});
  }, [checkAchievements, dictionary.length]);

  useEffect(() => {
    if (!pageRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      gsap.utils.toArray<HTMLElement>('.profile-section').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.5, delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
        });
      });
    });
    return () => mm.revert();
  }, []);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#111', border: '2px solid #222' }}>
            <Trophy size={32} className="text-[#E50914]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to view your profile</h2>
          <p className="text-[#999] mb-6">Track your progress, earn achievements, and build your slang vocabulary</p>
          <button onClick={openAuth} className="px-8 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90" style={{ background: '#E50914' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const totalWords = dictionary.length;
  const hardWords = dictionary.filter((w) => w.difficulty === 'hard').length;
  const streetWords = dictionary.filter((w) => w.type.toLowerCase().includes('street')).length;
  const easyWords = dictionary.filter((w) => w.difficulty === 'easy').length;
  const mediumWords = dictionary.filter((w) => w.difficulty === 'medium').length;

  const diffData = [
    { name: 'Easy', value: easyWords, color: DIFF_COLORS.easy },
    { name: 'Medium', value: mediumWords, color: DIFF_COLORS.medium },
    { name: 'Hard', value: hardWords, color: DIFF_COLORS.hard },
  ].filter((d) => d.value > 0);

  const typeCounts: Record<string, number> = {};
  dictionary.forEach((w) => { typeCounts[w.type] = (typeCounts[w.type] || 0) + 1; });
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Mock progress data
  const progressData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    words: Math.floor(totalWords * (i + 1) / 7),
  }));

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt).slice(0, 6);
  const rankTitle = getRankTitle(totalWords);

  const handleSaveName = async () => {
    if (nameValue.trim()) await updateProfileData({ displayName: nameValue.trim() });
    setEditingName(false);
  };

  const handleSaveBio = async () => {
    await updateProfileData({ bio: bioValue.trim() });
    setEditingBio(false);
  };

  const handleSaveLoc = async () => {
    await updateProfileData({ location: locValue.trim() });
    setEditingLocation(false);
  };

  const handleAvatarUpload = async (file: File) => {
    try { await uploadAvatar(file); } catch (e) { console.error(e); }
  };

  return (
    <div ref={pageRef} style={{ background: '#050505', minHeight: '100dvh' }}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="profile-section mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Flame size={24} className="text-[#E50914]" />
            <span className="text-white font-semibold">{streak.currentStreak}-day streak</span>
            <span className="text-[#666]">|</span>
            <span className="text-[#999] text-sm">{streak.todayProgress}/{streak.dailyGoal} today</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#222' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{
              width: `${Math.min(100, (streak.todayProgress / streak.dailyGoal) * 100)}%`,
              background: 'linear-gradient(90deg, #E50914, #ff6b35)',
            }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="profile-section space-y-4">
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #222' }}>
              <div className="flex flex-col items-center mb-4">
                <AvatarUpload
                  photoURL={profile?.photoURL}
                  displayName={profile?.displayName || user.displayName || 'User'}
                  size="xl"
                  editable
                  onUpload={handleAvatarUpload}
                />
              </div>

              {/* Name */}
              <div className="text-center mb-3">
                {editingName ? (
                  <div className="flex items-center gap-2 justify-center">
                    <input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="bg-[#1A1A1A] border border-[#333] rounded px-2 py-1 text-white text-center"
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="text-green-500"><Check size={16} /></button>
                    <button onClick={() => setEditingName(false)} className="text-red-500"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center">
                    <h2 className="text-xl font-bold text-white">{profile?.displayName || user.displayName || 'User'}</h2>
                    <button onClick={() => { setNameValue(profile?.displayName || ''); setEditingName(true); }} className="text-[#666] hover:text-[#E50914]">
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
                <p className="text-[#999] text-sm">{user.email}</p>
              </div>

              {/* Rank Badge */}
              <div className="flex justify-center mb-4">
                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(229,9,20,0.15)', color: '#E50914', border: '1px solid rgba(229,9,20,0.3)' }}>
                  {rankTitle}
                </span>
              </div>

              {/* Bio */}
              {editingBio ? (
                <div className="mb-3">
                  <textarea
                    value={bioValue}
                    onChange={(e) => setBioValue(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg p-2 text-white text-sm resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    autoFocus
                  />
                  <div className="flex gap-2 mt-1 justify-end">
                    <button onClick={handleSaveBio} className="text-green-500"><Check size={16} /></button>
                    <button onClick={() => setEditingBio(false)} className="text-red-500"><X size={16} /></button>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <p className="text-[#999] text-sm text-center">{profile?.bio || 'No bio yet'}</p>
                  <button onClick={() => { setBioValue(profile?.bio || ''); setEditingBio(true); }} className="text-[#E50914] text-xs hover:underline block mx-auto mt-1">
                    {profile?.bio ? 'Edit bio' : 'Add bio'}
                  </button>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-2 justify-center text-sm mb-3">
                <MapPin size={14} className="text-[#666]" />
                {editingLocation ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={locValue}
                      onChange={(e) => setLocValue(e.target.value)}
                      className="bg-[#1A1A1A] border border-[#333] rounded px-2 py-0.5 text-white text-sm w-32"
                      autoFocus
                    />
                    <button onClick={handleSaveLoc} className="text-green-500"><Check size={14} /></button>
                    <button onClick={() => setEditingLocation(false)} className="text-red-500"><X size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => { setLocValue(profile?.location || ''); setEditingLocation(true); }} className="text-[#999] hover:text-white">
                    {profile?.location || 'Add location'}
                  </button>
                )}
              </div>

              {/* Member since */}
              <div className="flex items-center gap-2 justify-center text-sm text-[#666]">
                <Calendar size={14} />
                <span>Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}</span>
              </div>

              <Link
                to="/settings"
                className="mt-4 w-full py-2 rounded-lg text-sm font-semibold text-center block transition-all hover:opacity-90"
                style={{ background: '#E50914', color: '#fff' }}
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Center Column - Stats */}
          <div className="space-y-4">
            {/* Stat Cards */}
            <div className="profile-section grid grid-cols-2 gap-3">
              {[
                { label: 'Total Words', value: totalWords, icon: <BookOpen size={20} />, color: '#E50914' },
                { label: 'Hard Words', value: hardWords, icon: <Zap size={20} />, color: '#EF4444' },
                { label: 'Street Slang', value: streetWords, icon: <MessageCircle size={20} />, color: '#F59E0B' },
                { label: 'Longest Streak', value: streak.longestStreak, icon: <Flame size={20} />, color: '#22C55E' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #222' }}>
                  <div className="flex items-center gap-2 mb-1" style={{ color: stat.color }}>{stat.icon}<span className="text-xs uppercase tracking-wider" style={{ color: '#666' }}>{stat.label}</span></div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Line Chart - Progress */}
            {progressData.length > 0 && (
              <div className="profile-section rounded-2xl p-4" style={{ background: '#111', border: '1px solid #222' }}>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-[#E50914]" />Words Progress</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="day" stroke="#666" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="words" stroke="#E50914" strokeWidth={2} dot={{ fill: '#E50914', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Difficulty Pie Chart */}
            {diffData.length > 0 && (
              <div className="profile-section rounded-2xl p-4" style={{ background: '#111', border: '1px solid #222' }}>
                <h3 className="text-white font-semibold mb-3">Difficulty Breakdown</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={diffData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                      {diffData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {diffData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1 text-xs text-[#999]">
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Type Bar Chart */}
            {typeData.length > 0 && (
              <div className="profile-section rounded-2xl p-4" style={{ background: '#111', border: '1px solid #222' }}>
                <h3 className="text-white font-semibold mb-3">Words by Type</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={typeData}>
                    <XAxis dataKey="name" stroke="#666" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="value" fill="#E50914" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Right Column - Achievements & Activity */}
          <div className="space-y-4">
            {/* Achievements Mini */}
            <div className="profile-section rounded-2xl p-4" style={{ background: '#111', border: '1px solid #222' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2"><Award size={18} className="text-[#E50914]" />Achievements</h3>
                <Link to="/achievements" className="text-[#E50914] text-xs hover:underline">View All</Link>
              </div>
              {unlockedAchievements.length === 0 ? (
                <p className="text-[#666] text-sm text-center py-4">Start saving words to unlock achievements!</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {unlockedAchievements.map((a) => (
                    <div key={a.id} className="text-center p-2 rounded-lg" style={{ background: '#1A1A1A' }} title={a.description}>
                      <div className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E50914, #8B0000)' }}>
                        <Check size={16} className="text-white" />
                      </div>
                      <p className="text-[10px] text-[#999] leading-tight">{a.title}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-center text-xs text-[#666] mt-2">{achievements.filter((a) => a.unlockedAt).length} / {achievements.length} unlocked</p>
            </div>

            {/* Daily Goal */}
            <div className="profile-section rounded-2xl p-4" style={{ background: '#111', border: '1px solid #222' }}>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2"><Target size={18} className="text-[#E50914]" />Daily Goal</h3>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[#999]">Progress</span>
                <span className="text-sm font-bold text-white">{streak.todayProgress} / {streak.dailyGoal}</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#222' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${Math.min(100, (streak.todayProgress / streak.dailyGoal) * 100)}%`,
                  background: isGoalMet ? 'linear-gradient(90deg, #22C55E, #16a34a)' : 'linear-gradient(90deg, #E50914, #ff6b35)',
                }} />
              </div>
              {isGoalMet && <p className="text-green-500 text-xs mt-1 flex items-center gap-1"><Check size={12} /> Daily goal met!</p>}
            </div>

            {/* Quick Actions */}
            <div className="profile-section rounded-2xl p-4" style={{ background: '#111', border: '1px solid #222' }}>
              <h3 className="text-white font-semibold mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/dictionary" className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[#1A1A1A]" style={{ background: '#1A1A1A' }}>
                  <BookOpen size={18} className="text-[#E50914]" /><span className="text-white text-sm">My Dictionary</span><span className="ml-auto text-[#E50914] font-bold">{totalWords}</span>
                </Link>
                <Link to="/flashcards" className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[#1A1A1A]" style={{ background: '#1A1A1A' }}>
                  <Zap size={18} className="text-[#F59E0B]" /><span className="text-white text-sm">Flashcards</span>
                </Link>
                <Link to="/leaderboard" className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[#1A1A1A]" style={{ background: '#1A1A1A' }}>
                  <Trophy size={18} className="text-[#FFD700]" /><span className="text-white text-sm">Leaderboard</span>
                </Link>
                <Link to="/settings" className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[#1A1A1A]" style={{ background: '#1A1A1A' }}>
                  <Award size={18} className="text-[#999]" /><span className="text-white text-sm">Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
