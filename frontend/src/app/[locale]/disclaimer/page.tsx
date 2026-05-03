"use client";

import React from 'react';

export default function DisclaimerPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen max-w-4xl mx-auto">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl font-serif italic text-foreground border-b border-border pb-6">
          Legal Disclaimer
        </h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary leading-relaxed">
          <p className="text-lg font-medium text-foreground italic">
            Astrology is a science of probability, not certainty.
          </p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Informational Purposes Only</h2>
            <p>
              The insights, predictions, and guidance provided by AstroPinch (including AI-generated content and astrologer consultations) are intended for informational and personal growth purposes only. They do not constitute professional, legal, medical, or financial advice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Accuracy & Reliability</h2>
            <p>
              While we use NASA-grade ephemeris data (Swiss Ephemeris) for planetary calculations, the interpretation of this data is subject to various schools of thought in Vedic astrology. We make no guarantees regarding the absolute accuracy or outcome of any prediction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. User Responsibility</h2>
            <p>
              Any action taken based on the astrological guidance provided by AstroPinch is the sole responsibility of the user. AstroPinch is not liable for any personal, professional, or financial decisions made by the user.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. No Substitutions</h2>
            <p>
              Astrological guidance should never replace the advice of a qualified professional in the relevant field (e.g., a doctor for health, an attorney for legal matters, or a certified financial planner for wealth).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
