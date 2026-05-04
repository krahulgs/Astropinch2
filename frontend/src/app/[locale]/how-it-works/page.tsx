"use client";

import React from 'react';
import { Compass, Database, Cpu, MessageSquare, ArrowRight, BookOpen } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl md:text-8xl font-serif italic text-foreground tracking-tight leading-[0.9]">
            The Science <br/> <span className="text-primary">of Certainty.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-normal leading-relaxed">
            AstroPinch replaces generic horoscopes with a multi-layered calculation engine that blends ancient Vedic manuscripts with modern data science.
          </p>
        </div>

        {/* The Four Pillars */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Layer 1: Precision */}
          <div className="relative group p-8 rounded-[2.5rem] bg-surface border border-border space-y-6 overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Database size={80} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative z-10">
              <Compass size={24} />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-bold text-foreground">1. NASA-Grade Precision</h3>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                We use the Swiss Ephemeris (NASA JPL standard) to calculate planetary positions down to 0.001 degrees.
              </p>
            </div>
          </div>

          {/* Layer 2: Vedic Logic */}
          <div className="relative group p-8 rounded-[2.5rem] bg-surface border border-border space-y-6 overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Compass size={80} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary relative z-10">
              <Database size={24} />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-bold text-foreground">2. Ancient Vedic Logic</h3>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Proprietary implementation of Brihat Parashara Hora Shastra rules, handling Dashas, Varga Charts, and Ashtakavarga.
              </p>
            </div>
          </div>

          {/* Layer 3: Astro-SLM */}
          <div className="relative group p-8 rounded-[2.5rem] bg-surface border border-border space-y-6 overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen size={80} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-highlight/10 flex items-center justify-center text-highlight relative z-10">
              <BookOpen size={24} />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-bold text-foreground">3. Proprietary Astro-SLM</h3>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Small Language Model fine-tuned on 10,000+ pages of Bhrigu Samhita and Phaladeepika for symbolic Jyotish understanding.
              </p>
            </div>
          </div>

          {/* Layer 4: AI Synthesis */}
          <div className="relative group p-8 rounded-[2.5rem] bg-surface border border-border space-y-6 overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu size={80} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative z-10">
              <Cpu size={24} />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-bold text-foreground">4. AI-Driven Synthesis</h3>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Our synthesis layer translates scripture and math into actionable "Cosmic Mentorship" for your modern life.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Workflow */}
        <div className="space-y-12">
          <h2 className="text-4xl font-serif italic text-foreground text-center">The AstroPinch Journey</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Birth Detail Input", desc: "Submit your precise date, time, and city of birth." },
              { step: "02", title: "Coordinate Mapping", desc: "Our engine maps your birth location to NASA ephemeris data." },
              { step: "03", title: "Logic Processing", desc: "The AI audits your chart for 500+ Yogas and Dasha themes." },
              { step: "04", title: "Insight Delivery", desc: "Receive your personalized dashboard within 30 seconds." }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl bg-foreground/[0.02] border border-border/50 space-y-4">
                <span className="text-xs font-black text-primary tracking-widest">{item.step}</span>
                <h4 className="text-lg font-bold text-foreground">{item.title}</h4>
                <p className="text-[10px] text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-16 rounded-[4rem] bg-foreground text-background text-center space-y-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-30" />
          <h2 className="text-4xl md:text-6xl font-serif italic relative z-10">Ready to start your <br/> precision journey?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button className="h-16 px-10 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-primary/40">
              Generate Free Kundali
            </button>
            <button className="h-16 px-10 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20">
              Learn More
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
