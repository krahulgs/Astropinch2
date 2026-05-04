"use client";

import {useTranslations} from 'next-intl';
import { Link } from '@/i18n/routing';
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Stars, Compass, Zap, Shield, Sparkles } from 'lucide-react';

interface PredictionData {
  sign: string;
  modules: {
    soul_essence: string;
    current_season: string;
    actionable_pillars: {
      wealth: string;
      career: string;
      health: string;
    };
    remedy: string;
    risk_synthesis?: { [key: string]: { level: string; explanation: string } }; market_intelligence?: { [key: string]: string };
  };
  scores: {
    love: number;
    career: number;
    health: number;
  };
  risk_level: {
    label: 'Low' | 'Medium' | 'High';
    score: number;
  };
  cautions: string[];
  power_actions: string[];
  citation: string;
}

export default function SignPage({ params }: { params: Promise<{ sign: string }> }) {
  const t = useTranslations('Horoscope');
  const { sign } = React.use(params);
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/horoscope/sign?sign=${sign}`);
        if (!res.ok) throw new Error('Failed to fetch horoscope data');
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Horoscope Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sign]);

  const riskConfig = {
    Low:    { color: 'text-highlight', bg: 'bg-highlight/10', border: 'border-highlight/30', ring: 'text-highlight', bar: 'bg-highlight', icon: '🟢' },
    Medium: { color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/30', ring: 'text-secondary', bar: 'bg-secondary', icon: '🟡' },
    High:   { color: 'text-alert',     bg: 'bg-alert/10',     border: 'border-alert/30',     ring: 'text-alert',     bar: 'bg-alert',     icon: '🔴' },
  };

  const risk = data?.risk_level ? riskConfig[data.risk_level.label] : riskConfig['Low'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary animate-pulse">Consulting the Stars...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full p-10 rounded-[3rem] bg-surface border border-border text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-alert/10 flex items-center justify-center text-alert mx-auto">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif italic text-foreground">Insights Unavailable</h2>
          <p className="text-xs text-text-secondary leading-relaxed uppercase tracking-widest font-bold">
            We couldn't retrieve the planetary alignment for {sign} at this moment. Please try again in a few minutes.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full h-14 rounded-full bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen text-foreground">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-8 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="space-y-1">
            <h1 className="text-6xl md:text-8xl font-medium tracking-tight italic font-serif capitalize text-foreground">
              {t(sign)}
            </h1>
            <p className="text-secondary font-bold tracking-[0.2em] uppercase text-xs">
              Daily Insights · {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Link 
            href="/horoscope"
            className="px-6 py-3 rounded-full bg-surface border border-border text-[10px] font-black uppercase tracking-widest hover:bg-foreground/5 transition-all"
          >
            ← Back to All Signs
          </Link>
        </div>

        {/* MODULE A: THE SOUL ESSENCE */}
        <div className="p-10 rounded-[3rem] bg-surface border border-border backdrop-blur-xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
           <div className="flex items-center gap-4 border-b border-border pb-4">
             <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Stars size={24} /></div>
             <div>
               <h2 className="text-2xl font-bold text-foreground">The Soul Essence</h2>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Lagna & Moon Analysis</p>
             </div>
           </div>
           
           <div className="grid gap-6">
             {data?.modules.soul_essence.split('SECTION:').filter(s => s.trim()).map((section, i) => {
               const lines = section.trim().split('\n');
               let title = lines[0].replace(/[🌌⏳🔭⚡💰🚀🌿📿]/g, '').trim();
               const body = lines.slice(1).join('\n');
               return (
                 <div key={i} className="group relative p-6 rounded-[2rem] bg-foreground/[0.02] border border-border/50 hover:border-primary/30 hover:bg-foreground/[0.04] transition-all duration-500">
                   <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-3 mb-1">
                       <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                         {title.includes('Soul') || title.includes('Celestial') ? <Stars size={16} /> : 
                          title.includes('Why') || title.includes('Logic') ? <Compass size={16} /> : 
                          title.includes('Move') || title.includes('Action') ? <Zap size={16} /> : 
                          <Sparkles size={16} />}
                       </div>
                       <h3 className="text-lg font-serif italic text-primary group-hover:translate-x-1 transition-transform duration-500">
                         {title}
                       </h3>
                     </div>
                     <p className="text-base text-text-secondary leading-relaxed font-normal">
                       {body}
                     </p>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>

        {/* MODULE B: THE CURRENT SEASON */}
        <div className="p-10 rounded-[3rem] bg-surface border border-border backdrop-blur-xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
           <div className="flex items-center gap-4 border-b border-border pb-4">
             <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary"><Compass size={24} /></div>
             <div>
               <h2 className="text-2xl font-bold text-foreground">The Current Season</h2>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Dasha & Transit Themes</p>
             </div>
           </div>
           <p className="text-lg text-text-secondary leading-relaxed font-normal">
             {data?.modules.current_season}
           </p>
        </div>

        {/* MODULE C: ACTIONABLE PILLARS */}
        <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
           {[
             { title: 'Wealth', icon: '💰', color: 'text-highlight', content: data?.modules.actionable_pillars.wealth },
             { title: 'Career', icon: '🎯', color: 'text-primary', content: data?.modules.actionable_pillars.career },
             { title: 'Health', icon: '🌿', color: 'text-alert', content: data?.modules.actionable_pillars.health }
           ].map(pillar => (
             <div key={pillar.title} className="p-8 rounded-[2.5rem] bg-surface border border-border flex flex-col gap-4">
               <div className="flex items-center gap-3">
                 <span className="text-2xl">{pillar.icon}</span>
                 <h3 className={`text-lg font-bold ${pillar.color}`}>{pillar.title}</h3>
               </div>
               <p className="text-sm text-text-secondary leading-relaxed">{pillar.content}</p>
             </div>
           ))}
        </div>

        {/* MODULE D: ASTROPINCH REMEDY */}
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20 backdrop-blur-xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
           <div className="flex items-center gap-4 border-b border-secondary/20 pb-4">
             <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-2xl">📿</div>
             <div>
               <h2 className="text-2xl font-bold text-foreground">The Astropinch® Remedy</h2>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Vedic Prescription</p>
             </div>
           </div>
           <p className="text-lg text-foreground/90 leading-relaxed font-medium">
             {data?.modules.remedy}
           </p>
           
           <div className="p-4 rounded-2xl border border-border mt-4">
             <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1">Accuracy Citation</p>
             <p className="text-xs text-secondary/80 italic">{data?.citation}</p>
           </div>
        </div>

        {/* Score Bars */}
        <div className="p-10 rounded-[3rem] bg-surface border border-border backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <h3 className="text-xl font-bold text-foreground mb-8">Daily Energy Scores</h3>
          <div className="grid md:grid-cols-3 gap-8">
             {[
               { label: 'Love', value: data?.scores.love, color: 'bg-alert' },
               { label: 'Career', value: data?.scores.career, color: 'bg-primary' },
               { label: 'Health', value: data?.scores.health, color: 'bg-highlight' }
             ].map((stat) => (
               <div key={stat.label} className="space-y-3">
                 <div className="flex justify-between text-sm font-medium">
                   <span className="text-text-secondary">{stat.label}</span>
                   <span className="text-foreground font-bold">{stat.value}%</span>
                 </div>
                 <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                   <div className={`${stat.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${stat.value}%` }}></div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* RISK LEVEL */}
        {data?.risk_level && (
          <div className={`p-8 rounded-[2.5rem] ${risk.bg} border-2 ${risk.border} backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-secondary">Today's Risk Level</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{risk.icon}</span>
                  <h3 className={`text-4xl font-serif italic font-bold ${risk.color}`}>{data.risk_level.label} Risk</h3>
                </div>
                <p className={`text-sm ${risk.color} font-medium`}>
                  {data.risk_level.label === 'Low' && 'Planetary energies are in your favour — proceed with confidence.'}
                  {data.risk_level.label === 'Medium' && 'Mixed planetary influences — proceed thoughtfully and with awareness.'}
                  {data.risk_level.label === 'High' && 'Challenging transits are active — heighten vigilance in key areas today.'}
                </p>
              </div>
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-foreground/10" />
                  <circle
                    cx="50" cy="50" r="42" strokeWidth="8" fill="transparent"
                    stroke="currentColor"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - (data.risk_level.score / 100))}`}
                    strokeLinecap="round"
                    className={`${risk.ring} transition-all duration-1000`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-serif font-bold italic ${risk.color}`}>{data.risk_level.score}</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">/ 100</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAUTIONS */}
        {data?.cautions && data.cautions.length > 0 && (
          <div className="p-8 rounded-[2.5rem] bg-alert/5 border-2 border-alert/20 backdrop-blur-xl space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-alert/15 flex items-center justify-center text-xl">⚠️</div>
              <div>
                <h3 className="text-xl font-bold text-alert uppercase tracking-widest text-sm">Cautions for Today</h3>
                <p className="text-[10px] text-alert/60 uppercase tracking-wider">Planetary warnings to be aware of</p>
              </div>
            </div>
            <div className="space-y-3 pl-2">
              {data.cautions.map((caution, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-alert/20 border border-alert/30 flex items-center justify-center text-[10px] font-bold text-alert flex-shrink-0 mt-0.5 group-hover:bg-alert/30 transition-colors">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{caution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POWER ACTIONS */}
        {data?.power_actions && data.power_actions.length > 0 && (
          <div className="p-8 rounded-[2.5rem] bg-highlight/5 border-2 border-highlight/20 backdrop-blur-xl space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-highlight/15 flex items-center justify-center text-xl">⚡</div>
              <div>
                <h3 className="text-xl font-bold text-highlight uppercase tracking-widest text-sm">Power Actions</h3>
                <p className="text-[10px] text-highlight/60 uppercase tracking-wider">Harness today's planetary energy</p>
              </div>
            </div>
            <div className="space-y-3 pl-2">
              {data.power_actions.map((action, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-highlight/20 border border-highlight/30 flex items-center justify-center text-[10px] font-bold text-highlight flex-shrink-0 mt-0.5 group-hover:bg-highlight/30 transition-colors">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── MODULE E: WEALTH & MARKET INTELLIGENCE ─── */}
        {data?.modules.market_intelligence && Object.keys(data.modules.market_intelligence).length > 0 && (
          <div className="p-10 rounded-[3rem] bg-foreground/[0.03] border border-border space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
            <div className="flex items-center gap-4 border-b border-border pb-4">
              <div className="w-12 h-12 rounded-full bg-highlight/10 flex items-center justify-center text-highlight"><Zap size={24} /></div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Wealth & Market Intelligence</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Financial Guidance & Analysis</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sentiment Card */}
              <div className="p-6 rounded-[2rem] bg-surface border border-border space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Market Sentiment</p>
                <p className="text-2xl font-serif italic text-primary">{data.modules.market_intelligence.sentiment || 'Neutral'}</p>
              </div>

              {/* Suitability Card */}
              <div className="p-6 rounded-[2rem] bg-surface border border-border space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Suitability</p>
                <p className="text-2xl font-serif italic text-highlight">{data.modules.market_intelligence.suitable || 'With Caution'}</p>
              </div>

              {/* Rationale - Full Width on small, 1/3 on large */}
              <div className="md:col-span-2 lg:col-span-1 p-6 rounded-[2rem] bg-surface border border-border space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Investment Rationale</p>
                <p className="text-sm text-foreground/80 leading-relaxed font-normal">{data.modules.market_intelligence.rationale}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Favored Sectors */}
              <div className="p-8 rounded-[2.5rem] bg-highlight/5 border border-highlight/20 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-highlight">Favored Sectors</h4>
                <div className="flex flex-wrap gap-2">
                  {data.modules.market_intelligence.favored?.split('|').map((s: string) => (
                    <span key={s} className="px-4 py-2 rounded-full bg-highlight/10 text-highlight text-[10px] font-bold uppercase tracking-widest border border-highlight/20">{s.trim?.() || s.trim()}</span>
                  ))}
                </div>
              </div>

              {/* Avoid Sectors */}
              <div className="p-8 rounded-[2.5rem] bg-alert/5 border border-alert/20 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-alert">Sectors to Avoid</h4>
                <div className="flex flex-wrap gap-2">
                  {data.modules.market_intelligence.avoid?.split('|').map((s: string) => (
                    <span key={s} className="px-4 py-2 rounded-full bg-alert/10 text-alert text-[10px] font-bold uppercase tracking-widest border border-alert/20">{s.trim?.() || s.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE E: AI RISK ASSESSMENT */}
        {data?.modules.risk_synthesis && Object.keys(data.modules.risk_synthesis).length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <h3 className="text-xl font-bold text-foreground px-4 flex items-center gap-2">
              <Shield className="text-secondary" size={18} /> Deep Risk Synthesis
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(data.modules.risk_synthesis).map(([key, value]) => {
                const colors: any = {
                  Low: "text-highlight bg-highlight/10 border-highlight/20",
                  Moderate: "text-secondary bg-secondary/10 border-secondary/20",
                  High: "text-alert bg-alert/10 border-alert/20"
                };
                const color = colors[value.level as string] || colors.Low;
                return (
                  <div key={key} className="p-6 rounded-[2rem] bg-surface border border-border hover:border-foreground/20 transition-all group">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-text-secondary capitalize">{key}</h4>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${color}`}>
                        {value.level}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed font-normal">
                      {value.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Citation */}
        <div className="text-center pt-8 opacity-50">
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary">
             {data?.citation || 'Grounded in Sidereal Jyotish Logic · NASA Ephemeris v4.2'}
           </p>
        </div>
      </div>
    </main>
  );
}
