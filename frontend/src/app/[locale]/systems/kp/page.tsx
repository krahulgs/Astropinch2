"use client";

import React from 'react';
import { Compass, Zap, Target, BookOpen } from 'lucide-react';

export default function KPSystemPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-serif italic text-foreground tracking-tight leading-[0.9]">
            The KP <br/> <span className="text-highlight">System.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-light leading-relaxed">
            The Krishnamurti Padhdhati (KP) System — where mathematical precision meets the science of Sub-Lords.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-text-secondary">
          <section className="space-y-4">
            <h2 className="text-3xl font-serif italic text-foreground border-b border-border pb-4">Precision Beyond Houses</h2>
            <p className="text-lg leading-relaxed">
              Founded by late Prof. K.S. Krishnamurti, the KP system is one of the most accurate predictive branches of Vedic astrology. It shifts the focus from the 'Sign' and 'House' to the <strong>'Star' (Nakshatra)</strong> and the <strong>'Sub-Lord'</strong>. This allows for pinpoint accuracy in timing events.
            </p>
          </section>

          {/* KP Pillars */}
          <div className="grid md:grid-cols-2 gap-8 not-prose">
            <div className="p-8 rounded-[2.5rem] bg-surface border border-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-highlight/10 flex items-center justify-center text-highlight"><Zap size={24} /></div>
              <h3 className="text-xl font-bold text-foreground">Sub-Lord Theory</h3>
              <p className="text-sm text-text-secondary leading-relaxed">The KP system divides each Nakshatra into nine 'Sub-divisions' based on the Vimshottari Dasha, allowing for microscopic analysis of planetary results.</p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-surface border border-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Target size={24} /></div>
              <h3 className="text-xl font-bold text-foreground">Placidus House System</h3>
              <p className="text-sm text-text-secondary leading-relaxed">Unlike the Whole Sign system, KP utilizes the Placidus system to define house cusps, ensuring the most accurate house-level predictions.</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-3xl font-serif italic text-foreground border-b border-border pb-4">AstroPinch & KP</h2>
            <p className="text-lg leading-relaxed">
              Our computation engine supports full KP analysis, including Ruling Planets (RP) and Cusp Interlinks. Whether you are analyzing a query through Horary (Prashna) or birth details, our KP logic provides the binary 'Yes/No' clarity you need.
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}
