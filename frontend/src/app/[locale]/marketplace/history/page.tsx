"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Clock, MessageSquare, ChevronRight, ArrowLeft, Calendar, User, ChevronDown } from 'lucide-react';
import { useActiveProfile } from '@/hooks/useActiveProfile';

export default function HistoryPage() {
  const { profiles, activeProfileId, selectProfile, parsedActive, isLoggedIn, loading: profileLoading } = useActiveProfile();
  const [history, setHistory] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const astrologers: any = {
    '1': { name: 'Acharya Rahul', image: '/images/astrologers/rahul.png' },
    '2': { name: 'Smt. Kavita', image: '/images/astrologers/kavita.png' },
    '3': { name: 'Dr. Sanjay', image: '/images/astrologers/sanjay.png' },
    '4': { name: 'Swami Ji', image: '/images/astrologers/swami.png' },
    '5': { name: 'Astrologer Priya', image: '/images/astrologers/priya.png' },
    '6': { name: 'Guru Dev', image: '/images/astrologers/guru.png' }
  };

  useEffect(() => {
    if (!profileLoading) {
      fetchHistory();
    }
  }, [profileLoading, activeProfileId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/consultation/history`);
      if (parsedActive?.name) {
        url.searchParams.append('profile_name', parsedActive.name);
      }
      const res = await fetch(url.toString());
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/consultation/history/${sessionId}`);
      const data = await res.json();
      setSelectedSession(data);
    } catch (e) {
      console.error("Failed to fetch session details", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="relative pt-32 pb-20 px-6 min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => selectedSession ? setSelectedSession(null) : router.push('/marketplace')}
              className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-4xl font-serif italic">
              {selectedSession ? 'Session Details' : 'Consultation History'}
            </h1>
          </div>
          {!selectedSession && (
             <div className="flex items-center gap-4">
                {isLoggedIn && profiles.length > 0 && (
                  <div className="relative">
                    <select
                      value={activeProfileId || ''}
                      onChange={(e) => selectProfile(parseInt(e.target.value))}
                      className="h-10 pl-4 pr-10 rounded-full bg-surface border border-border text-xs font-bold text-foreground focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">All Consultations</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id} className="bg-background">{p.full_name || 'Unknown'}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                  </div>
                )}
                <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hidden md:block">
                  {history.length} Saved
                </div>
             </div>
          )}
        </div>

        {selectedSession ? (
          /* Detailed View */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 rounded-3xl bg-surface border border-border flex items-center gap-6">
               <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border shadow-md">
                 <img 
                    src={astrologers[selectedSession.astrologer_id]?.image || '/images/astrologers/rahul.png'} 
                    alt="Astro" 
                    className="w-full h-full object-cover"
                 />
               </div>
               <div>
                  <h2 className="text-2xl font-serif italic text-foreground">
                    {astrologers[selectedSession.astrologer_id]?.name || 'Acharya'}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                    <div className="flex items-center gap-1.5"><Calendar size={12} /> Session ID: {selectedSession.session_id?.substring(0, 12) || 'Unknown'}...</div>
                  </div>
               </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-surface/50 border border-border space-y-6">
              {(selectedSession.messages || []).length === 0 ? (
                <p className="text-center text-text-secondary italic py-10">No messages recorded for this session.</p>
              ) : (
                (selectedSession.messages || []).map((msg: any, idx: number) => {
                  const isUser = msg.role === 'user';
                  const isAstro = ['astro', 'astrologer', 'assistant'].includes(msg.role);
                  if (!isUser && !isAstro) return null; // skip system messages
                  return (
                    <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] space-y-1`}>
                        <p className={`text-[9px] font-black uppercase tracking-widest px-2 ${
                          isUser ? 'text-right text-primary/60' : 'text-left text-text-secondary/60'
                        }`}>
                          {isUser ? 'You' : (astrologers[selectedSession.astrologer_id]?.name || 'Astrologer')}
                        </p>
                        <div className={`p-4 rounded-3xl text-sm leading-relaxed ${
                          isUser
                            ? 'bg-foreground text-background rounded-tr-none'
                            : 'bg-background border border-border text-foreground rounded-tl-none shadow-sm'
                        }`}>
                          {msg.text || msg.content || ''}
                        </div>
                        <p className={`text-[8px] font-bold text-text-secondary px-2 ${
                          isUser ? 'text-right' : 'text-left'
                        }`}>{msg.time || ''}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="grid gap-4">
            {history.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto text-text-secondary/40">
                  <MessageSquare size={32} />
                </div>
                <p className="text-text-secondary italic">No consultation history found yet.</p>
                <button onClick={() => router.push('/marketplace')} className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline">Start your first session</button>
              </div>
            ) : (
              history.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => fetchSessionDetails(item.session_id)}
                  className="p-5 rounded-3xl bg-surface border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer flex items-center gap-6"
                >
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-border shrink-0">
                    <img 
                      src={astrologers[item.astrologer_id]?.image || '/images/astrologers/rahul.png'} 
                      alt="Astro" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-serif italic text-foreground">
                        {astrologers[item.astrologer_id]?.name || 'Acharya'}
                      </h3>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/70">{item.session_date || '—'}</p>
                        <p className="text-[9px] font-medium text-text-secondary/60 mt-0.5">{item.session_time || ''}</p>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-1 mt-1 italic font-normal">"{item.last_message}"</p>

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary">
                        <MessageSquare size={12} /> {item.message_count} Messages
                      </div>
                      <div className="w-1 h-1 rounded-full bg-border"></div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-text-secondary/70">
                        <Clock size={12} />
                        {item.start_time || '—'} → {item.end_time || '—'}
                      </div>
                      {item.duration_label && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-border"></div>
                          <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">
                            {item.duration_label}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
