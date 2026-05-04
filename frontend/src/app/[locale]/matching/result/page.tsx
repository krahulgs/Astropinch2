"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Heart, Star, Zap, MessageCircle, Brain, Lock, ArrowRight, Sparkles, ShieldCheck, Calendar, Download, Info, BarChart3, Activity, Stars, AlertTriangle } from 'lucide-react';
import Skeleton from '@/components/Skeleton';
import WesternWheelChart from '@/components/WesternWheelChart';
import NorthIndianChart from '@/components/NorthIndianChart';
import DivorceRiskDashboard from '@/components/DivorceRiskDashboard';

interface Planet {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
  house: number;
  nakshatra?: string;
}

interface ChartData {
  planets: Planet[];
  ascendant: {
    sign: string;
    degree: number;
    longitude: number;
  };
}

interface MatchingData {
  overall_score: number;
  grade: string;
  vedic_score: {
    total: number;
    out_of: number;
    breakdown: Record<string, { received: number; total: number }>;
    doshas: {
      nadi: { present: boolean; cancelled: boolean };
      bhakoot: { present: boolean; cancelled: boolean };
      gana: { present: boolean; cancelled: boolean };
    };
    rajju_dosha: { present: boolean; group: string; severity: string };
    vedha_dosha: boolean;
  };
  western_score: {
    synastry_score: number;
    aspects: {
      p1: string;
      p2: string;
      aspect: string;
      impact: string;
    }[];
  };
  composite: Record<string, any>;
  mangal_dosha: {
    bride: { is_manglik: boolean; severity: string };
    groom: { is_manglik: boolean; severity: string };
    compatibility: string;
  };
  marriage_timing: string[];
  charts: {
    bride: ChartData;
    groom: ChartData;
  };
  strengths: string[];
  challenges: string[];
  remedies: string[];
  divorce_risk: any;
  narrative_summary: string;
}

export default function MatchingResultPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<MatchingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'foundation' | 'analysis' | 'risk' | 'guidance'>('foundation');
  const [activeChartMode, setActiveChartMode] = useState<'vedic' | 'western'>('vedic');

  useEffect(() => {
        const fetchData = async () => {
      try {
        const payload = {
          bride: {
            year: parseInt(searchParams.get('b_year') || '1990'),
            month: parseInt(searchParams.get('b_month') || '1'),
            day: parseInt(searchParams.get('b_day') || '1'),
            hour: parseInt(searchParams.get('b_hour') || '12'),
            minute: parseInt(searchParams.get('b_minute') || searchParams.get('b_min') || '0'),
            lat: parseFloat(searchParams.get('b_lat') || '28.6139'),
            lon: parseFloat(searchParams.get('b_lon') || '77.2090'),
            name: searchParams.get('b_name') || 'Bride',
            gender: searchParams.get('b_gender') || 'Female'
          },
          groom: {
            year: parseInt(searchParams.get('g_year') || '1990'),
            month: parseInt(searchParams.get('g_month') || '1'),
            day: parseInt(searchParams.get('g_day') || '1'),
            hour: parseInt(searchParams.get('g_hour') || '12'),
            minute: parseInt(searchParams.get('g_minute') || searchParams.get('g_min') || '0'),
            lat: parseFloat(searchParams.get('g_lat') || '19.0760'),
            lon: parseFloat(searchParams.get('g_lon') || '72.8777'),
            name: searchParams.get('g_name') || 'Groom',
            gender: searchParams.get('g_gender') || 'Male'
          }
        };

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/matching_raw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error('Backend returned non-OK:', res.status, errText);
          throw new Error(`Backend error ${res.status}`);
        }
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setData(result);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  if (loading) return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen text-foreground bg-background">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-6 flex flex-col items-center">
          <Skeleton className="h-12 w-64" />
          <Skeleton variant="circle" className="w-48 h-48" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    </main>
  );

  if (!data) return <div className="text-foreground min-h-screen flex items-center justify-center font-serif italic">The stars are obscured... try again.</div>;

  return (
    <main className="relative pt-32 pb-32 px-6 min-h-screen text-foreground overflow-hidden bg-background">
      {/* EMBOSSED BACKGROUND WATERMARK */}
      <div className="fixed inset-0 pointer-events-none -z-20 flex items-center justify-center overflow-hidden opacity-[0.02] print:opacity-[0.04]">
        <h1 className="text-[25vw] print:text-[200px] font-serif italic font-black text-foreground whitespace-nowrap -rotate-12 select-none tracking-tighter mix-blend-overlay">
          AstroPinch
        </h1>
      </div>

      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse print-hidden"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse delay-1000 print-hidden"></div>

      <div className="max-w-7xl mx-auto space-y-8">
      {/* PDF BRANDING HEADER */}
      <div className="hidden print:flex items-center justify-between mb-12 border-b-2 border-secondary pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white">
            <Stars size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif italic text-foreground leading-none">AstroPinch</h2>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-secondary">Divine Intelligence</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-foreground">Celestial Match Report</p>
          <p className="text-[8px] text-text-secondary">{new Date().toLocaleDateString()}</p>
        </div>
      </div>


        
        {/* PROFILE SUMMARY BAR */}
        <div className="print-hidden grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          {[
            { label: 'Groom', name: searchParams.get('g_name'), date: `${searchParams.get('g_day')}/${searchParams.get('g_month')}/${searchParams.get('g_year')}`, time: `${searchParams.get('g_hour')}:${(searchParams.get('g_minute') || searchParams.get('g_min') || '0').padStart(2, '0')}`, icon: '♂️' },
            { label: 'Bride', name: searchParams.get('b_name'), date: `${searchParams.get('b_day')}/${searchParams.get('b_month')}/${searchParams.get('b_year')}`, time: `${searchParams.get('b_hour')}:${(searchParams.get('b_minute') || searchParams.get('b_min') || '0').padStart(2, '0')}`, icon: '♀️' }
          ].map((profile, i) => (
            <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-surface/40 backdrop-blur-md border border-border/50 shadow-sm relative overflow-hidden group">
              <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase tracking-widest ${
                (i === 0 ? data.mangal_dosha.groom.is_manglik : data.mangal_dosha.bride.is_manglik) 
                ? 'bg-alert/10 text-alert border-l border-b border-alert/20' 
                : 'bg-green-500/10 text-green-500 border-l border-b border-green-500/20'
              }`}>
                {(i === 0 ? data.mangal_dosha.groom.is_manglik : data.mangal_dosha.bride.is_manglik) ? 'Mangalik' : 'Non-Mangalik'}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-2xl">
                {profile.icon}
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-secondary">{profile.label}</h3>
                <p className="text-xl font-serif italic text-foreground">{profile.name || 'Anonymous'}</p>
                <div className="flex gap-4 mt-1 text-[10px] text-text-secondary font-medium">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {profile.date}</span>
                  <span className="flex items-center gap-1">🕒 {profile.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* HERO SECTION - Summary Dashboard */}
        <div className="p-8 md:p-12 rounded-[4rem] bg-surface border border-border/50 relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="absolute top-0 right-0 p-12 text-secondary/5 -z-10"><Sparkles size={200} /></div>
          
          <div className="grid md:grid-cols-12 gap-12 items-center">
            {/* Main Score Gauge */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative w-64 h-64 flex flex-col items-center justify-center border-2 border-secondary/30 rounded-full bg-background/40 backdrop-blur-xl shadow-[0_0_50px_rgba(var(--secondary),0.1)]">
                <span className="text-8xl font-serif italic text-foreground leading-none">{data.overall_score}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-secondary mt-4">Match Affinity</span>
              </div>
            </div>

            {/* Verdict & Narrative */}
            <div className="md:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-widest">
                Verdict: {data.grade}
              </div>
              <h1 className="text-4xl md:text-6xl font-serif italic text-foreground tracking-tight leading-tight">
                A Union of <span className="text-secondary">Destiny</span> & Resonance
              </h1>
              <p className="text-lg md:text-xl text-text-secondary font-normal leading-relaxed italic opacity-90 border-l-2 border-secondary/20 pl-6">
                {data.narrative_summary}
              </p>
              
              {/* Quick Pulse Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Vedic Guna</span>
                  <p className="text-xl font-serif italic text-foreground">{data.vedic_score.total}/36</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Western Sync</span>
                  <p className="text-xl font-serif italic text-foreground">{data.western_score.synastry_score}%</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Stability</span>
                  <p className="text-xl font-serif italic text-highlight">{100 - data.divorce_risk.score}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="print-hidden flex bg-surface p-1.5 rounded-3xl border border-border backdrop-blur-xl sticky top-24 z-50 shadow-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'foundation', label: 'Celestial Foundation', icon: <Stars size={16} /> },
            { id: 'risk', label: 'Risk & Timing', icon: <AlertTriangle size={16} /> },
            { id: 'guidance', label: 'Remedies & Path', icon: <ShieldCheck size={16} /> }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-secondary text-white shadow-lg' : 'text-text-secondary hover:text-foreground'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT AREAS */}
        <div className="min-h-[600px]">
          
          {/* FOUNDATION (Charts) */}
          <div className={`${activeTab !== 'foundation' ? 'print:block hidden' : 'block'} space-y-6 print:space-y-4 animate-in fade-in slide-in-from-top-4 duration-700`}>
              <div className="flex justify-center gap-4 print-hidden">
                <button 
                  onClick={() => setActiveChartMode('western')}
                  className={`px-8 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeChartMode === 'western' ? 'bg-foreground text-background' : 'bg-surface border border-border text-text-secondary'}`}
                >
                  Western Wheels
                </button>
                <button 
                  onClick={() => setActiveChartMode('vedic')}
                  className={`px-8 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeChartMode === 'vedic' ? 'bg-foreground text-background' : 'bg-surface border border-border text-text-secondary'}`}
                >
                  Vedic Charts
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-16 items-center bg-surface/30 p-12 rounded-[4rem] border border-border/50">
                {/* WEB VIEW: TOGGLEABLE */}
                <div className="print:hidden contents">
                  {activeChartMode === 'western' ? (
                    <>
                      <WesternWheelChart title="BRIDE'S HEAVENS" planets={data.charts.bride.planets} ascendant={data.charts.bride.ascendant} />
                      <WesternWheelChart title="GROOM'S HEAVENS" planets={data.charts.groom.planets} ascendant={data.charts.groom.ascendant} />
                    </>
                  ) : (
                    <>
                      <NorthIndianChart planets={data.charts.bride.planets as any} ascendant={data.charts.bride.ascendant as any} />
                      <NorthIndianChart planets={data.charts.groom.planets as any} ascendant={data.charts.groom.ascendant as any} />
                    </>
                  )}
                </div>

                {/* PDF VIEW: SHOW BOTH STYLES FOR COMPLETENESS */}
                <div className="hidden print:block w-full space-y-12">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-secondary">Western Wheels</h3>
                    <div className="flex gap-8 scale-[0.85] origin-top-left print:mb-20">
                      <WesternWheelChart title="BRIDE" planets={data.charts.bride.planets} ascendant={data.charts.bride.ascendant} />
                      <WesternWheelChart title="GROOM" planets={data.charts.groom.planets} ascendant={data.charts.groom.ascendant} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-secondary">Vedic Charts</h3>
                    <div className="flex gap-8 scale-[0.85] origin-top-left print:mb-20">
                      <NorthIndianChart planets={data.charts.bride.planets as any} ascendant={data.charts.bride.ascendant as any} />
                      <NorthIndianChart planets={data.charts.groom.planets as any} ascendant={data.charts.groom.ascendant as any} />
                    </div>
                  </div>
                </div>
              </div>

              {/* CHART ANALYSIS */}
              <div className="grid md:grid-cols-2 gap-8 mt-12">
                {[
                  { label: 'Bride', name: searchParams.get('b_name'), planets: data.charts.bride.planets, asc: data.charts.bride.ascendant },
                  { label: 'Groom', name: searchParams.get('g_name'), planets: data.charts.groom.planets, asc: data.charts.groom.ascendant }
                ].map((profile, i) => (
                  <div key={i} className="p-8 rounded-[3rem] bg-surface/50 border border-border/50 space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary">{profile.label}'s Core Alignment</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-border/30">
                        <span className="text-[10px] font-bold text-text-secondary uppercase">Ascendant (Lagna)</span>
                        <span className="text-sm font-serif italic text-foreground">{profile.asc.sign} ({profile.asc.degree.toFixed(1)}°)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {profile.planets.slice(0, 5).map((p: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-[10px]">
                            <span className="text-text-secondary">{p.name}</span>
                            <span className="font-bold text-foreground">{p.sign.substring(0, 3)}</span>
                          </div>
                        ))}
                      </div>
                      <p className="pt-4 text-xs text-text-secondary leading-relaxed italic border-t border-border/30">
                        {profile.label}'s {profile.asc.sign} Lagna provides a strong {profile.asc.sign === 'Taurus' || profile.asc.sign === 'Virgo' || profile.asc.sign === 'Capricorn' ? 'Earth-based stability' : profile.asc.sign === 'Aries' || profile.asc.sign === 'Leo' || profile.asc.sign === 'Sagittarius' ? 'Fiery leadership' : profile.asc.sign === 'Gemini' || profile.asc.sign === 'Libra' || profile.asc.sign === 'Aquarius' ? 'Airy intellectual' : 'Water-based emotional'} foundation for this union.
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* VEDIC ASHTAKOOT ANALYSIS */}
              <div className="mt-12 p-10 rounded-[3.5rem] bg-surface border border-secondary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-secondary/5"><Stars size={100} /></div>
                
                <div className="relative space-y-8">
                  {/* PARTNER COSMIC IDENTITY */}
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {[
                      { label: 'Bride', name: searchParams.get('b_name'), data: data.charts.bride, color: 'secondary' },
                      { label: 'Groom', name: searchParams.get('g_name'), data: data.charts.groom, color: 'foreground' }
                    ].map((p, i) => (
                      <div key={i} className="p-6 rounded-3xl bg-background/40 border border-border/50 flex items-center justify-between group hover:border-secondary/30 transition-all">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl bg-${p.color}/10 flex items-center justify-center text-${p.color}`}>
                            <Stars size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{p.label}'s Lunar Signature</p>
                            <h4 className="text-lg font-serif italic text-foreground">{p.name}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-secondary">
                            {p.data.planets.find((pl: any) => pl.name === 'Moon')?.sign}
                          </p>
                          <p className="text-[10px] text-text-secondary italic">
                            {p.data.planets.find((pl: any) => pl.name === 'Moon')?.nakshatra || 'Nakshatra Unknown'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-serif italic text-foreground">Ashtakoot Guna Milan</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary mt-1">Detailed Vedic Compatibility Breakdown</p>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-serif italic text-secondary">{data.vedic_score.total}</span>
                      <span className="text-lg text-text-secondary"> / 36</span>
                    </div>
                  </div>

                  {/* SCORING LEGEND */}
                  <div className="flex flex-wrap gap-6 p-4 rounded-2xl bg-foreground/5 border border-border/50 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">High Compatibility (70%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_10px_rgba(99,102,241,0.4)]"></div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Stable Alignment (40-70%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Focus Required (Below 40%)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Object.entries(data.vedic_score.breakdown).map(([key, val]: [string, any], i) => (
                      <div key={i} className="p-6 rounded-[2rem] bg-background/50 border border-border/50 hover:border-secondary/30 transition-all group relative">
                        <div className="flex justify-between items-end mb-2">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">{key}</span>
                            <div className="flex items-baseline gap-2">
                              <span className={`text-sm font-black uppercase tracking-wider ${val.received / val.total > 0.7 ? 'text-green-500' : val.received / val.total > 0.4 ? 'text-secondary' : 'text-red-500'}`}>
                                {val.received / val.total > 0.7 ? 'Excellent' : val.received / val.total > 0.4 ? 'Positive' : 'Low Alignment'}
                              </span>
                              <span className="text-[8px] font-bold text-text-secondary opacity-50">
                                ({val.received} of {val.total})
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[8px] text-text-secondary font-medium leading-tight mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                          {key === 'Varna' ? 'Professional & Ego Alignment' : 
                           key === 'Vashya' ? 'Mutual Attraction & Control' :
                           key === 'Tara' ? 'Health & Destiny Resonance' :
                           key === 'Yoni' ? 'Physical & Intimacy Affinity' :
                           key === 'Maitri' ? 'Emotional & Psychological Bonding' :
                           key === 'Gana' ? 'Temperament & Spiritual Match' :
                           key === 'Bhakoot' ? 'Prosperity & Family Welfare' :
                           'Genetic Energy & Progeny'}
                        </p>
                        <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${val.received / val.total > 0.7 ? 'bg-green-500' : val.received / val.total > 0.4 ? 'bg-secondary' : 'bg-red-500'}`} 
                            style={{ width: `${(val.received / val.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-3xl bg-secondary/5 border border-secondary/10">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary mb-4">Vedic Dosha Audit</h4>
                    <div className="grid md:grid-cols-5 gap-6">
                      {[
                        { label: 'Nadi Dosha', info: data.vedic_score.doshas.nadi, icon: '🌊' },
                        { label: 'Bhakoot Dosha', info: data.vedic_score.doshas.bhakoot, icon: '🌿' },
                        { label: 'Gana Dosha', info: data.vedic_score.doshas.gana, icon: '👺' },
                        { label: 'Rajju Dosha', info: { present: data.vedic_score.rajju_dosha.present, cancelled: false }, icon: '⛓️' },
                        { label: 'Vedha Dosha', info: { present: data.vedic_score.vedha_dosha, cancelled: false }, icon: '🎯' }
                      ].map((dosha, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <span className="text-xl">{dosha.icon}</span>
                          <div>
                            <p className="text-[10px] font-bold text-foreground">{dosha.label}</p>
                            <p className={`text-[9px] font-black uppercase tracking-wider ${dosha.info.present && !dosha.info.cancelled ? 'text-red-500' : 'text-green-500'}`}>
                              {dosha.info.present && !dosha.info.cancelled ? 'Afflicted' : dosha.info.cancelled ? 'Shanti / Cancelled' : 'Clear'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MANGAL DOSHA SECTION */}
                  <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div className="p-8 rounded-[2.5rem] bg-alert/5 border border-alert/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 text-alert/10 group-hover:scale-110 transition-transform"><Zap size={48} /></div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-alert mb-6">Mangal Dosha Analysis (Kuja)</h4>
                      <div className="flex items-center justify-between gap-12">
                        {[
                          { label: 'Groom', status: data.mangal_dosha.groom },
                          { label: 'Bride', status: data.mangal_dosha.bride }
                        ].map((m, i) => (
                          <div key={i} className="flex-1 space-y-2">
                            <p className="text-[9px] font-bold text-text-secondary uppercase">{m.label}</p>
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${m.status.is_manglik ? 'bg-alert shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></div>
                              <span className={`text-sm font-bold uppercase tracking-wider ${m.status.is_manglik ? 'text-alert' : 'text-green-500'}`}>
                                {m.status.is_manglik ? `Mangalik (${m.status.severity})` : 'Non-Mangalik'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-alert/10">
                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-2">AstroPinch Conclusion</p>
                        <p className="text-sm font-serif italic text-foreground">{data.mangal_dosha.compatibility}</p>
                      </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-highlight/5 border border-highlight/20 flex flex-col justify-center">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-highlight mb-4">Cosmic Synchronization</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed font-normal italic">
                        Mangal Dosha is a significant factor in Vedic matching. When both partners are Mangalik, the intense energies of Mars are said to neutralize each other, creating a "Balanced Dosha" which is considered auspicious for long-term stability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </div>



          {/* RISK & TIMING */}
          <div className={`${activeTab !== 'risk' ? 'print:block hidden' : 'block'} space-y-12 animate-in fade-in slide-in-from-top-4 duration-700`}>
              {/* TIMING FIRST */}
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-5 p-10 rounded-[3rem] bg-secondary/5 border border-secondary/20 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 p-8 text-secondary/10 -z-10"><Calendar size={120} /></div>
                  <div className="space-y-4">
                    <div className="inline-flex p-3 rounded-2xl bg-secondary/20 text-secondary">
                      <Calendar size={24} />
                    </div>
                    <h2 className="text-3xl font-serif italic text-foreground">Auspicious Marriage Windows</h2>
                    <p className="text-sm text-text-secondary font-normal leading-relaxed">
                      Favorable periods for marriage calculated using planetary transits, specifically Jupiter's movement, and the activation of the 7th house in the Vimshottari Dasha system.
                    </p>
                  </div>
                </div>
                
                <div className="md:col-span-7 p-10 rounded-[3rem] bg-surface border border-border flex flex-col justify-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-6">Identified Timelines</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.marriage_timing.map((time, i) => (
                      <div key={time} className="flex items-center gap-4 p-5 rounded-2xl bg-foreground/5 border border-border/50 hover:border-secondary/30 transition-colors group">
                        <span className="text-2xl font-serif italic text-secondary/50 group-hover:text-secondary transition-colors">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-lg font-bold text-foreground tracking-wide">
                          {time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RISK SECOND */}
              <DivorceRiskDashboard data={data.divorce_risk} />
          </div>

          {/* GUIDANCE & REMEDIES */}
          <div className={`${activeTab !== 'guidance' ? 'print:block hidden' : 'block'} grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-top-4 duration-700`}>
              <div className="p-12 rounded-[3.5rem] bg-surface border border-border space-y-10">
                <h3 className="text-2xl font-serif italic text-foreground flex items-center gap-3">
                   <ShieldCheck className="text-highlight" /> Cosmic Safeguards
                </h3>
                <div className="space-y-6">
                   {data.remedies.map((rem, i) => (
                     <div key={i} className="flex gap-6 items-start p-6 rounded-3xl bg-foreground/5 group hover:bg-secondary/10 transition-all border border-transparent hover:border-secondary/20">
                       <span className="text-secondary font-serif italic text-2xl">0{i+1}</span>
                       <p className="text-sm text-text-secondary group-hover:text-foreground transition-colors font-normal leading-relaxed">{rem}</p>
                     </div>
                   ))}
                </div>
              </div>

              <div className="p-12 rounded-[3.5rem] bg-surface border border-border space-y-10 flex flex-col">
                <h3 className="text-2xl font-serif italic text-foreground flex items-center gap-3">
                   <Info className="text-primary" /> Psychological Strengths
                </h3>
                <div className="space-y-4 flex-1">
                   {data.strengths.map((s, i) => (
                     <div key={i} className="flex gap-4 items-center p-5 rounded-2xl bg-highlight/5 border border-highlight/10">
                       <div className="w-2 h-2 rounded-full bg-highlight"></div>
                       <p className="text-sm font-medium text-foreground">{s}</p>
                     </div>
                   ))}
                </div>
                <div className="pt-10 border-t border-border">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-alert mb-4">Areas for Conscious Growth</h4>
                   <div className="flex flex-wrap gap-2">
                      {data.challenges.map((c, i) => (
                        <span key={i} className="px-4 py-2 rounded-full bg-alert/5 border border-alert/20 text-alert text-[9px] font-bold uppercase tracking-wider">
                          {c}
                        </span>
                      ))}
                   </div>
                </div>
              </div>
          </div>

        </div>

        {/* EXPORT BUTTON */}
        <div className="text-center pt-20 border-t border-border/50 print-hidden">
          <button 
            onClick={() => window.print()}
            className="group relative inline-flex items-center gap-4 px-16 py-8 bg-foreground text-background rounded-full font-black uppercase tracking-[0.3em] text-xs hover:bg-secondary hover:text-white transition-all shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span className="relative z-10 flex items-center gap-3">
              <Download size={18} /> Export Full Divine Report
            </span>
          </button>
        </div>

        {/* PDF DISCLAIMER */}
        <div className="hidden print:block pt-12 border-t border-border mt-20">
          <p className="text-[8px] text-text-secondary leading-relaxed italic text-center">
            Disclaimer: This Celestial Match Report is generated by AstroPinch AI for guidance and entertainment purposes only. 
            Astrology is a subjective science and results may vary. Decisions regarding life-altering events like marriage 
            should be taken with personal discretion and consultation with elders/professionals. 
            © {new Date().getFullYear()} AstroPinch Divine Intelligence. All rights reserved.
          </p>
        </div>

      </div>

            <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(var(--foreground), 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--secondary), 0.3); border-radius: 10px; }
        @media print {
          @page { margin: 15mm; size: A4; }
          .print-hidden, .sticky, button, .no-scrollbar, .bg-primary/20, .bg-secondary/20 { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; background: white !important; }
          .max-w-7xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          
          /* Compression & Layout - More elegant padding for dossier feel */
          .p-12 { padding: 1.5rem !important; margin-bottom: 1rem !important; }
          .p-10, .p-8 { padding: 1rem !important; margin-bottom: 0.75rem !important; }
          .p-6 { padding: 0.75rem !important; margin-bottom: 0.5rem !important; }
          .rounded-[4rem], .rounded-[3.5rem], .rounded-3xl, .rounded-2xl { border-radius: 12px !important; border: 1px solid #e5e5e5 !important; background: #fafafa !important; }
          .animate-in { animation: none !important; opacity: 1 !important; transform: none !important; }
          
          /* Print Display Settings */
          .print\:block { display: block !important; }
          .hidden.print\:block { display: block !important; }
          
          /* Typography for Dossier feel */
          body { color: #111 !important; font-size: 10pt !important; line-height: 1.4 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          h1 { font-size: 20pt !important; margin-bottom: 0.5rem !important; color: #000 !important; }
          h2 { font-size: 16pt !important; margin-bottom: 0.25rem !important; color: #222 !important; }
          h3 { font-size: 12pt !important; color: #333 !important; }
          p, span, li { font-size: 9.5pt !important; }
          .text-8xl { font-size: 32pt !important; }
          .text-6xl { font-size: 24pt !important; }
          .text-4xl { font-size: 18pt !important; }
          .text-[10px] { font-size: 8pt !important; }
          
          /* Specific Component Fixes */
          .w-64.h-64 { width: 120px !important; height: 120px !important; }
          .w-20.h-20 { width: 60px !important; height: 60px !important; }
          .aspect-square { width: 100% !important; height: auto !important; max-width: 100% !important; }
          .origin-top-left { transform: scale(0.9) !important; transform-origin: top center !important; }
          
          /* Section Breaks - Intelligent breaking for clean reading */
          div[class*="animate-in"], .grid > div { page-break-inside: avoid !important; break-inside: avoid !important; }
          .border-t { border-color: #ddd !important; }
          
          /* Hide decorative icons to reduce clutter and save ink */
          .absolute.top-0.right-0 { display: none !important; }
        }
      `}</style>
    </main>
  );
}