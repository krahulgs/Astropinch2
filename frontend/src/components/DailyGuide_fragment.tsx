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
                 {data?.user_name}&apos;s Daily Guide
               </h2>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                 <Calendar className="w-3 h-3" /> Personalized Astrology
               </p>
             </div>
             <div className="relative group">
               <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative flex items-center gap-6 p-4 rounded-[2rem] bg-surface/50 border border-border backdrop-blur-md shadow-2xl">
                 <div className="text-right space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Day Energy Status</p>
                   <p className={`text-2xl md:text-3xl font-serif italic leading-none ${data?.day_score && data?.day_score > 7 ? 'text-highlight' : data?.day_score && data?.day_score > 4 ? 'text-secondary' : 'text-alert'}`}>
                     {data?.day_energy}
                   </p>
                 </div>
                 <div className="flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-foreground text-background shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                   <div className="text-center">
                     <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-0.5">Score</p>
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
           <div className="md:col-span-8 p-10 rounded-[3rem] bg-surface/50 backdrop-blur-xl border border-border shadow-xl space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Coffee size={24} />
                 </div>
                 <h2 className="text-2xl font-bold text-foreground">The Morning Dispatch</h2>
              </div>
              <p className="text-xl font-light text-foreground/90 leading-relaxed italic border-l-2 border-primary pl-6 py-2">
                 "{data?.day_summary}"
              </p>
           </div>
           <div className="md:col-span-4 p-8 rounded-[3rem] bg-primary text-white shadow-2xl shadow-primary/30 flex flex-col justify-center items-center text-center space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">Morning Mantra</p>
              <p className="text-lg font-medium leading-relaxed">{data?.morning_mantra}</p>
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
                    <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">Professional Guidance</h2>
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
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Verdict Reasoning</p>
                    <p className="text-sm font-medium text-foreground">{data?.profession_guidance?.decision_reasoning}</p>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="flex items-center gap-6 p-6 rounded-3xl bg-highlight/10 border border-highlight/20">
                    <Clock className="text-highlight" size={32} />
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-highlight/60">Best Execution Window</p>
                       <p className="text-2xl font-serif italic text-foreground">{data?.profession_guidance?.best_time_to_work}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6 p-6 rounded-3xl bg-alert/10 border border-alert/20">
                    <AlertTriangle className="text-alert" size={32} />
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-alert/60">Critical Avoidance Window</p>
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
                    <h2 className="text-2xl font-bold">Risk Map</h2>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Overall Risk</p>
                    <p className={`text-xl font-serif italic ${data?.risk_assessment?.overall_risk_level === 'Low' ? 'text-highlight' : 'text-alert'}`}>{data?.risk_assessment?.overall_risk_level}</p>
                 </div>
              </div>
              
              <div className="space-y-6">
                 {[
                   { label: 'Financial', risk: data?.risk_assessment?.financial_risk, detail: data?.risk_assessment?.financial_risk_detail, icon: <TrendingUp size={16} /> },
                   { label: 'Health', risk: data?.risk_assessment?.health_risk, detail: data?.risk_assessment?.health_risk_detail, icon: <Activity size={16} /> },
                   { label: 'Relationships', risk: data?.risk_assessment?.relationship_risk, detail: data?.risk_assessment?.relationship_risk_detail, icon: <Heart size={16} /> },
                   { label: 'Travel', risk: data?.risk_assessment?.travel_risk, detail: data?.risk_assessment?.travel_risk_detail, icon: <Compass size={16} /> },
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
                    <CheckCircle size={14} /> Strategic Actions (Do)
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
                    <AlertTriangle size={14} /> Protective Stance (Avoid)
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
                    <h2 className="text-2xl font-bold">Wealth & Markets</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Financial Intelligence</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="px-4 py-2 rounded-xl bg-foreground/5 border border-border">
                    <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Sentiment</p>
                    <p className="text-sm font-bold text-highlight">{data?.stock_market_pulse?.market_sentiment}</p>
                 </div>
                 <div className="px-4 py-2 rounded-xl bg-foreground/5 border border-border">
                    <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Suitable for Investing</p>
                    <p className="text-sm font-bold text-foreground">{data?.investment_guidance?.suitable_for_investing}</p>
                 </div>
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Investment Rationale</p>
                    <p className="text-lg font-light italic leading-relaxed text-foreground/90">{data?.investment_guidance?.rationale}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                       <p className="text-[9px] font-black uppercase tracking-widest text-highlight">Favored Sectors</p>
                       <div className="flex flex-wrap gap-2">
                          {data?.investment_guidance?.sectors_favored?.map(s => (
                            <span key={s} className="px-3 py-1 rounded-lg bg-highlight/10 text-highlight text-[10px] font-bold">{s}</span>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-3">
                       <p className="text-[9px] font-black uppercase tracking-widest text-alert">Avoid Sectors</p>
                       <div className="flex flex-wrap gap-2">
                          {data?.investment_guidance?.sectors_to_avoid?.map(s => (
                            <span key={s} className="px-3 py-1 rounded-lg bg-alert/10 text-alert text-[10px] font-bold">{s}</span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-surface border border-border space-y-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Market Pulse</p>
                 <div className="space-y-4">
                    <p className="text-sm font-medium leading-relaxed">{data?.stock_market_pulse?.advice}</p>
                    <div className="pt-4 border-t border-border">
                       <p className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Driving Planet</p>
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
                 <h2 className="text-2xl font-bold">Planetary Alignment Remedies</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    {[
                      { label: 'Morning Ritual', val: data?.remedies?.morning_remedy, icon: <Sun size={14} /> },
                      { label: 'Gemstone Sync', val: data?.remedies?.gemstone_activation, icon: <Gem size={14} /> },
                      { label: 'Power Mantra', val: data?.remedies?.mantra_for_today, icon: <Sparkles size={14} /> },
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
                      { label: 'Vibrational Color', val: data?.remedies?.color_to_wear, icon: <Activity size={14} /> },
                      { label: 'Energy Food', val: data?.remedies?.food_to_eat, icon: <Utensils size={14} /> },
                      { label: 'Evening Calm', val: data?.remedies?.evening_remedy, icon: <Moon size={14} /> },
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
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40">Lucky Matrix</p>
              <div className="space-y-2">
                 <p className="text-6xl font-serif italic text-foreground">{data?.lucky_elements?.lucky_number}</p>
                 <p className="text-xs font-bold uppercase tracking-widest text-highlight">{data?.lucky_elements?.lucky_color}</p>
              </div>
              <div className="space-y-1 border-t border-border pt-6 w-full">
                 <p className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Auspicious Window</p>
                 <p className="text-lg font-serif italic text-foreground">{data?.lucky_elements?.lucky_time}</p>
                 <p className="text-[10px] font-bold text-highlight">{data?.lucky_elements?.lucky_direction} Direction</p>
              </div>
           </div>
        </div>

        {/* --- MUHURTAS & PLANETARY HIGHLIGHTS --- */}
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
           <div className="p-10 rounded-[3rem] bg-surface/50 backdrop-blur-xl border border-border space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                 <Clock size={14} /> Critical Muhurtas
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
                       <p className="text-[8px] font-black uppercase tracking-widest text-alert/60">Rahu Kaal</p>
                       <p className="text-sm font-bold text-alert">{data?.important_muhurtas?.rahu_kaal}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-secondary/60">Gulika Kaal</p>
                       <p className="text-sm font-bold text-secondary">{data?.important_muhurtas?.gulika_kaal}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-10 rounded-[3rem] bg-surface/50 backdrop-blur-xl border border-border space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                 <Zap size={14} /> Planetary Highlights
              </h3>
              <div className="space-y-6">
                 {data?.planetary_highlights?.map((p, i) => (
                    <div key={i} className="space-y-1">
                       <p className="text-xs font-bold text-foreground">{p?.planet} <span className="text-[10px] font-normal text-text-secondary ml-2">in {p?.position}</span></p>
                       <p className="text-xs text-text-secondary font-light leading-relaxed">{p?.effect_today}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* --- CLOSING WISDOM --- */}
        <div className="p-12 rounded-[4rem] bg-gradient-to-br from-primary/20 via-surface to-highlight/10 border border-primary/20 text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
           <div className="w-16 h-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
              <Sparkles size={28} />
           </div>
           <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-3xl font-serif italic tracking-tight text-foreground leading-snug">
                "{data?.closing_wisdom}"
              </p>
              <div className="pt-6">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">— ASTROPINCH ENGINE —</p>
                 <p className="text-[8px] font-bold text-text-secondary mt-1">NASA Ephemeris v4.2 · Sidereal Jyotish Logic</p>
              </div>
           </div>
        </div>

        <div className="flex justify-center pt-8">
           <button 
             onClick={() => setSubmitted(false)}
             className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors flex items-center gap-2"
           >
             <Activity size={14} /> Recalculate with New Profile
           </button>
        </div>

      </div>
    </div>
  );
}


