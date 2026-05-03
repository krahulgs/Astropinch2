"use client";

import React, { useState, useEffect } from 'react';
import NorthIndianChart from '@/components/NorthIndianChart';
import SouthIndianChart from '@/components/SouthIndianChart';
import { Heart, Home, CarFront, Briefcase, Baby, Sunrise as SunriseIcon, Sunset as SunsetIcon, Moon as MoonIcon, Sparkles } from 'lucide-react';

import CustomMuhuratIcon from '@/components/CustomMuhuratIcon';

export default function MuhuratPage() {
  const [activeType, setActiveType] = useState('Vivah');
  const [selectedMuhurat, setSelectedMuhurat] = useState<any>(null);
  const [chartStyle, setChartStyle] = useState('north');
  const [muhurats, setMuhurats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [panchang, setPanchang] = useState<any>(null);
  
  // Default to current month/year
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const activities = [
    { name: 'Vivah', desc: 'Auspicious dates for marriage ceremonies.' },
    { name: 'Griha Pravesh', desc: 'Best times to enter a new home.' },
    { name: 'Vehicle', desc: 'Fortunate moments to purchase a new vehicle.' },
    { name: 'Business', desc: 'Inauguration timings for commercial success.' },
    { name: 'Namkaran', desc: 'Baby naming ceremony auspicious windows.' }
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
        body: JSON.stringify({
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: now.getDate(),
          hour: now.getHours(),
          minute: now.getMinutes(),
          lat: 28.6139,
          lon: 77.2090
        })
      });
      const data = await res.json();
      setPanchang(data);
    } catch (err) {
      console.error("Failed to fetch panchang:", err);
    }
  };

  const fetchMuhurats = async (year: number, month: number, type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/muhurat/vivah?year=${year}&month=${month}&type=${type}`);
      const data = await res.json();
      setMuhurats(data);
    } catch (err) {
      console.error("Failed to fetch muhurats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen text-foreground">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
            <Sparkles size={12} /> Divine Timing Engine
          </div>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1] italic font-serif text-foreground mb-6">
            Master Your Timeline. <br className="hidden md:block" />
            <span className="text-text-secondary font-light text-4xl md:text-5xl">Command Your Success.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto font-light leading-relaxed">
            In Vedic astrology, doing the right thing at the wrong time is the recipe for failure. Our high-precision Muhurat Engine calculates the exact planetary windows when the cosmos is actively conspiring in your favor. Whether marrying, investing, or launching—choose your moment with absolute certainty.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap md:flex-nowrap justify-between gap-4 px-4">
          {activities.map((act) => {
            const isActive = activeType === act.name;
            const themeColors: any = {
              'Vivah': 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]',
              'Griha Pravesh': 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]',
              'Vehicle': 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]',
              'Business': 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
              'Namkaran': 'bg-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]'
            };
            
            return (
              <button
                key={act.name}
                onClick={() => setActiveType(act.name)}
                className={`relative pb-6 transition-all flex flex-col items-center gap-4 text-center group min-w-[120px] ${
                  isActive ? 'scale-110' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <div className="transition-transform duration-500 group-hover:scale-110">
                  <CustomMuhuratIcon type={act.name} active={isActive} />
                </div>
                
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] block transition-colors ${isActive ? 'text-foreground' : 'text-text-secondary'}`}>
                  {act.name}
                </span>

                {/* Underline Indicator */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 rounded-full transition-all duration-500 ${
                  isActive ? `w-12 ${themeColors[act.name]}` : 'w-0 bg-transparent'
                }`}></div>
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
             <div>
               <h3 className="text-3xl font-serif italic text-foreground">Upcoming {activeType} Muhurats</h3>
               <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mt-1">Refining by {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
             </div>
             
             <div className="flex gap-3">
               {/* Month Selector */}
               <select 
                 value={selectedMonth} 
                 onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                 className="h-12 px-4 rounded-full bg-surface border border-border text-[10px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-primary transition-all"
               >
                 {[...Array(12)].map((_, i) => {
                   const m = i + 1;
                   // Disable past months if current year is selected
                   const isDisabled = selectedYear === now.getFullYear() && m < (now.getMonth() + 1);
                   return <option key={m} value={m} disabled={isDisabled}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                 })}
               </select>

               {/* Year Selector */}
               <select 
                 value={selectedYear} 
                 onChange={(e) => {
                   const yr = parseInt(e.target.value);
                   setSelectedYear(yr);
                   // Reset month if it becomes invalid
                   if (yr === now.getFullYear() && selectedMonth < (now.getMonth() + 1)) {
                     setSelectedMonth(now.getMonth() + 1);
                   }
                 }}
                 className="h-12 px-4 rounded-full bg-surface border border-border text-[10px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-primary transition-all"
               >
                 <option value={2026}>2026</option>
                 <option value={2027}>2027</option>
               </select>

               {loading && <div className="w-12 h-12 flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
             </div>
           </div>

           <div className="grid gap-6">
             {muhurats.map((m, i) => (
               <div key={i} className="p-8 rounded-[2.5rem] bg-surface border border-border backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-secondary/30 transition-all shadow-lg">
                  <div className="flex items-center gap-8 flex-1">
                    <div className="text-center min-w-[100px] py-4 bg-foreground/5 rounded-[1.5rem] border border-border">
                      <p className="text-4xl font-serif italic text-foreground leading-none">{m.date.split('-')[2]}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mt-2">
                        {new Date(m.date).toLocaleString('default', { month: 'short' })} {m.date.split('-')[0]}
                      </p>
                    </div>
                    <div className="h-16 w-px bg-border hidden md:block"></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-highlight animate-pulse"></span>
                        <p className="text-2xl font-medium text-foreground/90">{m.start_time} — {m.end_time}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Nakshatra: <span className="text-foreground">{m.nakshatra}</span></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Tithi: <span className="text-foreground">{m.tithi}</span></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Karana: <span className="text-foreground">{m.karana}</span></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Yoga: <span className="text-foreground">{m.yoga}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-right hidden sm:block">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Status</p>
                       <p className="text-xl font-serif italic text-foreground">Shubha</p>
                     </div>
                     <button 
                       onClick={() => setSelectedMuhurat({...m, name: activeType})}
                       className="h-14 px-10 rounded-full bg-foreground text-background font-bold text-[10px] uppercase tracking-widest hover:bg-secondary transition-all shadow-xl"
                     >
                       Technical Analysis
                     </button>
                  </div>
               </div>
             ))}
             {!loading && muhurats.length === 0 && (
               <div className="p-20 text-center border border-dashed border-border rounded-[3rem] text-text-secondary italic font-light">
                 No major muhurat found in the immediate window. Consult an expert for custom analysis.
               </div>
             )}
           </div>
        </div>

        {/* Modal */}
        {selectedMuhurat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-surface border border-border rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
              
              {/* Header - Fixed */}
              <div className="p-8 border-b border-border flex justify-between items-center bg-surface/50 backdrop-blur-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">Technical Analysis</p>
                    <div className="flex bg-foreground/5 rounded-full p-1 border border-border">
                      <button 
                        onClick={() => setChartStyle('north')}
                        className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${chartStyle === 'north' ? 'bg-surface shadow-sm text-foreground' : 'text-text-secondary hover:text-foreground'}`}
                      >
                        North
                      </button>
                      <button 
                        onClick={() => setChartStyle('south')}
                        className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${chartStyle === 'south' ? 'bg-surface shadow-sm text-foreground' : 'text-text-secondary hover:text-foreground'}`}
                      >
                        South
                      </button>
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif italic text-foreground">{selectedMuhurat.name} Muhurat</h3>
                  <p className="text-xs text-text-secondary font-light">{selectedMuhurat.date} | {selectedMuhurat.start_time} - {selectedMuhurat.end_time}</p>
                </div>
                <button 
                  onClick={() => setSelectedMuhurat(null)}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-foreground transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Content - Scrollable 2-Column Grid */}
              <div className="overflow-y-auto p-8 custom-scrollbar">
                <div className="grid md:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Chart */}
                  <div className="md:col-span-5 space-y-6">
                    <div className="p-4 rounded-[2rem] bg-foreground/5 border border-border">
                      {chartStyle === 'north' ? (
                        <NorthIndianChart planets={selectedMuhurat.planets} ascendant={selectedMuhurat.ascendant} />
                      ) : (
                        <SouthIndianChart planets={selectedMuhurat.planets} ascendant={selectedMuhurat.ascendant} />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-surface border border-border text-center">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Nakshatra</p>
                        <p className="font-serif italic text-base text-foreground">{selectedMuhurat.nakshatra}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-surface border border-border text-center">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">Tithi</p>
                        <p className="font-serif italic text-base text-foreground">{selectedMuhurat.tithi}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Details */}
                  <div className="md:col-span-7 space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-surface border border-border">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1">Yoga</p>
                        <p className="text-sm text-foreground">{selectedMuhurat.yoga}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-surface border border-border">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1">Muhurat Quality</p>
                        <p className="text-sm text-highlight font-bold">Auspicious</p>
                      </div>
                    </div>

                    {selectedMuhurat.caution_notes && (
                      <div className="p-6 rounded-[1.8rem] bg-alert/5 border border-alert/10 space-y-3">
                         <h4 className="text-[10px] font-bold uppercase tracking-widest text-alert">Pre-Calculated Safety Checks</h4>
                         <ul className="text-xs text-text-secondary space-y-1 font-light list-disc pl-4">
                           {selectedMuhurat.caution_notes.map((note: string, idx: number) => (
                             <li key={idx}>{note}</li>
                           ))}
                         </ul>
                      </div>
                    )}

                    <div className="p-6 rounded-[1.8rem] bg-secondary/5 border border-secondary/10 space-y-3">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Astronomical Justification</h4>
                       <p className="text-xs text-text-secondary leading-relaxed font-light">{selectedMuhurat.reason}</p>
                    </div>

                    <div className="p-6 rounded-[1.8rem] bg-surface border border-border space-y-3">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Recommended Actions</h4>
                       <ul className="text-xs text-text-secondary space-y-2 font-light list-disc pl-4">
                         {(selectedMuhurat.recommendations || [
                           "Perform Ganesh Puja before commencing ceremonies.",
                           "Charity to local temples is highly recommended.",
                           "Seek guidance from an elder or expert."
                         ]).map((action: string, idx: number) => (
                           <li key={idx}>{action}</li>
                         ))}
                       </ul>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button className="flex-1 h-14 rounded-full bg-foreground text-background font-bold text-[10px] uppercase tracking-widest hover:bg-secondary transition-all shadow-xl">
                        Set Calendar Reminder
                      </button>
                      <button className="flex-1 h-14 rounded-full bg-surface border border-border text-foreground font-bold text-[10px] uppercase tracking-widest hover:bg-foreground/5 transition-all">
                        PDF Report
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* Today's Panchang Section */}
        {panchang && (
          <div className="space-y-8 pt-12 border-t border-border">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-serif italic text-foreground">Today&apos;s Celestial Summary</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Tithi', value: panchang.tithi?.name, icon: '🌘' },
                { label: 'Nakshatra', value: panchang.nakshatra?.name, icon: '✨' },
                { label: 'Yoga', value: panchang.yoga?.name, icon: '🧘' },
                { label: 'Karana', value: panchang.karana?.name, icon: '🐂' }
              ].map((item) => (
                <div key={item.label} className="p-6 rounded-[2rem] bg-surface/50 border border-border backdrop-blur-sm text-center space-y-2 hover:border-primary/30 transition-all">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1">{item.label}</p>
                    <p className="text-lg font-serif italic text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-8 rounded-[2.5rem] bg-surface/30 border border-border backdrop-blur-xl grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <SunriseIcon size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1">Sunrise</p>
                    <p className="text-sm font-medium text-foreground">05:42 AM</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <SunsetIcon size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1">Sunset</p>
                    <p className="text-sm font-medium text-foreground">06:51 PM</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <MoonIcon size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1">Moonrise</p>
                    <p className="text-sm font-medium text-foreground">09:15 PM</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500">
                    <MoonIcon size={20} strokeWidth={2.5} className="rotate-180" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-text-secondary mb-1">Moonset</p>
                    <p className="text-sm font-medium text-foreground">08:04 AM</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-alert/5 border border-alert/10 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-alert">Rahu Kaal</h4>
                  <p className="text-2xl font-serif italic text-foreground/90">01:30 PM — 03:00 PM</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-alert/20 text-alert text-[8px] font-bold uppercase tracking-widest">Inauspicious</span>
              </div>
            </div>
          </div>
        )}

        <div className="p-12 rounded-[3rem] bg-secondary/5 border border-secondary/10 backdrop-blur-sm text-center space-y-6">
           <h3 className="text-2xl font-serif italic text-foreground">Need a Custom Muhurat?</h3>
           <p className="text-text-secondary max-w-xl mx-auto font-light">Our expert astrologers can calculate the perfect Muhurat based on your specific birth chart for maximum success.</p>
           <button className="px-10 py-4 bg-secondary text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-foreground hover:text-background transition-all">
             Consult Expert Now
           </button>
        </div>
      </div>
    </main>
  );
}
