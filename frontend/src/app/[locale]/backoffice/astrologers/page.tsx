"use client";

import { useState, useEffect } from 'react';
import { Check, X, ShieldAlert, User, Briefcase, FileText, ChevronRight, Settings } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`;

interface AstrologerApp {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  experience_years: number;
  specialties: string[];
  languages: string[];
  bio: string;
  status: string;
  created_at: string;
}

export default function BackofficeAstrologers() {
  const [applications, setApplications] = useState<AstrologerApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<AstrologerApp | null>(null);
  
  // Approval Form State
  const [ratePerMin, setRatePerMin] = useState('50');
  const [aiPrompt, setAiPrompt] = useState('Warm and precise. Uses phrases like "The stars indicate..."');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/backoffice/astrologers?status=PENDING`);
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/backoffice/astrologers/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate_per_min: parseInt(ratePerMin, 10),
          ai_persona_prompt: aiPrompt
        })
      });
      if (res.ok) {
        setApplications(applications.filter(app => app.id !== id));
        setSelectedApp(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this application?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/backoffice/astrologers/${id}/reject`, {
        method: 'PUT'
      });
      if (res.ok) {
        setApplications(applications.filter(app => app.id !== id));
        setSelectedApp(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background text-foreground pt-32 px-6 text-center">Loading applications...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10 border-b border-border pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif italic mb-2">Astrologer Applications</h1>
            <p className="text-text-secondary text-sm">Review, verify, and approve new experts to join the marketplace.</p>
          </div>
          <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={16} /> Secure Backoffice
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-3xl border border-border">
            <p className="text-text-secondary">No pending applications at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* List Column */}
            <div className="col-span-1 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">Pending Review ({applications.length})</h3>
              {applications.map(app => (
                <div 
                  key={app.id} 
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedApp?.id === app.id ? 'bg-primary/10 border-primary shadow-[0_0_20px_-5px] shadow-primary/20' : 'bg-surface border-border hover:border-primary/50'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm">{app.full_name}</h4>
                    <span className="text-[10px] text-text-secondary">{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-text-secondary truncate">{app.specialties.join(', ')}</p>
                </div>
              ))}
            </div>

            {/* Detail Column */}
            <div className="col-span-2">
              {selectedApp ? (
                <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-8 border-b border-border pb-6">
                    <div>
                      <h2 className="text-2xl font-serif italic mb-1">{selectedApp.full_name}</h2>
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span className="flex items-center gap-1"><Mail size={12} /> {selectedApp.email}</span>
                        <span className="flex items-center gap-1"><Phone size={12} /> {selectedApp.phone}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold">{selectedApp.experience_years}</span>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Years Exp.</p>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 flex items-center gap-2"><Briefcase size={14} /> Expertise & Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.specialties.map(s => <span key={s} className="px-3 py-1 bg-background border border-border rounded-full text-xs">{s}</span>)}
                        {selectedApp.languages.map(l => <span key={l} className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-xs">{l}</span>)}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 flex items-center gap-2"><FileText size={14} /> Biography</h4>
                      <p className="text-sm font-light leading-relaxed p-4 bg-background border border-border rounded-xl">
                        {selectedApp.bio}
                      </p>
                    </div>

                    <div className="p-4 bg-background border border-border rounded-xl border-dashed">
                       <h4 className="text-xs font-bold uppercase text-text-secondary mb-2">Documents (Verification)</h4>
                       <p className="text-xs text-green-500 flex items-center gap-2"><Check size={14} /> ID and Certificates Uploaded (Simulation)</p>
                    </div>
                  </div>

                  {/* Admin Action Area */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mt-8">
                    <h4 className="text-sm font-bold flex items-center gap-2 mb-4 text-primary"><Settings size={16} /> AI Integration Settings</h4>
                    
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="col-span-1 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Starting Rate (₹/min)</label>
                        <input type="number" value={ratePerMin} onChange={(e) => setRatePerMin(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">AI Persona Prompt (Internal)</label>
                        <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={2} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" placeholder="Instruct the AI how to talk like this astrologer..." />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-primary/10">
                      <button disabled={actionLoading} onClick={() => handleApprove(selectedApp.id)} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                        <Check size={16} /> Approve & Activate Profile
                      </button>
                      <button disabled={actionLoading} onClick={() => handleReject(selectedApp.id)} className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-8 min-h-[500px]">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 border border-border">
                    <User size={24} className="text-text-secondary" />
                  </div>
                  <p className="text-text-secondary">Select an application from the left to review.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
