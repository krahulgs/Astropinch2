"use client";

import React from 'react';
import { Shield, AlertTriangle, Heart, Flame } from 'lucide-react';

export default function MangalDoshaPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-serif italic text-foreground tracking-tight">
            Understanding <br/> <span className="text-alert">Mangal Dosha.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-light leading-relaxed">
            The definitive guide to Kuja Dosha, its impact on marital harmony, and the science of Vedic cancellations (Parihara).
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-text-secondary">
          <section className="space-y-4">
            <h2 className="text-3xl font-serif italic text-foreground border-b border-border pb-4">What is Mangal Dosha?</h2>
            <p className="text-lg leading-relaxed">
              Mangal Dosha, also known as Kuja Dosha or Bhom Dosha, occurs when Mars (Mangal) is placed in the 1st, 4th, 7th, 8th, or 12th house from the Ascendant (Lagna) or the Moon. In Vedic astrology, Mars is the planet of fire, energy, and war. When positioned in these specific houses, its intense energy can create friction in domestic and marital life.
            </p>
          </section>

          {/* Impact Grid */}
          <div className="grid md:grid-cols-2 gap-8 not-prose">
            <div className="p-8 rounded-[2.5rem] bg-surface border border-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-alert/10 flex items-center justify-center text-alert"><Flame size={24} /></div>
              <h3 className="text-xl font-bold text-foreground">Temperamental Intensity</h3>
              <p className="text-sm text-text-secondary leading-relaxed">Mars in the 1st or 7th house can lead to strong opinions and assertive behavior, requiring conscious efforts toward patience.</p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-surface border border-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Shield size={24} /></div>
              <h3 className="text-xl font-bold text-foreground">The Parihara (Cancellations)</h3>
              <p className="text-sm text-text-secondary leading-relaxed">Not all Mangalik placements are harmful. Our engine identifies 24 specific cancellations based on sign placement and aspects.</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-3xl font-serif italic text-foreground border-b border-border pb-4">AstroPinch Precision</h2>
            <p className="text-lg leading-relaxed">
              Most generic calculators simply check the house. AstroPinch goes deeper, analyzing the strength of Mars, its Nakshatra lordship, and the presence of neutralizing aspects from Jupiter or Saturn. This ensures you aren't living with a "false positive" diagnosis.
            </p>
          </section>

          <div className="p-10 rounded-[3rem] bg-gradient-to-br from-alert/10 to-transparent border border-alert/20 text-center space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Verify Your Dosha Status</h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto">Get a technical audit of your Mars placement using NASA-grade planetary coordinates.</p>
            <button className="px-10 h-14 rounded-full bg-alert text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-alert/20">
              Generate Free Audit
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
