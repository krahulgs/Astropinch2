"use client";

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import { Sparkles } from 'lucide-react';

export default function HoroscopePage() {
  const t = useTranslations('Horoscope');
  
  const signs = [
    { name: 'aries', icon: '♈', date: 'Mar 21 - Apr 19' },
    { name: 'taurus', icon: '♉', date: 'Apr 20 - May 20' },
    { name: 'gemini', icon: '♊', date: 'May 21 - Jun 20' },
    { name: 'cancer', icon: '♋', date: 'Jun 21 - Jul 22' },
    { name: 'leo', icon: '♌', date: 'Jul 23 - Aug 22' },
    { name: 'virgo', icon: '♍', date: 'Aug 23 - Sep 22' },
    { name: 'libra', icon: '♎', date: 'Sep 23 - Oct 22' },
    { name: 'scorpio', icon: '♏', date: 'Oct 23 - Nov 21' },
    { name: 'sagittarius', icon: '♐', date: 'Nov 22 - Dec 21' },
    { name: 'capricorn', icon: '♑', date: 'Dec 22 - Jan 19' },
    { name: 'aquarius', icon: '♒', date: 'Jan 20 - Feb 18' },
    { name: 'pisces', icon: '♓', date: 'Feb 19 - Mar 20' }
  ];

  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-8">
          <Sparkles size={12} /> The Celestial Pulse
        </div>
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1] italic font-serif text-foreground mb-6">
          The Stars Speak. <br className="hidden md:block" />
          <span className="text-text-secondary font-light text-4xl md:text-5xl">Are You Listening?</span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary font-light leading-relaxed mb-10">
          Every day, the planetary alignments shift—opening new doorways to wealth, love, and spiritual growth while closing others. Don't leave your day to chance. Tap into your sun sign below to uncover today's cosmic blueprint and step into your highest potential.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {signs.map((sign) => (
          <Link 
            key={sign.name} 
            href={`/horoscope/${sign.name}`}
            className="p-8 rounded-[2.5rem] bg-surface border border-border backdrop-blur-sm hover:bg-foreground/5 transition-all cursor-pointer text-center group relative overflow-hidden"
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="text-5xl mb-6 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500 relative z-10">
               {sign.icon}
            </div>
            <h3 className="text-xl font-bold relative z-10 text-foreground">{t(sign.name)}</h3>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-2 relative z-10">{sign.date}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
