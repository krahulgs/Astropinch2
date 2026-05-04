"use client";

import React from 'react';
import { BookOpen, Map, Sun, Moon } from 'lucide-react';

export default function LearnBasicsPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16">
        
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-serif italic text-foreground tracking-tight">
            Vedic Astrology <br/> <span className="text-primary">101.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-normal leading-relaxed">
            Your journey into the cosmic sciences starts here. Understand the foundational pillars of Jyotish.
          </p>
        </div>

        <div className="space-y-12">
          <section className="p-10 rounded-[3rem] bg-surface border border-border space-y-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Sun size={24} /></div>
               <h2 className="text-2xl font-bold text-foreground">What is Jyotish?</h2>
             </div>
             <p className="text-text-secondary leading-relaxed font-normal">
               Jyotish, often called "Vedic Astrology," translates to the "Science of Light." It is the study of how celestial light patterns reflect human life. Unlike Western astrology, Jyotish uses the <strong>Sidereal Zodiac</strong>, which accounts for the Earth's precession and matches the actual positions of stars in the sky.
             </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-surface border border-border space-y-4">
              <div className="text-3xl">🔭</div>
              <h3 className="text-xl font-bold text-foreground">The Lagna (Ascendant)</h3>
              <p className="text-sm text-text-secondary leading-relaxed">The sign rising on the eastern horizon at the exact moment of your birth. It represents your physical self and overall life path.</p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-surface border border-border space-y-4">
              <div className="text-3xl">🌙</div>
              <h3 className="text-xl font-bold text-foreground">The Rashi (Moon Sign)</h3>
              <p className="text-sm text-text-secondary leading-relaxed">The sign where the Moon resides. In Vedic astrology, the Moon Sign is often more important than the Sun Sign as it governs the mind and emotions.</p>
            </div>
          </section>

          <section className="p-10 rounded-[3rem] bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20 space-y-6">
             <h2 className="text-2xl font-bold text-foreground">Why Accuracy Matters</h2>
             <p className="text-text-secondary leading-relaxed font-normal">
               Vedic astrology is highly mathematical. A 4-minute error in birth time can shift your Lagna or change your Nakshatra padas. This is why AstroPinch uses NASA-grade algorithms to ensure your chart is calculated with the highest possible precision.
             </p>
          </section>

          {/* New Content: The 12 Houses */}
          <section className="space-y-8">
            <h2 className="text-4xl font-serif italic text-foreground">The 12 Bhavas (Houses)</h2>
            <div className="prose prose-invert max-w-none text-text-secondary font-normal">
              <p>Your birth chart is divided into 12 houses, each representing a specific department of your life. From the 1st house (Self & Physique) to the 12th house (Losses & Liberation), the placement of planets in these houses determines your karmic blueprint.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { h: "1st", t: "Self / Identity" },
                { h: "2nd", t: "Wealth / Family" },
                { h: "4th", t: "Home / Happiness" },
                { h: "5th", t: "Creativity / Kids" },
                { h: "7th", t: "Marriage / Partners" },
                { h: "9th", t: "Fortune / Dharma" },
                { h: "10th", t: "Career / Karma" },
                { h: "11th", t: "Gains / Goals" }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-surface border border-border text-center">
                  <span className="text-xs font-black text-primary block">{item.h} House</span>
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest">{item.t}</span>
                </div>
              ))}
            </div>
          </section>

          {/* New Content: The Navagrahas */}
          <section className="space-y-8">
            <h2 className="text-4xl font-serif italic text-foreground">The Navagrahas (9 Planets)</h2>
            <p className="text-text-secondary font-normal">In Vedic astrology, we study nine primary celestial bodies that influence our consciousness.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { n: "Sun (Surya)", d: "The Soul, authority, and father figure." },
                { n: "Moon (Chandra)", d: "The Mind, emotions, and mother." },
                { n: "Mars (Mangal)", d: "Energy, courage, and action." },
                { n: "Mercury (Budha)", d: "Intellect, speech, and commerce." },
                { n: "Jupiter (Guru)", d: "Wisdom, expansion, and children." },
                { n: "Venus (Shukra)", d: "Love, beauty, and luxury." },
                { n: "Saturn (Shani)", d: "Discipline, karma, and longevity." },
                { n: "Rahu & Ketu", d: "The shadow planets representing karmic desire and liberation." }
              ].map((p, i) => (
                <div key={i} className="p-6 rounded-3xl bg-surface border border-border hover:border-secondary transition-colors">
                  <h4 className="text-sm font-bold text-foreground mb-2">{p.n}</h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{p.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* New Content: Nakshatras */}
          <section className="p-10 rounded-[3rem] bg-foreground/[0.03] border border-border space-y-6">
            <h2 className="text-3xl font-serif italic text-foreground">The 27 Nakshatras</h2>
            <p className="text-text-secondary leading-relaxed font-normal">
              While there are 12 Zodiac signs, Vedic astrology goes deeper into the <strong>27 Lunar Mansions</strong> or Nakshatras. Each Nakshatra spans 13° 20' and has a specific deity, symbol, and power (Shakti). Your 'Birth Star' is the Nakshatra where the Moon was placed at your birth, and it defines your fundamental nature and instincts more accurately than your Sun sign.
            </p>
          </section>
        </div>

      </div>
    </main>
  );
}
