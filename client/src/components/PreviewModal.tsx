'use client';

import { useState } from 'react';
import { X, Download, RefreshCw, Sparkles, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';
import { downloadImageAs } from '@/lib/api';
import type { PosterResult } from '@/types/poster';

interface Props {
  result: PosterResult;
  onClose: () => void;
  onRegenerate: () => void;
}

export default function PreviewModal({ result, onClose, onRegenerate }: Props) {
  const [downloading, setDownloading]     = useState(false);
  const [downloaded, setDownloaded]       = useState(false);
  const [showGemini, setShowGemini]       = useState(false);
  const [selectedSlogan, setSelectedSlogan] = useState<number | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadImageAs(result.imageUrl, `rise-poster-${result.posterId.slice(-8)}.png`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      style={{ background: 'rgba(3,10,6,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-5xl max-h-[95dvh] overflow-y-auto glass rounded-2xl fade-up">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 glass border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bangla text-white font-bold text-lg">✅ পোস্টার তৈরি সম্পন্ন</h2>
            <p className="font-bangla text-[var(--text-muted)] text-xs mt-0.5">
              {result.dimensions.width}×{result.dimensions.height}px &nbsp;·&nbsp; {result.renderTimeMs}ms এ রেন্ডার
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center hover:bg-red-900/40 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 p-6">

          {/* Poster image */}
          <div className="lg:w-[45%] flex-shrink-0">
            <div className="rounded-xl overflow-hidden border border-[var(--border)] shadow-2xl"
                 style={{ aspectRatio: '3/4' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.imageUrl}
                alt="Generated Poster"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // fallback if server is not running
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => { void handleDownload(); }}
                disabled={downloading}
                className="btn-gold w-full py-3.5 text-base"
              >
                {downloading ? (
                  <><Loader2 size={18} className="spin" /> ডাউনলোড হচ্ছে…</>
                ) : downloaded ? (
                  <><Check size={18} /> সংরক্ষিত হয়েছে!</>
                ) : (
                  <><Download size={18} /> HD PNG ডাউনলোড করুন</>
                )}
              </button>

              <button onClick={onRegenerate} className="btn-ghost w-full py-3.5 text-base font-bangla">
                <RefreshCw size={16} /> পরিবর্তন করুন ও পুনরায় তৈরি করুন
              </button>
            </div>

            {/* Poster details */}
            <div className="bg-[var(--bg-card)] rounded-xl p-4 space-y-2">
              <p className="font-bangla text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
                পোস্টারের তথ্য
              </p>
              <Detail label="পোস্টার ID" value={result.posterId.slice(-12)} mono />
              <Detail label="রেজোলিউশন" value={`${result.dimensions.width} × ${result.dimensions.height} px`} />
              <Detail label="রেন্ডার সময়" value={`${result.renderTimeMs} ms`} />
              <Detail label="স্ট্যাটাস" value="✅ প্রস্তুত" green />
            </div>

            {/* Gemini AI suggestions */}
            {result.geminiEnhancements && (
              <div className="bg-[var(--bg-card)] rounded-xl overflow-hidden border border-[var(--border)]">
                <button
                  onClick={() => setShowGemini(!showGemini)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <span className="font-bangla text-sm text-white flex items-center gap-2">
                    <Sparkles size={14} className="text-yellow-400" />
                    Gemini AI-র আরও পরামর্শ
                    {result.geminiEnhancements.aiGenerated && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-400 text-xs">AI</span>
                    )}
                  </span>
                  {showGemini ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showGemini && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Slogans */}
                    <div>
                      <p className="font-bangla text-xs text-[var(--text-muted)] mb-2">স্লোগান বিকল্পসমূহ:</p>
                      <div className="space-y-2">
                        {result.geminiEnhancements.slogansOffered.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedSlogan(i)}
                            className={`w-full text-left px-3 py-2 rounded-lg border font-bangla text-sm transition-all ${
                              selectedSlogan === i
                                ? 'border-green-600 bg-green-900/30 text-green-300'
                                : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-glow)]'
                            }`}
                          >
                            {selectedSlogan === i && <Check size={12} className="inline mr-2 text-green-400" />}
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color themes */}
                    <div>
                      <p className="font-bangla text-xs text-[var(--text-muted)] mb-2">রঙ থিম বিকল্পসমূহ:</p>
                      <div className="space-y-2">
                        {result.geminiEnhancements.colorThemesOffered.map((theme, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-[var(--border)]">
                            <div className="flex gap-1.5">
                              <div className="w-5 h-5 rounded-full border border-white/20" style={{ background: theme.primary }} />
                              <div className="w-5 h-5 rounded-full border border-white/20" style={{ background: theme.accent }} />
                            </div>
                            <div>
                              <p className="font-bangla text-white text-xs font-medium">{theme.name}</p>
                              <p className="font-bangla text-[var(--text-muted)] text-xs">{theme.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, mono, green }: { label: string; value: string; mono?: boolean; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-bangla text-xs text-[var(--text-muted)]">{label}</span>
      <span className={`text-xs font-medium ${green ? 'text-green-400' : 'text-[var(--text-secondary)]'} ${mono ? 'font-mono' : 'font-bangla'}`}>
        {value}
      </span>
    </div>
  );
}
