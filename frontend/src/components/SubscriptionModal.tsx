import React, { useState } from 'react';
import { X, Sparkles, Check, Crown } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Gradient */}
        <div className="bg-gradient-to-br from-highlight/20 via-primary/10 to-surface p-8 text-center space-y-4">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-foreground/5 hover:bg-foreground/10 text-text-secondary transition-colors"
          >
            <X size={16} />
          </button>
          
          <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-highlight to-primary flex items-center justify-center shadow-lg shadow-highlight/20">
            <Crown size={28} className="text-white" />
          </div>
          
          <div>
            <h2 className="text-2xl font-serif italic text-foreground mt-2">Unlock AstroPinch+</h2>
            <p className="text-sm text-text-secondary font-light mt-1">
              Go beyond the math. Get unlimited access to DeepSeek-powered astrological synthesis.
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="px-8 py-6 space-y-4 bg-surface">
          {[
            { title: 'DeepSeek AI Insights', desc: 'Unlock full 4-pillar predictions, soul essence & life seasons.' },
            { title: 'Advanced Moon Chart AI', desc: 'Deep synthesis of your emotional and mental health.' },
            { title: 'Personalized Daily Guides', desc: 'Daily readings factoring exact Dashas and Transits.' },
            { title: 'Detailed Dosha Pariharas', desc: 'Personalized Vedic Shuddhi logic and exact remedies.' },
            { title: 'Advanced Compatibility', desc: 'AI plain-English relationship dynamic explanations.' },
            { title: 'AstroPinch Year Book', desc: 'High-fidelity astrological dossier with transit-based monthly predictions.' },
          ].map((benefit, i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Check size={12} className="text-primary" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground">{benefit.title}</h4>
                <p className="text-xs text-text-secondary font-light mt-0.5">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Selection */}
        <div className="px-8 pb-4 space-y-3">
          {/* Annual Plan */}
          <button 
            onClick={() => setSelectedPlan('annual')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
              selectedPlan === 'annual' 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-surface hover:border-border/80'
            }`}
          >
            <div className="text-left">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Annual Plan <span className="px-2 py-0.5 rounded-md bg-highlight/20 text-highlight text-[8px] uppercase tracking-wider">Best Value</span>
              </h3>
              <p className="text-xs text-text-secondary">Billed ₹2,499 yearly</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-serif italic text-foreground">₹208</span>
              <span className="text-[10px] text-text-secondary"> /mo</span>
            </div>
          </button>

          {/* Monthly Plan */}
          <button 
            onClick={() => setSelectedPlan('monthly')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
              selectedPlan === 'monthly' 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-surface hover:border-border/80'
            }`}
          >
            <div className="text-left">
              <h3 className="text-sm font-bold text-foreground">Monthly Plan</h3>
              <p className="text-xs text-text-secondary">Cancel anytime</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-serif italic text-foreground">₹299</span>
              <span className="text-[10px] text-text-secondary"> /mo</span>
            </div>
          </button>
        </div>

        {/* CTA */}
        <div className="p-8 pt-4">
          <button className="w-full py-4 rounded-full bg-foreground text-background font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors flex items-center justify-center gap-2 shadow-lg">
            <Sparkles size={14} /> Proceed to Pay {selectedPlan === 'annual' ? '₹2,499' : '₹299'}
          </button>
          <p className="text-center text-[9px] text-text-secondary mt-3">Secure payment via Stripe/Razorpay. No hidden fees.</p>
        </div>

      </div>
    </div>
  );
}
