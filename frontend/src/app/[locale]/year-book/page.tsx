"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { User, ChevronDown, Sparkles, Loader2, Lock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import CityInput from '@/components/CityInput';
import AnimatedZodiacBackground from '@/components/AnimatedZodiacBackground';
import { useActiveProfile, parseProfile } from '@/hooks/useActiveProfile';

export default function YearBookPage() {
  const t = useTranslations('YearBook');
  const kt = useTranslations('Kundali');
  const router = useRouter();
  const { profiles, parsedActive, activeProfileId, selectProfile, isLoggedIn, loading } = useActiveProfile();

  const [targetYear, setTargetYear] = useState('2026');
  const [loadingNav, setLoadingNav] = useState(false);
  const [error, setError] = useState('');

  // Manual form state (fallback for guests)
  const [formData, setFormData] = useState({
    name: '',
    day: '',
    month: (new Date().getMonth() + 1).toString(),
    year: '',
    hour: '',
    minute: '',
    place: '',
    lat: 0,
    lon: 0,
  });

  // When active profile changes, navigate directly
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedActive) return;
    setLoadingNav(true);
    const query = new URLSearchParams({
      name: parsedActive.name,
      day: parsedActive.day,
      month: parsedActive.month,
      year: parsedActive.year,
      hour: parsedActive.hour,
      minute: parsedActive.minute,
      lat: parsedActive.lat.toString(),
      lon: parsedActive.lon.toString(),
      targetYear,
    }).toString();
    setTimeout(() => router.push(`/year-book/report?${query}`), 400);
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lat) {
      setError(t('form.error_place'));
      return;
    }
    setLoadingNav(true);
    const query = new URLSearchParams({
      ...formData,
      lat: formData.lat.toString(),
      lon: formData.lon.toString(),
      targetYear,
    }).toString();
    setTimeout(() => router.push(`/year-book/report?${query}`), 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // ── LOGGED-IN EXPERIENCE ──────────────────────────────────────────────────
  if (isLoggedIn) {
    const completeProfiles = profiles.map(parseProfile).filter(Boolean) as ReturnType<typeof parseProfile>[];

    if (completeProfiles.length === 0) {
      return (
        <div className="relative pt-40 pb-20 px-6 text-center min-h-screen">
          <AnimatedZodiacBackground />
          <div className="max-w-md mx-auto space-y-8 relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-foreground/5 border border-border flex items-center justify-center mx-auto shadow-xl">
              <Lock size={32} className="text-text-secondary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-serif italic text-foreground">{t('no_profile.title')}</h2>
              <p className="text-xs text-text-secondary leading-relaxed uppercase tracking-widest font-bold">
                {t('no_profile.desc')}
              </p>
            </div>
            <Link
              href="/admin/users"
              className="inline-flex h-14 px-10 rounded-full bg-primary text-white items-center justify-center font-black uppercase tracking-[0.3em] text-[10px] hover:scale-105 transition-all shadow-2xl shadow-primary/20"
            >
              {t('no_profile.button')}
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen text-foreground overflow-hidden relative selection:bg-primary/30">
        <AnimatedZodiacBackground />
        <main className="relative z-10 pt-24 md:pt-32 pb-24 px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                <Sparkles size={12} /> The Annual Dossier
              </div>
              <h1 className="text-3xl md:text-7xl font-medium tracking-tight leading-[1.1] italic font-serif text-foreground">
                Your Future Is Written.{' '}
                <span className="block text-xl md:text-5xl text-text-secondary font-normal mt-1">Read The Script.</span>
              </h1>
              <p className="text-sm md:text-xl text-text-secondary max-w-3xl mx-auto font-normal leading-relaxed hidden md:block">
                Generate your month-by-month cosmic roadmap to navigate the upcoming year with unfair foresight.
              </p>
            </div>

            {/* Profile Selector Card */}
            <form onSubmit={handleProfileSubmit} className="p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-surface/50 backdrop-blur-xl border border-border shadow-2xl animate-in fade-in zoom-in duration-1000 space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-2 block">
                  {t('form.select_profile')}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                    <User size={16} />
                  </div>
                  <select
                    value={activeProfileId ?? ''}
                    onChange={(e) => selectProfile(parseInt(e.target.value))}
                    className="w-full h-14 pl-12 pr-10 rounded-2xl bg-foreground/5 border border-transparent text-sm text-foreground focus:border-primary focus:bg-transparent outline-none transition-all appearance-none cursor-pointer"
                  >
                    {completeProfiles.map((p) => p && (
                      <option key={p.id} value={p.id} className="bg-background">
                        {p.name} {p.role === 'master' ? '(Master)' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Selected Profile Preview */}
              {parsedActive && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 animate-in fade-in duration-500">
                  {[
                    { label: t('form.birth_date'), value: `${parsedActive.day}/${parsedActive.month}/${parsedActive.year}` },
                    { label: t('form.birth_time'), value: `${parsedActive.hour}:${parsedActive.minute}` },
                    { label: t('form.birth_place'), value: parsedActive.place || 'N/A' },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-2xl bg-foreground/5 border border-border space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">{item.label}</p>
                      <p className="text-xs font-medium text-foreground truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Prediction Year */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-secondary ml-2 block">
                  {t('form.prediction_year')}
                </label>
                <div className="relative">
                  <select
                    className="w-full h-12 px-6 rounded-2xl bg-foreground/5 border border-transparent text-sm text-foreground font-serif italic focus:border-secondary focus:bg-transparent outline-none appearance-none"
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                  >
                    {['2025', '2026', '2027', '2028', '2029', '2030'].map((y) => (
                      <option key={y} value={y} className="bg-background">{y} {t('form.roadmap_suffix')}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Pricing Pills */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-foreground/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{t('form.standard')}</h4>
                      <p className="text-[9px] text-text-secondary mt-0.5">{t('form.standard_desc')}</p>
                    </div>
                    <p className="text-lg font-serif italic text-foreground">Free</p>
                  </div>
                </div>
                <div className="p-5 rounded-3xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-secondary">{t('form.expert')}</h4>
                      <p className="text-[9px] text-secondary/60 mt-0.5">{t('form.expert_desc')}</p>
                    </div>
                    <p className="text-lg font-serif italic text-secondary">Free</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingNav || !parsedActive}
                className="w-full h-14 bg-secondary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[0.98] active:scale-95 transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {loadingNav ? (
                  <><Loader2 size={20} className="animate-spin" /> {t('form.loading')}</>
                ) : t('cta')}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // ── GUEST EXPERIENCE ──────────────────────────────────────────────────────
  return (
    <main className="relative pt-24 md:pt-32 pb-28 px-4 md:px-6 min-h-screen text-foreground">
      <AnimatedZodiacBackground />
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 relative z-10">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
            <Sparkles size={12} /> The Annual Dossier
          </div>
          <h1 className="text-3xl md:text-7xl font-medium tracking-tight leading-[1.1] italic font-serif text-foreground">
            Your Future Is Written.{' '}
            <span className="block text-xl md:text-5xl text-text-secondary font-normal mt-1">Read The Script.</span>
          </h1>
          <p className="text-sm md:text-xl text-text-secondary max-w-3xl mx-auto font-normal leading-relaxed hidden md:block">
            Our predictive Year Book combines Dasha timelines with major planetary transits to give you a month-by-month roadmap. Navigate with unfair foresight.
          </p>
          <p className="text-xs text-primary font-bold uppercase tracking-widest inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/20">
            <Link href="/login" className="hover:underline">{t('form.signin_prefix')}</Link> {t('form.signin_suffix')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-surface/50 backdrop-blur-xl border border-border shadow-2xl animate-in fade-in zoom-in duration-1000 delay-200">
          <form onSubmit={handleGuestSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-4 block">{kt('form.name')}</label>
                <input
                  required type="text" placeholder={kt('form.name')}
                  className="w-full h-12 px-6 rounded-2xl bg-foreground/5 border border-transparent text-sm text-foreground focus:border-primary focus:bg-transparent outline-none transition-all shadow-sm"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-secondary ml-4 block">{t('form.prediction_year')}</label>
                <div className="relative">
                  <select
                    className="w-full h-12 px-6 rounded-2xl bg-foreground/5 border border-transparent text-sm text-foreground font-serif italic focus:border-secondary focus:bg-transparent outline-none appearance-none"
                    value={targetYear} onChange={(e) => setTargetYear(e.target.value)}
                  >
                    {['2025', '2026', '2027', '2028', '2029', '2030'].map((y) => (
                      <option key={y} value={y}>{y} {t('form.roadmap_suffix')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-4 block">{kt('form.birthDate')}</label>
                <div className="grid grid-cols-3 gap-2">
                  <input required type="number" placeholder="DD" className="w-full h-12 rounded-2xl bg-foreground/5 border border-transparent text-center text-sm text-foreground focus:border-primary focus:bg-transparent outline-none" value={formData.day} onChange={(e) => setFormData({ ...formData, day: e.target.value })} />
                  <input required type="number" placeholder="MM" className="w-full h-12 rounded-2xl bg-foreground/5 border border-transparent text-center text-sm text-foreground focus:border-primary focus:bg-transparent outline-none" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} />
                  <input required type="number" placeholder="YYYY" className="w-full h-12 rounded-2xl bg-foreground/5 border border-transparent text-center text-sm text-foreground focus:border-primary focus:bg-transparent outline-none" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-4 block">{kt('form.birthTime')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <input required type="number" placeholder="HH" className="w-full h-12 rounded-2xl bg-foreground/5 border border-transparent text-center text-sm text-foreground focus:border-primary focus:bg-transparent outline-none" value={formData.hour} onChange={(e) => setFormData({ ...formData, hour: e.target.value })} />
                  <input required type="number" placeholder="MM" className="w-full h-12 rounded-2xl bg-foreground/5 border border-transparent text-center text-sm text-foreground focus:border-primary focus:bg-transparent outline-none" value={formData.minute} onChange={(e) => setFormData({ ...formData, minute: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <CityInput
                label={kt('form.birthPlace') + " (India)"}
                value={formData.place}
                onChange={(place, lat, lon) => setFormData({ ...formData, place, lat, lon })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="p-5 rounded-3xl bg-foreground/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <div><h4 className="font-bold text-xs text-foreground">{t('form.standard')}</h4><p className="text-[9px] text-text-secondary mt-0.5">{t('form.standard_desc')}</p></div>
                  <p className="text-lg font-serif italic text-foreground">Free</p>
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <div><h4 className="font-bold text-xs text-secondary">{t('form.expert')}</h4><p className="text-[9px] text-secondary/60 mt-0.5">{t('form.expert_desc')}</p></div>
                  <p className="text-lg font-serif italic text-secondary">Free</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-alert/5 border border-alert/20 text-alert text-[9px] font-bold uppercase tracking-widest text-center animate-in fade-in scale-95">
                {error}
              </div>
            )}

            <button
              disabled={loadingNav} type="submit"
              className="w-full h-14 bg-foreground text-background rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[0.98] active:scale-95 transition-all shadow-xl disabled:bg-foreground/20 flex items-center justify-center gap-4 mt-2"
            >
              {loadingNav ? <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" /> : t('cta')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
