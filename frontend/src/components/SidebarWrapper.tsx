"use client";

import {useTranslations} from 'next-intl';
import {Link, usePathname, useRouter} from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';
import { Compass, Heart, BookOpen, ShoppingBag, Clock, FileText, Sparkles, Gem, Stars } from 'lucide-react';

function SidebarContent({ children }: { children: React.ReactNode }) {
  const n = useTranslations('Navigation');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      setIsLoggedIn(!!token);
    };

    checkAuth();
    
    // Check on every pathname change as well
    const interval = setInterval(checkAuth, 1000); 

    window.addEventListener('storage', checkAuth);
    window.addEventListener('focus', checkAuth);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, [pathname]);

  const menu = [
    { id: 'charts', href: '/kundali/result?tab=charts', icon: <FileText size={18} />, label: 'Charts & Insights' },
    { id: 'daily', href: '/kundali/result?tab=daily', icon: <Sparkles size={18} />, label: 'Daily Guide' },
    { id: 'marriage', href: '/matching?context=marriage&mode=vedic', icon: <Gem size={18} />, label: 'Marriage Match' },
    { id: 'lovebirds', href: '/matching?context=relationship&mode=lovers', icon: <Heart size={18} className="text-pink-500" />, label: 'LoveBirds' },
    { id: 'year-book', href: '/year-book', icon: <BookOpen size={18} />, label: n('year-book') },
    { id: 'marketplace', href: '/marketplace', icon: <ShoppingBag size={18} />, label: n('marketplace') },
    { id: 'muhurat', href: '/muhurat', icon: <Clock size={18} />, label: n('muhurat') }
  ];

  const isHomePage = pathname === '/' || pathname === '';
  if (!isLoggedIn || isHomePage) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-20 bottom-0 w-64 bg-background/50 backdrop-blur-2xl border-r border-border z-40 hidden lg:block overflow-y-auto">
        <div className="p-6 h-full flex flex-col space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-4 ml-2">Main Menu</h3>
          <div className="flex-1 space-y-2">
            {menu.map((item) => {
              let isActive = false;
              const currentTab = searchParams.get('tab');
              
              if (item.id === 'charts') {
                isActive = pathname.includes('/kundali/result') && (currentTab === 'charts' || !currentTab);
              } else if (item.id === 'daily') {
                isActive = pathname.includes('/kundali/result') && currentTab === 'daily';
              } else if (item.id === 'marriage') {
                isActive = pathname.includes('/matching') && searchParams.get('context') === 'marriage';
              } else if (item.id === 'lovebirds') {
                isActive = pathname.includes('/matching') && searchParams.get('mode') === 'lovers';
              } else {
                isActive = pathname.includes(`/${item.id}`);
              }
              
              // Helper to append current search params to preserve user data context
              const getHref = () => {
                let base = item.href;
                let query = '';
                
                if (item.href.includes('?')) {
                  [base, query] = item.href.split('?');
                }
                
                const itemParams = new URLSearchParams(query);
                const combined = new URLSearchParams(searchParams.toString());
                itemParams.forEach((v, k) => combined.set(k, v));
                
                const hasUserData = combined.get('day') && combined.get('month') && combined.get('year');

                // If user wants to see personalized charts/daily guide but we lack data, send to form
                if ((item.id === 'charts' || item.id === 'daily') && !hasUserData) {
                  return '/kundali';
                }

                return query ? `${base}?${combined.toString()}` : base;
              };

              return (
                <div key={item.id} className="space-y-1">
                  <Link
                    href={getHref()}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold uppercase tracking-widest text-[10px] ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-text-secondary hover:bg-foreground/5 hover:text-foreground'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Astro Gyan Section */}
          <div className="mt-auto pt-8">
            <div className="relative group cursor-pointer overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-4 transition-all hover:border-primary/40">
              <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-4">
                <img 
                  src="/images/astro_gyan.png" 
                  alt="Astro Gyan" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                      <Sparkles size={10} className="text-primary" /> Astro Gyan
                  </p>
                </div>
              </div>
              <p className="text-[9px] font-medium text-text-secondary leading-relaxed italic">
                "The movement of Jupiter today suggests a period of expansion in knowledge. Seek wisdom in the unseen."
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Adjust padding based on sidebar presence */}
      <div className="lg:pl-64 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="transition-all duration-300">{children}</div>}>
      <SidebarContent>{children}</SidebarContent>
    </Suspense>
  );
}
