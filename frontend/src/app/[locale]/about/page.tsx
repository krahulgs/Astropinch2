"use client";

import React from 'react';
import { Compass, Stars, Zap, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <Stars size={12} /> The AstroPinch Standard
          </div>
          <h1 className="text-6xl md:text-8xl font-serif italic text-foreground tracking-tight leading-[0.9]">
            Ancient Wisdom. <br className="hidden md:block" />
            <span className="text-text-secondary font-normal text-5xl md:text-7xl">NASA-Grade Precision.</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto font-normal leading-relaxed mt-6">
            We were tired of generic horoscopes that told 1/12th of humanity they were going to "meet someone special today." So we built the world's most advanced Vedic calculation engine to give you absolute, mathematical clarity on your destiny.
          </p>
        </div>

        {/* Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-10 rounded-[3rem] bg-surface border border-border space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Compass size={24} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">The 0.001° Standard</h3>
            <p className="text-text-secondary leading-relaxed font-normal">
              While most platforms use approximate formulas, AstroPinch utilizes the Swiss Ephemeris (NASA JPL standard) to calculate planetary positions with 0.001-degree precision.
            </p>
          </div>
          
          <div className="p-10 rounded-[3rem] bg-surface border border-border space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Zap size={24} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">AI That Reads Charts</h3>
            <p className="text-text-secondary leading-relaxed font-normal">
              We don't just show you signs. Our proprietary AI synthesizes complex planetary aspects, Nakshatra transits, and Dasha periods to provide human-like guidance.
            </p>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary leading-relaxed">
          <h2 className="text-4xl font-serif italic text-foreground">Our Story</h2>
          <p>
            Founded by a team of Vedic scholars and data scientists, AstroPinch was born from a simple realization: the digital age of astrology had become generic. We saw a world of 12-sign horoscopes that ignored the deep, mathematical complexity of true Jyotish.
          </p>
          <p>
            We spent three years building the <strong>AstrologyEngine</strong> — a multi-layered calculation system that respects every micro-rule of Vedic logic while leveraging the speed and scalability of modern cloud computing.
          </p>
          <p>
            Today, AstroPinch serves as the "Cosmic Dashboard" for thousands of professionals, entrepreneurs, and seekers who require accuracy over ambiguity.
          </p>
        </div>

      </div>
    </main>
  );
}
