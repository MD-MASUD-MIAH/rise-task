'use client';

import { useState } from 'react';
import { X, User, Phone, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { register, login, setToken, saveUser } from '@/lib/api';
import type { AuthUser } from '@/types/poster';

interface Props {
  onSuccess: (user: AuthUser) => void;
  onClose: () => void;
}

type Mode = 'login' | 'register';

export default function AuthModal({ onSuccess, onClose }: Props) {
  const [mode, setMode]         = useState<Mode>('login');
  const [name, setName]         = useState('');
  const [identifier, setId]     = useState('');  // email or phone
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const isEmail = identifier.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = isEmail
        ? { email: identifier, password }
        : { phone: identifier, password };

      const data =
        mode === 'register'
          ? await register({ name, ...payload })
          : await login(payload);

      setToken(data.token);
      saveUser(data.user);
      onSuccess(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style={{ background: 'rgba(3,10,6,0.85)', backdropFilter: 'blur(8px)' }}>

      <div className="glass rounded-2xl w-full max-w-md p-8 fade-up relative">
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-gradient font-bold text-2xl font-bangla">✦ RISE পোস্টার</span>
          <p className="text-[var(--text-muted)] font-bangla text-sm mt-1">
            {mode === 'login' ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl overflow-hidden border border-[var(--border)] mb-6">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2.5 font-bangla text-sm font-medium transition-all
                ${mode === m ? 'bg-green-700 text-white' : 'text-[var(--text-muted)] hover:text-white'}`}>
              {m === 'login' ? 'লগইন' : 'নিবন্ধন'}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                className="input-field pl-9"
                placeholder="আপনার নাম"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="relative">
            {isEmail
              ? <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              : <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            }
            <input
              className="input-field pl-9"
              placeholder="ইমেইল বা ফোন নম্বর"
              value={identifier}
              onChange={(e) => setId(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              className="input-field pl-9 pr-10"
              type={showPw ? 'text' : 'password'}
              placeholder="পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm font-bangla bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading
              ? <><Loader2 size={18} className="spin" /> অপেক্ষা করুন…</>
              : mode === 'login' ? '🔐 প্রবেশ করুন' : '✨ অ্যাকাউন্ট তৈরি করুন'
            }
          </button>
        </form>
      </div>
    </div>
  );
}
