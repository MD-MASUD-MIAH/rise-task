'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2, AlertCircle, LogOut } from 'lucide-react';

import TemplateGallery from '@/components/TemplateGallery';
import PosterForm      from '@/components/PosterForm';
import PreviewModal    from '@/components/PreviewModal';
import AuthModal       from '@/components/AuthModal';

import { createPoster, getToken, getUser, logout } from '@/lib/api';
import type { PosterFormState, OccasionType, PosterResult, AuthUser } from '@/types/poster';

// ─── Default form state ────────────────────────────────────────────────────────

const DEFAULT_FORM: PosterFormState = {
  occasionType:       '',
  headline:           '',
  subHeadline:        '',
  dateLine:           '',
  partyName:          '',
  primaryColor:       '#0a3318',
  accentColor:        '#FFD700',
  enhanceWithGemini:  true,
  promoterName:       '',
  promoterDesignation:'',
  promoterArea:       '',
  promoterContact:    '',
  leaders:            [
    { name: '', designation: '' },
    { name: '', designation: '' },
    { name: '', designation: '' },
  ],
};

// ─── Loading messages ─────────────────────────────────────────────────────────

const LOADING_STEPS = [
  'ছবি প্রক্রিয়া করা হচ্ছে…',
  'AI দিয়ে স্লোগান তৈরি হচ্ছে…',
  'থিম ও রঙ প্রস্তুত করা হচ্ছে…',
  'Chromium দিয়ে পোস্টার রেন্ডার হচ্ছে…',
  'ফাইল সংরক্ষণ হচ্ছে…',
];

type PageState = 'idle' | 'loading' | 'success' | 'error';

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CreatePage() {
  const [form, setForm]           = useState<PosterFormState>(DEFAULT_FORM);
  const [pageState, setPageState] = useState<PageState>('idle');
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg]   = useState('');
  const [result, setResult]       = useState<PosterResult | null>(null);
  const [showAuth, setShowAuth]   = useState(false);
  const [user, setUser]           = useState<AuthUser | null>(null);

  // Restore user from localStorage on mount
  useEffect(() => {
    const saved = getUser();
    if (saved && getToken()) setUser(saved);
  }, []);

  // Cycle through loading messages while rendering
  useEffect(() => {
    if (pageState !== 'loading') return;
    setLoadingStep(0);
    const timer = setInterval(() => {
      setLoadingStep((s) => (s + 1) % LOADING_STEPS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [pageState]);

  const patchForm = (patch: Partial<PosterFormState>) => setForm((f) => ({ ...f, ...patch }));

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!getToken()) { setShowAuth(true); return; }
    if (!form.headline.trim()) { setErrorMsg('শীর্ষ স্লোগান / বার্তা আবশ্যক।'); return; }
    if (!form.promoterName.trim() || !form.promoterDesignation.trim() || !form.promoterArea.trim()) {
      setErrorMsg('নাম, পদবি এবং এলাকা আবশ্যক।');
      return;
    }

    setErrorMsg('');
    setPageState('loading');

    try {
      const fd = new FormData();
      fd.append('headline',            form.headline);
      fd.append('subHeadline',         form.subHeadline);
      fd.append('dateLine',            form.dateLine);
      fd.append('occasionType',        form.occasionType);
      fd.append('partyName',           form.partyName);
      fd.append('primaryColor',        form.primaryColor);
      fd.append('accentColor',         form.accentColor);
      fd.append('promoterName',        form.promoterName);
      fd.append('promoterDesignation', form.promoterDesignation);
      fd.append('promoterArea',        form.promoterArea);
      fd.append('promoterContact',     form.promoterContact);
      fd.append('enhanceWithGemini',   String(form.enhanceWithGemini));

      // Leader metadata as JSON
      const leaderMeta = form.leaders.map((l) => ({ name: l.name, designation: l.designation }));
      fd.append('leaderData', JSON.stringify(leaderMeta));

      // Photo files
      form.leaders.forEach((l) => {
        if (l.photoFile) fd.append('leaderPhotos', l.photoFile);
      });

      const posterResult = await createPoster(fd);
      setResult(posterResult);
      setPageState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'পোস্টার তৈরিতে সমস্যা হয়েছে।');
      setPageState('error');
    }
  };

  const handleRegenerate = () => {
    setResult(null);
    setPageState('idle');
  };

  const handleAuthSuccess = (u: AuthUser) => {
    setUser(u);
    setShowAuth(false);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const isFormValid = form.headline.trim() && form.promoterName.trim() &&
                      form.promoterDesignation.trim() && form.promoterArea.trim();

  return (
    <>
      {/* ── Auth modal ──────────────────────────────────────────────── */}
      {showAuth && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}

      {/* ── Preview modal ────────────────────────────────────────────── */}
      {pageState === 'success' && result && (
        <PreviewModal
          result={result}
          onClose={handleRegenerate}
          onRegenerate={handleRegenerate}
        />
      )}

      {/* ── Loading overlay ──────────────────────────────────────────── */}
      {pageState === 'loading' && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center"
             style={{ background: 'rgba(3,10,6,0.9)', backdropFilter: 'blur(10px)' }}>
          <div className="glass rounded-2xl p-10 text-center max-w-sm w-full fade-up">
            {/* Spinner */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-yellow-400 spin"
                   style={{ animationDuration: '1.4s', animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={24} className="text-green-400" />
              </div>
            </div>
            <h3 className="font-bangla text-white font-bold text-xl mb-2">পোস্টার তৈরি হচ্ছে</h3>
            <p className="font-bangla text-green-400 text-sm transition-all duration-500">
              {LOADING_STEPS[loadingStep]}
            </p>
            <div className="flex justify-center gap-1.5 mt-5">
              {LOADING_STEPS.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === loadingStep ? 'bg-green-400 scale-125' : 'bg-[var(--border)]'
                }`} />
              ))}
            </div>
            <p className="font-bangla text-[var(--text-muted)] text-xs mt-4">
              সাধারণত ৫–১০ সেকেন্ড সময় লাগে
            </p>
          </div>
        </div>
      )}

      {/* ── Page ─────────────────────────────────────────────────────── */}
      <div className="min-h-screen">

        {/* Navbar */}
        <nav className="glass sticky top-0 z-40 border-b border-[#1a3a22]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-[var(--text-muted)] hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <span className="text-gradient font-bold text-xl font-bangla">✦ RISE পোস্টার</span>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="font-bangla text-sm text-[var(--text-secondary)] hidden sm:block">
                    স্বাগতম, {user.name}
                  </span>
                  <button onClick={handleLogout}
                    className="btn-ghost py-2 px-3 text-sm flex items-center gap-1.5">
                    <LogOut size={14} /> লগআউট
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="btn-primary py-2 px-5 text-sm">
                  লগইন করুন
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* Page title */}
          <div className="fade-up">
            <h1 className="font-bangla text-3xl font-bold text-white">নতুন পোস্টার তৈরি করুন</h1>
            <p className="font-bangla text-[var(--text-muted)] mt-1">
              উপলক্ষ বেছে নিন, তথ্য দিন — AI পোস্টার তৈরি করবে
            </p>
          </div>

          {/* Template gallery */}
          <div className="fade-up" style={{ animationDelay: '0.1s' }}>
            <TemplateGallery
              selected={form.occasionType as OccasionType}
              onSelect={(id) => patchForm({ occasionType: id })}
            />
          </div>

          {/* Form */}
          <div className="fade-up" style={{ animationDelay: '0.2s' }}>
            <PosterForm form={form} onChange={patchForm} />
          </div>

          {/* Error */}
          {errorMsg && pageState === 'error' && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-900/20 border border-red-800/50 fade-up">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="font-bangla text-red-300 text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Submit */}
          <div className="fade-up pb-16" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => { void handleSubmit(); }}
              disabled={pageState === 'loading' || !isFormValid}
              className="btn-primary w-full py-4 text-lg"
            >
              {pageState === 'loading'
                ? <><Loader2 size={20} className="spin" /> রেন্ডার হচ্ছে…</>
                : <><Sparkles size={20} /> পোস্টার তৈরি করুন</>
              }
            </button>

            {!user && (
              <p className="font-bangla text-center text-[var(--text-muted)] text-xs mt-3">
                পোস্টার তৈরি করতে{' '}
                <button onClick={() => setShowAuth(true)} className="text-green-400 hover:underline">
                  লগইন করুন
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
