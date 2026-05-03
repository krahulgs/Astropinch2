"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowRight, Sparkles, Clock, Users, Star, Heart, X } from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import Image from 'next/image';
import AnimatedZodiacBackground from '@/components/AnimatedZodiacBackground';

export default function HomePage() {
  const t = useTranslations('Home');
  const n = useTranslations('Navigation');
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    // Show popover after 3 seconds
    const timer = setTimeout(() => setShowPopover(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen text-foreground overflow-hidden relative">
      {/* Mystical Animated SVG Background */}
      <AnimatedZodiacBackground />

      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-black uppercase tracking-[0.25em] shadow-[0_0_40px_-5px] shadow-primary/50 border border-white/20 transform hover:scale-105 transition-all">
            <span className="animate-pulse">✦</span>
            <span>INDIA&apos;S MOST PRECISE VEDIC AI PLATFORM</span>
            <span className="animate-pulse">✦</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-medium tracking-tight leading-[0.9] max-w-4xl mx-auto italic font-serif text-foreground">
            {t('hero.title')}
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto font-light leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="pt-8 flex flex-wrap justify-center gap-6">
            <Link href="/horoscope/daily" className="px-10 py-5 bg-primary text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl shadow-primary/20 flex items-center gap-3">
              ✦ Consult Daily Guide <ArrowRight size={14} />
            </Link>
            <Link href="/kundali" className="px-10 py-5 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl shadow-foreground/10 flex items-center gap-3">
              Get Your Free Kundali <ArrowRight size={14} />
            </Link>
          </div>

          {/* Trust Strip */}
          <div className="pt-10 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary/60">
            <div className="flex items-center gap-2">
              <span className="text-secondary text-base">✦</span> 42,000+ Kundalis generated
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary text-base">✦</span> Trusted by users in 18 countries
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary text-base">✦</span> 7 languages
            </div>
            <div className="flex items-center gap-2">
              <span className="text-secondary text-base">✦</span> No signup needed to start
            </div>
          </div>
        </div>

        {/* Feature Grid Mockup */}
        <div className="max-w-7xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Arcsecond Precision', 
              tagline: 'Not Approximate. Exact.',
              desc: 'Your Kundali is calculated using NASA JPL ephemeris data — the same dataset space agencies use. Every degree, every dasha, every divisional chart is mathematically perfect. Because your destiny deserves accuracy.' 
            },
            { 
              title: 'AI-Powered Synthesis', 
              tagline: 'Your Pandit. Available 24/7.',
              desc: 'Our AI doesn&apos;t just read planetary positions — it understands how your unique dasha, lagna, and nakshatra interact together. No copy-paste readings. Every insight is written for you, not your sun sign.' 
            },
            { 
              title: '7 Languages', 
              tagline: 'Wisdom in Your Mother Tongue',
              desc: 'Jyotish was born in Sanskrit. We deliver it in Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, and English — with cultural nuance intact. Because translation isn&apos;t just words, it&apos;s meaning.' 
            }
          ].map((feature, i) => (
            <div key={i} className="p-10 rounded-[3rem] bg-surface border border-border backdrop-blur-sm hover:bg-foreground/5 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Sparkles size={80} />
              </div>
              <div className="space-y-4 relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">{feature.title}</h3>
                <div className="space-y-2">
                  <p className="text-2xl font-serif italic text-foreground leading-tight">{feature.tagline}</p>
                  <p className="text-text-secondary text-sm leading-relaxed font-light">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Product Feature Sections */}
        <div className="space-y-24 mt-32">
          
          {/* HOROSCOPE */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 group">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif italic text-foreground leading-tight">Your Day. Your Planets. Your Edge.</h2>
              <p className="text-lg text-text-secondary leading-relaxed font-light">
                Forget sun-sign columns written for 1/12th of humanity. Your daily horoscope on AstroPinch is generated from your actual birth chart — your lagna, your current dasha, your transits — every single day. Start each morning knowing what the cosmos has written specifically for you.
              </p>
              <Link href="/horoscope/daily" className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-primary/20">
                ✦ Get Your Daily Guide <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex-1 w-full rounded-[3rem] bg-surface border border-border group-hover:border-secondary/30 transition-all overflow-hidden relative shadow-2xl">
              <div className="aspect-video relative">
                <Image src="/images/horoscope_feature.png" alt="Horoscope" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </div>
          </div>

          {/* KUNDALI */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 group">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif italic text-foreground leading-tight">Your Life&apos;s Blueprint. Finally Decoded.</h2>
              <p className="text-lg text-text-secondary leading-relaxed font-light">
                Your Kundali is the most precise map of your life ever created — drawn at the exact second you were born. AstroPinch generates all 16 divisional charts (Shodasvarga), calculates your Vimshottari Dasha timeline, and explains every placement in plain language. No Pandit appointment needed. No waiting.
              </p>
              <div className="space-y-4">
                <Link href="/kundali" className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-secondary transition-all">
                  Generate Free Kundali <ArrowRight size={14} />
                </Link>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2 ml-4">
                  <Clock size={12} /> Takes 30 seconds. Insights last a lifetime.
                </p>
              </div>
            </div>
            <div className="flex-1 w-full rounded-[3rem] bg-surface border border-border group-hover:border-primary/30 transition-all overflow-hidden relative shadow-2xl">
              <div className="aspect-video relative">
                <Image src="/images/kundali_feature.png" alt="Kundali" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </div>
          </div>

          {/* MATCHING (Kundali Milan) */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 group">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif italic text-foreground leading-tight">Before You Say Yes — Let the Stars Speak.</h2>
              <p className="text-lg text-text-secondary leading-relaxed font-light">
                Marriage is the biggest decision of your life. Our Kundali Matching goes beyond the 36-gun score to analyze Mangal Dosha, Nadi compatibility, Bhakoot, and Rajju — with a full AI explanation of what each compatibility point means for your specific relationship. Used by 11,000+ couples before their wedding.
              </p>
              <div className="space-y-4">
                <Link href="/matching" className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-secondary transition-all">
                  Match Kundalis Free <ArrowRight size={14} />
                </Link>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-4">
                  Free basic report · Detailed PDF report at ₹199
                </p>
              </div>
            </div>
            <div className="flex-1 w-full rounded-[3rem] bg-surface border border-border group-hover:border-highlight/30 transition-all overflow-hidden relative shadow-2xl">
              <div className="aspect-video relative">
                <Image src="/images/matching_feature.png" alt="Matching" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </div>
          </div>

          {/* LOVE MATCH (HIGHLIGHTED) */}
          <div className="relative p-10 md:p-16 rounded-[4rem] bg-gradient-to-br from-pink-500/10 via-surface to-pink-500/5 border border-pink-500/20 shadow-[0_0_100px_-20px] shadow-pink-500/20 max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16 group overflow-hidden">
            {/* Background Glow inside highlight */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="flex-1 relative z-10">
              {/* Floating Decorative Icons */}
              <div className="absolute top-0 right-10 opacity-[0.08] animate-[bounce_8s_infinite] pointer-events-none z-0">
                <Heart size={64} className="text-pink-500 fill-pink-500" />
              </div>
              <div className="absolute top-1/2 -left-10 opacity-[0.05] animate-[pulse_6s_infinite] pointer-events-none z-0">
                <Sparkles size={100} className="text-pink-400" />
              </div>
              <div className="absolute bottom-10 right-32 opacity-[0.08] animate-[bounce_10s_infinite_reverse] pointer-events-none z-0">
                <Star size={48} className="text-pink-500 fill-pink-500" />
              </div>
              <div className="absolute top-1/4 left-1/3 opacity-[0.03] pointer-events-none z-0">
                <Heart size={150} className="text-pink-300" />
              </div>
              <div className="absolute top-20 left-10 opacity-[0.06] animate-[spin_12s_linear_infinite] pointer-events-none z-0">
                <Star size={24} className="text-pink-400 fill-pink-400" />
              </div>
              <div className="absolute bottom-24 left-1/4 opacity-[0.04] animate-[bounce_7s_infinite] pointer-events-none z-0">
                <Heart size={40} className="text-pink-400 fill-pink-400" />
              </div>
              <div className="absolute top-1/3 right-1/4 opacity-[0.07] animate-[pulse_4s_infinite] pointer-events-none z-0">
                <Sparkles size={32} className="text-pink-500" />
              </div>

              <div className="space-y-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 text-pink-500 border border-pink-500/30 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-500/10">
                  <span className="animate-pulse">🔥</span> Most used feature by users under 30
                </div>
                <h2 className="text-3xl md:text-5xl font-serif italic text-foreground leading-tight">Chemistry gets you started. <span className="text-pink-500">The Cosmos keeps you together.</span></h2>
                <div className="space-y-4">
                  <p className="text-xl md:text-2xl text-foreground font-medium">
                    Stop guessing in the dark. Know instantly if they are your soulmate or a lesson waiting to happen.
                  </p>
                  <p className="text-lg text-text-secondary leading-relaxed font-light">
                    Dating profiles show you their best angles, but AstroPinch shows you their blueprint. Our advanced AI Love Match engine analyzes your Venus-Mars alignments and emotional wiring to reveal exactly how you'll love, fight, forgive, and grow together. Because your heart deserves absolute clarity, not vague promises.
                  </p>
                </div>
              <Link href="/love-match" className="inline-flex items-center gap-3 px-10 py-5 bg-pink-500 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-pink-500/40 mt-4">
                Check Love Compatibility <ArrowRight size={16} />
              </Link>
              </div>
            </div>
            <div className="flex-1 w-full rounded-[3rem] bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/30 group-hover:border-pink-500/50 transition-all overflow-hidden relative shadow-2xl z-10 p-2">
              <div className="aspect-[4/3] md:aspect-video rounded-[2.5rem] overflow-hidden relative border border-pink-500/20">
                <Image src="/images/love_match_feature.png" alt="Love Match" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/30 via-transparent to-transparent opacity-80" />
              </div>
            </div>
          </div>

          {/* PANCHANG */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 group">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif italic text-foreground leading-tight">Every Day Has Energy. Know How to Use It.</h2>
              <p className="text-lg text-text-secondary leading-relaxed font-light">
                Tithi, Vara, Nakshatra, Yoga, Karana — the five elements of Vedic time-keeping that determine the energy of every moment. Whether you&apos;re launching a business, signing a contract, or starting a new chapter, AstroPinch Panchang tells you the right moment to act. Updated daily at midnight.
              </p>
              <Link href="/panchang" className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-secondary transition-all">
                View Today&apos;s Panchang <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex-1 w-full rounded-[3rem] bg-surface border border-border group-hover:border-secondary/30 transition-all overflow-hidden relative shadow-2xl">
               <div className="aspect-video relative">
                <Image src="/images/panchang_feature.png" alt="Panchang" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </div>
          </div>

          {/* YEAR BOOK */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 group">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif italic text-foreground leading-tight">12 Months. Laid Out. No Surprises.</h2>
              <p className="text-lg text-text-secondary leading-relaxed font-light">
                What if you could see the peaks and valleys of your year before they happened? Your AstroPinch Year Book maps your Dasha periods, major transits, and auspicious windows across all 12 months — career, love, health, finance. Plan smarter. Move at the right time.
              </p>
              <div className="space-y-4">
                <Link href="/year-book" className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-primary/20">
                  Get My 2026 Year Book <ArrowRight size={14} />
                </Link>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest ml-4">
                  ₹499 · Most comprehensive yearly report in India
                </p>
              </div>
            </div>
            <div className="flex-1 w-full rounded-[3rem] bg-surface border border-border group-hover:border-primary/30 transition-all overflow-hidden relative shadow-2xl">
              <div className="aspect-video relative">
                <Image src="/images/year_book_feature.png" alt="Year Book" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </div>
          </div>

          {/* AI CHAT */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 group">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif italic text-foreground leading-tight">A Jyotishi Who Knows Your Chart. Always On.</h2>
              <p className="text-lg text-text-secondary leading-relaxed font-light">
                Ask anything. &quot;When should I change jobs?&quot; &quot;Is 2025 good for my marriage?&quot; &quot;Why do I keep facing problems in relationships?&quot; Our AI has read your full Kundali, your current dasha, and your planetary transits — and answers based on YOUR chart, not generic astrology rules.
              </p>
              <div className="space-y-4">
                <Link href="/chat" className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-secondary transition-all">
                  Chat With Your AI Jyotishi <ArrowRight size={14} />
                </Link>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-4 flex items-center gap-2">
                  <Sparkles size={12} className="text-primary" /> Powered by your personal birth chart · Responses in under 10 seconds
                </p>
              </div>
            </div>
            <div className="flex-1 w-full rounded-[3rem] bg-surface border border-border group-hover:border-secondary/30 transition-all overflow-hidden relative shadow-2xl">
               <div className="aspect-video relative">
                <Image src="/images/ai_chat_feature.png" alt="AI Chat" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </div>
          </div>

          {/* MUHURAT */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 group">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif italic text-foreground leading-tight">The Right Moment Changes Everything.</h2>
              <p className="text-lg text-text-secondary leading-relaxed font-light">
                In Vedic tradition, timing isn&apos;t superstition — it&apos;s strategy. AstroPinch Muhurat calculates the most auspicious time for marriage, griha pravesh, business launch, travel, or any major event using your personal chart and classical Muhurat criteria. Get the window the stars open for you.
              </p>
              <Link href="/muhurat" className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-secondary transition-all">
                Find My Muhurat <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex-1 w-full rounded-[3rem] bg-surface border border-border group-hover:border-highlight/30 transition-all overflow-hidden relative shadow-2xl">
               <div className="aspect-video relative">
                <Image src="/images/muhurat_feature.png" alt="Muhurat" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </div>
          </div>

        </div>

        {/* Community Trust Section */}
        <div className="max-w-7xl mx-auto mt-32 pt-20 border-t border-border relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-16">
            <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em]">
                <Star size={12} className="fill-primary" /> COMMUNITY VALIDATION
              </div>
              <h2 className="text-5xl md:text-6xl font-serif text-foreground">
                Trust in the <span className="italic text-primary">Cosmos</span>
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed font-light max-w-lg">
                Join a community of over 2 million seekers who rely on our precision-guided celestial insights for clarity in an uncertain world.
              </p>
            </div>
            
            <div className="bg-surface border border-border rounded-[2rem] p-6 flex items-center gap-8 shadow-xl">
              <div className="space-y-1">
                <p className="text-4xl font-bold text-foreground">4.98</p>
                <div className="flex text-yellow-500">
                  <Star size={14} className="fill-yellow-500" />
                  <Star size={14} className="fill-yellow-500" />
                  <Star size={14} className="fill-yellow-500" />
                  <Star size={14} className="fill-yellow-500" />
                  <Star size={14} className="fill-yellow-500" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary pt-2">APP STORE RATING</p>
              </div>
              <div className="w-px h-16 bg-border"></div>
              <div className="space-y-3">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border-2 border-surface overflow-hidden relative">
                    <Image src="/images/avatar_anjali.png" alt="Anjali" fill className="object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-surface overflow-hidden relative">
                    <Image src="/images/avatar_rohan.png" alt="Rohan" fill className="object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-highlight/20 flex items-center justify-center border-2 border-surface overflow-hidden relative">
                    <Image src="/images/avatar_priya.png" alt="Priya" fill className="object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-[10px] font-bold border-2 border-surface text-background z-10 relative">2M+</div>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary text-center">ACTIVE USERS</p>
              </div>
            </div>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { text: "I was skeptical — I've used 4 other astrology apps. AstroPinch's Kundali matching report was the only one that explained WHY certain planets create conflict in our relationship, not just a score. We used it before our wedding. Best ₹299 I've spent.", name: "Divya R.", role: "Bangalore", img: "/images/avatar_anjali.png" },
              { text: "The AI Chat felt like talking to a real Jyotishi. I asked about my career change timing and it gave me dasha-specific windows with actual reasoning. Other apps just say 'Mercury is good for you.' This one tells you WHY.", name: "Aakash M.", role: "Mumbai", img: "/images/avatar_rohan.png" },
              { text: "My mother uses it in Tamil, I use it in English. Same report, same insight, completely different language. That's magic.", name: "Preethi S.", role: "Chennai", img: "/images/avatar_priya.png" },
              { text: "Got my Muhurat for business registration through AstroPinch. Business crossed ₹1 crore in the first year. Coincidence? Maybe. But I'm using it again for my next venture.", name: "Rajesh K.", role: "Ahmedabad", img: "/images/avatar_vikram.png" }
            ].map((review, i) => (
              <div key={i} className="bg-surface border border-border rounded-[2rem] p-8 space-y-6 hover:-translate-y-1 transition-transform duration-300 shadow-lg relative group overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
                <div className="flex text-yellow-500 gap-1 relative z-10">
                  <Star size={12} className="fill-yellow-500" />
                  <Star size={12} className="fill-yellow-500" />
                  <Star size={12} className="fill-yellow-500" />
                  <Star size={12} className="fill-yellow-500" />
                  <Star size={12} className="fill-yellow-500" />
                </div>
                <p className="text-sm text-foreground leading-relaxed font-light italic relative z-10">"{review.text}"</p>
                <div className="flex items-center gap-3 pt-2 relative z-10">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative border border-border/50">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-[10px] font-black text-primary">
                      {review.name.split(' ')[0][0]}{review.name.split(' ')[1]?.[0] || ''}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{review.name}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary mt-1">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
      {/* Promotional Popover */}
      {showPopover && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative max-w-3xl w-full bg-gradient-to-br from-secondary via-primary to-highlight border border-white/20 rounded-[2rem] overflow-hidden shadow-[0_0_80px_-20px_rgba(var(--primary-rgb),0.5)] flex flex-col md:flex-row animate-in zoom-in slide-in-from-bottom-10 duration-700">
            {/* Close Button */}
            <button 
              onClick={() => setShowPopover(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all shadow-lg"
            >
              <X size={20} />
            </button>

            {/* Image Side */}
            <div className="md:w-5/12 relative h-48 md:h-auto hidden sm:block">
              <Image 
                src="/images/jyotish_guru.png" 
                alt="Jyotish Guru" 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent md:bg-gradient-to-r" />
            </div>

            {/* Content Side */}
            <div className="md:w-7/12 p-6 md:p-12 flex flex-col justify-center space-y-6 md:space-y-8 relative">
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest border border-white/30 backdrop-blur-md">
                  <Sparkles size={12} className="animate-pulse" /> INDIA&apos;S MOST ADVANCED ASTRO PORTAL
                </div>
                <h2 className="text-3xl md:text-4xl font-serif italic text-white leading-tight">
                  Your Future, <span className="text-white/80 italic">Decoded.</span>
                </h2>
                <p className="text-sm md:text-base text-white/90 font-light leading-relaxed">
                  Connect with our grand-master AI Jyotish Guru for absolute clarity on your career, relationships, and health. No waiting, just wisdom.
                </p>
              </div>

              <div className="space-y-6 relative z-10">
                <Link 
                  href="/chat" 
                  onClick={() => setShowPopover(false)}
                  className="w-full py-4 bg-white text-primary rounded-full font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-white/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <MessageCircle size={18} /> Free Chat with Jyotish Guru
                </Link>
                <div className="flex flex-wrap justify-center gap-4 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.25em] text-white/60">
                  <span className="flex items-center gap-2">✦ 100% PRIVATE</span>
                  <span className="flex items-center gap-2">✦ NO SIGNUP</span>
                  <span className="flex items-center gap-2">✦ INSTANT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
