"use client";

import React, { useState, useEffect } from 'react';
import { PROFESSION_CATEGORIES } from '@/constants/professions';
import { 
  Sparkles, Shield, TrendingUp, Heart, Briefcase, 
  MapPin, Clock, Moon, Sun, AlertTriangle, 
  CheckCircle, Zap, Star, Coffee, Utensils, 
  HandHeart, Compass, Gem, Activity, Calendar, Lock
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import CityInput from '@/components/CityInput';
import AnimatedZodiacBackground from '@/components/AnimatedZodiacBackground';
import { useTranslations } from 'next-intl';

interface HoroscopeData {
  date: string;
  user_name: string;
  lagna: string;
  moon_sign: string;
  current_dasha: string;
  birth_nakshatra: string;
  todays_nakshatra: string;
  todays_tithi: string;
  day_energy: string;
  day_score: number;
  morning_mantra: string;
  day_summary: string;
  profession_guidance: {
    profession: string;
    todays_outlook: string;
    key_guidance: string;
    best_time_to_work: string;
    avoid_time: string;
    decision_verdict: string;
    decision_reasoning: string;
  };
  risk_assessment: {
    overall_risk_level: string;
    risk_score: number;
    financial_risk: string;
    financial_risk_detail: string;
    health_risk: string;
    health_risk_detail: string;
    relationship_risk: string;
    relationship_risk_detail: string;
    travel_risk: string;
    travel_risk_detail: string;
  };
  do_today: string[];
  avoid_today: string[];
  investment_guidance: {
    suitable_for_investing: string;
    sectors_favored: string[];
    sectors_to_avoid: string[];
    rationale: string;
  };
  remedies: {
    morning_remedy: string;
    gemstone_activation: string;
    mantra_for_today: string;
    color_to_wear: string;
    food_to_eat: string;
    food_to_avoid: string;
    charity_remedy: string;
    evening_remedy: string;
  };
  lucky_elements: {
    lucky_number: number;
    lucky_color: string;
    lucky_direction: string;
    lucky_time: string;
    lucky_gemstone: string;
  };
  planetary_highlights: {
    planet: string;
    position: string;
    effect_today: string;
  }[];
  important_muhurtas: {
    auspicious_windows: string[];
    rahu_kaal: string;
    gulika_kaal: string;
    yamaganda: string;
    abhijit_muhurta: string;
  };
  stock_market_pulse: {
    market_sentiment: string;
    confidence_level: string;
    key_planet_driving_markets: string;
    sectors_to_watch: string[];
    advice: string;
  };
  closing_wisdom: string;
  llm_rephrased_summary?: string;
}

interface InitialProfile {
  name: string;
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  place: string;
  profession: string;
  lat: number;
  lon: number;
}

export default function DailyGuideTab({ initialProfile }: { initialProfile?: InitialProfile }) {
  const t = useTranslations('DailyGuide');
  const [formData, setFormData] = useState<InitialProfile>(initialProfile || {
    name: '',
    day: '',
    month: '',
    year: '',
    hour: '',
    minute: '',
    place: '',
    profession: '',
    lat: 0,
    lon: 0
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<HoroscopeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasFetched = React.useRef(false);

  useEffect(() => {
    const loadProfile = () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      // If pre-populated from parent (Kundali result page), auto-submit immediately
      // Note: Kundali searchParams often lack profession, so we default to "General"
      if (initialProfile && initialProfile.name && initialProfile.lat) {
        const dob = `${initialProfile.year}-${initialProfile.month.padStart(2,'0')}-${initialProfile.day.padStart(2,'0')}`;
        const time = `${initialProfile.hour.padStart(2,'0')}:${initialProfile.minute.padStart(2,'0')}`;
        handleAutoSubmit({
          full_name: initialProfile.name,
          birth_date: dob,
          birth_time: time,
          lat: initialProfile.lat,
          lon: initialProfile.lon,
          profession: initialProfile.profession || 'General'
        });
        return;
      }
      // Otherwise fall back to localStorage
      const saved = localStorage.getItem('astropinch_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        const [year, month, day] = parsed.birth_date.split('-');
        const [hour, minute] = parsed.birth_time.split(':');
        setFormData({
          name: parsed.full_name,
          day, month, year, hour, minute,
          place: parsed.birth_place,
          profession: parsed.profession,
          lat: parseFloat(parsed.lat),
          lon: parseFloat(parsed.lon)
        });
        if (parsed.full_name && parsed.birth_date && parsed.profession) {
          handleAutoSubmit(parsed);
        }
      }
    };

    loadProfile();
    window.addEventListener('profileChanged', loadProfile);
    return () => window.removeEventListener('profileChanged', loadProfile);
  }, [initialProfile]);

  const handleAutoSubmit = async (profile: any) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/astropinch_daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.full_name,
          dob: profile.birth_date,
          time: profile.birth_time,
          lat: parseFloat(profile.lat),
          lon: parseFloat(profile.lon),
          profession: profile.profession
        })
      });
      if (!res.ok) throw new Error('Failed to fetch personalized guide');
      const result = await res.json();
      setData(result);
      setSubmitted(true);
    } catch (err: any) {
      console.error('AutoSubmit Error:', err);
      setError(err.message || 'Connection failed. Please try manual entry.');
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.lat || !formData.profession) {
      setError('Please provide all details including birth place and profession.');
      return;
    }
    setLoading(true);
    const dob = `${formData.year}-${formData.month.padStart(2, '0')}-${formData.day.padStart(2, '0')}`;
    const time = `${formData.hour.padStart(2, '0')}:${formData.minute.padStart(2, '0')}`;
    
    // Save to local storage
    localStorage.setItem('astropinch_profile', JSON.stringify({
      full_name: formData.name,
      birth_date: dob,
      birth_time: time,
      birth_place: formData.place,
      profession: formData.profession,
      lat: formData.lat,
      lon: formData.lon
    }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/astropinch_daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          dob,
          time,
          lat: formData.lat,
          lon: formData.lon,
          profession: formData.profession
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to fetch horoscope');
      }

      const result = await res.json();
      setData(result);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!submitted) {
    return (
      <div className="relative pt-0 pb-20 px-2">
        <AnimatedZodiacBackground />
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Sparkles size={14} className="animate-pulse" /> {t('header.personalized')}
            </div>
            <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight leading-[0.9] text-foreground">
              {t('title').split(' Astrology ').map((part, i) => (
                <React.Fragment key={i}>
                  {part} {i === 0 && <br/>}
                </React.Fragment>
              ))}
            </h1>
            <p className="text-sm text-text-secondary max-w-xl mx-auto font-light leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          <div className="max-w-3xl mx-auto p-8 rounded-[3rem] bg-surface/50 backdrop-blur-3xl border border-border shadow-2xl animate-in fade-in zoom-in duration-1000">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('form.full_name')}</label>
                  <input required type="text" placeholder={t('form.full_name')} className="w-full h-12 px-6 rounded-2xl bg-foreground/5 border border-transparent text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <CityInput 
                    label={t('form.birth_place')}
                    value={formData.place}
                    onChange={(place, lat, lon) => setFormData({...formData, place, lat, lon})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('form.birth_date')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input required type="number" placeholder="DD" className="w-full h-12 rounded-2xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none" value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})} />
                    <input required type="number" placeholder="MM" className="w-full h-12 rounded-2xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} />
                    <input required type="number" placeholder="YYYY" className="w-full h-12 rounded-2xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('form.birth_time')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input required type="number" placeholder="HH" className="w-full h-12 rounded-2xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none" value={formData.hour} onChange={e => setFormData({...formData, hour: e.target.value})} />
                    <input required type="number" placeholder="MM" className="w-full h-12 rounded-2xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none" value={formData.minute} onChange={e => setFormData({...formData, minute: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('form.profession')}</label>
                <select
                  required
                  className="w-full h-12 px-6 rounded-2xl bg-foreground/5 border border-transparent text-[11px] text-foreground focus:border-primary focus:bg-transparent outline-none transition-all appearance-none cursor-pointer"
                  value={formData.profession}
                  onChange={e => setFormData({...formData, profession: e.target.value})}
                >
                  <option value="" className="bg-background">{t('form.select_profession')}</option>
                  {Object.entries(PROFESSION_CATEGORIES).map(([category, professions]) => (
                    <optgroup key={category} label={category} className="bg-background text-primary font-bold">
                      {professions.map(p => (
                        <option key={p} value={p} className="bg-background text-foreground">{p}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-alert/5 border border-alert/20 text-alert text-[8px] font-bold uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[0.98] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin"></div>
                ) : t('form.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 rounded-[2rem] bg-foreground/5 border border-border flex items-center justify-center animate-pulse">
           <Sparkles size={32} className="text-primary animate-spin duration-1000" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="relative pt-2 pb-20 px-2 selection:bg-primary/30">
      <AnimatedZodiacBackground />
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
           {/* Day Energy Metrics - Redesigned for High Visibility */}
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
             <div className="space-y-2">
               <h2 className="text-3xl md:text-5xl font-serif italic text-foreground leading-none">
                 {t('header.guide_title', { name: data?.user_name || 'Your' })}
               </h2>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                 <Calendar className="w-3 h-3" /> {t('header.personalized')}
               </p>
             </div>
             <div className="relative group">
               <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative flex items-center gap-6 p-4 rounded-[2rem] bg-surface/50 border border-border backdrop-blur-md shadow-2xl">
                 <div className="text-right space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">{t('header.energy_status')}</p>
                   <p className={`text-2xl md:text-3xl font-serif italic leading-none ${data?.day_score && data?.day_score > 7 ? 'text-highlight' : data?.day_score && data?.day_score > 4 ? 'text-secondary' : 'text-alert'}`}>
                     {data?.day_energy}
                   </p>
                 </div>
                 <div className="flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-foreground text-background shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                   <div className="text-center">
                     <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-0.5">{t('header.score')}</p>
                     <p className="text-3xl font-serif italic leading-none">{data?.day_score}</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: t('metrics.lagna'), value: data?.lagna, icon: <Activity size={14} /> },
               { label: t('metrics.moon_sign'), value: data?.moon_sign, icon: <Moon size={14} /> },
               { label: t('metrics.birth_nakshatra'), value: data?.birth_nakshatra, icon: <Star size={14} /> },
               { label: t('metrics.current_dasha'), value: data?.current_dasha, icon: <TrendingUp size={14} /> },
             ].map((item, i) => (
               <div key={i} className="p-4 rounded-2xl bg-surface/50 border border-border space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1">
                   {item.icon} {item.label}
                 </p>
                 <p className="text-sm font-medium text-foreground">{item.value}</p>
               </div>
             ))}
           </div>
        </div>

        {/* --- MORNING MANTRA & SUMMARY --- */}
        <div className="grid md:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
           <div className={`md:col-span-8 p-10 rounded-[3rem] bg-surface/50 backdrop-blur-xl border border-border shadow-xl space-y-6 ${data?.llm_rephrased_summary ? 'relative' : ''}`}>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Coffee size={24} />
                 </div>
                 <h2 className="text-2xl font-bold text-foreground">{t('sections.morning_dispatch')}</h2>
                 {data?.llm_rephrased_summary && (
                   <div className="flex items-center gap-1.5 ml-auto px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-black uppercase tracking-widest text-primary">
                     <Sparkles size={10} /> AI Enhanced
                   </div>
                 )}
              </div>
              
              {data?.llm_rephrased_summary ? (
                <div className="space-y-4">
                   <div className="text-sm text-foreground/80 leading-relaxed font-medium bg-foreground/5 p-6 rounded-2xl border border-border whitespace-pre-wrap">
                      {data.llm_rephrased_summary}
                   </div>
                   <p className="text-[10px] text-text-secondary italic px-2">Based on: "{data?.day_summary}"</p>
                </div>
              ) : (
                <p className="text-xl font-light text-foreground/90 leading-relaxed italic border-l-2 border-primary pl-6 py-2">
                   "{data?.day_summary}"
                </p>
              )}
           </div>
           <div className="md:col-span-4 p-8 rounded-[3rem] bg-primary text-white shadow-2xl shadow-primary/30 flex flex-col justify-center items-center text-center space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">{t('sections.morning_mantra')}</p>
              <p className="text-2xl md:text-3xl font-bold leading-relaxed">{data?.morning_mantra}</p>
           </div>
        </div>

        {/* --- PROFESSION GUIDANCE --- */}
        <div className="p-10 rounded-[3.5rem] bg-surface border border-border shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Briefcase size={24} />
                 </div>
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">{t('sections.professional_guidance')}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{data?.profession_guidance?.profession}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${data?.profession_guidance?.todays_outlook === 'Excellent' || data?.profession_guidance?.todays_outlook === 'Favorable' ? 'bg-highlight/20 border-highlight text-highlight' : 'bg-secondary/20 border-secondary text-secondary'}`}>
                    {data?.profession_guidance?.todays_outlook}
                 </span>
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${data?.profession_guidance?.decision_verdict?.includes('Green') ? 'bg-highlight/20 border-highlight text-highlight' : 'bg-alert/20 border-alert text-alert'}`}>
                    {data?.profession_guidance?.decision_verdict?.split(' — ')[0]}
                 </span>
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                 <p className="text-lg font-light leading-relaxed text-foreground/90 italic">
                    {data?.profession_guidance?.key_guidance}
                 </p>
                 <div className="p-6 rounded-2xl bg-foreground/5 border border-border space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{t('profession_detail.verdict_reasoning')}</p>
                    <p className="text-sm font-medium text-foreground">{data?.profession_guidance?.decision_reasoning}</p>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="flex items-center gap-6 p-6 rounded-3xl bg-highlight/10 border border-highlight/20">
                    <Clock className="text-highlight" size={32} />
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-highlight/60">{t('profession_detail.best_execution')}</p>
                       <p className="text-2xl font-serif italic text-foreground">{data?.profession_guidance?.best_time_to_work}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6 p-6 rounded-3xl bg-alert/10 border border-alert/20">
                    <AlertTriangle className="text-alert" size={32} />
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-alert/60">{t('profession_detail.critical_avoidance')}</p>
                       <p className="text-2xl font-serif italic text-foreground">{data?.profession_guidance?.avoid_time}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- RISK ASSESSMENT --- */}
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
           <div className="p-10 rounded-[3rem] bg-surface/50 backdrop-blur-xl border border-border shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Shield className="text-alert" size={24} />
                    <h2 className="text-2xl font-bold">{t('sections.risk_map')}</h2>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">{t('sections.overall_risk')}</p>
                    <p className={`text-xl font-serif italic ${data?.risk_assessment?.overall_risk_level === 'Low' ? 'text-highlight' : 'text-alert'}`}>{data?.risk_assessment?.overall_risk_level}</p>
                 </div>
              </div>
              
              <div className="space-y-6">
                 {[
                   { label: t('risk_detail.financial'), risk: data?.risk_assessment?.financial_risk, detail: data?.risk_assessment?.financial_risk_detail, icon: <TrendingUp size={16} /> },
                   { label: t('risk_detail.health'), risk: data?.risk_assessment?.health_risk, detail: data?.risk_assessment?.health_risk_detail, icon: <Activity size={16} /> },
                   { label: t('risk_detail.relationships'), risk: data?.risk_assessment?.relationship_risk, detail: data?.risk_assessment?.relationship_risk_detail, icon: <Heart size={16} /> },
                   { label: t('risk_detail.travel'), risk: data?.risk_assessment?.travel_risk, detail: data?.risk_assessment?.travel_risk_detail, icon: <Compass size={16} /> },
                 ].map((r, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.risk === 'Low' ? 'bg-highlight/10 text-highlight' : 'bg-alert/10 text-alert'}`}>
                         {r.icon}
                      </div>
                      <div>
                         <p className="text-xs font-bold text-foreground flex items-center gap-2">
                            {r.label} <span className="text-[8px] uppercase tracking-widest text-text-secondary">| {r.risk} Risk</span>
                         </p>
                         <p className="text-xs text-text-secondary font-light mt-1">{r.detail}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-8">
              {/* DO & AVOID */}
              <div className="p-8 rounded-[3rem] bg-highlight/5 border border-highlight/20 space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-highlight flex items-center gap-2">
                    <CheckCircle size={14} /> {t('sections.strategic_actions')}
                 </h3>
                 <ul className="space-y-3">
                    {data?.do_today?.map((item, i) => (
                      <li key={i} className="text-sm font-medium text-foreground flex gap-3">
                         <span className="text-highlight">•</span> {item}
                      </li>
                    ))}
                 </ul>
              </div>
              <div className="p-8 rounded-[3rem] bg-alert/5 border border-alert/20 space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-alert flex items-center gap-2">
                    <AlertTriangle size={14} /> {t('sections.protective_stance')}
                 </h3>
                 <ul className="space-y-3">
                    {data?.avoid_today?.map((item, i) => (
                      <li key={i} className="text-sm font-medium text-foreground flex gap-3">
                         <span className="text-alert">•</span> {item}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>

        {/* --- INVESTMENT & STOCK MARKET --- */}
        <div className="p-10 rounded-[3rem] bg-surface/50 backdrop-blur-xl border border-border shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-highlight/10 flex items-center justify-center text-highlight">
                    <TrendingUp size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold">{t('sections.wealth_markets')}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{t('sections.financial_intelligence')}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="px-4 py-2 rounded-xl bg-foreground/5 border border-border">
                    <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">{t('wealth_detail.sentiment')}</p>
                    <p className="text-sm font-bold text-highlight">{data?.stock_market_pulse?.market_sentiment}</p>
                 </div>
                 <div className="px-4 py-2 rounded-xl bg-foreground/5 border border-border">
                    <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">{t('wealth_detail.suitable')}</p>
                    <p className="text-sm font-bold text-foreground">{data?.investment_guidance?.suitable_for_investing}</p>
                 </div>
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{t('wealth_detail.rationale')}</p>
                    <p className="text-lg font-light italic leading-relaxed text-foreground/90">{data?.investment_guidance?.rationale}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                       <p className="text-[9px] font-black uppercase tracking-widest text-highlight">{t('wealth_detail.favored')}</p>
                       <div className="flex flex-wrap gap-2">
                          {data?.investment_guidance?.sectors_favored?.map(s => (
                            <span key={s} className="px-3 py-1 rounded-lg bg-highlight/10 text-highlight text-[10px] font-bold">{s}</span>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-3">
                       <p className="text-[9px] font-black uppercase tracking-widest text-alert">{t('wealth_detail.avoid')}</p>
                       <div className="flex flex-wrap gap-2">
                          {data?.investment_guidance?.sectors_to_avoid?.map(s => (
                            <span key={s} className="px-3 py-1 rounded-lg bg-alert/10 text-alert text-[10px] font-bold">{s}</span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-surface border border-border space-y-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{t('wealth_detail.pulse')}</p>
                 <div className="space-y-4">
                    <p className="text-sm font-medium leading-relaxed">{data?.stock_market_pulse?.advice}</p>
                    <div className="pt-4 border-t border-border">
                       <p className="text-[8px] font-black uppercase tracking-widest text-foreground/40">{t('wealth_detail.driving_planet')}</p>
                       <p className="text-lg font-serif italic text-foreground">{data?.stock_market_pulse?.key_planet_driving_markets}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- REMEDIES & LUCK --- */}
        <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
           <div className="md:col-span-2 p-10 rounded-[3rem] bg-secondary/10 border border-secondary/20 shadow-xl space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                    <Zap size={24} />
                 </div>
                 <h2 className="text-2xl font-bold">{t('sections.planetary_remedies')}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    {[
                      { label: t('remedy_detail.morning_ritual'), val: data?.remedies?.morning_remedy, icon: <Sun size={14} /> },
                      { label: t('remedy_detail.gemstone'), val: data?.remedies?.gemstone_activation, icon: <Gem size={14} /> },
                      { label: t('remedy_detail.power_mantra'), val: data?.remedies?.mantra_for_today, icon: <Sparkles size={14} /> },
                    ].map((rem, i) => (
                      <div key={i} className="space-y-1">
                         <p className="text-[8px] font-black uppercase tracking-widest text-secondary flex items-center gap-1">
                            {rem.icon} {rem.label}
                         </p>
                         <p className="text-xs font-medium text-foreground">{rem.val}</p>
                      </div>
                    ))}
                 </div>
                 <div className="space-y-6">
                    {[
                      { label: t('remedy_detail.color'), val: data?.remedies?.color_to_wear, icon: <Activity size={14} /> },
                      { label: t('remedy_detail.food'), val: data?.remedies?.food_to_eat, icon: <Utensils size={14} /> },
                      { label: t('remedy_detail.evening'), val: data?.remedies?.evening_remedy, icon: <Moon size={14} /> },
                    ].map((rem, i) => (
                      <div key={i} className="space-y-1">
                         <p className="text-[8px] font-black uppercase tracking-widest text-secondary flex items-center gap-1">
                            {rem.icon} {rem.label}
                         </p>
                         <p className="text-xs font-medium text-foreground">{rem.val}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="p-10 rounded-[3rem] bg-surface border border-border shadow-2xl flex flex-col justify-between items-center text-center py-12">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40">{t('luck_detail.lucky_matrix')}</p>
              <div className="space-y-2">
                 <p className="text-6xl font-serif italic text-foreground">{data?.lucky_elements?.lucky_number}</p>
                 <p className="text-xs font-bold uppercase tracking-widest text-highlight">{data?.lucky_elements?.lucky_color}</p>
              </div>
              <div className="space-y-1 border-t border-border pt-6 w-full">
                 <p className="text-[8px] font-black uppercase tracking-widest text-foreground/40">{t('luck_detail.auspicious_window')}</p>
                 <p className="text-lg font-serif italic text-foreground">{data?.lucky_elements?.lucky_time}</p>
                 <p className="text-[10px] font-bold text-highlight">{data?.lucky_elements?.lucky_direction} {t('luck_detail.direction')}</p>
              </div>
           </div>
        </div>

        {/* --- MUHURTAS & PLANETARY HIGHLIGHTS --- */}
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
           <div className="p-10 rounded-[3rem] bg-surface/50 backdrop-blur-xl border border-border space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                 <Clock size={14} /> {t('sections.muhurtas')}
              </h3>
              <div className="space-y-4">
                 {data?.important_muhurtas?.auspicious_windows?.map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-highlight/5 border border-highlight/10">
                       <p className="text-xs font-bold text-foreground">{w?.split(' (')[0]}</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-highlight">{w?.split(' (')[1]?.replace(')', '')}</p>
                    </div>
                 ))}
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-alert/60">{t('muhurta_detail.rahu_kaal')}</p>
                       <p className="text-sm font-bold text-alert">{data?.important_muhurtas?.rahu_kaal}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-secondary/60">{t('muhurta_detail.gulika_kaal')}</p>
                       <p className="text-sm font-bold text-secondary">{data?.important_muhurtas?.gulika_kaal}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-10 rounded-[3rem] bg-surface/50 backdrop-blur-xl border border-border space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                 <Zap size={14} /> {t('sections.planetary_highlights')}
              </h3>
              <div className="space-y-6">
                 {data?.planetary_highlights?.map((p, i) => (
                    <div key={i} className="space-y-1">
                       <p className="text-xs font-bold text-foreground">{p?.planet} <span className="text-[10px] font-normal text-text-secondary ml-2">{t('actions.in')} {p?.position}</span></p>
                       <p className="text-xs text-text-secondary font-light leading-relaxed">{p?.effect_today}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* --- CLOSING WISDOM --- */}
        <div className="p-12 rounded-[4rem] bg-gradient-to-br from-primary/20 via-surface to-highlight/10 border border-primary/20 text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
           <div className="w-16 h-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
              <Zap size={28} />
           </div>
           <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-3xl font-serif italic tracking-tight text-foreground leading-snug">
                "{data?.closing_wisdom}"
              </p>
              <div className="pt-6">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">— {t('footer.engine')} —</p>
                 <p className="text-[8px] font-bold text-text-secondary mt-1">{t('footer.logic')}</p>
              </div>
           </div>
        </div>

        <div className="flex justify-center pt-8">
           <button 
             onClick={() => setSubmitted(false)}
             className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors flex items-center gap-2"
           >
             <Activity size={14} /> {t('actions.recalculate')}
           </button>
        </div>

      </div>
    </div>
  );
}


