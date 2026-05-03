"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Namaste! I am your AI Jyotishi. To provide the most precise insights, I need a few details. What is your full name?' }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<'NAME' | 'DOB' | 'TIME' | 'PLACE' | 'READY'>('NAME');
  const [userData, setUserData] = useState({ name: '', dob: '', time: '', place: '', lat: 28.6, lon: 77.2 });
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // Step-by-step data collection
    if (step === 'NAME') {
      setTimeout(() => {
        setUserData(prev => ({ ...prev, name: userMsg }));
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Nice to meet you, **${userMsg}**. What is your date of birth? (DD/MM/YYYY)` 
        }]);
        setStep('DOB');
        setIsTyping(false);
      }, 800);
    } else if (step === 'DOB') {
      setTimeout(() => {
        setUserData(prev => ({ ...prev, dob: userMsg }));
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Thank you. And what was the exact time of your birth? (e.g., 14:30 or 02:30 PM)` 
        }]);
        setStep('TIME');
        setIsTyping(false);
      }, 800);
    } else if (step === 'TIME') {
      setTimeout(() => {
        setUserData(prev => ({ ...prev, time: userMsg }));
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Almost there! Finally, what is your city of birth?` 
        }]);
        setStep('PLACE');
        setIsTyping(false);
      }, 800);
    } else if (step === 'PLACE') {
      setTimeout(() => {
        setUserData(prev => ({ ...prev, place: userMsg }));
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Perfect. I have synchronized your birth details with the cosmic clock. What would you like to know about your destiny today?` 
        }]);
        setStep('READY');
        setIsTyping(false);
      }, 1000);
    } else {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: userData.name, query: userMsg })
        });
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        const aiResponse = data.response || "The stars are silent right now. Try asking again.";
        
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I am having trouble connecting to the cosmos right now. Please try again." 
        }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <main className="relative pt-32 pb-10 px-6 h-screen flex flex-col text-foreground">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col bg-surface border border-border rounded-[3rem] backdrop-blur-xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 border-b border-border bg-foreground/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-background font-bold">✨</div>
            <div>
              <h2 className="font-bold text-foreground">Astro AI Assistant</h2>
              <p className="text-[10px] text-highlight uppercase tracking-widest font-bold">Online • Parashari Expert</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full bg-foreground/5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
            3 Credits Free / Day
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-6 rounded-[2rem] ${
                m.role === 'user' 
                  ? 'bg-foreground text-background rounded-tr-none shadow-lg' 
                  : 'bg-surface text-foreground/90 rounded-tl-none border border-border'
              }`}>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {m.role === 'user' ? (userData.name || 'You') : 'Astro AI'}
                </div>
                <p className="text-sm leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-surface p-6 rounded-[2rem] rounded-tl-none border border-border flex gap-1">
                <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 bg-foreground/5 border-t border-border">
          <form onSubmit={handleSend} className="flex gap-4">
            <input
              type="text"
              placeholder="Ask about your career, marriage, or wealth..."
              className="flex-1 h-14 px-8 rounded-full bg-surface border border-border focus:border-secondary outline-none transition-all text-foreground placeholder:text-text-secondary/40"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="h-14 w-14 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-secondary transition-all shadow-xl"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </form>
          {step === 'READY' && (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
               {[
                 'When will I get a job?', 
                 'When will I get married?', 
                 'Will my finances improve?', 
                 'Business or Job?',
                 'Any doshas in my chart?'
               ].map(tag => (
                 <button 
                   key={tag} 
                   onClick={() => setInput(tag)} 
                   className="text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-foreground hover:bg-foreground/5 transition-all px-3 py-1.5 border border-border rounded-full"
                 >
                   {tag}
                 </button>
               ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
