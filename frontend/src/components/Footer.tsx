"use client";

import React from 'react';
import { usePathname, Link } from '@/i18n/routing';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations('Footer');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, [pathname]);
  
  // Hide footer on consultation pages to keep it immersive
  if (pathname.includes('/marketplace/consult/')) return null;

  return (
    <footer className={`bg-surface text-text-secondary ${!isLoggedIn ? 'py-16' : 'py-8'} border-t border-border`}>
      {!isLoggedIn && (
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 text-sm">
        
        {/* Brand & Social Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
              ✨
            </div>
            <span className="text-xl font-bold text-foreground tracking-wide">AstroPinch®</span>
          </div>
          <p className="text-text-secondary/80 leading-relaxed text-xs">
            {t('description')}
          </p>
          <div className="flex items-center gap-4 text-text-secondary font-bold text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Facebook</a>
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
          </div>
        </div>

        {/* Popular Services */}
        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">{t('popular_services.title')}</h4>
          <ul className="space-y-3 text-text-secondary/70 text-xs">
            <li><Link href="/kundali" className="hover:text-primary transition-colors">{t('popular_services.free_kundali')}</Link></li>
            <li><Link href="/kundali" className="hover:text-primary transition-colors">{t('popular_services.birth_chart')}</Link></li>
            <li><Link href="/horoscope" className="hover:text-primary transition-colors">{t('popular_services.horoscope')}</Link></li>
            <li><Link href="/services/career-astrology" className="hover:text-primary transition-colors">{t('popular_services.career')}</Link></li>
            <li><Link href="/matching" className="hover:text-primary transition-colors">{t('popular_services.matching')}</Link></li>
            <li><Link href="/services/mangal-dosha" className="hover:text-primary transition-colors">{t('popular_services.mangal_dosha')}</Link></li>
            <li><Link href="/services/numerology" className="hover:text-primary transition-colors">{t('popular_services.numerology')}</Link></li>
            <li><Link href="/muhurat" className="hover:text-primary transition-colors">{t('popular_services.muhurat')}</Link></li>
            <li><Link href="/premium" className="hover:text-primary transition-colors">{t('popular_services.premium')}</Link></li>
          </ul>
        </div>

        {/* Systems & Learn */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">{t('systems.title')}</h4>
            <ul className="space-y-3 text-text-secondary/70 text-xs">
              <li><Link href="/systems/vedic" className="hover:text-primary transition-colors">{t('systems.vedic')}</Link></li>
              <li><Link href="/systems/kp" className="hover:text-primary transition-colors">{t('systems.kp')}</Link></li>
              <li><Link href="/services/numerology" className="hover:text-primary transition-colors">{t('systems.numerology')}</Link></li>
              <li><Link href="/muhurat" className="hover:text-primary transition-colors">{t('systems.panchang')}</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">{t('learn.title')}</h4>
            <ul className="space-y-3 text-text-secondary/70 text-xs">
              <li><Link href="/learn/basics" className="hover:text-primary transition-colors">{t('learn.basics')}</Link></li>
              <li><Link href="/learn/planets" className="hover:text-primary transition-colors">{t('learn.planetary')}</Link></li>
              <li><Link href="/horoscope" className="hover:text-primary transition-colors">{t('learn.rashis')}</Link></li>
              <li><Link href="/learn/yogas" className="hover:text-primary transition-colors">{t('learn.yogas')}</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">{t('learn.blog')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Why Choose AstroPinch */}
        <div className="p-6 rounded-3xl bg-foreground/[0.03] border border-border/50 space-y-6 lg:col-span-1 shadow-sm">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Why Choose AstroPinch®</h4>
          <ul className="space-y-3 text-text-secondary/80 text-[11px]">
            <li className="flex items-start gap-2 group">
              <Check size={14} className="text-primary mt-0.5 shrink-0 group-hover:scale-125 transition-transform" />
              <span className="group-hover:text-foreground transition-colors">Accurate AI-Based Predictions</span>
            </li>
            <li className="flex items-start gap-2 group">
              <Check size={14} className="text-primary mt-0.5 shrink-0 group-hover:scale-125 transition-transform" />
              <span className="group-hover:text-foreground transition-colors">Easy-to-Understand Language</span>
            </li>
            <li className="flex items-start gap-2 group">
              <Check size={14} className="text-primary mt-0.5 shrink-0 group-hover:scale-125 transition-transform" />
              <span className="group-hover:text-foreground transition-colors">Verified Astrological Logic</span>
            </li>
            <li className="flex items-start gap-2 group">
              <Check size={14} className="text-primary mt-0.5 shrink-0 group-hover:scale-125 transition-transform" />
              <span className="group-hover:text-foreground transition-colors">Secure Online Payments</span>
            </li>
            <li className="flex items-start gap-2 group">
              <Check size={14} className="text-primary mt-0.5 shrink-0 group-hover:scale-125 transition-transform" />
              <span className="group-hover:text-foreground transition-colors">Trusted by Users Worldwide</span>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">{t('company.title')}</h4>
          <ul className="space-y-3 text-text-secondary/70 text-xs">
            <li><Link href="/about" className="hover:text-primary transition-colors">{t('company.about')}</Link></li>
            <li><Link href="/how-it-works" className="hover:text-primary transition-colors">{t('company.how_it_works')}</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">{t('company.contact')}</Link></li>
            <li><Link href="/help" className="hover:text-primary transition-colors">{t('company.help')}</Link></li>
            <li><Link href="/partnership" className="hover:text-primary transition-colors">{t('company.partnership')}</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">{t('legal.title')}</h4>
          <ul className="space-y-3 text-text-secondary/70 text-xs">
            <li><Link href="/privacy" className="hover:text-primary transition-colors">{t('legal.privacy')}</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">{t('legal.terms')}</Link></li>
            <li><Link href="/disclaimer" className="hover:text-primary transition-colors">{t('legal.disclaimer')}</Link></li>
            <li><Link href="/refund" className="hover:text-primary transition-colors">{t('legal.refund')}</Link></li>
          </ul>
        </div>

        </div>
      )}

      {/* Copyright and Disclaimer */}
      <div className={`max-w-7xl mx-auto px-6 ${!isLoggedIn ? 'mt-16 pt-8 border-t border-border/30' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary/60 text-[10px] text-center md:text-left">
            &copy; {new Date().getFullYear()} AstroPinch. All rights reserved. AstroPinch® is a registered trademark.
          </p>
          <p className="text-text-secondary/50 text-[9px] text-center md:text-right max-w-2xl">
            Disclaimer: The information and astrological interpretations provided by AstroPinch are for entertainment and educational purposes only. They should not be considered a substitute for professional medical, legal, or financial advice. We do not guarantee the accuracy or reliability of any predictions.
          </p>
        </div>
      </div>
    </footer>

  );
}
