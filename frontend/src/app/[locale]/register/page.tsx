'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Calendar, Clock, Briefcase, Mail, Phone, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import AnimatedZodiacBackground from '@/components/AnimatedZodiacBackground';
import Link from 'next/link';
import Image from 'next/image';
import { PROFESSION_CATEGORIES } from '@/constants/professions';

interface CitySuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function RegisterPage() {
  const router = useRouter();
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [profession, setProfession] = useState('');
  
  // Date and Time
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  
  // Location
  const [birthPlace, setBirthPlace] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP State
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleCitySearch = async (query: string) => {
    setBirthPlace(query);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/geo/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const selectCity = (city: CitySuggestion) => {
    setBirthPlace(city.display_name);
    setLat(city.lat);
    setLon(city.lon);
    setSuggestions([]);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!lat || !lon) {
      setError('Please select a valid birth place from the suggestions.');
      return;
    }
    if (!gender) {
      setError('Please select a gender.');
      return;
    }

    setLoading(true);
    const birthDate = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    const birthTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          mobile_number: mobileNumber,
          password,
          birth_date: birthDate,
          birth_time: birthTime,
          birth_place: birthPlace,
          lat,
          lon,
          profession,
          gender
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowOtp(true);
      } else {
        setError(data.detail || 'Registration failed.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await res.json();
      if (res.ok) {
        router.push('/admin/users');
      } else {
        setError(data.detail || 'Invalid OTP.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground overflow-hidden relative selection:bg-primary/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AnimatedZodiacBackground />

      <div className="relative z-10 w-full max-w-6xl bg-surface/40 backdrop-blur-xl border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side Image Hook */}
        <div className="hidden lg:block lg:w-5/12 xl:w-1/2 relative bg-background/50 border-r border-border/50">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10"></div>
          <Image 
            src="/images/registration-hook.png" 
            alt="Astrology Journey" 
            fill 
            className="object-cover object-center"
            priority
          />
          <div className="absolute bottom-12 left-10 right-10 z-20 text-white space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-2">
               Cosmic Calling
            </div>
            <h2 className="text-4xl xl:text-5xl font-serif italic drop-shadow-lg leading-tight">Unlock Your True Destiny</h2>
            <p className="font-normal text-white/80 drop-shadow-md text-sm xl:text-base max-w-md">Join thousands of cosmic seekers who have found clarity and purpose through AstroPinch's ancient wisdom and modern AI.</p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-7/12 xl:w-1/2 p-8 md:p-12 lg:p-16 relative flex flex-col justify-center">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>

          <div className="text-center lg:text-left mb-10 relative z-10">
            <h1 className="text-4xl font-serif italic tracking-tight mb-2">Join AstroPinch</h1>
            <p className="text-text-secondary font-normal">Begin your journey to understand the cosmos.</p>
          </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {!showOtp ? (
          <form onSubmit={handleRegister} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="John Doe" className="w-full bg-background/50 border border-border rounded-2xl py-3 md:py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john@example.com" className="w-full bg-background/50 border border-border rounded-2xl py-3 md:py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required placeholder="+91 9876543210" className="w-full bg-background/50 border border-border rounded-2xl py-3 md:py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-background/50 border border-border rounded-2xl py-3 md:py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Birth Date</label>
                <div className="flex gap-2 w-full">
                  <input type="text" maxLength={2} value={day} onChange={(e) => setDay(e.target.value)} placeholder="DD" required className="w-[28%] min-w-0 bg-background/50 border border-border rounded-2xl py-3 md:py-3.5 px-2 text-center text-sm focus:outline-none focus:border-primary/50 transition-all" />
                  <input type="text" maxLength={2} value={month} onChange={(e) => setMonth(e.target.value)} placeholder="MM" required className="w-[28%] min-w-0 bg-background/50 border border-border rounded-2xl py-3 md:py-3.5 px-2 text-center text-sm focus:outline-none focus:border-primary/50 transition-all" />
                  <input type="text" maxLength={4} value={year} onChange={(e) => setYear(e.target.value)} placeholder="YYYY" required className="flex-1 min-w-0 bg-background/50 border border-border rounded-2xl py-3 md:py-3.5 px-2 text-center text-sm focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>

              {/* Birth Time */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Birth Time (24h)</label>
                <div className="flex gap-2 w-full">
                  <input type="text" maxLength={2} value={hour} onChange={(e) => setHour(e.target.value)} placeholder="HH" required className="flex-1 min-w-0 bg-background/50 border border-border rounded-2xl py-3 md:py-3.5 px-2 text-center text-sm focus:outline-none focus:border-primary/50 transition-all" />
                  <input type="text" maxLength={2} value={minute} onChange={(e) => setMinute(e.target.value)} placeholder="MM" required className="flex-1 min-w-0 bg-background/50 border border-border rounded-2xl py-3 md:py-3.5 px-2 text-center text-sm focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>

              {/* Birth Place */}
              <div className="space-y-2 md:col-span-2 relative">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Birth Place</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input 
                    type="text" 
                    value={birthPlace} 
                    onChange={(e) => handleCitySearch(e.target.value)} 
                    placeholder="Search city/town" 
                    required 
                    className="w-full bg-background/50 border border-border rounded-2xl py-3 md:py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all" 
                  />
                  {isSearching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary animate-spin" />}
                </div>
                {suggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-2 bg-surface/90 backdrop-blur-xl border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                    {suggestions.map((city, i) => (
                      <button key={i} type="button" onClick={() => selectCity(city)} className="w-full text-left px-5 py-3 text-sm hover:bg-primary/10 transition-colors border-b border-border/50 last:border-0">
                        {city.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profession */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Profession</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                  <select value={profession} onChange={(e) => setProfession(e.target.value)} required className="w-full bg-background/50 border border-border rounded-2xl py-3 md:py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 appearance-none transition-all">
                    <option value="">Select Profession</option>
                    {Object.entries(PROFESSION_CATEGORIES).map(([category, professions]) => (
                      <optgroup key={category} label={category} className="bg-background text-primary font-bold">
                        {professions.map(p => (
                          <option key={p} value={p} className="bg-background text-foreground">{p}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Male', 'Female'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all border ${
                        gender === g
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                          : 'bg-background/50 border-border text-text-secondary hover:border-primary/30 hover:bg-background/80'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 md:py-4 bg-foreground text-background rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-primary transition-all duration-300 shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> Continue to Verification</>}
            </button>

            <p className="text-center text-sm text-text-secondary mt-6">
              Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Log in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center mb-6">
              <CheckCircle2 size={40} className="text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Check your inbox</h3>
              <p className="text-sm text-text-secondary">
                We've sent a 6-digit verification code to <span className="font-semibold text-foreground">{email}</span>.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Verification Code</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                maxLength={6}
                placeholder="Enter 6-digit OTP" 
                className="w-full bg-background/50 border border-border rounded-2xl py-4 text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:border-primary/50 transition-all" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || otp.length < 6}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-highlight transition-all duration-300 shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Complete'}
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
