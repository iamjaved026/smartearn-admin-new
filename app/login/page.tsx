'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp, Mail, Lock, Loader2 } from 'lucide-react';
import FormInput from '@/components/FormInput';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@smartearn.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Smart Earn Admin</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-[42px] text-slate-400" />
              <FormInput
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="pl-11"
                required
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-4 top-[42px] text-slate-400" />
              <FormInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-11"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
