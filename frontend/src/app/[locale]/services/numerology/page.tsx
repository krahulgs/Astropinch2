"use client";

import React from 'react';
import { Hash, Sparkles, User, Target } from 'lucide-react';

export default function NumerologyPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-serif italic text-foreground tracking-tight">
            The Geometry of <br/> <span className="text-secondary">Numbers.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-normal leading-relaxed">
            Unlock the hidden vibration of your name and birth date through the ancient Pythagorean and Chaldean systems.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-text-secondary">
          <section className="space-y-4">
            <h2 className="text-3xl font-serif italic text-foreground border-b border-border pb-4">Vibrational Science</h2>
            <p className="text-lg leading-relaxed">
              Numerology is the belief in a divine or mystical relationship between a number and one or more coinciding events. At AstroPinch, we synthesize these numeric vibrations with your astrological chart to provide a holistic blueprint of your destiny.
            </p>
          </section>

          {/* Numerology Pillars */}
          <div className="grid md:grid-cols-2 gap-8 not-prose">
            <div className="p-8 rounded-[2.5rem] bg-surface border border-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary"><User size={24} /></div>
              <h3 className="text-xl font-bold text-foreground">Life Path Number</h3>
              <p className="text-sm text-text-secondary leading-relaxed">Derived from your full birth date, this number reveals your core identity and the challenges you will face.</p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-surface border border-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-highlight/10 flex items-center justify-center text-highlight"><Target size={24} /></div>
              <h3 className="text-xl font-bold text-foreground">Destiny (Expression) Number</h3>
              <p className="text-sm text-text-secondary leading-relaxed">Calculated from your full name at birth, this reveals your natural talents and potential achievements.</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-3xl font-serif italic text-foreground border-b border-border pb-4">Why Numerology?</h2>
            <p className="text-lg leading-relaxed">
              While astrology provides the roadmap, numerology provides the vehicle. Understanding your numeric compatibility helps in choosing the right business name, house number, or even significant life dates.
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}
