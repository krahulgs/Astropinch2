"use client";

import React from 'react';

export default function RefundPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen max-w-4xl mx-auto">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl font-serif italic text-foreground border-b border-border pb-6">
          Refund Policy
        </h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary leading-relaxed">
          <p className="text-lg font-medium text-foreground italic">
            Fairness and transparency in every transaction.
          </p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Marketplace Consultations</h2>
            <p>
              Refunds for live consultations are generally not provided once the session has commenced. If a technical issue occurs on our end or the astrologer fails to join, a full refund or session credit will be issued.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Premium PDF Reports</h2>
            <p>
              Due to the digital and personalized nature of our premium PDF reports (e.g., Year Books), all sales are final once the report has been generated and delivered to your dashboard.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. Processing Time</h2>
            <p>
              Eligible refunds are processed within 5-7 business days and will be credited back to your original payment method (Stripe/Razorpay).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Contact Us</h2>
            <p>
              For any billing disputes or refund requests, please contact our support team at <strong>support@astropinch.com</strong> with your transaction ID.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
