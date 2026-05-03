"use client";

import React, { useState, useEffect } from 'react';
import NorthIndianChart from '@/components/NorthIndianChart';
import SouthIndianChart from '@/components/SouthIndianChart';
import { Heart, Home, CarFront, Briefcase, Baby, Sunrise as SunriseIcon, Sunset as SunsetIcon, Moon as MoonIcon, Sparkles, X } from 'lucide-react';
import CustomMuhuratIcon from '@/components/CustomMuhuratIcon';

export default function MuhuratPage() {
  const [activeType, setActiveType] = useState('Vivah');
  const [selectedMuhurat, setSelectedMuhurat] = useState<any>(null);
  const [chartStyle, setChartStyle] = useState('north');
  const [muhurats, setMuhurats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [panchang, setPanchang] = useState<any>(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const activities = [
    { name: 'Vivah',        desc: 'Auspicious dates for marriage ceremonies.' },
    { name: 'Griha Pravesh', desc: 'Best times to enter a new home.' },
    { name: 'Vehicle',      desc: 'Fortunate moments to purchase a new vehicle.' },
    { name: 'Business',     desc: 'Inauguration timings for commercial success.' },
    { name: 'Namkaran',     desc: 'Baby naming ceremony auspicious windows.' }
  ];

  useEffect(() => {
    fetchMuhurats(selectedYear, selectedMonth, activeType);
    fetchPanchang();
  }, [activeType, selectedMonth, selectedYear]);

  const fetchPanchang = async () => {
    try {
      const now = new Date();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/panchang`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), hour: now.getHours(), minute: now.getMinutes(), lat: 28.6139, lon: 77.2090 })
      });
      setPanchang(await res.json());
    } catch (err) { console.error("Failed to fetch panchang:", err); }
  };

  const fetchMuhurats = async (year: number, month: number, type: string) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/muhurat/vivah?year=${year}&month=${month}&type=${type}`);
      setMuhurats(await res.json());
    } catch (err) { console.error("Failed to fetch muhurats:", err); }
    finally { setLoading(false); }
  };

  return (
    <main className="relative pt-24 md:pt-32 pb-28 px-4 md:px-6 min-h-screen text-foreground">
      <div className="max-w-7xl mx-auto space-y-10 md:space-y-16">

        {/* ── Hero ── */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Sparkles size={12} /> Divine Timing Engine
          </div>
          <h1 className="text-3xl md:text-7xl font-medium tracking-tight leading-[1.1] italic font-serif text-foreground">
            Master Your Timeline.{' '}
            <span className="block text-xl md:text-5xl text-text-secondary font-light mt-1">Command Your Success.</span>
          </h1>
          <p className="text-sm md:text-xl text-text-secondary max-w-3xl mx-auto font-light leading-relaxed hidden md:block">
            In Vedic astrology, doing the right thing at the wrong time is the recipe for failure. Our high-precision Muhurat Engine calculates the exact planetary windows when the cosmos is actively conspiring in your favor.
          </p>
          {/* Short version for mobile */}
          <p className="text-xs text-text-secondary mx-auto font-light leading-relaxed md:hidden">
            Precision-calculated auspicious windows based on live planetary data.
          </p>
        </div>

        {/* ── Activity Categories — horizontal scroll on mobile ── */}
        <div className="flex gap-4 md:gap-0 md:justify-between overflow-x-auto no-scrollbar pb-2 px-1">
          {activities.map((act) => {
            const isActive = activeType === act.name;
            const themeColors: any = {
              'Vivah':         'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]',
              'Griha Pravesh': 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]',
              'Vehicle':       'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]',
              'Business':      'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
              'Namkaran':      'bg-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]',
            };
            return (
              <button
                key={act.name}
                onClick={() => setActiveType(act.name)}
                className={`relative pb-5 transition-all flex flex-col items-center gap-3 text-center group flex-shrink-0 w-[100px] md:w-auto ${
                  isActive ? 'scale-110' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div className="transition-transform duration-500 group-hover:scale-110">
                  <CustomMuhuratIcon type={act.name} active={isActive} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.15em] block transition-colors leading-tight ${isActive ? 'text-foreground' : 'text-text-secondary'}`}>
                  {act.name}
                </span>
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 rounded-full transition-all duration-500 ${
                  isActive ? `w-10 ${themeColors[act.name]}` : 'w-0 bg-transparent'
                }`} />
              </button>
            );
          })}
        </div>

        {/* ── Muhurat List ── */}
        <div className="space-y-6">
          {/* Header + Selectors */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif italic text-foreground">Upcoming {activeType} Muhurats</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mt-1">
                {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="h-10 px-3 rounded-full bg-surface border border-border text-[10px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-primary transition-all"
              >
                {[...Array(12)].map((_, i) => {
                  const m = i + 1;
                  const isDisabled = selectedYear === now.getFullYear() && m < (now.getMonth() + 1);
                  return <option key={m} value={m} disabled={isDisabled}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>;
                })}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => {
                  const yr = parseInt(e.target.value);
                  setSelectedYear(yr);
                  if (yr === now.getFullYear() && selectedMonth < (now.getMonth() + 1)) setSelectedMonth(now.getMonth() + 1);
                }}
                className="h-10 px-3 rounded-full bg-surface border border-border text-[10px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-primary transition-all"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
              {loading && <div className="w-8 h-8 flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-4">
            {muhurats.map((m, i) => (
              <div key={i} className="p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-surface border border-border backdrop-blur-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-8 group hover:border-secondary/30 transition-all shadow-lg">
                {/* Date + Time + Panchang */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Date badge */}
                  <div className="text-center min-w-[72px] py-3 px-2 bg-foreground/5 rounded-2xl border border-border flex-shrink-0">
                    <p className="text-3xl md:text-4xl font-serif italic text-foreground leading-none">{m.date.split('-')[2]}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary mt-1">
                      {new Date(m.date).toLocaleString('default', { month: 'short' })}
                    </p>
                  </div>

                  {/* Time + details */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-highlight animate-pulse flex-shrink-0" />
                      <p className="text-base md:text-2xl font-medium text-foreground/90 truncate">{m.start_time} — {m.end_time}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">
                        <span className="text-foreground">{m.nakshatra}</span> Nak
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">
                        <span className="text-foreground">{m.tithi}</span> Tithi
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary hidden sm:inline">
                        <span className="text-foreground">{m.yoga}</span> Yoga
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => setSelectedMuhurat({ ...m, name: activeType })}
                  className="w-full sm:w-auto h-10 md:h-14 px-6 md:px-10 rounded-full bg-foreground text-background font-bold text-[9px] uppercase tracking-widest hover:bg-secondary transition-all shadow-xl flex-shrink-0"
                >
                  Analysis
                </button>
              </div>
            ))}
            {!loading && muhurats.length === 0 && (
              <div className="p-12 md:p-20 text-center border border-dashed border-border rounded-[2rem] text-text-secondary italic font-light text-sm">
                No major muhurat found in this window. Consult an expert for custom analysis.
              </div>
            )}
          </div>
        </div>

        {/* ── Technical Analysis Modal (bottom sheet on mobile) ── */}
        {selectedMuhurat && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-surface border border-border rounded-t-[2rem] md:rounded-[2.5rem] w-full md:max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-8">

              {/* Modal Header */}
              <div className="p-4 md:p-8 border-b border-border flex justify-between items-start gap-3 bg-surface/50 backdrop-blur-xl flex-shrink-0">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">Technical Analysis</p>
                    <div className="flex bg-foreground/5 rounded-full p-1 border border-border">
                      {['north', 'south'].map(s => (
                        <button key={s} onClick={() => setChartStyle(s)}
                          className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${chartStyle === s ? 'bg-surface shadow-sm text-foreground' : 'text-text-secondary hover:text-foreground'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl md:text-3xl font-serif italic text-foreground">{selectedMuhurat.name} Muhurat</h3>
                  <p className="text-xs text-text-secondary font-light truncate">{selectedMuhurat.date} | {selectedMuhurat.start_time} - {selectedMuhurat.end_time}</p>
                </div>
                <button onClick={() => setSelectedMuhurat(null)}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-foreground transition-all flex-shrink-0">
                  <X size={15} />
                </button>
              </div>

              {/* Modal Body — single column on mobile, 2-col on md+ */}
              <div className="overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="grid md:grid-cols-12 gap-4 md:gap-8 items-start">

                  {/* Chart */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] bg-foreground/5 border border-border">
                      {chartStyle === 'north'
                        ? <NorthIndianChart planets={selectedMuhurat.planets} ascendant={selectedMuhurat.ascendant} />
                        : <SouthIndianChart planets={selectedMuhurat.planets} ascendant={selectedMuhurat.ascendant} />}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[['Nakshatra', selectedMuhurat.nakshatra], ['Tithi', selectedMuhurat.tithi]].map(([label, value]) => (
                        <div key={label} className="p-3 md:p-4 rounded-2xl bg-surface border border-border text-center">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">{label}</p>
                          <p className="font-serif italic text-sm md:text-base text-foreground mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 md:p-4 rounded-2xl bg-surface border border-border">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1">Yoga</p>
                        <p className="text-sm text-foreground">{selectedMuhurat.yoga}</p>
                      </div>
                      <div className="p-3 md:p-4 rounded-2xl bg-surface border border-border">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1">Quality</p>
                        <p className="text-sm text-highlight font-bold">Auspicious</p>
                      </div>
                    </div>

                    {selectedMuhurat.caution_notes && (
                      <div className="p-4 md:p-6 rounded-[1.5rem] bg-alert/5 border border-alert/10 space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-alert">Safety Checks</h4>
                        <ul className="text-xs text-text-secondary space-y-1 font-light list-disc pl-4">
                          {selectedMuhurat.caution_notes.map((note: string, idx: number) => <li key={idx}>{note}</li>)}
                        </ul>
                      </div>
                    )}

                    <div className="p-4 md:p-6 rounded-[1.5rem] bg-secondary/5 border border-secondary/10 space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Astronomical Justification</h4>
                      <p className="text-xs text-text-secondary leading-relaxed font-light">{selectedMuhurat.reason}</p>
                    </div>

                    <div className="p-4 md:p-6 rounded-[1.5rem] bg-surface border border-border space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Recommended Actions</h4>
                      <ul className="text-xs text-text-secondary space-y-1.5 font-light list-disc pl-4">
                        {(selectedMuhurat.recommendations || [
                          "Perform Ganesh Puja before commencing ceremonies.",
                          "Charity to local temples is highly recommended.",
                          "Seek guidance from an elder or expert."
                        ]).map((action: string, idx: number) => <li key={idx}>{action}</li>)}
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button className="flex-1 h-11 md:h-14 rounded-full bg-foreground text-background font-bold text-[9px] uppercase tracking-widest hover:bg-secondary transition-all shadow-xl">
                        Set Reminder
                      </button>
                      <button className="flex-1 h-11 md:h-14 rounded-full bg-surface border border-border text-foreground font-bold text-[9px] uppercase tracking-widest hover:bg-foreground/5 transition-all">
                        PDF Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Today's Panchang ── */}
        {panchang && (
          <div className="space-y-6 pt-8 border-t border-border">
            <div className="text-center space-y-1">
              <h3 className="text-2xl md:text-3xl font-serif italic text-foreground">Today&apos;s Celestial Summary</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Panchang grid — 2×2 on mobile, 4 across on md */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'Tithi',     value: panchang.tithi?.name,     icon: '🌘' },
                { label: 'Nakshatra', value: panchang.nakshatra?.name, icon: '✨' },
                { label: 'Yoga',      value: panchang.yoga?.name,      icon: '🧘' },
                { label: 'Karana',    value: panchang.karana?.name,    icon: '🐂' }
              ].map((item) => (
                <div key={item.label} className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-surface/50 border border-border backdrop-blur-sm text-center space-y-2 hover:border-primary/30 transition-all">
                  <div className="text-xl md:text-2xl">{item.icon}</div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-0.5">{item.label}</p>
                    <p className="text-base font-serif italic text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Sun/Moon times */}
              <div className="p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-surface/30 border border-border backdrop-blur-xl grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
                {[
                  { label: 'Sunrise',  time: '05:42 AM', icon: <SunriseIcon size={18} strokeWidth={2.5} />, color: 'text-amber-500',  bg: 'bg-amber-500/10' },
                  { label: 'Sunset',   time: '06:51 PM', icon: <SunsetIcon size={18} strokeWidth={2.5} />,  color: 'text-orange-500', bg: 'bg-orange-500/10' },
                  { label: 'Moonrise', time: '09:15 PM', icon: <MoonIcon size={18} strokeWidth={2.5} />,    color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                  { label: 'Moonset',  time: '08:04 AM', icon: <MoonIcon size={18} strokeWidth={2.5} className="rotate-180" />, color: 'text-slate-400', bg: 'bg-slate-500/10' },
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>{item.icon}</div>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-0.5">{item.label}</p>
                      <p className="text-xs font-medium text-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rahu Kaal */}
              <div className="p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-alert/5 border border-alert/10 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-alert">Rahu Kaal</h4>
                  <p className="text-xl md:text-2xl font-serif italic text-foreground/90 mt-1">01:30 PM — 03:00 PM</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-alert/20 text-alert text-[8px] font-bold uppercase tracking-widest flex-shrink-0">Inauspicious</span>
              </div>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-secondary/5 border border-secondary/10 backdrop-blur-sm text-center space-y-4 md:space-y-6">
          <h3 className="text-xl md:text-2xl font-serif italic text-foreground">Need a Custom Muhurat?</h3>
          <p className="text-sm text-text-secondary max-w-xl mx-auto font-light">
            Our expert astrologers can calculate the perfect Muhurat based on your specific birth chart for maximum success.
          </p>
          <button className="px-8 md:px-10 py-3.5 md:py-4 bg-secondary text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-foreground hover:text-background transition-all">
            Consult Expert Now
          </button>
        </div>

      </div>
    </main>
  );
}
