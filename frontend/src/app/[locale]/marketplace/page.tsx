"use client";

import React, { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Clock, Star, ShieldCheck, Zap, TrendingUp, Search, Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import { useActiveProfile } from '@/hooks/useActiveProfile';

export default function MarketplacePage() {
  const t = useTranslations('Marketplace');
  const [filter, setFilter] = useState('All');
  const { activeProfile, isLoggedIn } = useActiveProfile();
  const router = useRouter();

  // ── AI Oracle Match State ──────────────────────────────────────────────────
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchConcern, setMatchConcern] = useState('');
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<{astrologer_id: string; astrologer_name: string; reason: string; timing_info: string; dasha_planet: string|null} | null>(null);

  const handleMatch = async () => {
    setMatchLoading(true);
    setMatchResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/consultation/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_name: activeProfile?.full_name || '',
          concern: matchConcern,
        }),
      });
      const data = await res.json();
      setMatchResult(data);
    } catch {
      setMatchResult({ astrologer_id: '1', astrologer_name: 'Acharya Rahul', reason: 'Unable to reach the server. Please try again.', timing_info: '', dasha_planet: null });
    } finally {
      setMatchLoading(false);
    }
  };

  const astrologers = [
    { id: 1, name: 'Acharya Rahul', exp: '15 Yrs', rate: '₹45/min', rating: 4.9, reviews: 2405, tags: ['Vedic', 'KP'], status: 'Online', isPremium: true, image: '/images/astrologers/rahul.png' },
    { id: 2, name: 'Smt. Kavita', exp: '12 Yrs', rate: '₹35/min', rating: 4.8, reviews: 1892, tags: ['Nadi', 'Vastu'], status: 'Online', isPremium: false, image: '/images/astrologers/kavita.png' },
    { id: 3, name: 'Dr. Sanjay', exp: '20 Yrs', rate: '₹75/min', rating: 5.0, reviews: 4120, tags: ['Prashna', 'Vedic'], status: 'Busy', isPremium: true, image: '/images/astrologers/sanjay.png' },
    { id: 4, name: 'Swami Ji', exp: '25 Yrs', rate: '₹100/min', rating: 4.9, reviews: 5670, tags: ['Meditation', 'Vedic'], status: 'Online', isPremium: true, image: '/images/astrologers/swami.png' },
    { id: 5, name: 'Astrologer Priya', exp: '8 Yrs', rate: '₹25/min', rating: 4.7, reviews: 940, tags: ['Numerology', 'Tarot'], status: 'Offline', isPremium: false, image: '/images/astrologers/priya.png' },
    { id: 6, name: 'Guru Dev', exp: '30 Yrs', rate: '₹150/min', rating: 5.0, reviews: 8900, tags: ['Vedic', 'KP', 'Nadi', 'Prashna'], status: 'Online', isPremium: true, image: '/images/astrologers/guru.png' }
  ];

  const filteredAstrologers = filter === 'All'
    ? astrologers
    : astrologers.filter(a => a.tags.includes(filter));

  return (
    <>
    <main className="relative pt-24 md:pt-32 pb-28 px-4 md:px-6 min-h-screen text-foreground overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-10 md:space-y-16">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-highlight/10 border border-highlight/20 text-highlight text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <ShieldCheck size={14} /> {t('subtitle')}
            </div>
            <h1 className="text-4xl md:text-8xl font-serif italic tracking-tighter leading-[0.85] text-foreground">
              {t('title')}
              <span className="block text-base md:text-3xl not-italic font-sans font-black uppercase tracking-tighter opacity-10 mt-2">
                Verified Vedic Masters
              </span>
            </h1>
          </div>

          {isLoggedIn && (
            <Link
              href="/marketplace/history"
              className="group h-12 md:h-14 px-5 md:px-8 rounded-2xl bg-surface/50 backdrop-blur-md border border-border flex items-center gap-2 md:gap-3 hover:bg-foreground hover:text-background transition-all duration-500 shadow-xl self-start md:self-auto"
            >
              <Clock size={16} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t('card.consult_history')}</span>
            </Link>
          )}
        </div>

        {/* ── Filters + Search ── */}
        <div className="flex flex-col gap-3">
          {/* Filter pills — horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', 'Vedic', 'KP', 'Nadi', 'Numerology', 'Vastu'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`h-10 px-5 rounded-xl border transition-all duration-300 text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${
                  filter === f
                    ? 'bg-primary text-white border-primary shadow-xl shadow-primary/30'
                    : 'bg-surface/30 backdrop-blur-md border-border text-text-secondary hover:border-primary/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search masters..."
              className="w-full h-11 pl-11 pr-4 rounded-2xl bg-surface/30 backdrop-blur-md border border-border outline-none focus:border-primary focus:bg-surface/50 transition-all text-xs font-bold"
            />
          </div>
        </div>

        {/* ── Astrologer Grid ── */}
        {/* Grid: 1 column on mobile, 2 columns on desktop for spacious horizontal cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {filteredAstrologers.map((astro) => (
            <div key={astro.id} className="relative group">
              {astro.isPremium && (
                <div className="absolute -top-2 -right-2 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-highlight text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20 flex items-center gap-1">
                  <Zap size={9} fill="currentColor" /> Elite
                </div>
              )}

              {/* Card Container: horizontal on all sizes for better image visibility */}
              <div className="p-4 rounded-[2rem] bg-surface/40 backdrop-blur-2xl border border-border hover:border-primary/40 transition-all duration-500 flex flex-row gap-5 md:gap-8 relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-primary/5 group-hover:-translate-y-1 h-full">

                <div className="relative flex-shrink-0 self-start sm:self-stretch">
                  <div className={`absolute -inset-1 rounded-2xl blur-sm opacity-40 ${astro.status === 'Online' ? 'bg-highlight animate-pulse' : 'bg-transparent'}`} />
                  <div className="relative w-28 h-28 sm:w-40 sm:h-40 lg:w-56 lg:h-56 rounded-3xl overflow-hidden border border-border shadow-inner">
                    <img
                      src={astro.image}
                      alt={astro.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Status pill */}
                    <div className={`absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      astro.status === 'Online' ? 'bg-highlight/90 text-white' :
                      astro.status === 'Busy'   ? 'bg-secondary/90 text-white' :
                                                  'bg-black/60 text-white/70'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {astro.status}
                    </div>
                  </div>
                </div>

                {/* Info — fills remaining width on mobile */}
                <div className="flex flex-col justify-between flex-1 min-w-0 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-secondary font-black text-[9px] uppercase tracking-[0.15em]">
                      <Star size={9} fill="currentColor" /> {astro.rating}
                      <span className="text-text-secondary/50 lowercase font-medium">({astro.reviews})</span>
                    </div>
                    <h3 className="text-xl md:text-3xl font-serif italic text-foreground leading-tight">{astro.name}</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary/60 flex items-center gap-1">
                      <TrendingUp size={9} /> {astro.exp}
                    </p>
                    {/* Tags — hidden on mobile to save space, shown sm+ */}
                    <div className="hidden sm:flex flex-wrap gap-1.5 pt-1">
                      {astro.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-foreground/5 text-[8px] font-black uppercase tracking-widest text-text-secondary/80 border border-border/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rate + CTA — always visible */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[7px] font-black uppercase tracking-widest text-text-secondary opacity-60 block">Rate</span>
                      <p className="text-sm font-serif italic text-primary leading-none">{astro.rate}</p>
                    </div>
                    <button
                      onClick={() => {
                        const name = activeProfile?.full_name || '';
                        router.push(`/marketplace/consult/${astro.id}${name ? `?profile=${encodeURIComponent(name)}` : ''}`);
                      }}
                      disabled={astro.status === 'Offline'}
                      className={`h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex-shrink-0 ${
                        astro.status === 'Offline'
                          ? 'bg-surface border border-border text-text-secondary/40 cursor-not-allowed'
                          : 'bg-foreground text-background hover:bg-primary hover:text-white shadow-lg'
                      }`}
                    >
                      {astro.status === 'Offline' ? 'Offline' : t('card.consult')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Support / AI Match Section ── */}
        <div className="p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center space-y-4 md:space-y-6">
          <h2 className="text-2xl md:text-5xl font-serif italic text-foreground leading-tight">
            Can't decide who to consult?
          </h2>
          <p className="text-xs md:text-sm text-text-secondary max-w-xl mx-auto font-normal">
            Our AI engine can match you with the best astrologer based on your current planetary transits. Start a free query with our AI Oracle first.
          </p>
          <button
            onClick={() => { setShowMatchModal(true); setMatchResult(null); setMatchConcern(''); }}
            className="h-12 md:h-14 px-8 md:px-12 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[0.98] transition-all flex items-center gap-3 mx-auto"
          >
            <Sparkles size={16} />
            Match Me with a Guru
          </button>
        </div>
      </div>
    </main>

    {/* ── AI Oracle Match Modal ── */}
    {showMatchModal && (
      <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="w-full sm:max-w-lg bg-background border border-border rounded-t-[2rem] sm:rounded-[2.5rem] p-5 md:p-8 space-y-5 shadow-2xl animate-in slide-in-from-bottom-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">AI Oracle</p>
              </div>
              <h3 className="text-xl md:text-2xl font-serif italic text-foreground">Find Your Perfect Guru</h3>
              <p className="text-xs text-text-secondary font-normal">Tell us what's on your mind. Our AI will analyze your planetary timing and recommend the best match.</p>
            </div>
            <button onClick={() => setShowMatchModal(false)} className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all flex-shrink-0">
              <X size={15} />
            </button>
          </div>

          {/* Concern Input */}
          {!matchResult && (
            <div className="space-y-3">
              <textarea
                value={matchConcern}
                onChange={e => setMatchConcern(e.target.value)}
                placeholder="e.g. I want guidance on my career change, or leave blank for a planetary-based match..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-surface border border-border text-foreground text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 resize-none font-normal"
              />
              <button
                id="ai-oracle-match-btn"
                onClick={handleMatch}
                disabled={matchLoading}
                className="w-full h-13 py-3.5 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[0.98] transition-all disabled:opacity-50"
              >
                {matchLoading ? <><Loader2 size={16} className="animate-spin" /> Analyzing your stars...</> : <><Sparkles size={16} /> Find My Match</>}
              </button>
            </div>
          )}

          {/* Match Result */}
          {matchResult && (() => {
            const astro = astrologers.find(a => String(a.id) === matchResult.astrologer_id);
            return (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-primary/20 shrink-0">
                    <img src={astro?.image || '/images/astrologers/rahul.png'} alt={matchResult.astrologer_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">✨ Your Cosmic Match</p>
                    <h4 className="text-lg font-serif italic text-foreground truncate">{matchResult.astrologer_name}</h4>
                    {matchResult.dasha_planet && (
                      <p className="text-[10px] text-text-secondary mt-0.5">Based on your <span className="font-bold text-foreground">{matchResult.dasha_planet} Mahadasha</span></p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-text-secondary font-normal italic leading-relaxed px-1">"{matchResult.reason}"</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowMatchModal(false); setMatchResult(null); setMatchConcern(''); }}
                    className="flex-1 h-11 rounded-xl bg-surface border border-border text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                  >
                    Browse All
                  </button>
                  <button
                    id="ai-oracle-consult-btn"
                    onClick={() => {
                      setShowMatchModal(false);
                      const name = activeProfile?.full_name || '';
                      router.push(`/marketplace/consult/${matchResult.astrologer_id}${name ? `?profile=${encodeURIComponent(name)}` : ''}`);
                    }}
                    className="flex-1 h-11 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[0.98] transition-all"
                  >
                    Consult Now <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    )}
    </>
  );
}
