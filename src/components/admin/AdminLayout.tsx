import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  ArrowLeft,
  Settings,
  Clapperboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/movies', label: 'Movies', icon: Film, exact: false },
];

export default function AdminLayout() {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#222] bg-[#0A0A0A] fixed top-0 left-0 bottom-0 z-50">
        <div className="p-6 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E50914] flex items-center justify-center">
              <Clapperboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">KinoSlang</h1>
              <p className="text-[#666] text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive(to, exact)
                  ? 'bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/30'
                  : 'text-[#999] hover:text-white hover:bg-[#1A1A1A]'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#222] space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#999] hover:text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Site
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#999] hover:text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <Settings size={18} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-[#222] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clapperboard size={18} className="text-[#E50914]" />
          <span className="text-white font-bold text-sm">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/movies" className="text-[#999] text-xs px-3 py-1.5 rounded border border-[#222]">
            Movies
          </Link>
          <Link to="/" className="text-[#999] text-xs px-3 py-1.5 rounded border border-[#222]">
            Site
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-[1200px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
