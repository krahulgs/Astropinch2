"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('Legal');

  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen max-w-4xl mx-auto">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl font-serif italic text-foreground border-b border-border pb-6">
          Privacy Policy
        </h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary leading-relaxed">
          <p className="text-lg font-medium text-foreground italic">
            Last updated: May 1, 2026
          </p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
            <p>
              At AstroPinch, we collect your birth details (date, time, and location) solely for the purpose of generating accurate Vedic astrological charts and AI-driven insights. This data is processed securely and is never sold to third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. AI & Data Processing</h2>
            <p>
              Your birth data is used to calculate planetary positions via the Swiss Ephemeris. These technical data points are then processed by our AI services to provide personalized guidance. We do not use your personal information to train global AI models.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. Security</h2>
            <p>
              We implement industry-standard encryption to protect your account and birth data. Your saved profiles are protected by secure authentication protocols.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Your Rights</h2>
            <p>
              You have the right to access, modify, or delete your birth data and saved profiles at any time through your dashboard settings.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
