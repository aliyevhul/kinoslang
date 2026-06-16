import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, LogOut, User, Award, Settings, Flame, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useStreak } from '../context/StreakContext';
import { useModal } from '../context/ModalContext';
import AvatarUpload from './AvatarUpload';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/movies', label: 'Movies' },
  { to: '/dictionary', label: 'Dictionary' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/leaderboard', label: 'Leaderboard' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const { streak } = useStreak();
  const { openAuth } = useModal();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = useCallback((path: string) => {
    if (path === '/movies') return location.pathname.startsWith('/movies') || location.pathname.startsWith('/slang');
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(5,5,5,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <span className="text-[1.25rem] font-extrabold tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="text-white">Kino</span>
            <span className="text-[#E50914]">Slang</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative text-[0.875rem] font-medium uppercase tracking-[0.05em] transition-colors duration-200 hover:text-white"
              style={{
                color: isActive(link.to) ? '#FFFFFF' : '#999999',
                borderBottom: isActive(link.to) ? '2px solid #E50914' : '2px solid transparent',
                paddingBottom: '4px',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/movies"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-[#222222] text-[#999999] hover:border-[#E50914] hover:text-[#E50914] transition-colors duration-200"
          >
            <Search size={18} />
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              {/* Streak indicator */}
              {streak.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-sm" title={`${streak.currentStreak}-day streak`}>
                  <Flame size={16} className="text-[#E50914]" />
                  <span className="text-white font-semibold">{streak.currentStreak}</span>
                </div>
              )}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <AvatarUpload
                    photoURL={user.photoURL || undefined}
                    displayName={user.displayName || undefined}
                    size="sm"
                    editable={false}
                  />
                  <ChevronDown
                    size={14}
                    className={`text-[#666666] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-xl z-50"
                    >
                      <div className="px-4 py-3 border-b border-[#222222]">
                        <p className="text-[0.8125rem] font-medium text-white truncate">
                          {user.displayName || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-[0.6875rem] text-[#666666] truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[0.8125rem] text-[#999999] hover:text-white hover:bg-[#1A1A1A] transition-colors duration-200">
                        <User size={15} /> Profile
                      </Link>
                      <Link to="/achievements" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[0.8125rem] text-[#999999] hover:text-white hover:bg-[#1A1A1A] transition-colors duration-200">
                        <Award size={15} /> Achievements
                      </Link>
                      <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[0.8125rem] text-[#999999] hover:text-white hover:bg-[#1A1A1A] transition-colors duration-200">
                        <Settings size={15} /> Settings
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[0.8125rem] text-[#E50914] hover:text-white hover:bg-[#1A1A1A] transition-colors duration-200">
                          <Shield size={15} /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.8125rem] text-[#EF4444] hover:bg-[rgba(239,68,68,0.05)] transition-colors duration-200 border-t border-[#222222]"
                      >
                        <LogOut size={15} /> Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <button
              onClick={openAuth}
              className="text-[0.875rem] font-medium text-white border border-[#222222] rounded px-4 py-2 transition-colors duration-200 hover:border-[#E50914] hover:text-[#E50914]"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden flex items-center justify-center w-10 h-10 text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-[72px] left-0 right-0 bg-[#050505]/95 backdrop-blur-lg border-t border-[#222222] md:hidden">
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-[0.875rem] font-medium uppercase tracking-[0.05em] py-3 px-4 rounded transition-colors duration-200"
                style={{ color: isActive(link.to) ? '#FFFFFF' : '#999999', backgroundColor: isActive(link.to) ? '#111111' : 'transparent' }}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#222222] pt-3 mt-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 px-4">
                    <AvatarUpload photoURL={user.photoURL || undefined} displayName={user.displayName || undefined} size="sm" editable={false} />
                    <span className="text-white text-[0.875rem]">{user.displayName || user.email?.split('@')[0] || 'User'}</span>
                  </Link>
                  <Link to="/achievements" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2 px-4 text-[#999]">
                    <Award size={16} /> Achievements
                  </Link>
                  <Link to="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2 px-4 text-[#999]">
                    <Settings size={16} /> Settings
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2 px-4 text-[#E50914]">
                      <Shield size={16} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { setMobileOpen(false); logout(); }} className="flex items-center gap-2 py-3 px-4 text-[0.875rem] text-[#EF4444]">
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              ) : (
                <button onClick={() => { setMobileOpen(false); openAuth(); }} className="block w-full text-center text-[0.875rem] font-medium text-white border border-[#222222] rounded py-3 hover:border-[#E50914] hover:text-[#E50914] transition-colors duration-200">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
