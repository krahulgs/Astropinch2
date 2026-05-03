"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  ];

  const currentLanguage = languages.find(l => l.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface border border-border hover:bg-foreground/5 transition-all group"
        aria-label="Change language"
      >
        <Globe size={16} className="text-text-secondary group-hover:text-primary transition-colors" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground hidden lg:block">
          {currentLanguage.native}
        </span>
        <ChevronDown size={12} className={`text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-48 p-2 rounded-2xl bg-surface border border-border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 origin-top-right z-[60]">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group ${
                  locale === lang.code 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-foreground/5 text-text-secondary hover:text-foreground'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold">{lang.native}</span>
                  <span className="text-[9px] uppercase tracking-tighter opacity-60">{lang.name}</span>
                </div>
                {locale === lang.code && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
