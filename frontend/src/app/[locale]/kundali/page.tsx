"use client";

import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import CityInput from '@/components/CityInput';
import { PROFESSION_CATEGORIES } from '@/constants/professions';
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import AIChatPop from '@/components/AIChatPop';
import { useActiveProfile } from '@/hooks/useActiveProfile';

// ── Lazy-load Daily Guide — zero code loaded until tab is clicked ──
const DailyGuideTab = lazy(() => import('@/components/DailyGuide'));

type Tab = 'kundali' | 'daily';

export default function KundaliPage() {
  const t = useTranslations('Kundali');
  const router = useRouter();
  const { activeProfile, parsedActive, loading: profileLoading } = useActiveProfile();
  
  const [activeTab, setActiveTab] = useState<Tab>('kundali');
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (parsedActive && activeProfile && !profileLoading && activeTab === 'kundali') {
      setIsRedirecting(true);
      const query = new URLSearchParams({
        name: parsedActive.name,
        day: parsedActive.day,
        month: parsedActive.month,
        year: parsedActive.year,
        hour: parsedActive.hour,
        min: parsedActive.minute,
        profession: activeProfile.profession || 'Business/Entrepreneur',
        lat: parsedActive.lat.toString(),
        lon: parsedActive.lon.toString()
      }).toString();
      
      router.push(`/kundali/result?${query}`);
    }
  }, [parsedActive, activeProfile, profileLoading, activeTab, router]);

  const [formData, setFormData] = useState({
    name: '',
    day: '',
    month: '',
    year: '',
    hour: '',
    minute: '',
    place: '',
    profession: '',
    gender: '',
    lat: 28.6139,
    lon: 77.2090
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const day = parseInt(formData.day);
    const month = parseInt(formData.month);
    const year = parseInt(formData.year);
    const hour = parseInt(formData.hour);
    const minute = parseInt(formData.minute);

    if (year < 1900 || year > new Date().getFullYear()) {
      setError(`Year must be between 1900 and ${new Date().getFullYear()}.`);
      return;
    }
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      setError('Please enter a valid date of birth.');
      return;
    }
    if (hour < 0 || hour > 23) {
      setError('Hour must be between 0 and 23 in 24-hour format.');
      return;
    }
    if (minute < 0 || minute > 59) {
      setError('Minute must be between 0 and 59.');
      return;
    }
    if (formData.place.length > 0 && formData.lat === 28.6139 && formData.lon === 77.2090 && !formData.place.toLowerCase().includes('delhi')) {
      setError('Please select your birth place specifically from the dropdown suggestions to map the coordinates.');
      return;
    }

    const query = new URLSearchParams({
      name: formData.name,
      day: formData.day,
      month: formData.month,
      year: formData.year,
      hour: formData.hour,
      min: formData.minute,
      profession: formData.profession,
      gender: formData.gender,
      lat: formData.lat.toString(),
      lon: formData.lon.toString()
    }).toString();

    router.push(`/kundali/result?${query}`);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'kundali', label: 'Birth Chart', icon: <FileText size={14} /> },
    { id: 'daily', label: 'Daily Guide', icon: <Sparkles size={14} /> },
  ];

  if (profileLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs uppercase tracking-widest font-bold text-text-secondary">
          Loading {activeProfile?.full_name ? `${activeProfile.full_name}'s Profile` : 'Profile'}...
        </p>
      </div>
    );
  }

  return (
    <main className="relative pt-24 pb-16 px-6 min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page header ── */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-top-8 duration-700">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight leading-[0.9] italic font-serif text-foreground">
            {activeTab === 'kundali' ? t('title') : 'Daily Astrology Guide'}
          </h1>
          <p className="text-sm text-text-secondary max-w-xl mx-auto font-normal leading-relaxed">
            {activeTab === 'kundali'
              ? t('subtitle')
              : 'Precision Jyotish analysis mapped to your birth chart and profession.'}
          </p>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-surface border border-border shadow-inner">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'text-text-secondary hover:text-foreground hover:bg-foreground/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="animate-in fade-in duration-300">

          {/* Kundali tab — always in DOM, just hidden when inactive */}
          <div className={activeTab === 'kundali' ? 'block' : 'hidden'}>
            <div className="max-w-3xl mx-auto p-6 rounded-[2rem] bg-surface/50 backdrop-blur-xl border border-border shadow-2xl animate-in fade-in zoom-in duration-700 delay-200">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('form.name')}</label>
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent px-5 text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <CityInput
                      label={t('form.birthPlace') + " (India)"}
                      value={formData.place}
                      onChange={(place, lat, lon) => setFormData({...formData, place, lat, lon})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('form.birthDate')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input required type="number" placeholder="DD" className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={formData.day} onChange={(e) => setFormData({...formData, day: e.target.value})} />
                      <input required type="number" placeholder="MM" className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} />
                      <input required type="number" placeholder="YYYY" className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('form.birthTime')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input required type="number" placeholder="HH" className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={formData.hour} onChange={(e) => setFormData({...formData, hour: e.target.value})} />
                      <input required type="number" placeholder="MM" className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={formData.minute} onChange={(e) => setFormData({...formData, minute: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">GENDER</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Male', 'Female', 'Other'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({...formData, gender: g})}
                          className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                            formData.gender === g
                              ? 'bg-primary text-white border-primary shadow-lg'
                              : 'bg-foreground/5 border-transparent text-text-secondary hover:border-primary/30'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">PROFESSION</label>
                    <select
                      required
                      className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent px-5 text-[10px] text-foreground focus:border-primary focus:bg-transparent outline-none transition-all appearance-none cursor-pointer"
                      value={formData.profession}
                      onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    >
                      <option value="" className="bg-background">Select Profession</option>
                      {Object.entries(PROFESSION_CATEGORIES).map(([category, professions]) => (
                        <optgroup key={category} label={category} className="bg-background text-primary font-bold">
                          {professions.map(p => (
                            <option key={p} value={p} className="bg-background text-foreground">{p}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-alert/5 border border-alert/20 text-alert text-[8px] font-bold uppercase tracking-widest text-center animate-in fade-in scale-95">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-12 bg-foreground text-background rounded-xl font-black uppercase tracking-[0.3em] text-[9px] hover:scale-[0.98] active:scale-95 transition-all shadow-xl mt-1"
                >
                  {t('form.submit')}
                </button>
              </form>
            </div>
          </div>

          {/* Daily Guide tab — lazy-loaded only when this tab is first clicked */}
          {activeTab === 'daily' && (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center animate-pulse">
                  <Sparkles size={24} className="text-primary animate-spin" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary animate-pulse">
                  Loading Daily Guide…
                </p>
              </div>
            }>
              <DailyGuideTab />
            </Suspense>
          )}

        </div>
      </div>
      <AIChatPop />
    </main>
  );
}
