'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Calendar, Clock, Briefcase, Mail, Phone, Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import AnimatedZodiacBackground from '@/components/AnimatedZodiacBackground';
import Link from 'next/link';
import Image from 'next/image';
import { PROFESSION_CATEGORIES } from '@/constants/professions';

interface CitySuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

// ── Spec-compliant validation rules ───────────────────────────────────────
const VALIDATORS = {
  // Full Name: requires first + last name, letters/spaces/hyphens/apostrophes, 2–60 chars
  fullName: (v: string) => {
    const t = v.trim();
    if (!t) return 'Full name is required.';
    if (t.length > 60) return 'Name must be under 60 characters.';
    if (!/^[A-Za-z]+([ '\-][A-Za-z]+)+$/.test(t)) {
      if (!t.includes(' ') && !t.includes('-') && !t.includes("'"))
        return 'Enter at least first and last name.';
      return 'Only letters, spaces, hyphens, and apostrophes allowed.';
    }
    return '';
  },

  // Email: RFC 5322 practical subset, max 254 chars, normalized lowercase
  email: (v: string) => {
    const t = v.trim().toLowerCase();
    if (!t) return 'Valid email is required.';
    if (t.length > 254) return 'Valid email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return 'Valid email is required.';
    return '';
  },

  // Mobile: international standard \+?[1-9]\d{9,14}
  mobileNumber: (v: string) => {
    const t = v.trim().replace(/[\s\-]/g, '');
    if (!t) return 'Valid mobile number is required.';
    if (!/^\+?[1-9]\d{9,14}$/.test(t)) return 'Valid mobile number is required.';
    return '';
  },

  // Password: 8–64 chars, upper+lower+digit+special, no spaces
  password: (v: string) => {
    if (!v) return 'Password must be 8–64 characters with uppercase, lowercase, number, and special character.';
    if (v.includes(' ')) return 'Password must not contain spaces.';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,64}$/.test(v))
      return 'Password must be 8–64 characters with uppercase, lowercase, number, and special character.';
    return '';
  },

  // Birth Date: valid calendar date, age 13–120
  birthDate: (d: string, m: string, y: string) => {
    if (!d || !m || !y) return 'Valid birth date is required.';
    const day = parseInt(d), month = parseInt(m), year = parseInt(y);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Valid birth date is required.';
    if (month < 1 || month > 12) return 'Month must be 01–12.';
    if (day < 1 || day > 31) return 'Day must be 01–31.';
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
      return 'Invalid date — check DD / MM / YYYY (e.g. Feb 31 does not exist).';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date >= today) return 'Valid birth date is required.';
    const age = (today.getTime() - date.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (age < 13) return 'You must be at least 13 years old.';
    if (age > 120) return 'Age cannot exceed 120 years.';
    return '';
  },

  // Birth Time: optional, validates HH 00–23, MM 00–59 when filled
  birthTime: (h: string, m: string) => {
    if (!h && !m) return '';
    const hh = h.padStart(2, '0'), mm = m.padStart(2, '0');
    if (!/^([01]\d|2[0-3])$/.test(hh)) return 'Enter valid 24-hour time (HH: 00–23).';
    if (!/^[0-5]\d$/.test(mm)) return 'Enter valid 24-hour time (MM: 00–59).';
    return '';
  },

  // Birth Place: letters/spaces/commas/dots/hyphens, 2–100 chars
  birthPlace: (lat: string, lon: string, place: string) => {
    if (!place.trim()) return 'Birth place is required.';
    if (!lat || !lon) return 'Select a birth place from the dropdown suggestions.';
    if (place.trim().length < 2 || place.trim().length > 100) return 'Birth place must be 2–100 characters.';
    return '';
  },
};

type FieldErrors = Record<'fullName'|'email'|'mobileNumber'|'password'|'birthDate'|'birthTime'|'birthPlace'|'profession'|'gender', string>;
type FieldValid  = Partial<Record<keyof FieldErrors, boolean>>;
const EMPTY_ERRORS: FieldErrors = { fullName:'', email:'', mobileNumber:'', password:'', birthDate:'', birthTime:'', birthPlace:'', profession:'', gender:'' };

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
  const [serverWarm, setServerWarm] = useState(false); // tracks if API is warmed up
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // ── Warm up the production API as soon as the page loads ──
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    fetch(`${apiUrl}/health`, { method: 'GET' })
      .then(() => setServerWarm(true))
      .catch(() => setServerWarm(true)); // even on error, stop showing spinner
  }, []);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP State
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');

  // Validation state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(EMPTY_ERRORS);
  const [fieldValid,  setFieldValid]  = useState<FieldValid>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FieldErrors, boolean>>>({});

  const touch = (f: keyof FieldErrors) => setTouched(p => ({ ...p, [f]: true }));
  const setFE  = (f: keyof FieldErrors, msg: string) => {
    setFieldErrors(p => ({ ...p, [f]: msg }));
    setFieldValid(p  => ({ ...p, [f]: msg === '' }));
  };

  // Dynamic input class: red = error, green = valid, default otherwise
  const iClass = (f: keyof FieldErrors) =>
    `w-full bg-background/50 border rounded-2xl py-2.5 pl-12 pr-10 text-sm focus:outline-none transition-all ${
      touched[f] && fieldErrors[f]
        ? 'border-red-500/60 focus:border-red-500'
        : touched[f] && fieldValid[f]
        ? 'border-green-500/60 focus:border-green-500'
        : 'border-border focus:border-primary/50'
    }`;

  // Inline field message — red error or green success tick
  const FE = ({ f }: { f: keyof FieldErrors }) => {
    if (touched[f] && fieldErrors[f])
      return <p id={`${f}-error`} role="alert" className="flex items-center gap-1 text-red-400 text-[10px] mt-1 ml-3"><AlertCircle size={10}/>{fieldErrors[f]}</p>;
    if (touched[f] && fieldValid[f])
      return <p className="flex items-center gap-1 text-green-500 text-[10px] mt-1 ml-3"><CheckCircle2 size={10}/>Looks good!</p>;
    return null;
  };

  const validateAll = (): boolean => {
    const e: FieldErrors = {
      fullName:     VALIDATORS.fullName(fullName),
      email:        VALIDATORS.email(email),
      mobileNumber: VALIDATORS.mobileNumber(mobileNumber),
      password:     VALIDATORS.password(password),
      birthDate:    VALIDATORS.birthDate(day, month, year),
      birthTime:    VALIDATORS.birthTime(hour, minute),
      birthPlace:   VALIDATORS.birthPlace(lat, lon, birthPlace),
      profession:   !profession ? 'Please select your profession.' : '',
      gender:       !gender ? 'Please select gender.' : '',
    };
    const v: FieldValid = Object.fromEntries(
      (Object.keys(e) as (keyof FieldErrors)[]).map(k => [k, e[k] === ''])
    );
    setFieldErrors(e);
    setFieldValid(v);
    setTouched({ fullName:true, email:true, mobileNumber:true, password:true, birthDate:true, birthTime:true, birthPlace:true, profession:true, gender:true });
    return Object.values(e).every(v => v === '');
  };
  
  const handleCitySearch = async (query: string) => {
    setBirthPlace(query);
    setLat(''); setLon('');
    if (query.length > 0) setFE('birthPlace', VALIDATORS.birthPlace('', '', query));
    else setFE('birthPlace', '');
    if (query.length < 3) { setSuggestions([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${apiUrl}/geo/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data);
        setServerWarm(true);
      } catch (err) { console.error(err); }
      finally { setIsSearching(false); }
    }, 300);
  };

  const selectCity = (city: CitySuggestion) => {
    setBirthPlace(city.display_name);
    setLat(city.lat); setLon(city.lon);
    setSuggestions([]);
    setFE('birthPlace', '');
    touch('birthPlace');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateAll()) {
      setError('Please fix the highlighted errors before continuing.');
      return;
    }

    setLoading(true);
    const birthDate = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    const birthTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
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
        if (data.otp) {
          alert(`Your Registration OTP is: ${data.otp}`);
        }
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
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
    <div className="min-h-screen text-foreground overflow-hidden relative selection:bg-primary/30 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
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
        <div className="w-full lg:w-7/12 xl:w-1/2 p-6 md:p-8 lg:p-10 relative flex flex-col justify-center">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>

          <div className="text-center lg:text-left mb-5 relative z-10">
            <h1 className="text-3xl font-serif italic tracking-tight mb-1">Join AstroPinch</h1>
            <p className="text-text-secondary font-normal text-sm">Begin your journey to understand the cosmos.</p>
          </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {!showOtp ? (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input type="text" value={fullName} onChange={(e) => { setFullName(e.target.value); if (touched.fullName) setFE('fullName', VALIDATORS.fullName(e.target.value)); }} onBlur={() => { touch('fullName'); setFE('fullName', VALIDATORS.fullName(fullName)); }} placeholder="John Doe" aria-invalid={!!(touched.fullName && fieldErrors.fullName)} aria-describedby="fullName-error" className={iClass('fullName')} />
                </div>
                <FE f="fullName" />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (touched.email) setFE('email', VALIDATORS.email(e.target.value)); }} onBlur={() => { const n = email.trim().toLowerCase(); setEmail(n); touch('email'); setFE('email', VALIDATORS.email(n)); }} placeholder="john@example.com" aria-invalid={!!(touched.email && fieldErrors.email)} aria-describedby="email-error" className={iClass('email')} />
                </div>
                <FE f="email" />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input type="tel" value={mobileNumber} onChange={(e) => { setMobileNumber(e.target.value); if (touched.mobileNumber) setFE('mobileNumber', VALIDATORS.mobileNumber(e.target.value)); }} onBlur={() => { touch('mobileNumber'); setFE('mobileNumber', VALIDATORS.mobileNumber(mobileNumber)); }} placeholder="+91 9876543210" aria-invalid={!!(touched.mobileNumber && fieldErrors.mobileNumber)} aria-describedby="mobileNumber-error" className={iClass('mobileNumber')} />
                </div>
                <FE f="mobileNumber" />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); if (touched.password) setFE('password', VALIDATORS.password(e.target.value)); }} onBlur={() => { touch('password'); setFE('password', VALIDATORS.password(password)); }} placeholder="••••••••" aria-invalid={!!(touched.password && fieldErrors.password)} aria-describedby="password-error" className={iClass('password')} />
                </div>
                <FE f="password" />
              </div>

              {/* Birth Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Birth Date</label>
                <div className="flex gap-2 w-full">
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={day}   onChange={(e) => setDay(e.target.value.replace(/\D/g,''))}   onBlur={() => { touch('birthDate'); setFE('birthDate', VALIDATORS.birthDate(day, month, year)); }} placeholder="DD"   className={`w-[28%] min-w-0 bg-background/50 border rounded-2xl py-2.5 px-2 text-center text-sm focus:outline-none transition-all ${touched.birthDate && fieldErrors.birthDate ? 'border-red-500/60' : 'border-border focus:border-primary/50'}`} />
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={month} onChange={(e) => setMonth(e.target.value.replace(/\D/g,''))} onBlur={() => { touch('birthDate'); setFE('birthDate', VALIDATORS.birthDate(day, month, year)); }} placeholder="MM"   className={`w-[28%] min-w-0 bg-background/50 border rounded-2xl py-2.5 px-2 text-center text-sm focus:outline-none transition-all ${touched.birthDate && fieldErrors.birthDate ? 'border-red-500/60' : 'border-border focus:border-primary/50'}`} />
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={year}  onChange={(e) => setYear(e.target.value.replace(/\D/g,''))}  onBlur={() => { touch('birthDate'); setFE('birthDate', VALIDATORS.birthDate(day, month, year)); }} placeholder="YYYY" className={`flex-1 min-w-0 bg-background/50 border rounded-2xl py-2.5 px-2 text-center text-sm focus:outline-none transition-all ${touched.birthDate && fieldErrors.birthDate ? 'border-red-500/60' : 'border-border focus:border-primary/50'}`} />
                </div>
                <FE f="birthDate" />
              </div>

              {/* Birth Time */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Birth Time (24h)</label>
                <div className="flex gap-2 w-full">
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={hour}   onChange={(e) => setHour(e.target.value.replace(/\D/g,''))}   onBlur={() => { touch('birthTime'); setFE('birthTime', VALIDATORS.birthTime(hour, minute)); }} placeholder="HH" className={`flex-1 min-w-0 bg-background/50 border rounded-2xl py-2.5 px-2 text-center text-sm focus:outline-none transition-all ${touched.birthTime && fieldErrors.birthTime ? 'border-red-500/60' : 'border-border focus:border-primary/50'}`} />
                  <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={minute} onChange={(e) => setMinute(e.target.value.replace(/\D/g,''))} onBlur={() => { touch('birthTime'); setFE('birthTime', VALIDATORS.birthTime(hour, minute)); }} placeholder="MM" className={`flex-1 min-w-0 bg-background/50 border rounded-2xl py-2.5 px-2 text-center text-sm focus:outline-none transition-all ${touched.birthTime && fieldErrors.birthTime ? 'border-red-500/60' : 'border-border focus:border-primary/50'}`} />
                </div>
                <FE f="birthTime" />
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
                    onBlur={() => touch('birthPlace')}
                    placeholder="Search city/town"
                    className={`w-full bg-background/50 border rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none transition-all ${touched.birthPlace && fieldErrors.birthPlace ? 'border-red-500/60 focus:border-red-500' : 'border-border focus:border-primary/50'}`}
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
                <FE f="birthPlace" />
              </div>

              {/* Profession */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Profession</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                  <select value={profession} onChange={(e) => { setProfession(e.target.value); setFE('profession', e.target.value ? '' : 'Please select your profession.'); touch('profession'); }} className={`w-full bg-background/50 border rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none appearance-none transition-all ${touched.profession && fieldErrors.profession ? 'border-red-500/60' : 'border-border focus:border-primary/50'}`}>
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
                <FE f="profession" />
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary ml-3">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Male', 'Female'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => { setGender(g); setFE('gender', ''); touch('gender'); }}
                      className={`py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all border ${
                        gender === g
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                          : touched.gender && fieldErrors.gender
                          ? 'bg-background/50 border-red-500/60 text-text-secondary'
                          : 'bg-background/50 border-border text-text-secondary hover:border-primary/30 hover:bg-background/80'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <FE f="gender" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs hover:bg-primary transition-all duration-300 shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> Continue to Verification</>}
            </button>

            <p className="text-center text-sm text-text-secondary mt-3">
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

            <div className="space-y-1">
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
