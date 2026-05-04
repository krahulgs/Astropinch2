'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { LogIn, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import AnimatedZodiacBackground from '@/components/AnimatedZodiacBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/token`, {
        method: 'POST',
        body: params,
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);

      // Signal components to reload auth state in the same tab
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new Event('storage'));

      // Redirect all users to the users dashboard
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground overflow-hidden relative flex items-center justify-center p-6">
      <AnimatedZodiacBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Sparkles size={12} /> Secure Access
          </div>
          <h1 className="text-4xl font-serif italic">Cosmic Login</h1>
          <p className="text-text-secondary font-normal">Access your celestial dashboard</p>
        </div>

        <div className="bg-surface/80 border border-border backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-4">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-background/50 border border-border rounded-full py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-secondary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-4">Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background/50 border border-border rounded-full py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-secondary/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-foreground/5 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter the Cosmos'}
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-8 text-center border-t border-border pt-6">
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary font-bold hover:underline transition-all">
                Create Account
              </Link>
            </p>
          </div>

          {/* Credentials section removed for security */}
        </div>
      </div>
    </div>
  );
}
