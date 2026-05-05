'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  id: number;
  full_name: string;
  role: string;
  birth_place: string;
  birth_date: string;   // DD-MM-YYYY
  birth_time: string;   // HH:MM
  lat: string;
  lon: string;
  profession: string;
  gender?: string;
  marital_status?: string;
  profile_image?: string;
}

export interface ParsedProfile {
  id: number;
  name: string;
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  place: string;
  lat: number;
  lon: number;
  profession: string;
  gender?: string;
  marital_status?: string;
  profile_image?: string;
  role: string;
}

export function parseProfile(u: UserProfile): ParsedProfile | null {
  if (!u.birth_date || !u.birth_time || !u.lat || !u.lon) return null;
  const [d, m, y] = u.birth_date.split('-');
  const [h, min] = u.birth_time.split(':');
  return {
    id: u.id,
    name: u.full_name,
    day: d,
    month: m,
    year: y,
    hour: h,
    minute: min,
    place: u.birth_place || '',
    lat: parseFloat(u.lat),
    lon: parseFloat(u.lon),
    profession: u.profession || 'General',
    gender: u.gender,
    marital_status: u.marital_status,
    profile_image: u.profile_image,
    role: u.role,
  };
}

export function useActiveProfile() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    setIsLoggedIn(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        throw new Error('Failed to fetch profiles');
      }
      const data: UserProfile[] = await res.json();
      
      if (!data || data.length === 0) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setProfiles([]);
        setActiveProfileId(null);
        return;
      }

      setProfiles(data);

      // Restore previously selected profile, or default to master
      const savedId = localStorage.getItem('active_profile_id');
      if (savedId) {
        const num = parseInt(savedId);
        if (data.find((u) => u.id === num)) {
          setActiveProfileId(num);
          return;
        }
      }
      const master = data.find((u) => u.role === 'master') ?? data[0];
      if (master) setActiveProfileId(master.id);
    } catch {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setProfiles([]);
      setActiveProfileId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
    window.addEventListener('storage', fetchProfiles);
    window.addEventListener('focus', fetchProfiles);
    return () => {
      window.removeEventListener('storage', fetchProfiles);
      window.removeEventListener('focus', fetchProfiles);
    };
  }, [fetchProfiles]);

  const selectProfile = (id: number) => {
    setActiveProfileId(id);
    localStorage.setItem('active_profile_id', id.toString());
  };

  const activeProfile = profiles.find((u) => u.id === activeProfileId) ?? null;
  const parsedActive = activeProfile ? parseProfile(activeProfile) : null;

  return { profiles, activeProfile, parsedActive, activeProfileId, selectProfile, isLoggedIn, loading, refresh: fetchProfiles };
}
