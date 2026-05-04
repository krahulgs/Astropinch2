"use client";

import React from 'react';
import { Target, Briefcase, TrendingUp, Zap } from 'lucide-react';

export default function CareerAstrologyPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-serif italic text-foreground tracking-tight">
            The Astrology <br/> <span className="text-primary">of Career.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-normal leading-relaxed">
            Navigate your professional journey using the D-10 Dashamansha chart and the precision of Vedic timing.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-text-secondary">
          <section className="space-y-4">
            <h2 className="text-3xl font-serif italic text-foreground border-b border-border pb-4">The 10th House: Karma Sthana</h2>
            <p className="text-lg leading-relaxed">
              In Jyotish, the 10th house is the seat of power, reputation, and career. However, a true professional analysis goes beyond the 10th house. We analyze the <strong>Amatyakarka</strong> (planet with the second highest degree) and the 11th house of gains to understand your true vocation.
            </p>
          </section>

          {/* Core Insights */}
          <div className="grid md:grid-cols-3 gap-6 not-prose">
            <div className="p-6 rounded-3xl bg-surface border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Target size={20} /></div>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">D-10 Chart</h4>
              <p className="text-[10px] text-text-secondary leading-relaxed">The divisional chart that specifically reveals the fruit of your professional actions.</p>
            </div>
            <div className="p-6 rounded-3xl bg-surface border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><TrendingUp size={20} /></div>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">Dasha Timing</h4>
              <p className="text-[10px] text-text-secondary leading-relaxed">Identifying the precise Mahadasha to switch careers or expect a promotion.</p>
            </div>
            <div className="p-6 rounded-3xl bg-surface border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-highlight/10 flex items-center justify-center text-highlight"><Zap size={20} /></div>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">Wealth Yogas</h4>
              <p className="text-[10px] text-text-secondary leading-relaxed">Detecting Dhana Yogas that indicate financial success through your profession.</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-3xl font-serif italic text-foreground border-b border-border pb-4">Strategic Professional Planning</h2>
            <p className="text-lg leading-relaxed">
              Why guess when you can calculate? AstroPinch helps you understand whether you are better suited for entrepreneurship or corporate leadership based on the strength of the Sun (Authority) and Mercury (Commerce).
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}
