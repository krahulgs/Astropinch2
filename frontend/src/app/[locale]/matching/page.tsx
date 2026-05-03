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
  place: '', lat: 0, lon: 0, profession: '', mbti: 'NOT_SURE', love_language: 'Quality Time'
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

  useEffect(() => {
    const savedP2 = localStorage.getItem('unified_match_p2');
    if (savedP2) setP2(JSON.parse(savedP2));
  }, []);

  useEffect(() => {
    const qMode = searchParams.get('mode');
    const qCtx = searchParams.get('context');
    if (qMode) setMatchMode(qMode as any);
    if (qCtx) setMatchContext(qCtx as any);
  }, [searchParams]);

  useEffect(() => { localStorage.setItem('unified_match_p2', JSON.stringify(p2)); }, [p2]);

  // Derive p1 from profile when logged in, or use manual form
  const [p1Manual, setP1Manual] = useState({ ...EMPTY_PARTNER });
  useEffect(() => {
    const savedP1 = localStorage.getItem('unified_match_p1');
    if (savedP1 && !isLoggedIn) setP1Manual(JSON.parse(savedP1));
  }, [isLoggedIn]);
  useEffect(() => { if (!isLoggedIn) localStorage.setItem('unified_match_p1', JSON.stringify(p1Manual)); }, [p1Manual, isLoggedIn]);

  const p1 = isLoggedIn && parsedActive
    ? {
        name: parsedActive.name,
        day: parsedActive.day,
        month: parsedActive.month,
        year: parsedActive.year,
        hour: parsedActive.hour,
        minute: parsedActive.minute,
        place: parsedActive.place,
        lat: parsedActive.lat,
        lon: parsedActive.lon,
        profession: parsedActive.profession,
        mbti: 'NOT_SURE',
        love_language: 'Quality Time',
      }
    : p1Manual;

  const completeProfiles = profiles.map(parseProfile).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1.lat || !p2.lat) {
      setError(t('errors.places'));
      return;
    }
    setLoading(true);

    const query = new URLSearchParams({
      // p1 is Groom in marriage context, p2 is Bride
      g_name: p1.name, g_day: p1.day, g_month: p1.month, g_year: p1.year,
      g_hour: p1.hour, g_minute: p1.minute, g_lat: p1.lat.toString(), g_lon: p1.lon.toString(),
      g_prof: p1.profession, g_mbti: (p1 as any).mbti || 'NOT_SURE', g_love: (p1 as any).love_language || 'Quality Time',
      
      b_name: p2.name, b_day: p2.day, b_month: p2.month, b_year: p2.year,
      b_hour: p2.hour, b_minute: p2.minute, b_lat: p2.lat.toString(), b_lon: p2.lon.toString(),
      b_prof: p2.profession, b_mbti: p2.mbti, b_love: p2.love_language,
      
      context: matchContext
    }).toString();

    setTimeout(() => {
      if (matchMode === 'soulbound') router.push(`/matching/soulbound?${query}`);
      else if (matchMode === 'lovers') router.push(`/matching/lovers?${query}`);
      else router.push(`/matching/result?${query}`);
    }, 1500);
  };

  // ── Person 1 card: logged-in profile selector ─────────────────────────────
  const renderP1Card = () => {
    const label = matchContext === 'marriage' ? t('labels.groom') : t('labels.p1');

    if (isLoggedIn && completeProfiles.length > 0) {
      return (
        <div className="p-6 rounded-[2rem] bg-surface/50 backdrop-blur-xl border border-primary/30 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-700 relative overflow-hidden">
          {/* "You" badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-white text-[8px] font-black uppercase tracking-widest">
              <CheckCircle2 size={10} /> {t('labels.your_profile')}
            </span>
          </div>

          <div className="flex items-center gap-4 border-b border-border pb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              {parsedActive?.profile_image ? (
                <img src={parsedActive.profile_image} alt={parsedActive.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-serif italic text-foreground leading-none">{label}</h3>
              <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary mt-1 block">{t('labels.auto_filled')}</span>
            </div>
          </div>

          {/* Profile Switcher */}
          {completeProfiles.length > 1 && (
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{t('labels.switch_profile')}</label>
              <div className="relative">
                <select
                  value={activeProfileId ?? ''}
                  onChange={(e) => selectProfile(parseInt(e.target.value))}
                  className="w-full h-10 pl-5 pr-10 rounded-xl bg-foreground/5 border border-transparent text-xs text-foreground focus:border-primary focus:bg-transparent outline-none transition-all appearance-none cursor-pointer"
                >
                  {completeProfiles.map((p) => p && (
                    <option key={p.id} value={p.id} className="bg-background">
                      {p.name}{p.role === 'master' ? ' (Master)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              </div>
            </div>
          )}

          {/* Profile detail pills */}
          {parsedActive && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: t('labels.full_name'), value: parsedActive.name },
                { label: t('labels.birth_date'), value: `${parsedActive.day}/${parsedActive.month}/${parsedActive.year}` },
                { label: t('labels.birth_time'), value: `${parsedActive.hour}:${parsedActive.minute}` },
                { label: t('labels.birth_place'), value: parsedActive.place || 'N/A' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-foreground/5 border border-border space-y-0.5">
                  <p className="text-[7px] font-black uppercase tracking-widest text-text-secondary">{item.label}</p>
                  <p className="text-[10px] font-medium text-foreground truncate">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Guest fallback
    return renderPartnerForm(p1Manual, setP1Manual, label);
  };

  // ── Partner 2 form: always manual ─────────────────────────────────────────
  const renderPartnerForm = (data: any, setData: any, label: string) => (
    <div className="p-6 rounded-[2rem] bg-surface/50 backdrop-blur-xl border border-border space-y-4 shadow-2xl animate-in fade-in zoom-in duration-700">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-primary">
          <User size={20} />
        </div>
        <div>
          <h3 className="text-lg font-serif italic text-foreground leading-none">{label}</h3>
          <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary mt-1 block">{t('labels.signature')}</span>
        </div>
      </div>

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

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-white border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-[0_0_25px_rgba(var(--primary-rgb),0.4)] animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Sparkles size={14} className="fill-current animate-pulse" /> {t('badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight leading-[0.9]">
              {matchMode === 'soulbound' ? t('modes.soulbound') : matchMode === 'lovers' ? t('modes.lovers') : t('modes.vedic')}
              <span className="block text-3xl md:text-5xl mt-2 not-italic font-sans font-black uppercase tracking-tighter opacity-20">{t('portal')}</span>
            </h1>

            {isLoggedIn && parsedActive && (
              <p className="text-xs text-primary/80 font-bold uppercase tracking-widest animate-in fade-in duration-700">
                ✦ {t('signed_in', { name: parsedActive.name })}
              </p>
            )}

            <div className="flex flex-col items-center gap-6 pt-8">
              {!isLoggedIn && (
                <>
                  {/* Context Selector */}
                  <div className="flex bg-foreground/5 p-1 rounded-2xl border border-border backdrop-blur-xl">
                    <button
                      onClick={() => setMatchContext('relationship')}
                      className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${matchContext === 'relationship' ? 'bg-surface shadow-xl text-primary' : 'text-text-secondary hover:text-foreground'}`}
                    >
                      <Heart size={14} /> {t('contexts.relationship')}
                    </button>
                    <button
                      onClick={() => { setMatchContext('marriage'); setMatchMode('vedic'); }}
                      className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${matchContext === 'marriage' ? 'bg-surface shadow-xl text-secondary' : 'text-text-secondary hover:text-foreground'}`}
                    >
                      <Gem size={14} /> {t('contexts.marriage')}
                    </button>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex justify-center gap-3">
                    <button
                      type="button" onClick={() => setMatchMode('vedic')}
                      className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${matchMode === 'vedic' ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-surface border-border text-text-secondary'}`}
                    >
                      {t('modes.vedic')}
                    </button>
                    {matchContext !== 'marriage' && (
                      <>
                        <button
                          type="button" onClick={() => setMatchMode('soulbound')}
                          className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${matchMode === 'soulbound' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-secondary'}`}
                        >
                          {t('modes.soulbound')}
                        </button>
                        <button
                          type="button" onClick={() => setMatchMode('lovers')}
                          className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${matchMode === 'lovers' ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'bg-surface border-border text-text-secondary'}`}
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

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8 relative">
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-surface border border-border items-center justify-center z-20 shadow-2xl animate-pulse">
                {matchContext === 'marriage' ? <Gem size={24} className="text-secondary" /> : <Heart size={24} className="text-primary fill-primary/20" />}
              </div>

              {renderP1Card()}
              {renderPartnerForm(p2, setP2, matchContext === 'marriage' ? t('labels.bride') : t('labels.p2'))}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-alert/5 border border-alert/20 text-alert text-[10px] font-bold uppercase tracking-widest text-center animate-in fade-in scale-95">
                {error}
              </div>
            )}

            <button
              disabled={loading} type="submit"
              className={`w-full h-16 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:scale-[0.98] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 ${matchMode === 'lovers' ? 'bg-pink-500 text-white shadow-pink-500/30' : matchMode === 'soulbound' ? 'bg-primary text-white shadow-primary/30' : 'bg-secondary text-white shadow-secondary/30'}`}
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> {t('buttons.loading')}</>
              ) : (
                matchMode === 'lovers' ? t('buttons.lovers') : matchMode === 'soulbound' ? t('buttons.soulbound') : t('buttons.vedic')
              )}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
              { icon: <Sparkles />, title: t('features.psychological'), desc: t('features.psychological_desc') },
              { icon: <Stars />, title: t('features.vedic'), desc: t('features.vedic_desc') },
              { icon: <Heart />, title: t('features.karmic'), desc: t('features.karmic_desc') }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-surface/50 border border-border text-center space-y-3 hover:bg-surface transition-all shadow-sm">
                <div className="text-primary flex justify-center">{f.icon}</div>
                <h4 className="text-[10px] font-black uppercase tracking-widest">{f.title}</h4>
                <p className="text-[11px] text-text-secondary font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
