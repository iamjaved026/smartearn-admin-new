'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { TrendingUp, Mail, Lock, Loader2 } from 'lucide-react';
import FormInput from '@/components/FormInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
         setError('Account temporarily locked. Please wait a few minutes before trying again.');
      } else if (err.code === 'auth/network-request-failed') {
         setError('Network connection failed. Please check your internet connection.');
      } else {
         setError('Authentication failed. Please contact support if the issue persists.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
         setError('Google Sign-In cancelled.');
      } else {
         setError('Google verification failed. Please try a different account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4">
      {/* Premium Ambient Light Orbs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px] animate-pulse" />
      <div className="absolute top-40 -right-20 h-80 w-80 rounded-full bg-purple-500/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-[2rem] border border-white/50 bg-white/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">SmartEarn</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Secure Command Center</p>
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-80"
          >
            {isSubmitting ? (
               <>
                 <Loader2 size={18} className="animate-spin" />
                 Authenticating Admin...
               </>
            ) : (
              'Access Dashboard'
            )}
          </button>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-transparent px-4 text-slate-400 font-semibold backdrop-blur-md">Or authorize via</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200/50 bg-white/80 backdrop-blur-sm py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-white active:scale-[0.98] disabled:opacity-70"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" /><path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" /><path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" /><path d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z" fill="#34A853" /></svg>
            System Administrator SSO
          </button>
        </form>
      </div>
    </div>
  );
}
