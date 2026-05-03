"use client";

import React from 'react';

export default function TermsPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen max-w-4xl mx-auto">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl font-serif italic text-foreground border-b border-border pb-6">
          Terms of Service
        </h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary leading-relaxed">
          <p className="text-lg font-medium text-foreground italic">
            Last updated: May 1, 2026
          </p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Use of Service</h2>
            <p>
              By using AstroPinch, you agree to provide accurate birth details. Our services are for informational and entertainment purposes only. Astrology should not be used as a substitute for professional legal, medical, or financial advice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Marketplace & Consultations</h2>
            <p>
              Consultations booked through our marketplace are provided by independent astrologers. AstroPinch provides the technology platform but is not responsible for the specific advice given during these sessions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. Intellectual Property</h2>
            <p>
              The AI-generated insights, chart visualizations, and AstroPinch branding are the intellectual property of AstroPinch. Users are granted a personal license to use these for their own non-commercial purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Limitation of Liability</h2>
            <p>
              AstroPinch is not liable for any decisions made based on the astrological insights provided by our platform or AI.
            </p>
          </section>Section: 
        </div>
      </div>
    </main>
  );
}
