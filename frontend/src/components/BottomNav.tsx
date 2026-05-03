"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Home, MessageCircle, FileText, ShoppingBag, User,
  Sparkles, BookOpen, Clock, Heart, Gem, Stars
} from 'lucide-react';

// ── Logged-out bottom nav (public pages) ──────────────────────
function PublicBottomNav() {
  const pathname = usePathname();
  const items = [
    { label: 'Home',    icon: <Home size={20} />,         href: '/' },
    { label: 'Kundali', icon: <FileText size={20} />,     href: '/kundali' },
    { label: 'AI Chat', icon: <MessageCircle size={20} />, href: '/chat' },
    { label: 'Market',  icon: <ShoppingBag size={20} />,  href: '/marketplace' },
    { label: 'Login',   icon: <User size={20} />,          href: '/login' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-4 lg:hidden">
      <div className="bg-surface/80 backdrop-blur-2xl border border-border rounded-[2.5rem] shadow-2xl flex items-center justify-around p-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                isActive ? 'text-primary' : 'text-text-secondary hover:text-foreground'
              }`}
            >
              <div className={isActive ? 'scale-110 transition-transform' : ''}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Logged-in bottom nav (mirrors left sidebar) ────────────────
function AuthBottomNav() {
  const n = useTranslations('Navigation');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const menu = [
    { id: 'home',        href: '/',                                              icon: <Home size={20} />,        label: 'Home' },
    { id: 'charts',      href: '/kundali/result?tab=charts',                    icon: <FileText size={20} />,    label: 'Kundali' },
    { id: 'daily',       href: '/kundali/result?tab=daily',                     icon: <Sparkles size={20} />,    label: 'Daily' },
    { id: 'marriage',    href: '/matching?context=marriage&mode=vedic',          icon: <Gem size={20} />,         label: 'Match' },
    { id: 'year-book',   href: '/year-book',                                    icon: <BookOpen size={20} />,    label: n('year-book') },
    { id: 'marketplace', href: '/marketplace',                                  icon: <ShoppingBag size={20} />, label: n('marketplace') },
    { id: 'muhurat',     href: '/muhurat',                                      icon: <Clock size={20} />,       label: n('muhurat') },
  ];

  const getHref = (item: typeof menu[number]) => {
    let base = item.href;
    let query = '';
    if (item.href.includes('?')) [base, query] = item.href.split('?');
    const itemParams = new URLSearchParams(query);
    const combined  = new URLSearchParams(searchParams.toString());
    itemParams.forEach((v, k) => combined.set(k, v));
    const hasUserData = combined.get('day') && combined.get('month') && combined.get('year');
    if ((item.id === 'charts' || item.id === 'daily') && !hasUserData) return '/kundali';
    return query ? `${base}?${combined.toString()}` : base;
  };

  const isActive = (item: typeof menu[number]) => {
    const tab = searchParams.get('tab');
    if (item.id === 'charts')   return pathname.includes('/kundali/result') && (tab === 'charts' || !tab);
    if (item.id === 'daily')    return pathname.includes('/kundali/result') && tab === 'daily';
    if (item.id === 'marriage') return pathname.includes('/matching') && searchParams.get('context') === 'marriage';
    if (item.id === 'home')     return pathname === '/' || pathname === '';
    return pathname.includes(`/${item.id}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] px-3 pb-3 lg:hidden">
      {/* Pill container — scrollable so all 7 items fit */}
      <div className="bg-surface/90 backdrop-blur-2xl border border-border rounded-[2.5rem] shadow-2xl shadow-black/30 flex items-center justify-around overflow-x-auto no-scrollbar p-1 gap-0.5">
        {menu.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.id}
              href={getHref(item)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-2.5 rounded-[1.5rem] flex-shrink-0 transition-all duration-200 ${
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-text-secondary hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest leading-none whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Main export — switches based on auth state ─────────────────
export default function BottomNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('token'));
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('focus', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  // Don't flash wrong nav during SSR hydration
  if (!mounted) return null;

  const isHomePage = pathname === '/' || pathname === '';

  if (isLoggedIn && !isHomePage) return (
    <Suspense fallback={null}>
      <AuthBottomNav />
    </Suspense>
  );
  return <PublicBottomNav />;
}
