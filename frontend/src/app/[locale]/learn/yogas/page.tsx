"use client";

import React from 'react';
import { Sparkles, Clock, Zap, Crown, Gem, Shield } from 'lucide-react';

export default function YogasDashaPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-serif italic text-foreground tracking-tight leading-[0.9]">
            Yogas & <br/> <span className="text-primary">The Dasha.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-light leading-relaxed">
            The blueprint of your destiny and the precise timing of its unfolding.
          </p>
        </div>

        {/* Section 1: Yogas */}
        <div className="space-y-12">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Crown size={24} /></div>
            <h2 className="text-4xl font-serif italic text-foreground">Planetary Yogas</h2>
          </div>
          <p className="text-text-secondary leading-relaxed font-light">
            In Vedic astrology, a 'Yoga' is a specific planetary combination that yields a particular result. Your chart might contain hundreds of Yogas, some promising wealth, others spiritual growth or professional authority.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 rounded-[3rem] bg-surface border border-border space-y-4">
              <div className="flex items-center gap-3">
                <Gem className="text-secondary" size={20} />
                <h3 className="text-xl font-bold text-foreground">Raja Yogas</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">Combinations of the lords of Kendras (1,4,7,10) and Trikonas (1,5,9). These bring status, success, and leadership.</p>
            </div>
            <div className="p-10 rounded-[3rem] bg-surface border border-border space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="text-highlight" size={20} />
                <h3 className="text-xl font-bold text-foreground">Dhana Yogas</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">Specific alignments between the 2nd (wealth) and 11th (gains) houses that indicate financial prosperity.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Dasha */}
        <div className="space-y-12">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary"><Clock size={24} /></div>
            <h2 className="text-4xl font-serif italic text-foreground">The Time-Lords (Dasha)</h2>
          </div>
          <div className="prose prose-invert max-w-none text-text-secondary font-light space-y-6">
            <p className="text-lg">If the birth chart is the 'Map', the Dasha system is the 'Clock'. It tells us <strong>when</strong> a particular promise in your chart will manifest.</p>
            <p>AstroPinch utilizes the 120-year <strong>Vimshottari Dasha</strong> system, which is the most widely trusted method for timing life events in Vedic astrology.</p>
          </div>
          
          {/* Dasha Layers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-8 rounded-[2.5rem] bg-foreground/[0.03] border border-border text-center space-y-2">
              <h4 className="text-xs font-black uppercase text-primary tracking-widest">Mahadasha</h4>
              <p className="text-[10px] text-text-secondary">Major period (6 to 20 years) setting the primary theme of your life.</p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-foreground/[0.03] border border-border text-center space-y-2">
              <h4 className="text-xs font-black uppercase text-secondary tracking-widest">Antardasha</h4>
              <p className="text-[10px] text-text-secondary">Sub-period (months to 3 years) that triggers specific events.</p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-foreground/[0.03] border border-border text-center space-y-2">
              <h4 className="text-xs font-black uppercase text-highlight tracking-widest">Pratyantardasha</h4>
              <p className="text-[10px] text-text-secondary">Micro-period (days to weeks) for fine-grained daily guidance.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-12 rounded-[4rem] bg-surface border border-border text-center space-y-8">
           <h3 className="text-3xl font-serif italic text-foreground">Identify Your Active Dasha</h3>
           <p className="text-sm text-text-secondary max-w-md mx-auto font-light">Understand which planetary time-lord is currently governing your life and how to align with its energy.</p>
           <button className="px-12 h-14 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
             View My Timeline
           </button>
        </div>

      </div>
    </main>
  );
}
