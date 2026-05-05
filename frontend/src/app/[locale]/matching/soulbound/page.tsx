"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Heart, Star, Zap, MessageCircle, Brain, Lock, ArrowRight, Sparkles } from 'lucide-react';
import Skeleton from '@/components/Skeleton';

interface SoulboundData {
  overall_score: number;
  verdict: string;
  verdict_tagline: string;
  scores: {
    emotional: number;
    communication: number;
    physical_chemistry: number;
    intellectual: number;
    long_term_potential: number;
    values_alignment: number;
  };
  vedic: {
    guna_score: string;
    summary: string;
  };
  astrology: {
    element_match: string;
    summary: string;
  };
  numerology: {
    person1_life_path: number;
    person2_life_path: number;
    summary: string;
  };
  attachment_dynamic: string;
  love_language_compatibility: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
  romantic_summary: string;
  celebrity_match: string;
  best_together_at: string;
  watch_out_for: string;
}

export default function SoulboundResultPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<SoulboundData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/matching/soulbound`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            person1: {
              name: searchParams.get('b_name') || 'Partner 1',
              dob: `${searchParams.get('b_year')}-${String(searchParams.get('b_month')).padStart(2, '0')}-${String(searchParams.get('b_day')).padStart(2, '0')}`,
              time: `${String(searchParams.get('b_hour')).padStart(2, '0')}:${String(searchParams.get('b_minute') || searchParams.get('b_min')).padStart(2, '0')}`,
              lat: parseFloat(searchParams.get('b_lat') || '28.6139'),
              lon: parseFloat(searchParams.get('b_lon') || '77.2090'),
              mbti: searchParams.get('b_mbti') || 'INFJ',
              love_language: searchParams.get('b_love') || 'Quality Time',
              gender: searchParams.get('b_gender') || 'Female'
            },
            person2: {
              name: searchParams.get('g_name') || 'Partner 2',
              dob: `${searchParams.get('g_year')}-${String(searchParams.get('g_month')).padStart(2, '0')}-${String(searchParams.get('g_day')).padStart(2, '0')}`,
              time: `${String(searchParams.get('g_hour')).padStart(2, '0')}:${String(searchParams.get('g_minute') || searchParams.get('g_min')).padStart(2, '0')}`,
              lat: parseFloat(searchParams.get('g_lat') || '19.0760'),
              lon: parseFloat(searchParams.get('g_lon') || '72.8777'),
              mbti: searchParams.get('g_mbti') || 'ENTP',
              love_language: searchParams.get('g_love') || 'Words of Affirmation',
              gender: searchParams.get('g_gender') || 'Male'
            }
          })
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  if (loading) {
    return (
      <main className="relative pt-32 pb-20 px-6 min-h-screen text-foreground">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 flex flex-col items-center">
            <Skeleton className="h-12 w-64" />
            <Skeleton variant="circle" className="w-56 h-56" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
          </div>
        </div>
      </main>
    );
  }

  if (!data) return <div className="min-h-screen flex items-center justify-center text-foreground">Error loading Soulbound report.</div>;

  return (
    <main className="relative pt-32 pb-32 px-6 min-h-screen text-foreground overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-7xl mx-auto space-y-20">
        {/* Hero Section */}
        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles size={12} /> Soulbound Analysis Complete
          </div>
          
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-3xl group-hover:bg-pink-500/30 transition-all duration-700"></div>
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex flex-col items-center justify-center border-4 border-pink-500/20 rounded-full bg-surface/40 backdrop-blur-md">
              <span className="text-7xl md:text-9xl font-serif italic text-foreground leading-none">{data.overall_score}</span>
              <span className="text-xs font-black uppercase tracking-[0.4em] text-pink-500 mt-2">Soul Affinity</span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight">
              Verdict: <span className="text-pink-500">{data.verdict}</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary font-normal max-w-2xl mx-auto leading-relaxed italic">
              "{data.verdict_tagline}"
            </p>
          </div>
        </div>

        {/* Core Pillars Score Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {[
            { label: 'Emotional', score: data.scores?.emotional || 0, icon: <Heart size={20} className="text-pink-500" /> },
            { label: 'Communication', score: data.scores?.communication || 0, icon: <MessageCircle size={20} className="text-blue-500" /> },
            { label: 'Physical', score: data.scores?.physical_chemistry || 0, icon: <Zap size={20} className="text-yellow-500" /> },
            { label: 'Intellectual', score: data.scores?.intellectual || 0, icon: <Brain size={20} className="text-purple-500" /> },
            { label: 'Long-term', score: data.scores?.long_term_potential || 0, icon: <Star size={20} className="text-green-500" /> },
            { label: 'Values', score: data.scores?.values_alignment || 0, icon: <Lock size={20} className="text-orange-500" /> },
          ].map((item, i) => (
            <div key={i} className="p-6 md:p-8 rounded-[2.5rem] bg-surface border border-border backdrop-blur-sm group hover:border-pink-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-foreground/5">{item.icon}</div>
                <span className="text-2xl font-serif italic text-foreground">{item.score}%</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{item.label}</p>
              <div className="mt-4 h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-500 transition-all duration-1000 delay-500" 
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Poetic Summary */}
        <div className="p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-pink-500/10 via-surface to-purple-500/10 border border-pink-500/20 relative overflow-hidden text-center">
           <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
           <div className="relative z-10 space-y-8">
             <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/40">
               <Heart size={32} />
             </div>
             <h2 className="text-4xl md:text-5xl font-serif italic text-foreground">The Celestial Synthesis</h2>
             <p className="text-xl md:text-3xl text-foreground/80 font-normal leading-relaxed max-w-4xl mx-auto font-serif italic">
               {data.romantic_summary}
             </p>
           </div>
        </div>

        {/* Framework Details */}
        <div className="grid md:grid-cols-2 gap-8">
           {/* Vedic Section */}
           <div className="p-10 rounded-[3rem] bg-surface border border-border space-y-6">
             <div className="flex items-center gap-3">
               <span className="text-2xl">🕉️</span>
               <h3 className="text-xl font-bold text-foreground">Vedic Guna Milan</h3>
             </div>
             <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/20">
               <p className="text-3xl font-serif italic text-pink-500">{data.vedic.guna_score}</p>
               <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500/60 mt-1">Total Compatibility</p>
             </div>
             <p className="text-text-secondary text-sm leading-relaxed font-normal">{data.vedic.summary}</p>
           </div>

           {/* Astrology Section */}
           <div className="p-10 rounded-[3rem] bg-surface border border-border space-y-6">
             <div className="flex items-center gap-3">
               <span className="text-2xl">✨</span>
               <h3 className="text-xl font-bold text-foreground">Western Astrology</h3>
             </div>
             <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
               <p className="text-lg font-medium text-blue-500">{data.astrology.element_match}</p>
               <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500/60 mt-1">Element Synergy</p>
             </div>
             <p className="text-text-secondary text-sm leading-relaxed font-normal">{data.astrology.summary}</p>
           </div>

           {/* Numerology Section */}
           <div className="p-10 rounded-[3rem] bg-surface border border-border space-y-6">
             <div className="flex items-center gap-3">
               <span className="text-2xl">🔢</span>
               <h3 className="text-xl font-bold text-foreground">Numerology Vibes</h3>
             </div>
             <div className="flex gap-4">
                <div className="flex-1 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-center">
                  <p className="text-2xl font-serif italic text-purple-500">{data.numerology.person1_life_path}</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-purple-500/60">Partner 1</p>
                </div>
                <div className="flex-1 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-center">
                  <p className="text-2xl font-serif italic text-purple-500">{data.numerology.person2_life_path}</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-purple-500/60">Partner 2</p>
                </div>
             </div>
             <p className="text-text-secondary text-sm leading-relaxed font-normal">{data.numerology.summary}</p>
           </div>

           {/* Psych Section */}
           <div className="p-10 rounded-[3rem] bg-surface border border-border space-y-6">
             <div className="flex items-center gap-3">
               <span className="text-2xl">🧠</span>
               <h3 className="text-xl font-bold text-foreground">Psychological Sync</h3>
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Attachment Dynamic</span>
                  <span className="font-bold text-foreground">{data.attachment_dynamic}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Love Language</span>
                  <span className="font-bold text-foreground">{data.love_language_compatibility}</span>
                </div>
             </div>
           </div>
        </div>

        {/* Strengths & Challenges */}
        <div className="grid md:grid-cols-2 gap-12">
           <div className="space-y-8">
             <h3 className="text-2xl font-serif italic text-foreground flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">✓</div>
               Cosmic Strengths
             </h3>
             <ul className="space-y-6">
               {(data.strengths || []).map((s, i) => (
                 <li key={i} className="flex gap-4 items-start group">
                   <span className="text-green-500 mt-1">•</span>
                   <p className="text-text-secondary font-normal group-hover:text-foreground transition-colors">{s}</p>
                 </li>
               ))}
             </ul>
           </div>
           <div className="space-y-8">
             <h3 className="text-2xl font-serif italic text-foreground flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">!</div>
               Growth Challenges
             </h3>
             <ul className="space-y-6">
               {(data.challenges || []).map((c, i) => (
                 <li key={i} className="flex gap-4 items-start group">
                   <span className="text-red-500 mt-1">•</span>
                   <p className="text-text-secondary font-normal group-hover:text-foreground transition-colors">{c}</p>
                 </li>
               ))}
             </ul>
           </div>
        </div>

        {/* Actionable Advice */}
        <div className="p-12 md:p-16 rounded-[4rem] bg-surface border border-border space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-serif italic text-foreground">Guided Relationship Path</h2>
            <p className="text-text-secondary font-normal">Practical wisdom to nurture your unique celestial bond.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {(data.advice || []).map((a, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-foreground/5 space-y-4 hover:bg-foreground/10 transition-all border border-transparent hover:border-pink-500/20">
                <span className="text-2xl font-serif italic text-pink-500">0{i+1}</span>
                <p className="text-sm text-foreground leading-relaxed font-normal">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fun Extras */}
        <div className="grid md:grid-cols-3 gap-8">
           <div className="p-8 rounded-[2.5rem] bg-surface border border-border flex flex-col items-center text-center space-y-4">
             <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center"><Star size={24} /></div>
             <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Celebrity Archetype</p>
             <p className="text-foreground font-medium text-sm leading-relaxed">{data.celebrity_match}</p>
           </div>
           <div className="p-8 rounded-[2.5rem] bg-surface border border-border flex flex-col items-center text-center space-y-4">
             <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center"><Zap size={24} /></div>
             <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Thrive Scenario</p>
             <p className="text-foreground font-medium text-sm leading-relaxed">{data.best_together_at}</p>
           </div>
           <div className="p-8 rounded-[2.5rem] bg-surface border border-border flex flex-col items-center text-center space-y-4">
             <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center"><Lock size={24} /></div>
             <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Key Trigger</p>
             <p className="text-foreground font-medium text-sm leading-relaxed">{data.watch_out_for}</p>
           </div>
        </div>

        <div className="text-center pt-10">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-3 px-12 py-6 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-xs hover:bg-pink-500 transition-all shadow-2xl mx-auto"
          >
            Get Full 40-Page Soulbound PDF <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}
