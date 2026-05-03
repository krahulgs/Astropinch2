"use client";

import {useTranslations} from 'next-intl';
import {Link, useRouter} from '@/i18n/routing';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { User, ChevronDown, LogOut, Settings, Users, Globe, MessageSquare } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const t = useTranslations('Home');
  const n = useTranslations('Navigation');
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Extracted so it can be called on mount, focus, and storage events
  const loadAuthState = useCallback(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'user';
    setIsLoggedIn(!!token);
    setUserRole(role);

    if (token) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      fetch(`${apiUrl}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(users => {
          if (users && Array.isArray(users)) {
            const me = users.find((u: any) => u.role === 'master') || users[0];
            if (me) {
              setUserImage(me.profile_image || null);
              setUserName(me.full_name || '');
            }
            setAllProfiles(users);
          }
        })
        .catch(() => {});
    } else {
      setAllProfiles([]);
      setUserImage(null);
      setUserName('');
    }
  }, []);

  useEffect(() => {
    // Run immediately on mount
    loadAuthState();

    // Re-run when localStorage changes (cross-tab login)
    window.addEventListener('storage', loadAuthState);

    // Re-run when window regains focus (same-tab login redirect)
    window.addEventListener('focus', loadAuthState);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', loadAuthState);
      window.removeEventListener('focus', loadAuthState);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [loadAuthState]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', next);
  };

  const handleNav = (href: string) => {
    const isSessionActive = sessionStorage.getItem('ASTRO_SESSION_ACTIVE');
    if (isSessionActive) {
      alert("⚠️ Active Session Locked: You are in a live consultation. Please end your current session before navigating to other pages.");
      return;
    }
    router.push(href as any);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserImage(null);
    setUserName('');
    setAllProfiles([]);
    setShowProfileMenu(false);
    window.dispatchEvent(new Event('storage')); // Notify other components (like Footer)
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/20 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <button onClick={() => handleNav('/')} className="text-2xl font-bold tracking-tighter text-foreground">
          ASTROPINCH®
        </button>

        {!isLoggedIn && (
          <div className="hidden md:flex items-center gap-8 ml-auto mr-8">
            {['horoscope', 'kundali', 'matching', 'year-book', 'marketplace', 'muhurat'].map((item) => (
              <Link
                key={item}
                href={`/${item}`}
                className="text-[10px] font-bold hover:text-foreground transition-colors uppercase tracking-widest text-text-secondary"
              >
                {n(item)}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-lg hover:bg-foreground/5 transition-all"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          {/* <LanguageSwitcher /> - Hidden per user request */}

          {isLoggedIn ? (
            /* ── LOGGED IN: Profile avatar + dropdown / bottom-sheet ── */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-1 pr-4 py-1 rounded-full bg-surface border border-border hover:bg-foreground/5 transition-all"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shadow-lg overflow-hidden flex-shrink-0">
                  {userImage ? (
                    <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
                    {userName ? userName.split(' ')[0] : 'Profile'}
                  </p>
                  <p className="text-[8px] text-text-secondary uppercase tracking-tighter mt-0.5">
                    {userRole === 'master' ? 'Master Account' : 'Standard Account'}
                  </p>
                </div>
                <ChevronDown size={12} className={`text-text-secondary transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <>
                  {/* ── Mobile: full-screen backdrop + bottom sheet ── */}
                  <div
                    className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm sm:hidden animate-in fade-in duration-200"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className={`
                    z-[90] bg-surface border-border shadow-2xl backdrop-blur-xl
                    animate-in fade-in duration-200
                    fixed bottom-0 left-0 right-0 rounded-t-[2rem] p-4 border-t
                    sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-3
                    sm:w-72 sm:rounded-2xl sm:border sm:p-2 sm:origin-top-right sm:zoom-in-95
                  `}>
                    {/* Mobile drag handle */}
                    <div className="w-10 h-1 rounded-full bg-border mx-auto mb-3 sm:hidden" />

                    {/* ── Account header ── */}
                    <div className="flex items-center gap-3 p-4 border-b border-border/50">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                        {userImage ? (
                          <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{userName || 'Master Admin'}</p>
                        <p className="text-[9px] text-text-secondary uppercase tracking-widest">
                          {userRole === 'master' ? '✦ Master Account' : 'Standard Account'}
                        </p>
                      </div>
                    </div>

                    {/* ── Menu Links ── */}
                    <div className="mt-2 space-y-0.5">
                      {userRole === 'master' && (
                        <button
                          onClick={() => { handleNav('/admin/users'); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3.5 sm:py-3 rounded-xl hover:bg-foreground/5 text-text-secondary hover:text-foreground transition-all group"
                        >
                          <Users size={15} className="group-hover:text-primary transition-colors flex-shrink-0" />
                          <span className="text-xs font-bold uppercase tracking-widest">Manage Profile</span>
                        </button>
                      )}

                      <button
                        onClick={() => { handleNav('/marketplace/history'); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 sm:py-3 rounded-xl hover:bg-foreground/5 text-text-secondary hover:text-foreground transition-all group"
                      >
                        <MessageSquare size={15} className="group-hover:text-primary transition-colors flex-shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-widest">Past Consultations</span>
                      </button>
                    </div>

                    <div className="h-px bg-border/50 my-2" />

                    {/* ── Settings ── */}
                    <button
                      onClick={() => { handleNav('/settings'); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 sm:py-3 rounded-xl hover:bg-foreground/5 text-text-secondary hover:text-foreground transition-all group"
                    >
                      <Settings size={15} className="group-hover:text-primary transition-colors flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
                    </button>

                    {/* ── Logout ── */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 sm:py-3 rounded-xl hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-all group"
                    >
                      <LogOut size={15} className="flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
                    </button>

                    {/* Extra safe-area padding for iOS home bar */}
                    <div className="h-4 sm:hidden" />
                  </div>
                </>
              )}
            </div>

          ) : (
            /* ── LOGGED OUT: Login button ── */
            <button
              onClick={() => handleNav('/login')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <User size={12} />
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
