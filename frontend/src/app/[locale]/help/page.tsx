"use client";

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, User, Stars, CreditCard, ShieldCheck, MessageCircle } from 'lucide-react';

const faqs = [
  {
    category: "Astrology & Calculations",
    icon: <Stars className="text-primary" />,
    items: [
      { q: "Why are my birth details important?", a: "Vedic astrology is highly time-sensitive. Even a 4-minute difference in birth time can shift your Lagna (Ascendant) or Nakshatra Padas, significantly altering your chart's accuracy." },
      { q: "What Ayanamsa does AstroPinch use?", a: "By default, we use the Lahiri Ayanamsa (Chitra Paksha), which is the official standard for Vedic calculations in India and globally." },
      { q: "Is the AI guidance accurate?", a: "Our AI is a synthesis layer. It takes NASA-grade planetary coordinates and processes them through ancient scripture logic. While accurate, it should be used for personal growth and probability analysis." }
    ]
  },
  {
    category: "Account & Profile",
    icon: <User className="text-secondary" />,
    items: [
      { q: "Can I save multiple birth profiles?", a: "Yes! Logged-in users can save profiles for family and friends in their dashboard for quick access to charts and matching." },
      { q: "How do I delete my data?", a: "You can delete individual profiles or your entire account from the Settings menu. We respect your 'Right to be Forgotten' as per global privacy standards." }
    ]
  },
  {
    category: "Payments & Consultation",
    icon: <CreditCard className="text-highlight" />,
    items: [
      { q: "Is my payment secure?", a: "We use industry-leading processors like Stripe and Razorpay. Your credit card details never touch our servers." },
      { q: "What happens if an astrologer misses a session?", a: "If a marketplace consultation doesn't happen due to an astrologer's absence, you will receive a 100% refund or session credit automatically." }
    ]
  }
];

export default function HelpCentrePage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => setOpenIndex(openIndex === id ? null : id);

  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-serif italic text-foreground tracking-tight">
            How can we <br/> <span className="text-primary">help you?</span>
          </h1>
          <div className="relative max-w-xl mx-auto group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl group-focus-within:bg-primary/30 transition-all opacity-50" />
            <div className="relative h-16 rounded-full bg-surface border border-border px-8 flex items-center gap-4 focus-within:border-primary transition-all shadow-xl">
              <Search size={20} className="text-text-secondary" />
              <input type="text" placeholder="Search for 'Mangal Dosha', 'Refunds', 'Accuracy'..." className="bg-transparent outline-none flex-1 text-sm text-foreground" />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Astrology", icon: <Stars />, count: 12 },
            { label: "Account", icon: <User />, count: 5 },
            { label: "Payments", icon: <CreditCard />, count: 8 },
            { label: "Safety", icon: <ShieldCheck />, count: 4 }
          ].map((cat, i) => (
            <button key={i} className="p-8 rounded-[2.5rem] bg-surface border border-border hover:border-primary transition-all text-center space-y-3 group">
              <div className="w-10 h-10 rounded-xl bg-foreground/[0.03] flex items-center justify-center mx-auto text-text-secondary group-hover:text-primary transition-colors">
                {cat.icon}
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">{cat.label}</h4>
              <p className="text-[10px] text-text-secondary font-medium">{cat.count} Articles</p>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-12">
          <h2 className="text-3xl font-serif italic text-foreground text-center">Frequently Asked Questions</h2>
          <div className="space-y-8">
            {faqs.map((group, gIdx) => (
              <div key={gIdx} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  {group.icon}
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">{group.category}</h3>
                </div>
                <div className="space-y-2">
                  {group.items.map((item, iIdx) => {
                    const id = `${gIdx}-${iIdx}`;
                    const isOpen = openIndex === id;
                    return (
                      <div key={id} className="rounded-3xl bg-surface border border-border overflow-hidden transition-all">
                        <button onClick={() => toggle(id)} className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-foreground/[0.02] transition-colors">
                          <span className="text-sm font-bold text-foreground">{item.q}</span>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {isOpen && (
                          <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                            <p className="text-xs text-text-secondary leading-relaxed font-normal">{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Support CTA */}
        <div className="p-12 rounded-[4rem] bg-gradient-to-br from-primary to-secondary text-white text-center space-y-6 shadow-2xl shadow-primary/20">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto backdrop-blur-md">
            <MessageCircle size={32} />
          </div>
          <h3 className="text-3xl font-serif italic">Still need guidance?</h3>
          <p className="text-sm text-white/80 max-w-md mx-auto font-normal">
            Our support gurus are available 24/7 to help you with technical or astrological queries.
          </p>
          <button className="px-12 h-14 rounded-full bg-white text-primary text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
            Start Live Chat
          </button>
        </div>

      </div>
    </main>
  );
}
