"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Send, Phone, Video, X, Shield, Clock, IndianRupee } from 'lucide-react';
import Image from 'next/image';

export default function ConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{role: string, text: string, time: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const astrologers: any = {
    '1': { name: 'Acharya Rahul', image: '/images/astrologers/rahul.png', rate: 45, status: 'Online' },
    '2': { name: 'Smt. Kavita', image: '/images/astrologers/kavita.png', rate: 35, status: 'Online' },
    '3': { name: 'Dr. Sanjay', image: '/images/astrologers/sanjay.png', rate: 75, status: 'Busy' },
    '4': { name: 'Swami Ji', image: '/images/astrologers/swami.png', rate: 100, status: 'Online' },
    '5': { name: 'Astrologer Priya', image: '/images/astrologers/priya.png', rate: 25, status: 'Offline' },
    '6': { name: 'Guru Dev', image: '/images/astrologers/guru.png', rate: 150, status: 'Online' }
  };

  const astro = astrologers[params.id as string] || astrologers['1'];

  useEffect(() => {
    // Initial greeting
    setChat([{
      role: 'astro',
      text: `Namaste! I am ${astro.name}. How can I assist you with your Jyotish queries today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  }, [astro.name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const userMsg = {
      role: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChat(prev => [...prev, userMsg]);
    setMessage('');

    // Simulate AI Astrologer response
    setTimeout(() => {
      const responses = [
        "I see. Let me look at your planetary transits for this period.",
        "Based on your Saturn placement, I suggest focusing on patience and structured growth.",
        "Your Jupiter is very strong right now. This is a great time for spiritual or educational pursuits.",
        "I am calculating your Dasha sequence. One moment please.",
        "Have you considered the impact of Rahu in your current chart? It seems to be creating some illusions."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setChat(prev => [...prev, {
        role: 'astro',
        text: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  return (
    <main className="relative h-screen bg-background overflow-hidden flex flex-col md:flex-row pt-20">
      {/* Sidebar - Profile & Info */}
      <div className="w-full md:w-80 border-r border-border bg-surface/30 backdrop-blur-xl p-6 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl rotate-[-2deg]">
            <Image src={astro.image} alt={astro.name} fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-serif italic text-foreground">{astro.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-highlight"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-highlight">Live Session</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-foreground/5 border border-border flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Elapsed Time</p>
              <p className="text-sm font-bold text-foreground font-mono">04:22</p>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-foreground/5 border border-border flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-highlight/10 flex items-center justify-center text-highlight">
              <IndianRupee size={18} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Current Charges</p>
              <p className="text-sm font-bold text-foreground">₹{(astro.rate * 4.3).toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <button className="w-full h-12 rounded-xl bg-alert/10 border border-alert/20 text-alert font-black text-[10px] uppercase tracking-widest hover:bg-alert hover:text-white transition-all flex items-center justify-center gap-2" onClick={() => router.push('/marketplace')}>
            <X size={14} /> End Consultation
          </button>
          <div className="flex items-center justify-center gap-2 text-text-secondary/40">
            <Shield size={12} />
            <span className="text-[8px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-foreground/[0.02]">
        {/* Header Actions */}
        <div className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
               <Shield size={16} />
             </div>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary">Verified Expert Session</p>
          </div>
          <div className="flex gap-3">
             <button className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all">
               <Phone size={18} />
             </button>
             <button className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all">
               <Video size={18} />
             </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {chat.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
              <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-foreground text-background rounded-tr-none' 
                    : 'bg-surface border border-border text-foreground rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <p className="text-[8px] font-bold text-text-secondary px-2">{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-background/50 backdrop-blur-md border-t border-border">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input 
              type="text" 
              placeholder="Type your question here..."
              className="flex-1 h-12 px-6 rounded-xl bg-foreground/5 border border-transparent focus:border-primary focus:bg-transparent outline-none transition-all text-sm text-foreground"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg hover:scale-[0.98] transition-all"
              onClick={handleSend}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
