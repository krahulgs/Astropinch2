"use client";

import React from 'react';
import { Sun, Moon, Zap, Shield, Compass, Star } from 'lucide-react';

export default function PlanetaryEffectsPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-serif italic text-foreground tracking-tight leading-[0.9]">
            Planetary <br/> <span className="text-secondary">Dynamics.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-light leading-relaxed">
            Understand how the Navagrahas exert their influence through strength, aspects, and motion.
          </p>
        </div>

        <div className="space-y-16">
          
          {/* Section 1: Dignity */}
          <section className="p-10 rounded-[3rem] bg-surface border border-border space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary"><Star size={24} /></div>
               <h2 className="text-3xl font-serif italic text-foreground">Exaltation & Debilitation</h2>
            </div>
            <p className="text-text-secondary leading-relaxed font-light">
              Planets gain or lose strength based on the sign they occupy. <strong>Exaltation (Ucha)</strong> is when a planet is at its peak power, acting with maximum positivity. <strong>Debilitation (Neecha)</strong> is when a planet is weakened, often requiring remedial measures to harmonize its energy.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { p: "Sun", u: "Aries", n: "Libra" },
                 { p: "Moon", u: "Taurus", n: "Scorpio" },
                 { p: "Mars", u: "Capricorn", n: "Cancer" },
                 { p: "Jupiter", u: "Cancer", n: "Capricorn" }
               ].map((item, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-foreground/[0.02] border border-border/50 text-center">
                   <h5 className="text-[10px] font-black uppercase text-foreground mb-2">{item.p}</h5>
                   <div className="text-[8px] space-y-1">
                     <p className="text-secondary">Ucha: {item.u}</p>
                     <p className="text-alert">Neecha: {item.n}</p>
                   </div>
                 </div>
               ))}
            </div>
          </section>

          {/* Section 2: Aspects */}
          <section className="space-y-8">
            <h2 className="text-4xl font-serif italic text-foreground">Planetary Aspects (Drishti)</h2>
            <div className="prose prose-invert max-w-none text-text-secondary font-light">
              <p>In Vedic astrology, planets don't just affect the house they sit in—they 'look' at other houses too. All planets aspect the 7th house from their position. However, some have special aspects:</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { p: "Mars", a: "4th, 7th, 8th", c: "primary" },
                { p: "Jupiter", a: "5th, 7th, 9th", c: "secondary" },
                { p: "Saturn", a: "3rd, 7th, 10th", c: "highlight" }
              ].map((item, i) => (
                <div key={i} className={`p-8 rounded-[2.5rem] bg-surface border border-border space-y-4`}>
                  <h4 className="text-lg font-bold text-foreground">{item.p}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium tracking-widest uppercase">Aspects: {item.a}</p>
                  <p className="text-[10px] text-text-secondary leading-relaxed">These special aspects allow the planet to influence multiple areas of your life simultaneously.</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Retrograde */}
          <section className="p-12 rounded-[4rem] bg-foreground text-background relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-50" />
             <div className="relative z-10 space-y-6">
               <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white"><Zap size={24} /></div>
               <h2 className="text-3xl font-serif italic">The Mystery of Retrograde (Vakra)</h2>
               <p className="text-sm opacity-80 leading-relaxed font-light max-w-2xl">
                 When a planet appears to move backward, it is in 'Vakra' motion. In Vedic logic, a retrograde planet becomes exceptionally strong and carries deep karmic significance. It often indicates areas where you have 'unfinished business' from past lives.
               </p>
             </div>
          </section>

        </div>

      </div>
    </main>
  );
}
