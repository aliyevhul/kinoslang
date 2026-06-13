import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/movies', label: 'Movies' },
  { to: '/dictionary', label: 'Dictionary' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/leaderboard', label: 'Leaderboard' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = useCallback(
    (path: string) => {
      if (path === '/movies') return location.pathname.startsWith('/movies') || location.pathname.startsWith('/slang');
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

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
          <span
            className="text-[1.25rem] font-extrabold tracking-tight"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
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
            <Link to="/profile">
              <div
                className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-[0.75rem] font-semibold text-white border-2 border-[#E50914]"
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
          ) : (
            <Link
              to="/profile"
              className="text-[0.875rem] font-medium text-white border border-[#222222] rounded px-4 py-2 transition-colors duration-200 hover:border-[#E50914] hover:text-[#E50914]"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
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
                style={{
                  color: isActive(link.to) ? '#FFFFFF' : '#999999',
                  backgroundColor: isActive(link.to) ? '#111111' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#222222] pt-3 mt-2">
              {user ? (
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-3 px-4"
                >
                  <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-[0.75rem] font-semibold text-white border-2 border-[#E50914]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-[0.875rem]">{user.name}</span>
                </Link>
              ) : (
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center text-[0.875rem] font-medium text-white border border-[#222222] rounded py-3 hover:border-[#E50914] hover:text-[#E50914] transition-colors duration-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
