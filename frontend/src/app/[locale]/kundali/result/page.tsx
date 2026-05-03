"use client";

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import NorthIndianChart from '@/components/NorthIndianChart';
import SouthIndianChart from '@/components/SouthIndianChart';
import Skeleton from '@/components/Skeleton';
import { Download, Share2, Sparkles, Compass, Coins, Briefcase, Activity, Leaf, FileText, Lock } from 'lucide-react';
import AIChatPop from '@/components/AIChatPop';
import SubscriptionModal from '@/components/SubscriptionModal';

const DailyGuideTab = lazy(() => import('@/components/DailyGuide'));

type Tab = 'charts' | 'daily';

interface Planet { name: string; sign: string; degree: number; house: number; nakshatra?: string; is_retrograde?: boolean; }
interface ChartData { planets: Planet[]; ascendant: { sign: string; degree: number; house: number; }; validation_note?: string; }
interface PredictionData { soul_essence: string; current_season: string; actionable_pillars: { wealth: string; career: string; health: string; }; remedy: string; }

const SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const engine_to_sign = (id: number) => SIGN_NAMES[id - 1] || "Unknown";
const get_house_offset = (p_sign: number, asc_sign: number) => {
  let h = p_sign - asc_sign + 1;
  if (h <= 0) h += 12;
  return h;
};

export default function KundaliResultPage() {
  const t = useTranslations('Kundali');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(true);
  const [calculations, setCalculations] = useState<any>(null);
  const [loadingCalculations, setLoadingCalculations] = useState(true);
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [showD10, setShowD10] = useState(false);
  
  const activeTab = (searchParams.get('tab') as Tab) || 'charts';
  
  const [moonChartData, setMoonChartData] = useState<any>(null);
  const [loadingMoonChart, setLoadingMoonChart] = useState(true);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const body = {
    year: parseInt(searchParams.get('year') || '2000'),
    month: parseInt(searchParams.get('month') || '1'),
    day: parseInt(searchParams.get('day') || '1'),
    hour: parseInt(searchParams.get('hour') || '0'),
    minute: parseInt(searchParams.get('minute') || searchParams.get('min') || '0'),
    lat: parseFloat(searchParams.get('lat') || '28.6139'),
    lon: parseFloat(searchParams.get('lon') || '77.2090'),
    profession: searchParams.get('profession') || 'General',
  };

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const post = (url: string) => {
      return fetch(`${apiUrl}${url}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(url === '/ai/predict' ? { ...body, language: locale } : body) 
      });
    };

    setLoading(true); setLoadingPrediction(true); setLoadingCalculations(true); setLoadingMoonChart(true);

    // Data Moat: Automatically save this profile
    fetch(`${apiUrl}/api/profiles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: searchParams.get('name') || 'User', ...body }) }).catch(console.error);

    post('/chart').then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
    post('/ai/predict').then(r => r.json()).then(d => setPrediction(d.prediction)).catch(console.error).finally(() => setLoadingPrediction(false));
    post('/calculate').then(r => r.json()).then(setCalculations).catch(console.error).finally(() => setLoadingCalculations(false));
    post('/moon-chart').then(r => r.ok ? r.json() : null).then(d => d && setMoonChartData(d)).catch(console.error).finally(() => setLoadingMoonChart(false));
  }, [searchParams.toString()]);

  const handleShare = async () => {
    const shareData = {
      title: 'My AstroPinch Chart',
      text: `I just generated my Vedic Astrology chart on AstroPinch! Lagna: ${data?.ascendant?.sign || 'Unknown'}, Moon: ${moonChartData?.moon_sign || 'Unknown'}. Get your precise math-driven chart for free.`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen text-foreground">
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-12 w-80" /><Skeleton className="h-4 w-96" />
        <div className="grid lg:grid-cols-2 gap-8"><Skeleton className="aspect-square rounded-3xl" /><Skeleton className="aspect-square rounded-3xl" /></div>
      </div>
    </main>
  );

  if (!data) return <div className="text-foreground min-h-screen flex items-center justify-center">{t('result.synthesis.error_loading')}</div>;

  const moonSign = moonChartData?.moon_sign || data.planets.find(p => p.name === 'Moon')?.sign || 'Unknown';
  const moonNakshatra = moonChartData?.moon_nakshatra || data.planets.find(p => p.name === 'Moon')?.nakshatra || 'Unknown';
  const lagnaSign = data.ascendant.sign;

  const insightCard = (label: string, value: string, icon: React.ReactNode, color: string, bg: string, isLocked: boolean = false) => {
    const firstSentence = value.split('.')[0] + '.';
    const restOfValue = value.substring(firstSentence.length).trim();
    
    return (
      <div key={label} className={`relative p-5 rounded-[1.8rem] border ${bg} space-y-3 hover:scale-[1.01] transition-transform overflow-hidden`}>
        <div className={`flex items-center gap-2 ${color}`}>{icon}<span className="text-[8px] font-bold uppercase tracking-widest">{label}</span></div>
        {isLocked ? (
          <p className="text-xs text-foreground leading-relaxed font-light">
            <span>{firstSentence} </span>
            <span className="blur-[4px] select-none opacity-60">
              {restOfValue.length > 10 ? restOfValue : "Discover the profound impact of this aspect on your life by unlocking AstroPinch premium access today."}
            </span>
          </p>
        ) : (
          <p className="text-xs text-foreground leading-relaxed font-light">{value}</p>
        )}
        {isLocked && (
          <div className="absolute inset-0 top-10 flex flex-col items-center justify-center bg-gradient-to-t from-background/90 via-background/50 to-transparent z-10 pt-4">
            <button 
              onClick={() => setIsSubModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full text-[9px] font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
            >
              <Lock size={12} /> Unlock AstroPinch+
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="relative pt-28 pb-24 px-4 md:px-8 min-h-screen text-foreground">
      <div id="pdf-content" className="max-w-7xl mx-auto space-y-10">

        {/* ══════════════════════════════════════════════
            CHARTS & INSIGHTS TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'charts' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">

            {/* ── PAGE HEADER ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-8 border-b border-border">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-5xl font-medium italic font-serif text-foreground">
                  {t('result.header.chart_title', { name: searchParams.get('name') || t('result.header.your') })}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {[
                    `${searchParams.get('day')}/${searchParams.get('month')}/${searchParams.get('year')}`,
                    `${searchParams.get('hour')}:${searchParams.get('minute')}`,
                    `Lagna: ${lagnaSign}`,
                    `Moon: ${moonSign} · ${moonNakshatra}`
                  ].map(b => (
                    <span key={b} className="px-3 py-1 rounded-full bg-foreground/5 text-[10px] font-bold uppercase tracking-widest text-text-secondary border border-border">{b}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <div className="flex bg-foreground/5 rounded-full p-1 border border-border">
                  {(['north', 'south'] as const).map(s => (
                    <button key={s} onClick={() => setChartStyle(s)} className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${chartStyle === s ? 'bg-surface shadow-sm text-foreground' : 'text-text-secondary'}`}>{s}</button>
                  ))}
                </div>
                <button id="pdf-download-btn" onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-highlight to-secondary text-white font-bold uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-highlight/20 hover:scale-105 transition-all">
                  <Download size={13} /> Get Premium PDF (Free)
                </button>
                <button onClick={handleShare} className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                  <Share2 size={13} />
                </button>
              </div>
            </div>

            {/* ── SECTION 1: BOTH CHARTS SIDE BY SIDE ── */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-primary" />
                <h2 className="text-lg font-bold text-foreground uppercase tracking-widest">Birth Charts</h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Lagna / D-10 Chart */}
                <div className="p-6 rounded-[2.5rem] bg-surface border border-border shadow-xl space-y-4 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{showD10 ? 'Dasamsa (D-10)' : t('result.charts.lagna')}</h3>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary mt-0.5">
                        {showD10 ? 'Career Overlay' : `Ascendant · ${lagnaSign}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowD10(!showD10)}
                        className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${showD10 ? 'bg-primary text-background border-primary' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'}`}
                      >
                        {showD10 ? 'Show D-1' : 'View D-10'}
                      </button>
                    </div>
                  </div>
                  
                  {showD10 && !calculations?.advanced_metrics?.d10_chart ? (
                    <div className="aspect-square flex flex-col items-center justify-center text-text-secondary text-sm">
                      <Sparkles className="animate-spin mb-2" /> Loading D-10...
                    </div>
                  ) : (
                    chartStyle === 'north'
                      ? <NorthIndianChart 
                          planets={showD10 ? Object.entries(calculations.advanced_metrics.d10_chart).filter(([k]) => k !== 'Ascendant').map(([name, data]: any) => ({ name, sign: engine_to_sign(data.sign_id), degree: data.position_in_sign, house: get_house_offset(data.sign_id, calculations.advanced_metrics.d10_chart.Ascendant.sign_id) })) : data.planets} 
                          ascendant={showD10 ? { sign: engine_to_sign(calculations.advanced_metrics.d10_chart.Ascendant.sign_id), degree: calculations.advanced_metrics.d10_chart.Ascendant.position_in_sign, house: 1 } : data.ascendant} 
                        />
                      : <SouthIndianChart 
                          planets={showD10 ? Object.entries(calculations.advanced_metrics.d10_chart).filter(([k]) => k !== 'Ascendant').map(([name, data]: any) => ({ name, sign: engine_to_sign(data.sign_id), degree: data.position_in_sign, house: get_house_offset(data.sign_id, calculations.advanced_metrics.d10_chart.Ascendant.sign_id) })) : data.planets} 
                          ascendant={showD10 ? { sign: engine_to_sign(calculations.advanced_metrics.d10_chart.Ascendant.sign_id), degree: calculations.advanced_metrics.d10_chart.Ascendant.position_in_sign, house: 1 } : data.ascendant} 
                        />
                  )}
                </div>

                {/* Moon Chart */}
                <div className="p-6 rounded-[2.5rem] bg-surface border border-secondary/20 shadow-xl shadow-secondary/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-foreground">Chandra Lagna</h3>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary mt-0.5">Moon · {moonSign} · {moonNakshatra}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {moonChartData?.validation_note && (
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${moonChartData.validation_note.includes('OK') ? 'bg-highlight/10 text-highlight border-highlight/20' : 'bg-alert/10 text-alert border-alert/20'}`}>
                          {moonChartData.validation_note.includes('OK') ? 'AI ✓' : 'AI !'}
                        </span>
                      )}
                      <span className="text-[9px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">Moon Chart</span>
                    </div>
                  </div>
                  {loadingMoonChart
                    ? <div className="aspect-square rounded-2xl bg-foreground/5 animate-pulse" />
                    : moonChartData
                      ? <NorthIndianChart planets={moonChartData.chandra_lagna_planets} ascendant={moonChartData.moon_chart_ascendant} />
                      : <div className="aspect-square flex items-center justify-center text-text-secondary text-sm">Unavailable</div>}
                </div>
              </div>
            </section>

            {/* ── SECTION 2: UNIFIED PLANET TABLE ── */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-secondary" />
                <h2 className="text-lg font-bold text-foreground uppercase tracking-widest">Planetary Positions</h2>
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary bg-foreground/5 px-2 py-1 rounded-full border border-border">Lagna H · Moon H comparison</span>
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-[8px] uppercase tracking-widest text-text-secondary bg-foreground/5">
                      <th className="px-5 py-3">{t('result.planets.headers.planet')}</th>
                      <th className="px-5 py-3">{t('result.planets.headers.sign')}</th>
                      <th className="px-5 py-3 text-center">{t('result.planets.headers.degree')}</th>
                      <th className="px-5 py-3 text-center">Lagna H</th>
                      <th className="px-5 py-3 text-center text-secondary">Moon H</th>
                      <th className="px-5 py-3">{t('result.planets.headers.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px]">
                    {data.planets.map(p => {
                      const isRetro = p.is_retrograde || p.name === 'Rahu' || p.name === 'Ketu';
                      const moonH = moonChartData?.chandra_lagna_planets?.find((cp: any) => cp.name === p.name)?.house;
                      return (
                        <tr key={p.name} className="border-b border-border/5 hover:bg-foreground/5 transition-colors">
                          <td className="px-5 py-3 font-bold text-foreground">{t(`result.planets.names.${p.name}`)}</td>
                          <td className="px-5 py-3 text-text-secondary">{p.sign}</td>
                          <td className="px-5 py-3 text-center font-mono text-text-secondary">{p.degree.toFixed(2)}°</td>
                          <td className="px-5 py-3 text-center text-text-secondary">{p.house}</td>
                          <td className="px-5 py-3 text-center font-bold text-secondary">{moonH ?? '—'}</td>
                          <td className={`px-5 py-3 text-[8px] font-bold uppercase tracking-widest ${isRetro ? 'text-alert' : 'text-highlight'}`}>
                            {isRetro ? t('result.planets.status.Retro') : t('result.planets.status.Direct')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── SECTION 3: ANALYSIS STRIP ── */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-highlight" />
                <h2 className="text-lg font-bold text-foreground uppercase tracking-widest">{t('result.analysis.title')}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: t('result.analysis.lagna'),        value: calculations?.ascendant || lagnaSign,                          color: 'text-primary' },
                  { label: t('result.analysis.rashi'),         value: calculations?.moon_sign || moonSign,                           color: 'text-secondary' },
                  { label: t('result.analysis.nakshatra'),     value: moonNakshatra,                                                  color: 'text-foreground' },
                  { label: t('result.analysis.mangal_dosha'),  value: calculations?.manglik?.is_manglik ? (calculations?.manglik?.is_parihara ? 'Neutralized' : `${t('result.analysis.manglik')} (${calculations.manglik.severity})`) : t('result.analysis.non_manglik'), color: (calculations?.manglik?.is_parihara && calculations?.manglik?.is_manglik) ? 'text-highlight' : (calculations?.manglik?.is_manglik ? 'text-alert' : 'text-highlight') },
                  { label: t('result.analysis.sade_sati'),    value: calculations?.sade_sati?.is_under_sade_sati ? calculations.sade_sati.phase : t('result.analysis.none'), color: calculations?.sade_sati?.is_under_sade_sati ? 'text-alert' : 'text-highlight' },
                  { label: t('result.analysis.moolank'),      value: calculations?.numerology?.moolank,                              color: 'text-primary' },
                  { label: t('result.analysis.bhagyank'),     value: calculations?.numerology?.bhagyank,                             color: 'text-secondary' },
                ].map(item => (
                  <div key={item.label} className="p-4 rounded-2xl bg-surface border border-border text-center shadow-sm">
                    <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-text-secondary mb-1">{item.label}</p>
                    {loadingCalculations ? <Skeleton className="h-5 w-12 mx-auto" /> : <p className={`font-serif italic text-sm ${item.color}`}>{item.value}</p>}
                  </div>
                ))}
              </div>

              {/* Jatak + Dasha in one row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">{t('result.analysis.title')} · Jatak</p>
                  <div className="flex flex-wrap gap-2">
                    {['yoni', 'gana', 'nadi', 'varna'].map(key => (
                      <div key={key} className="px-3 py-1.5 rounded-full bg-foreground/5 border border-border flex items-center gap-2">
                        <span className="text-[8px] font-bold uppercase tracking-tighter text-text-secondary">{t(`result.analysis.${key}`)}:</span>
                        <span className="text-[10px] font-bold text-foreground">{calculations?.jatak?.[key] || '...'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">{t('result.dasha.title')}</p>
                  {loadingCalculations ? <Skeleton className="h-10 w-full" /> : calculations?.dasha ? (
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-xl font-serif italic text-secondary">{calculations.dasha.mahadasha}</span>
                        <span className="text-[8px] text-text-secondary ml-2 uppercase font-bold tracking-widest">{t('result.dasha.mahadasha')}</span>
                        <p className="text-[9px] text-text-secondary">{t('result.dasha.ends')} {calculations.dasha.ends_year}</p>
                      </div>
                      <div className="w-px h-10 bg-border" />
                      <div>
                        <span className="text-base font-serif italic text-primary">{calculations.dasha.antardasha}</span>
                        <span className="text-[8px] text-text-secondary ml-2 uppercase font-bold tracking-widest">{t('result.dasha.antardasha')}</span>
                        <p className="text-[9px] text-highlight">{t('result.dasha.active')}</p>
                      </div>
                    </div>
                  ) : <p className="text-xs text-text-secondary">{t('result.dasha.unavailable')}</p>}
                </div>
              </div>
            </section>

            {/* ── SECTION 4: INSIGHTS SIDE BY SIDE ── */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-primary" />
                <h2 className="text-lg font-bold text-foreground uppercase tracking-widest">AI Insights</h2>
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary bg-foreground/5 px-2 py-1 rounded-full border border-border">Powered by DeepSeek</span>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Lagna Insights */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-serif italic text-foreground flex items-center gap-2"><FileText size={15} className="text-primary" /> Lagna Chart Insights</h3>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">Birth Chart</span>
                  </div>
                  {loadingPrediction
                    ? [1,2,3].map(i => <div key={i} className="h-20 rounded-[1.8rem] bg-foreground/5 animate-pulse" />)
                    : prediction ? (
                      <div className="grid gap-3">
                        {insightCard(t('result.synthesis.soul_essence'), prediction.soul_essence, <Compass size={13}/>, 'text-secondary', 'bg-secondary/5 border-secondary/15')}
                        {insightCard(t('result.synthesis.current_season'), prediction.current_season, <Sparkles size={13}/>, 'text-highlight', 'bg-highlight/5 border-highlight/15')}
                        <div className="grid grid-cols-3 gap-3">
                          {insightCard(t('result.synthesis.pillars.wealth'), prediction.actionable_pillars.wealth, <Coins size={13}/>, 'text-secondary', 'bg-secondary/5 border-secondary/15')}
                          {insightCard(t('result.synthesis.pillars.career'), prediction.actionable_pillars.career, <Briefcase size={13}/>, 'text-primary', 'bg-primary/5 border-primary/15')}
                          {insightCard(t('result.synthesis.pillars.health'), prediction.actionable_pillars.health, <Activity size={13}/>, 'text-alert', 'bg-alert/5 border-alert/15')}
                        </div>
                        {insightCard(t('result.synthesis.remedy'), prediction.remedy, <Leaf size={13}/>, 'text-primary', 'bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border-primary/15')}
                      </div>
                    ) : null}
                </div>

                {/* Moon Insights */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-serif italic text-foreground flex items-center gap-2"><Sparkles size={15} className="text-secondary" /> Moon Chart Insights</h3>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-1 rounded-full border border-secondary/20">Chandra Lagna</span>
                  </div>
                  {loadingMoonChart
                    ? [1,2,3,4].map(i => <div key={i} className="h-20 rounded-[1.8rem] bg-foreground/5 animate-pulse" />)
                    : moonChartData?.moon_prediction ? (
                      <div className="grid gap-3">
                        {[
                          { key: 'Soul & Emotions',        icon: <Sparkles size={13}/>, color: 'text-secondary', bg: 'bg-secondary/5 border-secondary/15' },
                          { key: 'Relationships & Family', icon: <Compass size={13}/>,  color: 'text-highlight',  bg: 'bg-highlight/5 border-highlight/15' },
                          { key: 'Mind & Mental Health',   icon: <Activity size={13}/>, color: 'text-primary',    bg: 'bg-primary/5 border-primary/15' },
                          { key: 'Home & Comfort',         icon: <Leaf size={13}/>,     color: 'text-alert',      bg: 'bg-alert/5 border-alert/15' },
                        ].map(({ key, icon, color, bg }) => insightCard(key, moonChartData.moon_prediction[key] || '—', icon, color, bg))}
                      </div>
                    ) : <p className="text-sm text-text-secondary">Moon insights unavailable.</p>}
                </div>
              </div>
            </section>

            {/* ── SECTION 5: ADVANCED VEDIC INSIGHTS ── */}
            {calculations?.advanced_metrics && (
              <section className="space-y-8 pt-10 border-t border-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                      <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-serif italic text-foreground">Premium Vedic Insights</h2>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-1">Powered by Advanced Engine</p>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                  {/* Shadbala Strength Meter (Takes 7 columns on Desktop) */}
                  <div className="lg:col-span-7 p-8 rounded-[2.5rem] bg-surface border border-border shadow-2xl shadow-foreground/5 space-y-6">
                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Shadbala</h3>
                        <p className="text-xs text-text-secondary font-light mt-1">Intrinsic Planetary Strength</p>
                      </div>
                      <Activity size={18} className="text-primary opacity-50" />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(calculations.advanced_metrics.shadbala || {})
                        .sort(([, a]: any, [, b]: any) => b.percentage - a.percentage)
                        .map(([planet, data]: any) => (
                        <div key={planet} className="group relative flex flex-col p-5 rounded-3xl bg-surface/40 backdrop-blur-md border border-border/60 hover:bg-surface hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                          {/* Subtle background glow for strong planets */}
                          {data.is_strong && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10 transition-opacity opacity-50 group-hover:opacity-100" />}
                          
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${data.is_strong ? 'bg-primary/10 border-primary/20 text-primary' : data.is_weak ? 'bg-alert/10 border-alert/20 text-alert' : 'bg-foreground/5 border-border text-text-secondary'}`}>
                                <Sparkles size={12} className={data.is_strong ? "animate-pulse" : ""} />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-foreground block">
                                  {t(`result.planets.names.${planet}`)}
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${data.is_strong ? 'text-primary' : data.is_weak ? 'text-alert' : 'text-text-secondary'}`}>
                                  {data.strength_label}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-serif italic text-foreground block leading-none">{data.rupas}</span>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Rupas</span>
                            </div>
                          </div>
                          
                          <div className="relative h-1.5 w-full bg-foreground/5 rounded-full overflow-visible mb-5">
                            <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${data.is_strong ? 'bg-gradient-to-r from-primary/60 to-primary shadow-[0_0_8px_rgba(91,33,182,0.6)]' : data.is_weak ? 'bg-gradient-to-r from-alert/60 to-alert' : 'bg-gradient-to-r from-text-secondary/60 to-text-secondary'}`} style={{ width: `${data.percentage}%` }} />
                          </div>

                          <div className="space-y-3 mt-auto">
                            <div className="flex items-start gap-2">
                              <Activity size={12} className="text-text-secondary mt-0.5 shrink-0" />
                              <p className="text-[11px] text-foreground font-light leading-relaxed">{data.impact}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <Leaf size={12} className="text-highlight mt-0.5 shrink-0" />
                              <p className="text-[11px] text-foreground font-semibold leading-relaxed">{data.solution}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nadi Karmic Tasks & Ashtakavarga (Takes 5 columns) */}
                  <div className="lg:col-span-5 space-y-8 flex flex-col">
                    {/* Ashtakavarga Summary */}
                    <div className="p-8 rounded-[2.5rem] bg-surface border border-border shadow-xl shadow-foreground/5 space-y-6 flex-1">
                      <div className="flex items-center justify-between border-b border-border/50 pb-4">
                        <div>
                          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Ashtakavarga</h3>
                          <p className="text-xs text-text-secondary font-light mt-1">Maximum Supported Houses</p>
                        </div>
                        <Compass size={18} className="text-secondary opacity-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(calculations.advanced_metrics.ashtakavarga_sav || {})
                          .sort(([, a]: any, [, b]: any) => b - a)
                          .slice(0, 4) // Show top 4 houses
                          .map(([house, score]: any, index) => {
                            const houseMeanings: Record<string, string> = {
                              "1": "Self & Body", "2": "Wealth & Speech", "3": "Courage & Siblings", "4": "Home & Mother",
                              "5": "Intellect & Kids", "6": "Health & Debts", "7": "Marriage & Biz", "8": "Secrets & Longevity",
                              "9": "Luck & Dharma", "10": "Career & Fame", "11": "Gains & Network", "12": "Expenses & Travel"
                            };
                            return (
                              <div key={house} className={`relative overflow-hidden p-4 rounded-2xl border flex flex-col justify-between ${index === 0 ? 'bg-highlight/10 border-highlight/30' : 'bg-foreground/5 border-border'}`}>
                                {index === 0 && <div className="absolute -top-6 -right-6 w-16 h-16 bg-highlight/20 rounded-full blur-xl" />}
                                <div>
                                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${index === 0 ? 'text-highlight' : 'text-text-secondary'}`}>House {house}</p>
                                  <p className="text-[11px] text-foreground font-semibold leading-tight">{houseMeanings[house]}</p>
                                </div>
                                <p className={`text-2xl font-serif italic mt-3 ${index === 0 ? 'text-highlight' : 'text-foreground'}`}>{score} <span className="text-[9px] font-sans not-italic text-text-secondary uppercase tracking-widest font-bold">Pts</span></p>
                              </div>
                            );
                          })}
                      </div>
                      <p className="text-[10px] text-text-secondary italic">Higher points indicate areas of life where you will naturally experience the most success and least friction.</p>
                    </div>

                    {/* Nadi */}
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-secondary/10 via-surface to-background border border-secondary/30 shadow-xl shadow-secondary/5 space-y-6 relative overflow-hidden">
                      <div className="absolute -bottom-10 -right-10 opacity-10 text-secondary pointer-events-none">
                        <Leaf size={150} />
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-1">
                          <Leaf size={16} className="text-secondary" /> Nadi Karmic Task
                        </h3>
                        <p className="text-xs text-text-secondary font-light mb-6">Based on your planetary trines</p>
                        
                        <div className="space-y-4">
                          {(calculations.advanced_metrics.nadi_karma || []).slice(0, 2).map((karma: any, idx: number) => (
                            <div key={idx} className="p-5 rounded-2xl bg-surface/80 backdrop-blur-md border border-secondary/20 shadow-sm transition-transform hover:-translate-y-1">
                              <p className="text-[9px] uppercase tracking-widest font-bold text-secondary mb-2">{karma.debt}</p>
                              <p className="text-sm text-foreground leading-relaxed">{karma.task}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </section>
            )}

            {/* ── SECTION 6: ASTROLOGER MARKETPLACE (High Ticket) ── */}
            <section className="pt-8 border-t border-border space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-serif italic text-foreground">Need deeper clarity?</h2>
                <p className="text-sm text-text-secondary">Consult verified Vedic Astrologers directly from the AstroPinch Marketplace.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-[2rem] bg-surface border border-border shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-foreground/10" />
                    <div>
                      <h4 className="font-bold text-foreground">Acharya Ramesh</h4>
                      <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">15+ Yrs Exp · Vedic Expert</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary font-light">Specializes in career transitions, marriage timing, and deep Dosha analysis.</p>
                  <button className="w-full py-3 rounded-xl bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all">
                    Book Session (Free)
                  </button>
                </div>

                <div className="p-6 rounded-[2rem] bg-surface border border-border shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-foreground/10" />
                    <div>
                      <h4 className="font-bold text-foreground">Dr. Ananya Sharma</h4>
                      <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">Gold Medalist · Numerologist</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary font-light">Expert in name correction, Muhurat calculation, and emotional healing.</p>
                  <button className="w-full py-3 rounded-xl bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all">
                    Book Session (Free)
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ── DAILY GUIDE TAB ── */}
        {activeTab === 'daily' && (
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Sparkles size={24} className="text-primary animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary animate-pulse">{t('result.synthesis.loading_daily')}</p>
            </div>
          }>
            <DailyGuideTab initialProfile={{
              name: searchParams.get('name') || '',
              day: searchParams.get('day') || '',
              month: searchParams.get('month') || '',
              year: searchParams.get('year') || '',
              hour: searchParams.get('hour') || '0',
              minute: searchParams.get('minute') || searchParams.get('min') || '0',
              place: '',
              profession: searchParams.get('profession') || '',
              lat: parseFloat(searchParams.get('lat') || '0'),
              lon: parseFloat(searchParams.get('lon') || '0'),
            }} />
          </Suspense>
        )}

      </div>
      <AIChatPop />
      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />

      <style jsx global>{`
        @media print {
          @page { margin: 15mm; size: A4; }
          body { background: white !important; color: black !important; }
          .print\\:hidden, #pdf-download-btn, button { display: none !important; }
          main { padding-top: 0 !important; }
          .max-w-7xl { max-width: 100% !important; }
          .grid { display: grid !important; }
          .rounded-[3rem], .rounded-[2.5rem], .rounded-3xl, .rounded-2xl { border-radius: 1rem !important; border: 1px solid #e5e7eb !important; }
          .break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
          .border, .border-border { border-color: #e5e7eb !important; }
          .bg-surface, .bg-background\\/50, .bg-foreground\\/5 { background: #fafafa !important; }
          .text-foreground { color: #111827 !important; }
          .text-text-secondary { color: #4b5563 !important; }
          .bg-primary\\/10, .bg-primary\\/50 { background: #f3e8ff !important; }
          .text-primary { color: #6b21a8 !important; }
          .bg-highlight\\/10 { background: #d1fae5 !important; }
          .text-highlight { color: #047857 !important; }
          .bg-alert\\/10 { background: #ffe4e6 !important; }
          .text-alert { color: #be123c !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </main>
  );
}
