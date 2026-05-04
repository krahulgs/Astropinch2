'use client';

import React, { useState } from 'react';

import { Check, Sparkles, Crown, Moon, Star, ArrowRight } from 'lucide-react';
import AnimatedZodiacBackground from '@/components/AnimatedZodiacBackground';

const plans = [
  {
    name: 'Seeker',
    price: 199,
    description: 'Begin your celestial journey',
    features: ['Daily Personalised Rashifal', 'Basic Kundali Analysis', '1 AI Astrology Chat Session', 'Lunar Transit Alerts'],
    icon: <Moon className="w-6 h-6 text-blue-400" />,
    color: 'from-blue-500/20 to-cyan-400/20',
    borderColor: 'border-blue-500/30'
  },
  {
    name: 'Adept',
    price: 499,
    description: 'Deepen your cosmic connection',
    features: ['In-depth Ashtakvarga Charts', 'Unlimited AI Consultation', 'Monthly Muhurat Calendar', 'Advanced Varshphal Report'],
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    color: 'from-primary/20 to-secondary/20',
    borderColor: 'border-primary/40',
    popular: true
  },
  {
    name: 'Luminary',
    price: 999,
    description: 'Master your destiny',
    features: ['Priority Expert Consultation', 'Custom Gemstone Analysis', 'Vastu Energy Mapping', 'Life-time Dasha Timeline'],
    icon: <Crown className="w-6 h-6 text-highlight" />,
    color: 'from-highlight/20 to-yellow-500/20',
    borderColor: 'border-highlight/40'
  }
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const handleSubscribe = async (plan: typeof plans[0]) => {
    setLoading(plan.name);
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Subscription to ${plan.name} selected! Payment integration is currently disabled.`);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Cosmic connection interrupted. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen text-foreground overflow-hidden relative selection:bg-primary/30">
      <AnimatedZodiacBackground />

      {/* Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <main className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles size={12} /> Elite Cosmic Access
          </div>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1] italic font-serif text-foreground mb-6">
            Stop Guessing. <br className="hidden md:block" />
            <span className="text-text-secondary font-normal text-4xl md:text-5xl">Start Architecting Your Life.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto font-normal leading-relaxed">
            Most people react to their destiny; the elite prepare for it. Unlock NASA-grade planetary tracking, unlimited AI consultations, and deep Karmic analysis to stay permanently ahead of life's curve.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div 
              key={plan.name}
              className={`group relative rounded-[2.5rem] p-8 bg-surface border border-border backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:bg-foreground/[0.02] flex flex-col ${plan.popular ? 'ring-1 ring-primary/30' : ''}`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background px-4 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase shadow-lg shadow-primary/20">
                  Most Auspicious
                </div>
              )}
              
              <div className="mb-6">
                <div className={`w-12 h-12 rounded-[1.25rem] bg-gradient-to-br ${plan.color} flex items-center justify-center border ${plan.borderColor} mb-4 transition-transform group-hover:scale-105 duration-500`}>
                  {React.cloneElement(plan.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                </div>
                <h2 className="text-2xl font-serif italic mb-1">{plan.name}</h2>
                <p className="text-text-secondary text-[13px] font-normal leading-snug h-8">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold font-serif italic text-foreground">₹{plan.price}</span>
                <span className="text-text-secondary text-xs font-normal">/monthly</span>
              </div>

              <div className="flex-grow">
                <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-4">Plan Includes</p>
                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[13px] text-text-secondary font-normal">
                      <div className="mt-1">
                        <Star size={10} className="text-primary fill-primary" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading !== null}
                className={`w-full py-4 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all duration-300 shadow-lg overflow-hidden relative group/btn ${
                  plan.popular 
                    ? 'bg-foreground text-background hover:bg-primary' 
                    : 'bg-surface border border-border text-foreground hover:bg-foreground hover:text-background'
                } disabled:opacity-50`}
              >
                <span className="relative z-10">
                  {loading === plan.name ? 'Aligning...' : 'Begin'}
                </span>
                {loading !== plan.name && <ArrowRight size={12} className="relative z-10" />}
              </button>
              {/* Subtle bottom gradient */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-[2.5rem] bg-gradient-to-r ${plan.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-24 text-center">
          <div className="p-8 rounded-[2rem] bg-surface/50 border border-border backdrop-blur-sm">
            <p className="text-text-secondary text-sm font-normal leading-relaxed italic">
              "The stars incline, they do not determine. Use these tools as a guide for your free will."
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-yellow-500/50">
              <Star size={12} className="fill-current" />
              <Star size={12} className="fill-current" />
              <Star size={12} className="fill-current" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
