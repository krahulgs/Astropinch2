'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Heart, Stars, User, Loader2, Sparkles, Gem, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import CityInput from '@/components/CityInput';
import AnimatedZodiacBackground from '@/components/AnimatedZodiacBackground';
import { PROFESSION_CATEGORIES } from '@/constants/professions';
import { useActiveProfile, parseProfile } from '@/hooks/useActiveProfile';

const EMPTY_PARTNER = {
  name: '', day: '', month: '', year: '', hour: '', minute: '',
  place: '', lat: 0, lon: 0, profession: '', gender: '', mbti: 'NOT_SURE', love_language: 'Quality Time'
};

export default function UnifiedMatchingPage() {
  const t = useTranslations('Matching');
  const router = useRouter();
  const { profiles, parsedActive, activeProfileId, selectProfile, isLoggedIn, loading: profileLoading } = useActiveProfile();

  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchMode, setMatchMode] = useState<'vedic' | 'soulbound' | 'lovers'>((searchParams.get('mode') as any) || 'soulbound');
  const [matchContext, setMatchContext] = useState<'marriage' | 'relationship'>((searchParams.get('context') as any) || 'relationship');

  // p1 = logged-in user's profile (or manual); p2 = always manual (the match partner)
  const [p2, setP2] = useState({ ...EMPTY_PARTNER, love_language: 'Words of Affirmation' });

  // NOTE: P2 is intentionally NOT persisted to localStorage — partner details must be entered fresh each time.
  useEffect(() => {
    // Clear any stale partner data from previous sessions
    localStorage.removeItem('unified_match_p2');
  }, []);

  useEffect(() => {
    const qMode = searchParams.get('mode');
    const qCtx  = searchParams.get('context');
    if (qMode) setMatchMode(qMode as any);
    if (qCtx)  setMatchContext(qCtx as any);
  }, [searchParams]);

  // Manual forms for both partners
  const [p1, setP1] = useState({ ...EMPTY_PARTNER, love_language: 'Quality Time' });
  useEffect(() => {
    const savedP1 = localStorage.getItem('unified_match_p1');
    if (savedP1) setP1(JSON.parse(savedP1));
  }, []);
  useEffect(() => { localStorage.setItem('unified_match_p1', JSON.stringify(p1)); }, [p1]);

  const completeProfiles = profiles.map(parseProfile).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1.lat || !p2.lat) {
      setError(t('errors.places'));
      return;
    }
    setLoading(true);

    const groomProfile = p1;
    const brideProfile = p2;

    const query = new URLSearchParams({
      g_name: groomProfile.name, g_day: groomProfile.day, g_month: groomProfile.month, g_year: groomProfile.year,
      g_hour: groomProfile.hour, g_minute: groomProfile.minute, g_lat: groomProfile.lat.toString(), g_lon: groomProfile.lon.toString(),
      g_prof: groomProfile.profession, g_gender: matchContext === 'marriage' ? 'Male' : ((groomProfile as any).gender || 'Male'), g_mbti: (groomProfile as any).mbti || 'NOT_SURE', g_love: (groomProfile as any).love_language || 'Quality Time',
      
      b_name: brideProfile.name, b_day: brideProfile.day, b_month: brideProfile.month, b_year: brideProfile.year,
      b_hour: brideProfile.hour, b_minute: brideProfile.minute, b_lat: brideProfile.lat.toString(), b_lon: brideProfile.lon.toString(),
      b_prof: brideProfile.profession, b_gender: matchContext === 'marriage' ? 'Female' : ((brideProfile as any).gender || 'Female'), b_mbti: brideProfile.mbti, b_love: brideProfile.love_language,
      
      context: matchContext
    }).toString();

    setTimeout(() => {
      if (matchMode === 'soulbound') router.push(`/matching/soulbound?${query}`);
      else if (matchMode === 'lovers') router.push(`/matching/lovers?${query}`);
      else router.push(`/matching/result?${query}`);
    }, 1500);
  };

  // ── Partner forms ─────────────────────────────────────────  // ── Partner 2 form: always manual ─────────────────────────────────────────
  const renderPartnerForm = (data: any, setData: any, label: string, allowedGender?: string) => {
    const allowedProfiles = (completeProfiles || []).filter(p => p && (!allowedGender || p.gender === allowedGender));

    return (
    <div className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-surface/50 backdrop-blur-xl border border-border space-y-4 shadow-2xl animate-in fade-in zoom-in duration-700">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-primary">
          <User size={20} />
        </div>
        <div>
          <h3 className="text-lg font-serif italic text-foreground leading-none">{label}</h3>
          <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary mt-1 block">{t('labels.signature')}</span>
        </div>
      </div>

      {isLoggedIn && allowedProfiles.length > 0 && (
        <div className="space-y-1 mb-4">
          <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('labels.switch_profile') || 'Autofill from Profile'}</label>
          <div className="relative">
            <select
              className="w-full h-10 pl-5 pr-10 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary focus:border-primary focus:bg-transparent outline-none transition-all appearance-none cursor-pointer"
              onChange={(e) => {
                if (!e.target.value) return;
                const id = parseInt(e.target.value);
                const prof = allowedProfiles.find(p => p && p.id === id);
                if (prof) {
                  setData({
                    ...data,
                    name: prof.name,
                    day: prof.day, month: prof.month, year: prof.year,
                    hour: prof.hour, minute: prof.minute,
                    place: prof.place, lat: prof.lat, lon: prof.lon,
                    profession: prof.profession, gender: prof.gender || ''
                  });
                }
              }}
            >
              <option value="">-- Select Profile --</option>
              {allowedProfiles.map(p => (
                <option key={p.id} value={p.id} className="bg-background text-foreground">{p.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('labels.full_name')}</label>
          <input required type="text" placeholder={t('labels.full_name')} className="w-full h-10 px-5 rounded-xl bg-foreground/5 border border-transparent text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
        </div>

        <div className="space-y-1">
          <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('labels.birth_date')}</label>
          <div className="grid grid-cols-3 gap-2">
            <input required type="number" placeholder="DD" className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={data.day} onChange={e => setData({ ...data, day: e.target.value })} />
            <input required type="number" placeholder="MM" className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={data.month} onChange={e => setData({ ...data, month: e.target.value })} />
            <input required type="number" placeholder="YYYY" className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={data.year} onChange={e => setData({ ...data, year: e.target.value })} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('labels.birth_time')}</label>
          <div className="grid grid-cols-2 gap-2">
            <input required type="number" placeholder="HH" className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={data.hour} onChange={e => setData({ ...data, hour: e.target.value })} />
            <input required type="number" placeholder="MM" className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent text-center text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={data.minute} onChange={e => setData({ ...data, minute: e.target.value })} />
          </div>
        </div>

        <div className="space-y-1">
          <CityInput
            label={t('labels.birth_place')}
            value={data.place}
            onChange={(place, lat, lon) => setData({ ...data, place, lat, lon })}
          />
        </div>

        {matchContext !== 'marriage' && (
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">GENDER</label>
            <div className="grid grid-cols-2 gap-2">
              {['Male', 'Female'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setData({ ...data, gender: g })}
                  className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                    data.gender === g
                      ? 'bg-primary text-white border-primary shadow-lg'
                      : 'bg-foreground/5 border-transparent text-text-secondary hover:border-primary/30'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {matchMode !== 'vedic' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('labels.profession')}</label>
              <select
                required
                className="w-full h-10 rounded-xl bg-foreground/5 border border-transparent px-5 text-[10px] text-foreground focus:border-primary focus:bg-transparent outline-none transition-all appearance-none cursor-pointer"
                value={data.profession}
                onChange={e => setData({ ...data, profession: e.target.value })}
              >
                <option value="" className="bg-background">{t('labels.select_profession')}</option>
                {Object.entries(PROFESSION_CATEGORIES).map(([category, professions]) => (
                  <optgroup key={category} label={category} className="bg-background text-primary font-bold">
                    {professions.map(p => (
                      <option key={p} value={p} className="bg-background text-foreground">{p}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('labels.mbti')}</label>
                <select className="w-full h-10 px-4 rounded-xl bg-foreground/5 border border-transparent text-[10px] text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={data.mbti} onChange={e => setData({ ...data, mbti: e.target.value })}>
                  {[
                    ['NOT_SURE', t('labels.not_sure')],
                    ['INFJ', t('labels.mbti_types.INFJ')],
                    ['INFP', t('labels.mbti_types.INFP')],
                    ['INTJ', t('labels.mbti_types.INTJ')],
                    ['INTP', t('labels.mbti_types.INTP')],
                    ['ISFJ', t('labels.mbti_types.ISFJ')],
                    ['ISFP', t('labels.mbti_types.ISFP')],
                    ['ISTJ', t('labels.mbti_types.ISTJ')],
                    ['ISTP', t('labels.mbti_types.ISTP')],
                    ['ENFJ', t('labels.mbti_types.ENFJ')],
                    ['ENFP', t('labels.mbti_types.ENFP')],
                    ['ENTJ', t('labels.mbti_types.ENTJ')],
                    ['ENTP', t('labels.mbti_types.ENTP')],
                    ['ESFJ', t('labels.mbti_types.ESFJ')],
                    ['ESFP', t('labels.mbti_types.ESFP')],
                    ['ESTJ', t('labels.mbti_types.ESTJ')],
                    ['ESTP', t('labels.mbti_types.ESTP')]
                  ].map(([t_key, label]) => (
                    <option key={t_key} value={t_key}>{t_key === 'NOT_SURE' ? label : `${t_key} - ${label}`}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('labels.love_lang')}</label>
                <select className="w-full h-10 px-4 rounded-xl bg-foreground/5 border border-transparent text-[10px] text-foreground focus:border-primary focus:bg-transparent outline-none transition-all" value={data.love_language} onChange={e => setData({ ...data, love_language: e.target.value })}>
                  {['Quality Time', 'Words of Affirmation', 'Acts of Service', 'Physical Touch', 'Receiving Gifts'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    );
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-foreground overflow-hidden relative selection:bg-primary/30 transition-all duration-700"
      style={{
        '--primary': matchContext === 'relationship' ? '#ec4899' : '#6B4EAC',
        '--primary-rgb': matchContext === 'relationship' ? '236, 72, 153' : '107, 78, 172'
      } as React.CSSProperties}
    >
      <AnimatedZodiacBackground />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 z-0" />

      <main className="relative z-10 pt-24 md:pt-32 pb-24 md:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-primary text-white border border-primary/20 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-3 md:mb-4 shadow-[0_0_25px_rgba(var(--primary-rgb),0.4)] animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Sparkles size={12} className="fill-current animate-pulse" /> {t('badge')}
            </div>
            <h1 className="text-3xl md:text-7xl font-serif italic tracking-tight leading-[0.9]">
              {matchMode === 'soulbound' ? t('modes.soulbound') : matchMode === 'lovers' ? t('modes.lovers') : t('modes.vedic')}
              <span className="block text-xl md:text-5xl mt-2 not-italic font-sans font-black uppercase tracking-tighter opacity-20">{t('portal')}</span>
            </h1>

            {isLoggedIn && parsedActive && (
              <p className="text-xs text-primary/80 font-bold uppercase tracking-widest animate-in fade-in duration-700">
                ✦ {t('signed_in', { name: parsedActive.name })}
              </p>
            )}

            <div className="flex flex-col items-center gap-4 md:gap-6 pt-4 md:pt-8 w-full">
              {!isLoggedIn && (
                <>
                  {/* Context Selector */}
                  <div className="flex bg-foreground/5 p-1 rounded-2xl border border-border backdrop-blur-xl w-full max-w-xs">
                    <button
                      onClick={() => setMatchContext('relationship')}
                      className={`flex-1 px-3 md:px-8 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${matchContext === 'relationship' ? 'bg-surface shadow-xl text-primary' : 'text-text-secondary hover:text-foreground'}`}
                    >
                      <Heart size={12} /> {t('contexts.relationship')}
                    </button>
                    <button
                      onClick={() => { setMatchContext('marriage'); setMatchMode('vedic'); }}
                      className={`flex-1 px-3 md:px-8 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${matchContext === 'marriage' ? 'bg-surface shadow-xl text-secondary' : 'text-text-secondary hover:text-foreground'}`}
                    >
                      <Gem size={12} /> {t('contexts.marriage')}
                    </button>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button" onClick={() => setMatchMode('vedic')}
                      className={`px-4 md:px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${matchMode === 'vedic' ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-surface border-border text-text-secondary'}`}
                    >
                      {t('modes.vedic')}
                    </button>
                    {matchContext !== 'marriage' && (
                      <>
                        <button
                          type="button" onClick={() => setMatchMode('soulbound')}
                          className={`px-4 md:px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${matchMode === 'soulbound' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-secondary'}`}
                        >
                          {t('modes.soulbound')}
                        </button>
                        <button
                          type="button" onClick={() => setMatchMode('lovers')}
                          className={`px-4 md:px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${matchMode === 'lovers' ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'bg-surface border-border text-text-secondary'}`}
                        >
                          {t('modes.lovers')}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="grid md:grid-cols-2 gap-5 md:gap-8 relative">
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-surface border border-border items-center justify-center z-20 shadow-2xl animate-pulse">
                {matchContext === 'marriage' ? <Gem size={24} className="text-secondary" /> : <Heart size={24} className="text-primary fill-primary/20" />}
              </div>

              {renderPartnerForm(p1, setP1, matchContext === 'marriage' ? t('labels.groom') : t('labels.p1'), matchContext === 'marriage' ? 'Male' : undefined)}
              {renderPartnerForm(p2, setP2, matchContext === 'marriage' ? t('labels.bride') : t('labels.p2'), matchContext === 'marriage' ? 'Female' : undefined)}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-alert/5 border border-alert/20 text-alert text-[10px] font-bold uppercase tracking-widest text-center animate-in fade-in scale-95">
                {error}
              </div>
            )}

            <button
              disabled={loading} type="submit"
              className={`w-full h-12 md:h-16 rounded-3xl font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-[11px] hover:scale-[0.98] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 md:gap-4 disabled:opacity-50 ${matchMode === 'lovers' ? 'bg-pink-500 text-white shadow-pink-500/30' : matchMode === 'soulbound' ? 'bg-primary text-white shadow-primary/30' : 'bg-secondary text-white shadow-secondary/30'}`}
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> {t('buttons.loading')}</>
              ) : (
                matchMode === 'lovers' ? t('buttons.lovers') : matchMode === 'soulbound' ? t('buttons.soulbound') : t('buttons.vedic')
              )}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-6 md:pt-12">
            {[
              { icon: <Sparkles />, title: t('features.psychological'), desc: t('features.psychological_desc') },
              { icon: <Stars />, title: t('features.vedic'), desc: t('features.vedic_desc') },
              { icon: <Heart />, title: t('features.karmic'), desc: t('features.karmic_desc') }
            ].map((f, i) => (
              <div key={i} className="p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-surface/50 border border-border text-center space-y-2 md:space-y-3 hover:bg-surface transition-all shadow-sm">
                <div className="text-primary flex justify-center">{f.icon}</div>
                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{f.title}</h4>
                <p className="text-[10px] md:text-[11px] text-text-secondary font-normal">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
