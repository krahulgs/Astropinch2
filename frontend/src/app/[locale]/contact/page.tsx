"use client";

import React from 'react';
import { Mail, MessageSquare, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-16">
        
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-8 duration-1000">
          <h1 className="text-6xl font-serif italic text-foreground tracking-tight">
            Connect With the <br/> <span className="text-primary">Cosmos.</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto font-light">
            Whether you're a user with a question or an astrologer looking to join our marketplace, we're here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Email Support</h4>
                <p className="text-text-secondary font-light">support@astropinch.com</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">24/7 Response Time</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <MessageSquare size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Partnership Inquiries</h4>
                <p className="text-text-secondary font-light">partners@astropinch.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-highlight/10 flex items-center justify-center text-highlight shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Headquarters</h4>
                <p className="text-text-secondary font-light">Cosmic Square, Sector 44<br/>Gurugram, HR 122003, India</p>
              </div>
            </div>
          </div>

          {/* Simple Form Placeholder */}
          <div className="p-10 rounded-[3rem] bg-surface border border-border space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Full Name</label>
                <input type="text" className="w-full h-14 rounded-2xl bg-foreground/5 border border-border/50 px-6 text-sm focus:border-primary outline-none transition-all" placeholder="Arjun Sharma" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Email Address</label>
                <input type="email" className="w-full h-14 rounded-2xl bg-foreground/5 border border-border/50 px-6 text-sm focus:border-primary outline-none transition-all" placeholder="arjun@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Your Message</label>
                <textarea className="w-full h-32 rounded-2xl bg-foreground/5 border border-border/50 p-6 text-sm focus:border-primary outline-none transition-all resize-none" placeholder="How can we help you navigate your chart?"></textarea>
              </div>
            </div>
            <button className="w-full h-14 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
              Send Message
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
