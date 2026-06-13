import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User, Lock, SlidersHorizontal, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../context/UserProfileContext';
import { useStreak } from '../context/StreakContext';
import { useModal } from '../context/ModalContext';
import AvatarUpload from '../components/AvatarUpload';
import { languages } from '../data/languages';

const GENRES = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Crime', 'Romance', 'Horror', 'Thriller', 'Fantasy', 'Documentary'];

type TabId = 'profile' | 'account' | 'preferences' | 'privacy';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'account', label: 'Account', icon: <Lock size={16} /> },
  { id: 'preferences', label: 'Preferences', icon: <SlidersHorizontal size={16} /> },
  { id: 'privacy', label: 'Privacy', icon: <Eye size={16} /> },
];

export default function Settings() {
  const { user } = useAuth();
  const { profile, updateProfileData, uploadAvatar } = useUserProfile();
  const { updateDailyGoal } = useStreak();
  const { openAuth } = useModal();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('en');
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(5);

  // Account state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Preferences state
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setNativeLanguage(profile.nativeLanguage || 'en');
      setFavoriteGenres(profile.favoriteGenres || []);
      setIsPublic(profile.isPublic !== false);
      setDailyGoal(profile.dailyGoal || 5);
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="text-center">
          <Lock size={40} className="text-[#E50914] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to access settings</h2>
          <button onClick={openAuth} className="px-8 py-3 rounded-lg font-semibold text-white mt-4" style={{ background: '#E50914' }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfileData({
      displayName: displayName.trim(),
      bio: bio.trim(),
      location: location.trim(),
      nativeLanguage,
      favoriteGenres,
      isPublic,
      dailyGoal,
    });
    await updateDailyGoal(dailyGoal);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
    try {
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
      const { auth } = await import('../firebase/config');
      if (auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setSaved(true); setTimeout(() => setSaved(false), 2000);
      }
    } catch (e: any) {
      setPasswordError(e.message || 'Failed to change password');
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const { verifyBeforeUpdateEmail } = await import('firebase/auth');
      const { auth } = await import('../firebase/config');
      if (auth.currentUser) {
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
        setNewEmail('');
        setSaved(true); setTimeout(() => setSaved(false), 2000);
      }
    } catch (e: any) {
      setPasswordError(e.message || 'Failed to update email');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { deleteUser } = await import('firebase/auth');
      const { auth } = await import('../firebase/config');
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        navigate('/');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleGenre = (genre: string) => {
    setFavoriteGenres((prev) => prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]);
  };

  return (
    <div style={{ background: '#050505', minHeight: '100dvh' }}>
      <div className="max-w-[800px] mx-auto px-4 md:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                background: activeTab === tab.id ? '#E50914' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#999',
                border: activeTab === tab.id ? 'none' : '1px solid #222',
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Saved indicator */}
        {saved && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm flex items-center gap-2">
            <Save size={14} /> Changes saved successfully!
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #222' }}>
              <label className="block text-sm font-medium text-[#999] mb-3">Profile Photo</label>
              <AvatarUpload
                photoURL={profile?.photoURL}
                displayName={profile?.displayName}
                size="lg"
                editable
                onUpload={uploadAvatar}
              />
            </div>

            {/* Display Name */}
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #222' }}>
              <label className="block text-sm font-medium text-[#999] mb-2">Display Name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>

            {/* Bio */}
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #222' }}>
              <label className="block text-sm font-medium text-[#999] mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E50914] resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Location */}
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #222' }}>
              <label className="block text-sm font-medium text-[#999] mb-2">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E50914]"
                placeholder="City, Country"
              />
            </div>

            {/* Native Language */}
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #222' }}>
              <label className="block text-sm font-medium text-[#999] mb-2">Native Language</label>
              <select
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E50914]"
              >
                {languages.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
              </select>
            </div>

            {/* Favorite Genres */}
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #222' }}>
              <label className="block text-sm font-medium text-[#999] mb-3">Favorite Genres</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
                    style={{
                      background: favoriteGenres.includes(genre) ? 'rgba(229,9,20,0.15)' : '#1A1A1A',
                      borderColor: favoriteGenres.includes(genre) ? '#E50914' : '#333',
                      color: favoriteGenres.includes(genre) ? '#E50914' : '#999',
                    }}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#E50914' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Change Password */}
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #222' }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Lock size={18} className="text-[#E50914]" />Change Password</h3>
              {passwordError && <p className="text-red-500 text-sm mb-3">{passwordError}</p>}
              <div className="space-y-3">
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E50914]" />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E50914]" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E50914]" />
                <button onClick={handleChangePassword} className="px-6 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#E50914' }}>Update Password</button>
              </div>
            </div>

            {/* Update Email */}
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #222' }}>
              <h3 className="text-white font-semibold mb-4">Update Email</h3>
              <p className="text-[#999] text-sm mb-3">Current: {user.email}</p>
              <div className="flex gap-3">
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New email address" className="flex-1 bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#E50914]" />
                <button onClick={handleUpdateEmail} className="px-6 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#E50914' }}>Update</button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #B20710' }}>
              <h3 className="text-red-500 font-semibold mb-2 flex items-center gap-2"><AlertTriangle size={18} />Danger Zone</h3>
              <p className="text-[#999] text-sm mb-4">Deleting your account will remove all your data permanently.</p>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">
                  <Trash2 size={14} className="inline mr-2" />Delete Account
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-400 text-sm font-semibold">Are you sure? This cannot be undone!</p>
                  <div className="flex gap-3">
                    <button onClick={handleDeleteAccount} className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700">Yes, Delete Everything</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-2 rounded-lg text-sm font-semibold text-[#999] border border-[#333]">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #222' }}>
              <label className="block text-sm font-medium text-[#999] mb-2">Daily Goal: {dailyGoal} words</label>
              <input type="range" min={1} max={20} value={dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))} className="w-full accent-[#E50914]" />
              <div className="flex justify-between text-xs text-[#666] mt-1"><span>1</span><span>20</span></div>
            </div>

            {[
              { label: 'Auto-play pronunciation', desc: 'Automatically play audio when viewing slang', value: autoPlayAudio, onChange: setAutoPlayAudio },
              { label: 'Show translations by default', desc: 'Reveal translations without clicking', value: showTranslations, onChange: setShowTranslations },
              { label: 'Browser notifications', desc: 'Get reminded to practice daily', value: notifications, onChange: setNotifications },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl p-6 flex items-center justify-between" style={{ background: '#111', border: '1px solid #222' }}>
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-[#666] text-sm">{item.desc}</p>
                </div>
                <button
                  onClick={() => item.onChange(!item.value)}
                  className="w-12 h-7 rounded-full transition-all relative"
                  style={{ background: item.value ? '#E50914' : '#333' }}
                >
                  <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all" style={{ left: item.value ? '22px' : '2px' }} />
                </button>
              </div>
            ))}

            <button onClick={handleSaveProfile} disabled={saving} className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ background: '#E50914' }}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="rounded-2xl p-6 flex items-center justify-between" style={{ background: '#111', border: '1px solid #222' }}>
              <div>
                <p className="text-white font-medium">Public Profile</p>
                <p className="text-[#666] text-sm">When public, others can view your profile from the leaderboard</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className="w-12 h-7 rounded-full transition-all relative"
                style={{ background: isPublic ? '#E50914' : '#333' }}
              >
                <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all" style={{ left: isPublic ? '22px' : '2px' }} />
              </button>
            </div>

            <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid #222' }}>
              <p className="text-[#999] text-sm">
                {isPublic
                  ? 'Your profile is currently visible to other users. They can see your achievements, word count, and rank.'
                  : 'Your profile is private. Other users cannot see your details on the leaderboard.'}
              </p>
            </div>

            <button onClick={handleSaveProfile} disabled={saving} className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ background: '#E50914' }}>
              {saving ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
