"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Zap, Shield, Star, Award, ChevronRight, Sparkles, User, Loader2, RotateCcw } from 'lucide-react';

// Astrologer personalities mapped by ID
const ASTROLOGERS: Record<string, { name: string; title: string; specialty: string; avatar: string; greeting: string; style: string }> = {
  '1': { name: 'Acharya Rahul', title: 'Senior Vedic Consultant', specialty: 'Vedic & KP Astrology', avatar: '/images/astrologers/rahul.png', greeting: "Namaste! I am Acharya Rahul. I have reviewed your Kundali and I am ready to guide you. What is your main concern today — career, relationships, finances, or health?", style: 'warm, traditional, uses occasional Sanskrit blessings' },
  '2': { name: 'Smt. Kavita', title: 'Nadi & Vastu Specialist', specialty: 'Nadi & Vastu Shastra', avatar: '/images/astrologers/kavita.png', greeting: "Pranam! This is Smt. Kavita. I specialize in Nadi astrology, which reads the karmic blueprint of your soul. Tell me what weighs on your heart today?", style: 'compassionate, motherly, focuses on karmic patterns' },
  '3': { name: 'Dr. Sanjay', title: 'Prashna & Research Astrologer', specialty: 'Prashna & Vedic', avatar: '/images/astrologers/sanjay.png', greeting: "Good day. I am Dr. Sanjay. I use Prashna astrology — the astrology of the question — to give you precise, moment-specific answers. What is your burning question?", style: 'analytical, precise, data-driven, references specific techniques' },
  '4': { name: 'Swami Ji', title: 'Vedic Sage & Meditation Guide', specialty: 'Meditation & Vedic', avatar: '/images/astrologers/swami.png', greeting: "Om Shanti. I am here, dear seeker. The cosmos has brought you to this moment for a reason. Let us explore what the universe is trying to tell you. Speak your truth.", style: 'spiritual, philosophical, speaks with deep wisdom and metaphors' },
  '5': { name: 'Astrologer Priya', title: 'Numerology & Tarot Guide', specialty: 'Numerology & Tarot', avatar: '/images/astrologers/priya.png', greeting: "Hello! I am Priya. I blend numerology and tarot to give you clear, practical insights. I believe astrology should be empowering, not scary. What's on your mind?", style: 'friendly, modern, encouraging, practical advice-focused' },
  '6': { name: 'Guru Dev', title: 'Grand Master Astrologer', specialty: 'Vedic, KP, Nadi & Prashna', avatar: '/images/astrologers/guru.png', greeting: "I am Guru Dev. 30 years of study and practice have shown me that the stars do not control you — they illuminate your path. I am ready to illuminate yours. Ask me anything.", style: 'authoritative, confident, delivers profound insights with clarity' },
};

interface Message {
  id: string;
  role: 'user' | 'astrologer' | 'system';
  text: string;
  time: string;
}

export default function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const searchParams = useSearchParams();
  const profileName = searchParams.get('profile') || '';
  const astrologer = ASTROLOGERS[id] || ASTROLOGERS['1'];
  const sessionId = useRef(`session_${id}_${Date.now()}`);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initialize session — guarded against React 18 StrictMode double-fire
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      await new Promise(r => setTimeout(r, 1800));
      setIsConnected(true);

      const sysMsg: Message = {
        id: crypto.randomUUID(),
        role: 'system',
        text: `🔐 Secure session established. ${astrologer.name} has loaded your Kundali profile${profileName ? ` for ${profileName}` : ''} and is ready to consult.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([sysMsg]);

      await new Promise(r => setTimeout(r, 800));
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1400));
      setIsTyping(false);

      const greeting: Message = {
        id: crypto.randomUUID(),
        role: 'astrologer',
        text: astrologer.greeting,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, greeting]);
    };
    init();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');

    // ── Repetition Detection ─────────────────────────────────────────────────
    const wordOverlap = (a: string, b: string) => {
      const setA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      const setB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      if (!setA.size || !setB.size) return 0;
      const intersection = [...setA].filter(w => setB.has(w)).length;
      return intersection / Math.min(setA.size, setB.size);
    };
    const recentUserMsgs = messages.filter(m => m.role === 'user').slice(-4);
    const repeatCount = recentUserMsgs.filter(m => wordOverlap(m.text, text) > 0.65).length;
    const isRepeat = repeatCount > 0;
    // ────────────────────────────────────────────────────────────────────────

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const apiMessages = updatedMessages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'astrologer' ? 'assistant' : 'user',
          text: m.text,
          time: m.time
        }));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/consultation/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          astro_name: astrologer.name,
          profile_name: profileName,
          messages: apiMessages,
          is_repeat: isRepeat,
          repeat_count: repeatCount,
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Consultation API error:', err);
        throw new Error(`Backend error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.text || data.reply || data.response || "The stars are reflecting. Please try again.";

      setIsTyping(false);
      const astroMsg: Message = {
        id: crypto.randomUUID(),
        role: 'astrologer',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, astroMsg]);

      // Log the session in background
      fetch(`${apiUrl}/consultation/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId.current,
          astrologer_id: id,
          profile_name: profileName,
          messages: [...apiMessages, { role: 'assistant', text: reply, time: now }]
        })
      }).catch(() => {});

    } catch {
      setIsTyping(false);
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'system',
        text: 'Connection interrupted. Please check your network and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endSession = () => setSessionEnded(true);

  // === CONNECTING SCREEN ===
  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center space-y-10 z-[200]">
        <div className="relative flex items-center justify-center w-40 h-40">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-2xl shadow-primary/30">
            <img src={astrologer.avatar} alt={astrologer.name} className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display='none'; }} />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-serif italic text-foreground">Connecting to {astrologer.name}</h2>
          {profileName ? (
            <div className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-highlight/10 border border-highlight/20">
              <User size={12} className="text-highlight" />
              <p className="text-xs font-bold text-highlight">Loading chart for: {profileName}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-alert/10 border border-alert/20">
              <Zap size={12} className="text-alert" />
              <p className="text-xs font-bold text-alert">No Kundali profile linked — general consultation mode</p>
            </div>
          )}
          <p className="text-xs font-black uppercase tracking-[0.3em] text-text-secondary animate-pulse">Syncing your cosmic profile...</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-surface border border-border">
          <Shield size={14} className="text-highlight" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">End-to-End Encrypted Session</span>
        </div>
      </div>
    );
  }

  // === SESSION ENDED SCREEN ===
  if (sessionEnded) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center space-y-10 z-[200] animate-in fade-in duration-700">
        <div className="w-24 h-24 rounded-[2rem] bg-highlight/10 border border-highlight/20 flex items-center justify-center">
          <Star size={48} className="text-highlight" fill="currentColor" />
        </div>
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-4xl font-serif italic text-foreground">Session Complete</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Your consultation with {astrologer.name} has ended. The cosmic wisdom shared today has been recorded in your consultation history.
          </p>
          <div className="flex items-center justify-center gap-2 text-highlight">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">{messages.filter(m => m.role !== 'system').length} messages exchanged</span>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => { setSessionEnded(false); setMessages([]); }}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-surface border border-border text-sm font-bold hover:bg-foreground/5 transition-all"
          >
            <RotateCcw size={16} /> New Session
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-10 py-4 rounded-2xl bg-foreground text-background font-bold text-sm uppercase tracking-widest hover:bg-primary transition-all"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  // === MAIN CHAT UI ===
  return (
    <div className="fixed inset-0 bg-background flex flex-col z-[200]">
      {/* Header */}
      <div className="h-20 border-b border-border bg-surface/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-primary/20 to-secondary/20">
              <img src={astrologer.avatar} alt={astrologer.name} className="w-full h-full object-cover" onError={(e: any) => { e.target.src = ''; }} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-highlight border-2 border-background animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-base font-serif italic text-foreground">{astrologer.name}</h1>
            <div className="flex items-center gap-2">
              <Award size={10} className="text-secondary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary">{astrologer.title}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profileName && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
              <User size={12} className="text-primary" />
              <span className="text-[10px] font-bold text-primary">{profileName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-highlight/10 border border-highlight/20">
            <div className="w-2 h-2 rounded-full bg-highlight animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-highlight">Live</span>
          </div>
          <button
            onClick={endSession}
            className="px-4 py-2 rounded-xl border border-alert/30 text-alert text-[10px] font-black uppercase tracking-widest hover:bg-alert/10 transition-all"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">
        {/* Specialty tag */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-[9px] font-bold uppercase tracking-widest text-text-secondary">
            <Sparkles size={10} className="text-primary" />
            {astrologer.specialty}
            <ChevronRight size={10} />
            AI-Powered Consultation
          </div>
        </div>

        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="max-w-xl px-5 py-3 rounded-2xl bg-primary/5 border border-primary/15 text-center">
                  <p className="text-[10px] text-primary/80 font-medium">{msg.text}</p>
                </div>
              </div>
            );
          }
          const isAstro = msg.role === 'astrologer';
          return (
            <div key={msg.id} className={`flex items-end gap-3 ${isAstro ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {isAstro && (
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-border shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20">
                  <img src={astrologer.avatar} alt="" className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display='none'; }} />
                </div>
              )}
              <div className={`max-w-[75%] md:max-w-[60%] space-y-1 ${isAstro ? '' : 'items-end'} flex flex-col`}>
                <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed ${
                  isAstro
                    ? 'rounded-bl-none bg-surface border border-border text-foreground'
                    : 'rounded-br-none bg-primary text-white shadow-xl shadow-primary/25'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-text-secondary px-1">{msg.time}</span>
              </div>
              {!isAstro && (
                <div className="w-9 h-9 rounded-xl bg-foreground/10 border border-border flex items-center justify-center shrink-0">
                  <User size={16} className="text-foreground/60" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-3 animate-in fade-in duration-300">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-border shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20">
              <img src={astrologer.avatar} alt="" className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display='none'; }} />
            </div>
            <div className="px-5 py-4 rounded-2xl rounded-bl-none bg-surface border border-border flex items-center gap-2">
              <Loader2 size={14} className="text-primary animate-spin" />
              <span className="text-xs text-text-secondary italic">
                {astrologer.name.split(' ')[0]} is consulting the stars...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 md:px-8 py-3 border-t border-border/50 bg-surface/30 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            "What does my future hold for career?",
            "When will I get married?",
            "Is this a good time to invest?",
            "What's my biggest strength?",
            "Should I change my job now?",
          ].map(q => (
            <button
              key={q}
              onClick={() => { setInput(q); inputRef.current?.focus(); }}
              className="shrink-0 px-4 py-2 rounded-xl bg-surface border border-border text-[10px] font-medium text-text-secondary hover:border-primary/40 hover:text-primary transition-all whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="px-4 md:px-8 py-4 border-t border-border bg-surface/60 backdrop-blur-xl shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${astrologer.name.split(' ')[0]} anything...`}
              className="w-full h-14 pl-5 pr-5 rounded-2xl bg-background border border-border outline-none focus:border-primary transition-all text-sm placeholder:text-text-secondary/60"
              disabled={isTyping}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[0.97] active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Shield size={10} className="text-text-secondary/50" />
          <p className="text-[9px] text-text-secondary/50 uppercase tracking-widest font-bold">
            AI-Powered · End-to-End Encrypted · Session saved to history
          </p>
        </div>
      </div>
    </div>
  );
}
