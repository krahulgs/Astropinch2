"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import CustomYearBookIcon from '@/components/CustomYearBookIcon';
import NorthIndianChart from '@/components/NorthIndianChart';
import { Download, Share2, Sparkles, Stars, Lock } from 'lucide-react';

interface Prediction {
  month: string;
  career: string;
  finance: string;
  love: string;
  health: string;
  travel: string;
  score: number;
}

interface Dasha {
  planet: string;
  start: string;
  end: string;
  type: string;
  good?: string;
  bad?: string;
}

interface Transit {
  planet: string;
  event: string;
  date: string;
}

interface YearBookData {
  year: number;
  predictions: Prediction[];
  dasha: Dasha[];
  transits: Transit[];
  ai_outlook?: {
    theme: string;
    summary: string;
    quarters: { period: string; focus: string }[];
    key_date: string;
    citation: string;
  };
}

export default function YearBookReportPage() {
  const t = useTranslations('YearBook');
  const searchParams = useSearchParams();
  const [data, setData] = useState<YearBookData | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [calculations, setCalculations] = useState<any>(null);
  const [loading, setLoading] = useState(true);       // page skeleton
  const [aiLoading, setAiLoading] = useState(true);   // AI section skeleton
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const getParam = (key: string, def: string) => {
      const val = searchParams.get(key);
      return (val && val !== '') ? val : def;
    };

    const body = {
      year: parseInt(getParam('year', '1990')),
      month: parseInt(getParam('month', '1')),
      day: parseInt(getParam('day', '1')),
      hour: parseInt(getParam('hour', '0')),
      minute: parseInt(getParam('minute', getParam('min', '0'))),
      lat: parseFloat(getParam('lat', '28.6139')),
      lon: parseFloat(getParam('lon', '77.2090')),
      target_year: parseInt(getParam('targetYear', '2026'))
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Phase 1: Fast calls — show page immediately
    const fetchFast = async () => {
      try {
        const [chartRes, calcRes] = await Promise.all([
          fetch(`${apiUrl}/chart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          }),
          fetch(`${apiUrl}/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          })
        ]);
        if (chartRes.ok) setChartData(await chartRes.json());
        if (calcRes.ok) setCalculations(await calcRes.json());
      } catch (err) {
        console.error('Fast fetch error:', err);
      } finally {
        setLoading(false); // Show page regardless
      }
    };

    // Phase 2a: Fast YearBook predictions — instant via Swiss Ephemeris
    const fetchYearBook = async () => {
      try {
        const yearBookRes = await fetch(`${apiUrl}/year-book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!yearBookRes.ok) {
          const errData = await yearBookRes.json().catch(() => ({}));
          console.error(`YearBook Error ${yearBookRes.status}:`, errData.detail);
          return;
        }
        const ybData = await yearBookRes.json();
        setData(ybData);
        setAiLoading(false);  // Predictions ready — hide skeleton immediately

        // Phase 2b: Background AI Outlook (slow) — fills in after predictions show
        fetch(`${apiUrl}/year-book/outlook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }).then(r => r.json()).then(outlookData => {
          setData(prev => prev ? { ...prev, ai_outlook: outlookData.ai_outlook } : prev);
        }).catch(err => console.warn('AI Outlook fetch failed (non-critical):', err));

      } catch (err: any) {
        console.error('YearBook Fetch Error:', err.message);
        setAiLoading(false);
      }
    };

    // Fire both in parallel — page shows fast, AI fills in
    fetchFast();
    fetchYearBook();
  }, [searchParams]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-foreground"></div>
    </div>
  );

  const currentPred = data?.predictions?.[activeMonth];
  const targetYear = parseInt(searchParams.get('targetYear') || '2026');

  return (
    <main className="relative pt-24 md:pt-32 pb-24 px-4 md:px-6 print:pt-8 print:pb-0 print:px-0 min-h-screen text-foreground overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-16 print:space-y-8">
        {/* PDF BRANDING HEADER */}
        <div className="hidden print:flex items-center justify-between mb-8 border-b-2 border-secondary pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white">
               <Stars size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif italic text-foreground leading-none">AstroPinch</h2>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-secondary">Divine Intelligence · {targetYear} Year Book</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-foreground">Personalized Annual Forecast</p>
            <p className="text-[8px] text-text-secondary">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-4 print:space-y-2">
          <h1 className="text-2xl md:text-6xl font-medium italic font-serif text-foreground leading-tight">
            {searchParams.get('name')}&apos;s {targetYear} {t('report.year_book_suffix')}
            <span className="block mt-3 text-2xl md:text-4xl text-primary font-light opacity-90 print:mt-1 print:text-2xl">
              {t('report.chart_overview')}
            </span>
          </h1>
          <p className="text-secondary font-bold tracking-widest uppercase text-xs pt-2">
            {t('report.roadmap_subtitle')}
          </p>
          <div className="pt-4 flex justify-center print:hidden">
            <button 
              onClick={() => window.print()} 
              className="px-6 py-3 bg-primary text-background rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {t('report.download_pdf')}
            </button>
          </div>
        </div>

        {/* AI Outlook Section — skeleton while loading */}
        {aiLoading ? (
          <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
            <div className="p-10 rounded-[3rem] bg-surface border border-border space-y-4">
              <div className="h-8 bg-foreground/10 rounded-xl w-3/4"></div>
              <div className="h-4 bg-foreground/10 rounded w-full"></div>
              <div className="h-4 bg-foreground/10 rounded w-5/6"></div>
              <div className="h-4 bg-foreground/10 rounded w-4/5"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="p-6 rounded-[2.5rem] bg-surface border border-border h-32"></div>)}
            </div>
          </div>
        ) : data?.ai_outlook ? (
          <div className="grid lg:grid-cols-2 gap-8 print:grid-cols-1 print:gap-6">
            <div className="p-10 print:p-6 rounded-[3rem] print:rounded-2xl bg-gradient-to-br from-secondary/20 to-transparent border border-secondary/20 space-y-6 print:space-y-4">
              <h2 className="text-4xl print:text-3xl font-serif italic text-secondary">{t('report.strategy_prefix')} {data.ai_outlook.theme}</h2>
              <p className="text-lg print:text-base text-foreground/80 font-light leading-relaxed">{data.ai_outlook.summary}</p>
              <div className="p-6 print:p-4 rounded-3xl/40 print:rounded-xl border border-border space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary">{t('report.vedic_citation')}</h4>
                <p className="text-sm print:text-xs text-text-secondary italic">{data.ai_outlook.citation}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 print:gap-4">
              {data.ai_outlook.quarters.map((q: any, i: number) => (
                <div key={i} className="p-6 print:p-4 rounded-[2.5rem] print:rounded-xl bg-surface border border-border space-y-3 hover:bg-foreground/5 transition-all">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">{q.period}</h4>
                  <p className="text-sm print:text-xs font-light text-foreground/80 leading-relaxed">
                    <span className="font-bold text-foreground block mb-1">{q.focus.split('. ')[0]}.</span>
                    {q.focus.split('. ').slice(1).join('. ')}
                  </p>
                </div>
              ))}
              <div className="col-span-full p-6 print:p-4 rounded-[2rem] print:rounded-xl bg-primary/10 border border-primary/20 flex justify-between items-center">
                 <span className="text-xs font-bold uppercase tracking-widest text-primary">{t('report.key_turning_point')}</span>
                 <span className="text-xl print:text-lg font-serif italic text-foreground">{data.ai_outlook.key_date}</span>
              </div>
            </div>
          </div>
        ) : null}
        
        {/* Dasha section — only show when data is available */}
        {data?.dasha && (
        <div className="p-8 print:p-6 rounded-[2.5rem] print:rounded-2xl bg-surface border border-border backdrop-blur-sm space-y-6 print:break-after-page">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-text-secondary">{t('report.active_dasha')}</h3>
          <div className="flex flex-wrap gap-4">
            {data.dasha.map((d, i) => (
              <div key={i} className="flex-1 min-w-[280px] print:min-w-[45%] p-6 print:p-4 rounded-3xl print:rounded-xl bg-surface border border-border space-y-4 break-inside-avoid">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest">{d.type}</span>
                  <span className="text-[10px] text-text-secondary">{d.start} — {d.end}</span>
                </div>
                <p className="text-2xl print:text-xl font-serif italic text-foreground">{d.planet}</p>
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-highlight mt-1.5 shrink-0"></span>
                    <p className="text-sm print:text-xs text-text-secondary leading-relaxed"><span className="text-highlight font-bold uppercase tracking-wider">{t('report.good')}</span> {d.good}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-alert mt-1.5 shrink-0"></span>
                    <p className="text-sm print:text-xs text-text-secondary leading-relaxed"><span className="text-alert font-bold uppercase tracking-wider">{t('report.caution')}</span> {d.bad}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Month selector + detail */}
        <div className="grid lg:grid-cols-[1fr_3fr] gap-6 md:gap-12 print:hidden">
          {/* Month Selector — horizontal scroll on mobile, vertical list on lg */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary px-1 hidden lg:block">{t('report.months_label')}</h3>
            {/* Mobile: horizontal scroll pill tabs — isolated so it doesn't affect page width */}
            <div className="flex lg:hidden -mx-4 px-4 overflow-x-auto no-scrollbar gap-2 pb-1">
              {aiLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-10 w-20 rounded-xl bg-surface border border-border animate-pulse flex-shrink-0" />
                ))
              ) : data?.predictions?.map((p, i) => (
                <button
                  key={p.month}
                  onClick={() => setActiveMonth(i)}
                  className={`h-10 px-4 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                    activeMonth === i
                      ? 'bg-foreground text-background'
                      : 'bg-surface text-text-secondary hover:bg-foreground/5'
                  }`}
                >
                  {t(`months.${p.month}`).slice(0, 3)}
                </button>
              ))}
            </div>
            {/* Desktop: vertical list */}
            <div className="hidden lg:grid grid-cols-1 gap-2">
              {aiLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-2xl bg-surface border border-border animate-pulse" />
                ))
              ) : data?.predictions?.map((p, i) => (
                <button
                  key={p.month}
                  onClick={() => setActiveMonth(i)}
                  className={`h-14 px-6 rounded-2xl text-left transition-all font-medium ${
                    activeMonth === i
                      ? 'bg-foreground text-background'
                      : 'bg-surface text-text-secondary hover:bg-foreground/5'
                  }`}
                >
                  {t(`months.${p.month}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Month Detail */}
          {aiLoading ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-12 bg-foreground/10 rounded-xl w-1/3"></div>
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-8 rounded-[2rem] bg-surface border border-border space-y-4">
                    <div className="h-4 bg-foreground/10 rounded w-1/3"></div>
                    <div className="h-3 bg-foreground/10 rounded w-full"></div>
                    <div className="h-3 bg-foreground/10 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : currentPred ? (
          <div key={activeMonth} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-3xl md:text-5xl font-serif italic text-foreground">{t(`months.${currentPred.month}`)} {targetYear}</h2>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-secondary/10 to-highlight/10 border border-secondary/30 backdrop-blur-md self-start md:self-auto">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highlight opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-highlight" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/80">
                  {t('report.alignment_score')} <span className="text-secondary text-base ml-1 font-black">{currentPred.score}</span><span className="text-text-secondary/50 font-medium">/100</span>
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {[
                { label: 'Career & Work', content: currentPred.career },
                { label: 'Finance & Wealth', content: currentPred.finance },
                { label: 'Love & Family', content: currentPred.love },
                { label: 'Health & Vitality', content: currentPred.health },
                { label: 'Travel & Growth', content: currentPred.travel }
              ].map((section) => (
                <div key={section.label} className="p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-surface border border-border backdrop-blur-sm space-y-3 md:space-y-4">
                  <div className="flex items-center gap-3">
                    <CustomYearBookIcon type={section.label} />
                    <h4 className="font-bold text-foreground/90 uppercase tracking-widest text-xs">{section.label}</h4>
                  </div>
                  <div className="space-y-4">
                    <p className="text-text-secondary leading-relaxed font-light">{section.content.split('Simple Tip:')[0]}</p>
                    
                    {section.content.includes('Simple Tip:') && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-highlight/5 border border-highlight/20">
                         <span className="w-2 h-2 rounded-full bg-highlight mt-1.5 shrink-0"></span>
                         <p className="text-sm text-text-secondary italic leading-relaxed">
                           <span className="text-highlight font-bold uppercase tracking-wider not-italic">{t('report.tip')}</span> {section.content.split('Simple Tip:')[1]}
                         </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Key Transits for the Month */}
              {data?.transits && (
              <div className="p-8 rounded-[2rem] bg-primary/10 border border-primary/20 backdrop-blur-sm space-y-4">
                <h4 className="font-bold text-primary uppercase tracking-widest text-xs">{t('report.key_transits')}</h4>
                <div className="space-y-3">
                    {data?.transits?.map((tr, i) => (
                    <div key={i} className="flex justify-between items-center text-sm gap-4">
                      <span className="text-foreground/80 font-medium truncate">{tr.planet} {tr.event}</span>
                      <span className="text-text-secondary text-xs shrink-0">{tr.date}</span>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          </div>
          ) : null}
        </div>

        {/* Print-Only: All Months View */}
        <div className="hidden print:block space-y-16 pt-8 relative">
          
          {/* Embossed Watermark for PDF */}
          <div className="fixed inset-0 z-[-1] hidden print:flex items-center justify-center pointer-events-none" style={{ mixBlendMode: 'overlay' }}>
            <h1 className="text-[15rem] font-serif font-black italic transform -rotate-45 text-foreground/10" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1), -1px -1px 2px rgba(255,255,255,0.5)' }}>Astropinch</h1>
          </div>

          <div className="text-center space-y-2 mb-12 border-b border-border pb-8">
            <h2 className="text-4xl font-serif italic text-foreground">{t('report.complete_analysis')}</h2>
            <p className="text-xs uppercase tracking-widest text-text-secondary">{t('report.detailed_breakdown')}</p>
          </div>
          
          {(data?.predictions || []).map((pred, idx) => (
            <div key={idx} className="space-y-6" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex items-center justify-between border-b border-border/30 pb-4">
                <h3 className="text-3xl font-serif italic text-foreground">{t(`months.${pred.month}`)} {targetYear}</h3>
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
                  {t('report.alignment')}: {pred.score}/100
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Career & Work', content: pred.career },
                  { label: 'Finance & Wealth', content: pred.finance },
                  { label: 'Love & Family', content: pred.love },
                  { label: 'Health & Vitality', content: pred.health },
                  { label: 'Travel & Growth', content: pred.travel }
                ].map((section) => (
                  <div key={section.label} className="p-5 rounded-2xl border border-border/50 space-y-3">
                    <h4 className="font-bold text-foreground uppercase tracking-widest text-[10px]">{section.label}</h4>
                    <div className="space-y-3">
                      <p className="text-text-secondary leading-relaxed font-light text-sm">{section.content.split('Simple Tip:')[0]}</p>
                      {section.content.includes('Simple Tip:') && (
                        <div className="flex items-start gap-2 bg-highlight/5 p-3 rounded-xl">
                          <span className="w-1.5 h-1.5 rounded-full bg-highlight mt-1.5 shrink-0"></span>
                          <p className="text-xs text-text-secondary italic">
                            <span className="text-highlight font-bold uppercase tracking-wider not-italic">{t('report.tip')}</span> {section.content.split('Simple Tip:')[1]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Monthly Transits (Print) */}
                <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                  <h4 className="font-bold text-primary uppercase tracking-widest text-[10px]">{t('report.key_transits')}</h4>
                  <div className="space-y-2">
                      {data?.transits?.map((tr, i) => (
                      <div key={i} className="flex justify-between items-center text-[9px] border-b border-primary/10 pb-1">
                        <span className="text-foreground font-medium">{tr.planet} {tr.event}</span>
                        <span className="text-text-secondary">{tr.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Kundali Data (Print Only) */}
          {chartData && chartData.planets && (
            <div className="pt-12 mt-12 border-t border-border break-inside-avoid">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-serif italic text-foreground">{t('report.birth_chart_overview')}</h2>
                <p className="text-[10px] uppercase tracking-widest text-text-secondary">{t('report.astrological_foundations')}</p>
              </div>

              {/* Chart and Calculations Grid */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Lagna Chart */}
                <div className="p-6 rounded-3xl border border-border bg-surface">
                  <h3 className="text-lg font-bold text-foreground mb-4 text-center">{t('report.lagna_chart')}</h3>
                  <NorthIndianChart planets={chartData.planets} ascendant={chartData.ascendant} />
                </div>
                
                {/* Vedic Analysis */}
                {calculations && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Mangal Dosha', value: calculations.manglik?.is_manglik ? 'Manglik' : 'Non-Manglik' },
                        { label: 'Sade Sati', value: calculations.sade_sati?.is_under_sade_sati ? calculations.sade_sati.phase : 'None' },
                        { label: 'Moolank', value: calculations.numerology?.moolank },
                        { label: 'Bhagyank', value: calculations.numerology?.bhagyank }
                      ].map((item) => (
                        <div key={item.label} className="p-4 rounded-xl border border-border bg-foreground/5 text-center">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1">{item.label}</p>
                          <p className="text-base font-serif italic text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{t('report.jatak_details')}</p>
                      <div className="flex flex-wrap gap-2">
                        {['yoni', 'gana', 'nadi', 'varna'].map((key) => (
                          <div key={key} className="px-2 py-1 rounded border border-border/50 text-[10px]">
                            <span className="font-bold text-text-secondary capitalize mr-1">{key}:</span>
                            <span className="text-foreground">{calculations.jatak?.[key] || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Vimshottari Dasha */}
                    {calculations.dasha && (
                      <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{t('report.current_dasha_vimshottari')}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-end border-b border-border/50 pb-2">
                            <div>
                              <span className="text-xl font-serif italic text-secondary">{calculations.dasha.mahadasha}</span>
                              <span className="text-[8px] text-text-secondary ml-2 uppercase font-bold tracking-widest">{t('report.mahadasha')}</span>
                            </div>
                            <span className="text-[8px] font-bold text-foreground">{t('report.ends')} {calculations.dasha.ends_year}</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <span className="text-lg font-serif italic text-primary">{calculations.dasha.antardasha}</span>
                              <span className="text-[8px] text-text-secondary ml-2 uppercase font-bold tracking-widest">{t('report.antardasha')}</span>
                            </div>
                            <span className="text-[8px] font-bold text-foreground">{t('report.active')}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-foreground/5 text-[10px] uppercase tracking-widest text-text-secondary">
                      <th className="px-6 py-3">Planet</th>
                      <th className="px-6 py-3">Sign</th>
                      <th className="px-6 py-3 text-center">Degree</th>
                      <th className="px-6 py-3 text-center">House</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {chartData.planets.map((p: any) => (
                      <tr key={p.name} className="border-b border-border/10">
                        <td className="px-6 py-3 font-bold text-foreground">{p.name}</td>
                        <td className="px-6 py-3 text-text-secondary">{p.sign}</td>
                        <td className="px-6 py-3 text-center font-mono text-text-secondary">{p.degree.toFixed(2)}°</td>
                        <td className="px-6 py-3 text-center text-text-secondary">{p.house}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Print Disclaimer & Footer */}
          <div className="pt-12 mt-12 border-t border-border space-y-8 pb-8 break-inside-avoid">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Official Disclaimer</h4>
              <p className="text-[8px] text-text-secondary leading-relaxed text-justify opacity-70">
                At AstroPinch, we are committed to providing thoughtful and personalized astrological insights using advanced analytical models and Vedic methodologies. While we make every reasonable effort to ensure the quality, relevance, and consistency of the predictions, astrology is inherently interpretative. Guidance and readings may not always be fully accurate or aligned with real-life outcomes. The information provided is intended solely for informational and spiritual purposes and should not be considered as professional financial, health, or legal advice. AstroPinch and its affiliates shall not be held liable for any decisions arising from the use of the platform. By using AstroPinch, you acknowledge that astrological interpretations may vary and no system can guarantee absolute certainty.
              </p>
            </div>
            
            <div className="text-center space-y-2 border-t border-border/50 pt-8">
              <h4 className="text-xl font-serif italic text-foreground">AstroPinch AI Astrologer</h4>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                {t('report.generated_for', { name: searchParams.get('name') || 'User' })} • Annual Divine Synthesis
              </p>
              <p className="text-[10px] text-text-secondary/60">
                © {new Date().getFullYear()} AstroPinch Divine Intelligence. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8 print:hidden">
          <button className="px-12 py-5 bg-foreground text-background rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-secondary transition-all shadow-2xl shadow-foreground/10">
            {t('report.buy_pdf')}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 15mm; size: A4; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          main { padding-top: 0 !important; }
          .max-w-7xl { max-width: 100% !important; }
          .grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
          .rounded-[3rem], .rounded-[2.5rem], .rounded-3xl { border-radius: 1rem !important; }
          .p-10, .p-8 { padding: 1.5rem !important; }
          .break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
          body { background: white !important; color: black !important; }
          h1 { font-size: 28pt !important; line-height: 1.1 !important; }
          h2 { font-size: 22pt !important; line-height: 1.2 !important; }
          h3 { font-size: 18pt !important; }
          .text-4xl { font-size: 20pt !important; }
          .text-lg { font-size: 10pt !important; }
          .shadow-2xl, .shadow-xl, .shadow-lg { shadow: none !important; box-shadow: none !important; }
          .bg-surface { background: #fafafa !important; border: 1px solid #eee !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </main>
  );
}
