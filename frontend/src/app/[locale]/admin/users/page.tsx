'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Trash2, Edit2, Shield, User, MapPin, Briefcase, Heart, Camera, Loader2, X, Star, ExternalLink, Calendar, Clock } from 'lucide-react';
import AnimatedZodiacBackground from '@/components/AnimatedZodiacBackground';
import Image from 'next/image';
import { PROFESSION_CATEGORIES } from '@/constants/professions';

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  birth_place?: string;
  birth_date?: string;
  birth_time?: string;
  lat?: string;
  lon?: string;
  profession?: string;
  gender?: string;
  marital_status?: string;
  profile_image?: string;
}

interface CitySuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');
  const [birthPlace, setBirthPlace] = useState('');
  const [profession, setProfession] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const router = useRouter();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
    const savedId = localStorage.getItem('active_profile_id');
    if (savedId) setActiveProfileId(parseInt(savedId));
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (!data || data.length === 0) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        setUsers(data);
      } else {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/upload-avatar`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setProfileImage(data.url);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
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

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFullName(user.full_name || '');
    setEmail(user.email || '');
    setRole(user.role || 'user');
    setBirthPlace(user.birth_place || '');
    setProfession(user.profession || '');
    setGender(user.gender || '');
    setMaritalStatus(user.marital_status || '');
    setLat(user.lat || '');
    setLon(user.lon || '');
    setProfileImage(user.profile_image || '');

    if (user.birth_date) {
      const [d, m, y] = user.birth_date.split('-');
      setDay(d || ''); setMonth(m || ''); setYear(y || '');
    } else {
      setDay(''); setMonth(''); setYear('');
    }

    if (user.birth_time) {
      const [h, min] = user.birth_time.split(':');
      setHour(h || ''); setMinute(min || '');
    } else {
      setHour(''); setMinute('');
    }

    setShowModal(true);
  };

  const handleViewKundali = (user: UserProfile) => {
    if (!user.birth_date || !user.birth_time || !user.lat || !user.lon) {
      alert('Please complete birth details to view Kundali');
      return;
    }

    // Persist selected profile so Matching, Year Book etc. auto-pick this person
    localStorage.setItem('active_profile_id', user.id.toString());
    setActiveProfileId(user.id);

    const [day, month, year] = user.birth_date.split('-');
    const [hour, minute] = user.birth_time.split(':');

    const query = new URLSearchParams({
      name: user.full_name,
      day,
      month,
      year,
      hour,
      minute,
      lat: user.lat,
      lon: user.lon,
      profession: user.profession || 'General',
      gender: user.gender || ''
    }).toString();
    
    router.push(`/kundali/result?${query}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const birthDate = day && month && year ? `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}` : null;
    const birthTime = hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : null;

    const payload = { 
      email: email || undefined,
      full_name: fullName, 
      role,
      birth_place: birthPlace,
      birth_date: birthDate,
      birth_time: birthTime,
      lat,
      lon,
      profession,
      gender,
      marital_status: maritalStatus,
      profile_image: profileImage
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const url = editingUser 
        ? `${apiUrl}/users/${editingUser.id}` 
        : `${apiUrl}/users`;
      
      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingUser ? payload : { ...payload, password })
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchUsers();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Save failed: ${errData.detail || response.statusText}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please check if the backend is running.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to remove this celestial seeker?')) return;
    const token = localStorage.getItem('token');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('user');
    setBirthPlace('');
    setProfession('');
    setGender('');
    setMaritalStatus('');
    setProfileImage('');
    setDay(''); setMonth(''); setYear('');
    setHour(''); setMinute('');
    setLat(''); setLon('');
    setEditingUser(null);
  };

  const masterUser = users.find(u => u.role === 'master');
  const masterName = masterUser ? masterUser.full_name.split(' ')[0] : '';

  return (
    <div className="min-h-screen text-foreground overflow-hidden relative selection:bg-primary/30">
      <AnimatedZodiacBackground />

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight">
                {masterName ? `${masterName}'s ` : ''}Cosmic Community
              </h1>
              <p className="text-text-secondary font-normal">Oversee your celestial family and access their birth charts.</p>
            </div>
            <button 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-xl shadow-foreground/5 group"
            >
              <UserPlus size={16} className="group-hover:rotate-12 transition-transform" /> Add New Profile
            </button>
          </div>

          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {users.map((user) => {
              const isMaster = user.role === 'master';
              const isActive = activeProfileId === user.id || (!activeProfileId && isMaster);
              return (
                <div 
                  key={user.id} 
                  className={`relative group bg-surface/40 backdrop-blur-xl border rounded-[2.5rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 ${
                    isActive
                      ? 'border-highlight/50 ring-2 ring-highlight/30 bg-highlight/5'
                      : isMaster
                      ? 'border-primary/30 ring-1 ring-primary/20 bg-primary/5 border-border'
                      : 'border-border'
                  }`}
                >
                  {isActive && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-highlight text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-highlight/30 z-20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span> Active
                    </div>
                  )}
                  {isMaster && !isActive && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-primary/30 z-20">
                      Master Profile
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Profile Image */}
                    <div className={`w-24 h-24 rounded-[2rem] overflow-hidden relative border-4 ${
                      isMaster ? 'border-primary/40 shadow-xl shadow-primary/20' : 'border-background/50'
                    }`}>
                      {user.profile_image ? (
                        <Image src={user.profile_image} alt={user.full_name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-text-secondary">
                          {isMaster ? <Shield size={32} /> : <User size={32} />}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className={`text-lg font-bold tracking-tight ${isMaster ? 'text-primary' : 'text-foreground'}`}>
                        {user.full_name}
                      </h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-medium">
                        {user.profession || 'Universal Seeker'}
                      </p>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

                    {/* Detailed Info */}
                    <div className="w-full space-y-3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary">
                          <MapPin size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-bold uppercase text-text-secondary tracking-widest">Birth Place</p>
                          <p className="text-[11px] font-medium truncate">{user.birth_place || 'Unknown'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary">
                          <Calendar size={12} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[8px] font-bold uppercase text-text-secondary tracking-widest">Birth Date</p>
                          <p className="text-[11px] font-medium">{user.birth_date || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary">
                          <Clock size={12} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[8px] font-bold uppercase text-text-secondary tracking-widest">Birth Time</p>
                          <p className="text-[11px] font-medium">{user.birth_time || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary">
                          <Heart size={12} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[8px] font-bold uppercase text-text-secondary tracking-widest">Marital Status</p>
                          <p className="text-[11px] font-medium">{user.marital_status || 'Unspecified'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

                    <div className="flex flex-col w-full gap-2">
                      <button 
                        onClick={() => handleViewKundali(user)}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-border group"
                      >
                        <Star size={14} className="group-hover:rotate-45 transition-transform" /> View Kundali
                      </button>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-foreground/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-border"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.email === 'master@astropinch.com'}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-border disabled:opacity-20"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Edit / Manifest Profile Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh]">

            {/* ── Header ── */}
            <div className="flex items-center gap-4 p-6 border-b border-border shrink-0">
              {/* Avatar picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 rounded-2xl bg-foreground/5 border-2 border-dashed border-border flex flex-col items-center justify-center text-text-secondary cursor-pointer hover:border-primary/60 hover:text-primary transition-all relative overflow-hidden group shrink-0"
              >
                {uploading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : profileImage ? (
                  <>
                    <Image src={profileImage} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera size={16} className="text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <Camera size={18} className="mb-0.5" />
                    <span className="text-[7px] font-bold uppercase">Photo</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-serif italic tracking-tight text-foreground">
                  {editingUser ? 'Edit Profile' : 'Manifest Profile'}
                </h2>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {editingUser ? 'Adjust the celestial path of this entity.' : 'Input details to calculate celestial destiny.'}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-foreground hover:bg-foreground/10 hover:rotate-90 transition-all duration-300 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Scrollable Form Body ── */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-background border border-border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Birth Place */}
                <div className="space-y-1.5" style={{ position: 'relative', zIndex: 50 }}>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">Birth Place (India)</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                    <input
                      type="text"
                      value={birthPlace}
                      onChange={(e) => handleCitySearch(e.target.value)}
                      placeholder="Search city or taluka…"
                      className="w-full bg-background border border-border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      required
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-2xl shadow-2xl max-h-44 overflow-y-auto" style={{ zIndex: 300 }}>
                      {suggestions.map((city, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectCity(city)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors border-b border-border/40 last:border-0 first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          <p className="font-medium text-foreground text-[13px]">{city.display_name.split(',')[0]}</p>
                          <p className="text-[11px] text-text-secondary truncate">{city.display_name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Birth Date + Time — single full-width row, nothing clips */}
                <div className="space-y-1.5">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">Birth Date</label>
                      <div className="flex gap-1.5">
                        <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={day}   onChange={(e) => setDay(e.target.value.replace(/\D/g,''))}   placeholder="DD"   className="w-0 flex-1 bg-background border border-border rounded-xl py-3.5 text-center text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all min-w-0" required />
                        <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={month} onChange={(e) => setMonth(e.target.value.replace(/\D/g,''))} placeholder="MM"   className="w-0 flex-1 bg-background border border-border rounded-xl py-3.5 text-center text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all min-w-0" required />
                        <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={year}  onChange={(e) => setYear(e.target.value.replace(/\D/g,''))}  placeholder="YYYY" className="w-0 flex-[1.8] bg-background border border-border rounded-xl py-3.5 text-center text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all min-w-0" required />
                      </div>
                    </div>
                    <div className="shrink-0 space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">Birth Time</label>
                      <div className="flex items-center gap-1.5">
                        <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={hour}   onChange={(e) => setHour(e.target.value.replace(/\D/g,''))}   placeholder="HH" className="w-16 bg-background border border-border rounded-xl py-3.5 text-center text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" required />
                        <span className="text-text-secondary font-bold text-base">:</span>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={minute} onChange={(e) => setMinute(e.target.value.replace(/\D/g,''))} placeholder="MM" className="w-16 bg-background border border-border rounded-xl py-3.5 text-center text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-3 rounded-2xl text-sm font-semibold transition-all border ${
                          gender === g
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                            : 'bg-background border-border text-text-secondary hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profession */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">Profession</label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                    <select
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full bg-background border border-border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none transition-all"
                    >
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

                {/* Marital Status */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">Marital Status</label>
                  <div className="relative">
                    <Heart size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      className="w-full bg-background border border-border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none transition-all"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* ── Sticky Footer ── */}
              <div className="p-4 border-t border-border shrink-0">
                <button
                  type="submit"
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-[0.15em] text-[12px] hover:bg-primary/90 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                >
                  {editingUser ? 'Update Profile' : 'Manifest Celestial Profile'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
