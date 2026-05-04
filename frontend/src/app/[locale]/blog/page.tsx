"use client";

import React from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, Stars, Shield, Search } from 'lucide-react';
import { Link } from '@/i18n/routing';

const blogPosts = [
  {
    id: 'muhurat-science',
    title: "The Science of Subha Muhurat: Why Timing is Everything",
    category: "Muhurat",
    date: "May 1, 2026",
    readTime: "6 min read",
    excerpt: "Understand how the alignment of the Moon and the five elements of Panchang determines the success of any venture.",
    image: "/images/blog/muhurat.png"
  },
  {
    id: 'saturn-transit-2026',
    title: "Saturn Transit 2026: A Karmic Audit for All Signs",
    category: "Transits",
    date: "April 28, 2026",
    readTime: "8 min read",
    excerpt: "Shani's movement into a new Rashi brings a period of discipline and restructuring. Find out how it affects your Moon sign.",
    image: "/images/blog/saturn.png"
  },
  {
    id: 'ai-astrology-research',
    title: "Research: Can AI Accurately Interpret Bhrigu Samhita?",
    category: "Research",
    date: "April 25, 2026",
    readTime: "12 min read",
    excerpt: "A deep dive into how AstroPinch's SLM (Small Language Model) is trained to understand ancient symbolic manuscripts.",
    image: "/images/blog/research.png"
  },
  {
    id: 'marriage-matching-beyond-guna',
    title: "Vedic Matching: Moving Beyond the 36 Guna Limit",
    category: "Relationship",
    date: "April 22, 2026",
    readTime: "5 min read",
    excerpt: "Why Mangal Dosha and Bhakoot cancellations are more important than just the basic compatibility score.",
    image: "/images/blog/relationship.png"
  }
];

export default function BlogHubPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Hero / Featured */}
        <div className="relative group rounded-[3rem] md:rounded-[4rem] overflow-hidden bg-foreground text-background p-8 md:p-24 space-y-8 animate-in fade-in slide-in-from-top-8 duration-1000">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40 opacity-40 mix-blend-overlay" />
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
           
           <div className="relative z-10 space-y-8 max-w-3xl">
             <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Featured Research</span>
             </div>
             
             <h1 className="text-5xl md:text-8xl font-serif italic tracking-tight leading-[0.9]">
               The Quantum <br/> <span className="text-primary italic">Jyotish Project.</span>
             </h1>
             
             <p className="text-lg md:text-2xl opacity-80 font-normal leading-relaxed max-w-2xl">
               Exploring the intersection of quantum entanglement and the Vedic concept of planetary drishti (aspects).
             </p>
             
             <Link href="/blog/quantum-jyotish-project" className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest group bg-white text-foreground px-8 py-4 rounded-full hover:bg-primary hover:text-white transition-all">
                Read Full Paper <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
             </Link>
           </div>
        </div>

        <div className="space-y-12">
          {/* Categories Bar & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border pb-10">
             <div className="flex flex-wrap items-center gap-3">
                {['All Articles', 'Research', 'Muhurat', 'Transits', 'Relationship'].map((cat, i) => (
                  <button key={i} className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${i === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface border border-border text-text-secondary hover:border-primary'}`}>
                    {cat}
                  </button>
                ))}
             </div>
             
             <div className="relative max-w-xs w-full">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input 
                  type="text" 
                  placeholder="Search insights..." 
                  className="w-full h-12 pl-12 pr-6 rounded-full bg-surface border border-border text-xs outline-none focus:border-primary transition-all"
                />
             </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {blogPosts.map((post, i) => (
              <Link key={i} href={`/blog/${post.id}`} className="flex flex-col space-y-6 group">
                 <div className="aspect-[4/5] rounded-[2.5rem] bg-surface border border-border flex items-center justify-center text-7xl group-hover:scale-[0.98] group-hover:-rotate-1 transition-all duration-500 overflow-hidden relative shadow-sm group-hover:shadow-xl group-hover:shadow-primary/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover relative z-0 transition-transform duration-700 group-hover:scale-105" />
                 </div>
                 
                 <div className="space-y-4 px-2">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest">{post.category}</span>
                       <div className="flex items-center gap-3 text-[9px] text-text-secondary font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}</span>
                       </div>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-serif italic text-foreground leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-text-secondary leading-relaxed font-normal line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground group-hover:gap-4 transition-all">
                        Deep Dive <ArrowRight size={14} className="text-primary" />
                      </span>
                    </div>
                 </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter / Community */}
        <div className="p-10 md:p-20 rounded-[3rem] md:rounded-[5rem] bg-surface border border-border text-center space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-20 opacity-[0.03] text-primary rotate-12">
              <Stars size={400} />
           </div>
           <div className="absolute bottom-0 left-0 p-20 opacity-[0.03] text-secondary -rotate-12">
              <Stars size={300} />
           </div>
           
           <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                 <Shield size={12} /> Privacy Guaranteed
              </div>
              <h2 className="text-4xl md:text-6xl font-serif italic text-foreground tracking-tight leading-tight">
                Join the <span className="text-primary">Cosmic Weekly.</span>
              </h2>
              <p className="text-lg text-text-secondary font-normal leading-relaxed">
                Join 50,000+ seekers who receive our AI-driven transit updates and research summaries every Sunday.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                 <input 
                   type="email" 
                   placeholder="Your sacred email..." 
                   className="h-16 px-8 rounded-full bg-foreground/[0.03] border border-border outline-none focus:border-primary flex-1 w-full text-sm font-medium" 
                 />
                 <button className="h-16 px-12 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest whitespace-nowrap w-full sm:w-auto hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                   Subscribe Now
                 </button>
              </div>
           </div>
        </div>

      </div>
    </main>
  );
}
