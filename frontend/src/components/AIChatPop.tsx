"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Minus } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatPop() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Namaste! I am your AI Jyotishi. Ask me anything about your future, career, or relationships based on your birth chart.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tokens, setTokens] = useState(3);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('focus', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  if (!isLoggedIn) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || tokens <= 0) return;

    const userMsg = input;
    setInput('');
    setTokens(prev => prev - 1);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Based on your planetary alignments, especially the current transit of Jupiter through your 11th house, the query about "${userMsg}" looks promising. You should see significant developments by the next full moon.` 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[90vw] md:w-[400px] h-[600px] max-h-[70vh] bg-surface border border-border rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500 backdrop-blur-2xl">
          {/* Header */}
          <div className="p-5 border-b border-border bg-foreground/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary/20 border border-secondary/20 flex items-center justify-center text-secondary">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Astro AI Guide</h3>
                <p className="text-[10px] text-highlight uppercase tracking-widest font-black">Live Analysis</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-foreground/5 transition-colors"
            >
              <Minus size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth bg-gradient-to-b from-transparent to-foreground/[0.02]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-foreground text-background rounded-tr-none' 
                    : 'bg-foreground/5 text-foreground/90 rounded-tl-none border border-border'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-foreground/5 p-4 rounded-2xl rounded-tl-none border border-border flex gap-1">
                  <div className="w-1 h-1 bg-foreground/40 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
            {['Career?', 'Marriage?', 'Health?'].map(tag => (
              <button key={tag} onClick={() => setInput(tag)} className="whitespace-nowrap px-3 py-1 rounded-full border border-border text-[9px] font-bold uppercase tracking-widest text-text-secondary hover:border-secondary hover:text-secondary transition-all">
                {tag}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-5 border-t border-border">
            {tokens > 0 ? (
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  placeholder={`Ask your query... (${tokens} tokens left)`}
                  className="w-full h-12 pl-6 pr-14 rounded-2xl bg-foreground/5 border border-transparent focus:border-secondary outline-none transition-all text-xs text-foreground placeholder:text-text-secondary/60"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 h-8 w-8 bg-foreground text-background rounded-xl flex items-center justify-center hover:bg-secondary transition-all"
                >
                  <Send size={14} />
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-2 p-2 bg-secondary/10 rounded-2xl border border-secondary/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">0 Karma Tokens Remaining</p>
                <button className="px-6 py-2 bg-secondary text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-foreground transition-all">
                  Buy 10 Tokens (₹199)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pop Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 group ${
          isOpen ? 'bg-foreground text-background rotate-90' : 'bg-primary text-white hover:bg-secondary'
        }`}
      >
        <div className="relative">
          <div className={`absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></div>
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </div>
        {!isOpen && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-alert text-[8px] font-black rounded-full flex items-center justify-center border-2 border-background animate-bounce shadow-lg">
            1
          </div>
        )}
      </button>
    </div>
  );
}
