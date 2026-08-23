import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  Shield,
  Activity,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useNotificationStore } from '../../store/notificationStore.js';

export default function Header({ toggleSidebar }) {
  const { user, logout } = useAuthStore();
  const { unreadCount, toggleOpen } = useNotificationStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800/80 glass-panel sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: mobile toggle & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Agent Engine Live</span>
          </div>
        </div>
      </div>

      {/* Right section: System health, Notifications, User Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Bell */}
        <button
          onClick={toggleOpen}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-800/60 border border-slate-800 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
              {user?.name?.charAt(0) || 'O'}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                {user?.name || 'Operator'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono capitalize">
                {user?.role || 'operator'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-100 border border-slate-700/80 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="p-3 border-b border-slate-800 mb-1">
                <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Shield className="w-3 h-3" />
                  <span className="uppercase">{user?.role || 'Operator'}</span>
                </div>
              </div>

              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Account & API Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
