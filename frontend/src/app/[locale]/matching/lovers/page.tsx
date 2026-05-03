"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Zap, Flame, AlertCircle, Heart, MessageCircle, Brain, Music, Film, Ghost, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import Skeleton from '@/components/Skeleton';

interface LoversData {
  overall_score: number;
  verdict: string;
  one_line_read: string;
  talking_stage_status: string;
  scores: {
    emotional_safety: number;
    communication: number;
    physical_chemistry: number;
    intellectual_spark: number;
    long_term_potential: number;
    fun_factor: number;
  };
  astrology: {
    sun_compatibility: string;
    venus_match: string;
    mars_dynamic: string;
    moon_match: string;
    overall_astro_vibe: string;
  };
  attachment: {
    person1_style: string;
    person2_style: string;
    dynamic_name: string;
    honest_prediction: string;
    healing_path: string;
  };
  love_language_breakdown: {
    person1_language: string;
    person2_language: string;
    the_misfire: string;
    fix: string;
  };
  green_flags: string[];
  red_flags: string[];
  beige_flags: string[];
  numerology: {
    person1_life_path: number;
    person2_life_path: number;
    lp_verdict: string;
    soul_urge_vibe: string;
  };
  the_real_talk: string;
  their_song: string;
  their_movie: string;
  plot_twist_warning: string;
  if_this_works: string;
  if_this_doesnt: string;
  compatibility_era: string;
}

export default function LoversResultPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<LoversData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/matching/lovers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            person1: {
              name: searchParams.get('b_name') || 'Partner 1',
              dob: `${searchParams.get('b_year')}-${String(searchParams.get('b_month')).padStart(2, '0')}-${String(searchParams.get('b_day')).padStart(2, '0')}`,
              time: `${String(searchParams.get('b_hour')).padStart(2, '0')}:${String(searchParams.get('b_min')).padStart(2, '0')}`,
              lat: parseFloat(searchParams.get('b_lat') || '28.6139'),
              lon: parseFloat(searchParams.get('b_lon') || '77.2090'),
              mbti: searchParams.get('b_mbti') || 'INFJ',
              love_language: searchParams.get('b_love') || 'Quality Time'
            },
            person2: {
              name: searchParams.get('g_name') || 'Partner 2',
              dob: `${searchParams.get('g_year')}-${String(searchParams.get('g_month')).padStart(2, '0')}-${String(searchParams.get('g_day')).padStart(2, '0')}`,
              time: `${String(searchParams.get('g_hour')).padStart(2, '0')}:${String(searchParams.get('g_min')).padStart(2, '0')}`,
              lat: parseFloat(searchParams.get('g_lat') || '19.0760'),
              lon: parseFloat(searchParams.get('g_lon') || '72.8777'),
              mbti: searchParams.get('g_mbti') || 'ENTP',
              love_language: searchParams.get('g_love') || 'Words of Affirmation'
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

  if (loading) return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto space-y-12">
        <Skeleton className="h-20 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-[3rem]" />
      </div>
    </main>
  );

  if (!data) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Failed to execute LOVERS.EXE</div>;

  return (
    <main className="relative pt-24 pb-32 px-6 min-h-screen bg-[#FDFCFB] text-[#1A1220] overflow-hidden selection:bg-pink-100 selection:text-pink-600">
      {/* Soft Gradient Backgrounds */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-pink-100/50 rounded-full blur-[120px] -mr-[20%] -mt-[20%] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-purple-100/50 rounded-full blur-[120px] -ml-[20%] -mb-[20%] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header / Era Tag */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="px-5 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
             <Zap size={12} fill="currentColor" /> LOVERS.EXE v2.0.4 • LIGHT MODE
           </div>
           <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1220]/40">
             COMPATIBILITY ERA: <span className="text-[#1A1220]">{(data.compatibility_era || '').toUpperCase()}</span>
           </div>
        </div>

        {/* Main Score & Verdict Card */}
        <div className="p-10 md:p-16 rounded-[4rem] bg-white border border-pink-500/10 shadow-[0_32px_64px_-16px_rgba(219,39,119,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-[120px] font-black text-pink-500/5 leading-none select-none group-hover:text-pink-500/10 transition-all duration-700">
            {data.overall_score}%
          </div>
          <div className="space-y-8 relative z-10">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.4em] text-pink-500">The Verdict</p>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none text-[#1A1220]">
                {data.verdict.toUpperCase()}
              </h1>
            </div>
            <p className="text-2xl md:text-3xl font-medium leading-tight max-w-2xl border-l-4 border-pink-500 pl-6 py-2 text-[#1A1220]/90">
              {data.one_line_read}
            </p>
            <div className="inline-block px-4 py-1.5 rounded-lg bg-pink-50 text-[10px] font-bold uppercase tracking-widest border border-pink-100 text-pink-600">
              CURRENT STATUS: <span className="font-black">{data.talking_stage_status}</span>
            </div>
          </div>
        </div>

        {/* The Real Talk (Brutal Honesty) */}
        <div className="p-10 rounded-[3.5rem] bg-[#1A1220] text-white space-y-6 shadow-2xl shadow-[#1A1220]/20 relative group">
           <div className="absolute top-4 right-6 text-white/10 group-hover:text-pink-500/40 transition-colors">
              <MessageCircle size={40} />
           </div>
           <div className="flex items-center gap-3">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500">The Real Talk (Unfiltered)</h3>
           </div>
           <p className="text-xl md:text-2xl font-bold leading-tight italic">
             "{data.the_real_talk}"
           </p>
        </div>

        {/* Grid: Astro & Attachment */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Astrology Card */}
          <div className="p-10 rounded-[3rem] bg-white border border-pink-500/10 shadow-xl shadow-pink-500/5 space-y-8">
            <div className="flex items-center gap-3 text-pink-500">
               <Sparkles size={24} />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Astro Vibe Check</h3>
            </div>
            <div className="space-y-6">
               <div className="space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-[#1A1220]/40">Moon Intimacy</p>
                 <p className="text-sm font-medium text-[#1A1220]">{data.astrology.moon_match}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-[#1A1220]/40">Mars Energy</p>
                 <p className="text-sm font-medium text-[#1A1220]">{data.astrology.mars_dynamic}</p>
               </div>
               <div className="p-4 rounded-2xl bg-pink-50 border border-pink-100">
                  <p className="text-xs italic text-pink-700/80">"{data.astrology.overall_astro_vibe}"</p>
               </div>
            </div>
          </div>

          {/* Attachment Card */}
          <div className="p-10 rounded-[3rem] bg-white border border-purple-500/10 shadow-xl shadow-purple-500/5 space-y-8">
            <div className="flex items-center gap-3 text-purple-600">
               <Brain size={24} />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Attachment Dynamics</h3>
            </div>
            <div className="space-y-6">
               <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                  <p className="text-lg font-black italic uppercase tracking-tighter text-purple-600">{data.attachment.dynamic_name}</p>
               </div>
               <div className="space-y-3">
                 <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#1A1220]/40">Honest Prediction</p>
                    <p className="text-sm text-[#1A1220]/80 leading-relaxed">{data.attachment.honest_prediction}</p>
                 </div>
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                    <TrendingUp size={16} className="text-green-600" />
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{data.attachment.healing_path}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Score Metrics */}
        <div className="p-10 md:p-14 rounded-[4rem] bg-white border border-pink-500/10 shadow-2xl shadow-pink-500/5">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1A1220]/40 mb-12 text-center">Metric Deep-Dive</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
             {[
               { label: 'Emotional Safety', val: data.scores.emotional_safety, color: 'bg-blue-400' },
               { label: 'Communication', val: data.scores.communication, color: 'bg-green-400' },
               { label: 'Physical Heat', val: data.scores.physical_chemistry, color: 'bg-pink-400' },
               { label: 'Intellectual Spark', val: data.scores.intellectual_spark, color: 'bg-yellow-400' },
               { label: 'Long-term Potential', val: data.scores.long_term_potential, color: 'bg-purple-400' },
               { label: 'Fun Factor', val: data.scores.fun_factor, color: 'bg-orange-400' }
             ].map((s, i) => (
               <div key={i} className="space-y-4">
                 <div className="flex justify-between items-end">
                   <p className="text-[9px] font-black uppercase tracking-widest text-[#1A1220]/60 leading-none">{s.label}</p>
                   <span className="text-2xl font-black italic leading-none text-[#1A1220]">{s.val}</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                   <div className={`h-full ${s.color} transition-all duration-1000 delay-500`} style={{ width: `${s.val}%` }}></div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Flags Section */}
        <div className="grid md:grid-cols-3 gap-6">
           <div className="p-8 rounded-[3rem] bg-green-50 border border-green-100 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600">Green Flags</h4>
              <ul className="space-y-4">
                {(data.green_flags || []).map((f, i) => (
                  <li key={i} className="text-xs text-green-800 leading-relaxed flex gap-2">
                    <span className="text-green-500">✦</span> {f}
                  </li>
                ))}
              </ul>
           </div>
           <div className="p-8 rounded-[3rem] bg-red-50 border border-red-100 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Red Flags</h4>
              <ul className="space-y-4">
                {(data.red_flags || []).map((f, i) => (
                  <li key={i} className="text-xs text-red-800 leading-relaxed flex gap-2">
                    <span className="text-red-500">🚩</span> {f}
                  </li>
                ))}
              </ul>
           </div>
           <div className="p-8 rounded-[3rem] bg-yellow-50 border border-yellow-100 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-700">Beige Flags</h4>
              <ul className="space-y-4">
                {(data.beige_flags || []).map((f, i) => (
                  <li key={i} className="text-xs text-yellow-800 leading-relaxed flex gap-2">
                    <span className="text-yellow-600">◽</span> {f}
                  </li>
                ))}
              </ul>
           </div>
        </div>

        {/* Pop Culture */}
        <div className="grid md:grid-cols-2 gap-8">
           <div className="p-10 rounded-[3rem] bg-white border border-pink-500/10 flex items-center gap-6 shadow-xl shadow-pink-500/5">
              <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shrink-0"><Music size={32} /></div>
              <div className="space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-[#1A1220]/40">The Anthem</p>
                 <p className="text-lg font-bold leading-tight text-[#1A1220]">{data.their_song}</p>
              </div>
           </div>
           <div className="p-10 rounded-[3rem] bg-white border border-purple-500/10 flex items-center gap-6 shadow-xl shadow-purple-500/5">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0"><Film size={32} /></div>
              <div className="space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-[#1A1220]/40">The Screenplay</p>
                 <p className="text-lg font-bold leading-tight text-[#1A1220]">{data.their_movie}</p>
              </div>
           </div>
        </div>

        {/* Warning Section */}
        <div className="p-12 rounded-[4rem] bg-white border-2 border-red-100 space-y-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 text-red-500 group-hover:scale-110 transition-transform duration-700">
             <AlertCircle size={120} />
           </div>
           <div className="flex items-center gap-3 text-red-600">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Plot Twist Warning</h3>
           </div>
           <p className="text-2xl md:text-3xl font-black italic text-[#1A1220] leading-tight relative z-10">
             "{data.plot_twist_warning}"
           </p>
        </div>

        {/* Future Scenarios */}
        <div className="grid md:grid-cols-2 gap-8">
           <div className="p-10 rounded-[3.5rem] bg-[#10b981] text-white space-y-4 shadow-xl shadow-green-500/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">IF THIS WORKS OUT...</h4>
              <p className="text-xl font-bold leading-tight">{data.if_this_works}</p>
           </div>
           <div className="p-10 rounded-[3.5rem] bg-white border border-pink-500/10 space-y-4 shadow-xl shadow-pink-500/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-500 italic">IF IT FLOPPED...</h4>
              <p className="text-xl font-medium leading-tight text-[#1A1220]/80">{data.if_this_doesnt}</p>
           </div>
        </div>

        {/* Footer Action */}
        <div className="text-center pt-10">
           <button 
             onClick={() => window.print()}
             className="px-12 py-6 bg-[#1A1220] text-white rounded-full font-black uppercase tracking-[0.4em] text-[10px] hover:bg-pink-600 transition-all shadow-2xl shadow-[#1A1220]/20"
           >
             Download Full LOVERS.EXE Log <ArrowRight size={16} className="inline ml-2" />
           </button>
        </div>

      </div>
    </main>
  );
}
