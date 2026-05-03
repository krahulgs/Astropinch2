"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Sparkles, ArrowRight, CheckCircle2, UploadCloud, User, Mail, Phone, Briefcase, Languages, FileText } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`;

export default function AstrologerApplyPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    experience_years: '',
    specialties: '',
    languages: '',
    bio: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Process comma separated arrays
    const specialtiesArray = formData.specialties.split(',').map(s => s.trim()).filter(s => s);
    const languagesArray = formData.languages.split(',').map(s => s.trim()).filter(s => s);

    try {
      const response = await fetch(`${API_BASE_URL}/api/astrologers/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          experience_years: parseInt(formData.experience_years, 10),
          specialties: specialtiesArray,
          languages: languagesArray,
          profile_image: null,
          documents: [] // Skipping actual S3 upload logic for the demo
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to submit application');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-md w-full bg-surface border border-border rounded-[2rem] p-10 text-center relative z-10 shadow-2xl">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-serif italic mb-4">Application Received</h2>
          <p className="text-text-secondary font-light mb-8">
            Thank you for applying to join the AstroPinch network. Our backoffice team will review your credentials and get back to you within 48 hours.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-primary/20">
            Return to Home <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-surface border border-border text-primary text-[10px] font-black uppercase tracking-widest shadow-lg">
            <Sparkles size={14} /> Join India's Most Premium Astrologer Network
          </div>
          <h1 className="text-5xl md:text-6xl font-serif italic tracking-tight">Become an AstroPinch Guru</h1>
          <p className="text-xl text-text-secondary font-light max-w-2xl mx-auto">
            Bring your Vedic wisdom to millions of seekers worldwide. Fill out the application below to get verified.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-[2rem] p-8 md:p-12 shadow-2xl relative z-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2"><User size={14} /> Full Name</label>
                  <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm" placeholder="Acharya Rahul Sharma" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2"><Mail size={14} /> Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm" placeholder="rahul@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2"><Phone size={14} /> Phone Number</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm" placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2"><Briefcase size={14} /> Experience (Years)</label>
                  <input required type="number" min="0" name="experience_years" value={formData.experience_years} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm" placeholder="15" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Professional Expertise</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2"><Sparkles size={14} /> Specialties (Comma separated)</label>
                  <input required type="text" name="specialties" value={formData.specialties} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm" placeholder="Vedic, KP Astrology, Vastu, Numerology" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2"><Languages size={14} /> Languages Spoken (Comma separated)</label>
                  <input required type="text" name="languages" value={formData.languages} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm" placeholder="Hindi, English, Sanskrit" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2"><FileText size={14} /> Professional Bio</label>
                  <textarea required name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm resize-none" placeholder="Tell us about your lineage, approach to astrology, and how you help seekers..."></textarea>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">Verification Documents</h3>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} className="text-primary" />
                </div>
                <p className="font-bold text-foreground">Upload Govt. ID & Astrology Certifications</p>
                <p className="text-xs text-text-secondary mt-2">PDF, JPG, PNG (Max 5MB)</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="pt-4">
              <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'} <ArrowRight size={16} />
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
