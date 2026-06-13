import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, BookOpen, Flame, Trophy, Award, MapPin, Calendar } from 'lucide-react';
import { useUserProfile, type UserProfile } from '../context/UserProfileContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import AvatarUpload from '../components/AvatarUpload';

function getRankTitle(words: number): string {
  if (words >= 100) return 'Slang Legend';
  if (words >= 50) return 'Word Master';
  if (words >= 20) return 'Movie Buff';
  if (words >= 10) return 'Word Hunter';
  if (words >= 5) return 'Local';
  return 'Newbie';
}

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { getUserProfile } = useUserProfile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    getUserProfile(userId).then((p) => {
      setProfile(p);
      if (p && p.isPublic !== false) {
        // Fetch word count and streak
        getDoc(doc(db, 'users', userId)).then((snap: any) => {
          if (snap.exists()) {
            const data = snap.data();
            setWordCount((data.dictionary || []).length);
          }
        });
        getDoc(doc(db, 'users', userId, 'streak', 'data')).then((snap: any) => {
          if (snap.exists()) {
            setStreak((snap.data() as any).currentStreak || 0);
          }
        }).catch(() => {});
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId, getUserProfile]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="text-center">
          <p className="text-[#999] mb-4">User not found</p>
          <Link to="/leaderboard" className="text-[#E50914] hover:underline">Back to Leaderboard</Link>
        </div>
      </div>
    );
  }

  if (profile.isPublic === false) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="text-center">
          <Lock size={40} className="text-[#666] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">This profile is private</h2>
          <p className="text-[#999] mb-4">This user has chosen to keep their profile private.</p>
          <Link to="/leaderboard" className="text-[#E50914] hover:underline">Back to Leaderboard</Link>
        </div>
      </div>
    );
  }

  const rankTitle = getRankTitle(wordCount);

  return (
    <div style={{ background: '#050505', minHeight: '100dvh' }}>
      <div className="max-w-[800px] mx-auto px-4 md:px-8 py-8">
        <Link to="/leaderboard" className="flex items-center gap-2 text-[#999] hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} /><span>Back to Leaderboard</span>
        </Link>

        <div className="rounded-2xl p-8" style={{ background: '#111', border: '1px solid #222' }}>
          <div className="flex flex-col items-center text-center">
            <AvatarUpload
              photoURL={profile.photoURL}
              displayName={profile.displayName}
              size="xl"
              editable={false}
            />
            <h1 className="text-2xl font-bold text-white mt-4">{profile.displayName}</h1>
            <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2" style={{ background: 'rgba(229,9,20,0.15)', color: '#E50914', border: '1px solid rgba(229,9,20,0.3)' }}>
              {rankTitle}
            </span>
          </div>

          {profile.bio && <p className="text-[#999] text-center mt-4">{profile.bio}</p>}

          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-[#666]">
            {profile.location && <span className="flex items-center gap-1"><MapPin size={14} />{profile.location}</span>}
            {profile.createdAt && <span className="flex items-center gap-1"><Calendar size={14} />{new Date(profile.createdAt).toLocaleDateString()}</span>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 rounded-xl" style={{ background: '#1A1A1A' }}>
              <BookOpen size={20} className="text-[#E50914] mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{wordCount}</p>
              <p className="text-xs text-[#666] uppercase tracking-wider">Words</p>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: '#1A1A1A' }}>
              <Flame size={20} className="text-[#F59E0B] mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{streak}</p>
              <p className="text-xs text-[#666] uppercase tracking-wider">Streak</p>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: '#1A1A1A' }}>
              <Trophy size={20} className="text-[#FFD700] mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{rankTitle}</p>
              <p className="text-xs text-[#666] uppercase tracking-wider">Rank</p>
            </div>
          </div>

          {/* Favorite Genres */}
          {profile.favoriteGenres && profile.favoriteGenres.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2"><Award size={16} className="text-[#E50914]" />Favorite Genres</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {profile.favoriteGenres.map((g) => (
                  <span key={g} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(229,9,20,0.1)', color: '#E50914', border: '1px solid rgba(229,9,20,0.2)' }}>{g}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
