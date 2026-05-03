"use client";

import React, { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { Home, MessageCircle, FileText, ShoppingBag, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const isHomePage = pathname === '/' || pathname === '';
  
  // Show only when left nav is NOT visible
  // Left nav is visible ONLY when logged in AND NOT on home page
  const showBottomNav = !isLoggedIn || isHomePage;

  if (!showBottomNav) return null;

  const menuItems = [
    { label: 'Home', icon: <Home size={20} />, href: '/' },
    { label: 'Kundali', icon: <FileText size={20} />, href: '/kundali' },
    { label: 'AI Chat', icon: <MessageCircle size={20} />, href: '/chat' },
    { label: 'Market', icon: <ShoppingBag size={20} />, href: '/marketplace' },
    { label: 'Login', icon: <User size={20} />, href: '/login' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-4 lg:hidden">
      <div className="bg-surface/80 backdrop-blur-2xl border border-border rounded-[2.5rem] shadow-2xl flex items-center justify-around p-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                isActive 
                  ? 'text-primary' 
                  : 'text-text-secondary hover:text-foreground'
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
