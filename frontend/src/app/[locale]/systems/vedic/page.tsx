"use client";

import React from 'react';
import { Compass, Shield, Zap } from 'lucide-react';

export default function VedicSystemPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16">
        
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-serif italic text-foreground tracking-tight leading-[0.9]">
            The Vedic <br/> <span className="text-secondary">Standard.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-normal leading-relaxed">
            Discover the ancient logic and modern precision behind the AstroPinch Vedic System.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-text-secondary">
          <section className="space-y-4">
            <h2 className="text-3xl font-serif italic text-foreground border-b border-border pb-4">Sidereal Logic</h2>
            <p className="text-lg leading-relaxed">
              Vedic Astrology utilizes the Sidereal Zodiac (Nirayana), which is fixed to the background of the stars. Unlike Western Tropical astrology, which is based on seasons, the Vedic system remains accurate to the actual astronomical positions of the planets as they appear from Earth.
            </p>
          </section>

          <section className="grid md:grid-cols-3 gap-6 not-prose">
            <div className="p-6 rounded-3xl bg-surface border border-border space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary">Dashas</h4>
              <p className="text-xs text-text-secondary">Predictive time-lords that determine the major themes of your life periods.</p>
            </div>
            <div className="p-6 rounded-3xl bg-surface border border-border space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-secondary">Vargas</h4>
              <p className="text-xs text-text-secondary">Divisional charts (D-9, D-10) that reveal hidden details of marriage and career.</p>
            </div>
            <div className="p-6 rounded-3xl bg-surface border border-border space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-highlight">Yogas</h4>
              <p className="text-xs text-text-secondary">Specific planetary combinations that bestow unique life strengths or challenges.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-serif italic text-foreground border-b border-border pb-4">Our Methodology</h2>
            <p className="text-lg leading-relaxed">
              At AstroPinch, we synthesize Paraśara's foundational principles with modern algorithmic validation. Our system calculates Lahiri Ayanamsa by default, providing the most trusted baseline for Indian Vedic computations.
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}
