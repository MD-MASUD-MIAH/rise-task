'use client';

import { useRef } from 'react';
import { Upload, X, UserCircle2, Sparkles, Palette } from 'lucide-react';
import type { PosterFormState, OccasionType, LeaderEntry } from '@/types/poster';

interface Props {
  form: PosterFormState;
  onChange: (patch: Partial<PosterFormState>) => void;
}

const OCCASION_LABELS: Record<OccasionType, string> = {
  victory_day: 'বিজয় দিবস — Victory Day',
  election:    'নির্বাচনী প্রচার — Election Campaign',
  memorial:    'শোক / স্মরণ — Memorial',
  greetings:   'শুভেচ্ছা — Greetings',
  '':          '— উপলক্ষ বেছে নিন —',
};

const HEADLINE_PRESETS: Record<string, string[]> = {
  victory_day: ['মহান বিজয় দিবস', '১৬ই ডিসেম্বর মহান বিজয় দিবস', 'বিজয়ের রক্তিম শুভেচ্ছা'],
  election:    ['টেক ব্যাক বাংলাদেশ', 'ভোট দিন, পরিবর্তন আনুন', 'জনগণের ভোটাধিকার রক্ষা করুন'],
  memorial:    ['শোকাবহ আগস্ট', 'শ্রদ্ধাঞ্জলি ও স্মরণ অনুষ্ঠান', 'বিনম্র শ্রদ্ধাঞ্জলি ও চিরন্তন স্মরণ'],
  greetings:   ['ঈদ মোবারক', 'শুভ নববর্ষ', 'উৎসব ও বিশেষ দিনের শুভেচ্ছা বার্তা'],
};

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border)]">
    <Icon size={18} className="text-green-400" />
    <h3 className="font-bangla font-semibold text-white text-base">{title}</h3>
  </div>
);

const Label = ({ required, children }: { required?: boolean; children: React.ReactNode }) => (
  <label className="block font-bangla text-sm text-[var(--text-secondary)] mb-1.5">
    {children} {required && <span className="text-red-400">*</span>}
  </label>
);

export default function PosterForm({ form, onChange }: Props) {
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  /* ── Leader photo handling ───────────────────────────────────────── */
  const handlePhotoSelect = (idx: number, files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];
    const preview = URL.createObjectURL(file);
    const updated = [...form.leaders] as LeaderEntry[];
    updated[idx] = { ...updated[idx], photoFile: file, photoPreview: preview };
    onChange({ leaders: updated });
  };

  const removePhoto = (idx: number) => {
    const updated = [...form.leaders] as LeaderEntry[];
    if (updated[idx]?.photoPreview) URL.revokeObjectURL(updated[idx].photoPreview!);
    updated[idx] = { ...updated[idx], photoFile: undefined, photoPreview: undefined };
    onChange({ leaders: updated });
  };

  const updateLeaderField = (idx: number, field: keyof LeaderEntry, val: string) => {
    const updated = [...form.leaders] as LeaderEntry[];
    updated[idx] = { ...(updated[idx] ?? { name: '', designation: '' }), [field]: val };
    onChange({ leaders: updated });
  };

  const presets = HEADLINE_PRESETS[form.occasionType] ?? [];

  return (
    <div className="space-y-8">

      {/* ── Section 1: Occasion ─────────────────────────────────────── */}
      <section className="glass rounded-2xl p-6">
        <SectionHeader icon={Sparkles} title="উপলক্ষ ও বার্তা" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>উপলক্ষ</Label>
            <select
              className="input-field"
              value={form.occasionType}
              onChange={(e) => onChange({ occasionType: e.target.value as OccasionType })}
            >
              {(Object.entries(OCCASION_LABELS) as [OccasionType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>তারিখ</Label>
            <input
              className="input-field font-bangla"
              placeholder="যেমন: ১৬ই ডিসেম্বর, ২০২৪"
              value={form.dateLine}
              onChange={(e) => onChange({ dateLine: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4">
          <Label required>শীর্ষ স্লোগান / বার্তা (Bangla)</Label>
          <textarea
            className="input-field font-bangla resize-none"
            rows={2}
            placeholder="যেমন: মহান বিজয় দিবসের শুভেচ্ছা"
            value={form.headline}
            onChange={(e) => onChange({ headline: e.target.value })}
          />
          {/* Preset suggestions */}
          {presets.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-[var(--text-muted)]">পরামর্শ:</span>
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange({ headline: p })}
                  className="text-xs font-bangla px-2.5 py-1 rounded-full border border-[var(--border)] text-green-400 hover:bg-green-900/30 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>সহায়ক বার্তা</Label>
            <input
              className="input-field font-bangla"
              placeholder="উপলক্ষে আন্তরিক শুভেচ্ছা"
              value={form.subHeadline}
              onChange={(e) => onChange({ subHeadline: e.target.value })}
            />
          </div>
          <div>
            <Label>সংগঠন / দল</Label>
            <input
              className="input-field font-bangla"
              placeholder="দলের নাম"
              value={form.partyName}
              onChange={(e) => onChange({ partyName: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* ── Section 2: Leader Photos ─────────────────────────────────── */}
      <section className="glass rounded-2xl p-6">
        <SectionHeader icon={UserCircle2} title="নেতা / ব্যক্তির ছবি (সর্বোচ্চ ৩টি)" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[0, 1, 2].map((idx) => {
            const leader = form.leaders[idx];
            const hasPhoto = !!leader?.photoPreview;
            return (
              <div key={idx} className="flex flex-col items-center gap-3">
                {/* Photo slot */}
                <div className="relative">
                  {hasPhoto ? (
                    <div className="relative">
                      <img
                        src={leader.photoPreview}
                        alt={`Leader ${idx + 1}`}
                        className="w-28 h-28 rounded-full object-cover border-4 border-green-600 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRefs[idx]?.current?.click()}
                      className="w-28 h-28 rounded-full border-2 border-dashed border-[var(--border-glow)] flex flex-col items-center justify-center gap-1.5 hover:border-green-500 hover:bg-green-900/20 transition-all group"
                    >
                      <Upload size={20} className="text-[var(--text-muted)] group-hover:text-green-400 transition-colors" />
                      <span className="font-bangla text-xs text-[var(--text-muted)] group-hover:text-green-400">ছবি যোগ করুন</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRefs[idx]}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handlePhotoSelect(idx, e.target.files)}
                  />
                </div>

                {/* Name + designation */}
                <div className="w-full space-y-2">
                  <input
                    className="input-field font-bangla text-sm py-2"
                    placeholder={`নেতার নাম ${idx + 1}`}
                    value={leader?.name ?? ''}
                    onChange={(e) => updateLeaderField(idx, 'name', e.target.value)}
                  />
                  <input
                    className="input-field font-bangla text-sm py-2"
                    placeholder="পদবি"
                    value={leader?.designation ?? ''}
                    onChange={(e) => updateLeaderField(idx, 'designation', e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 3: Promoter Info ─────────────────────────────────── */}
      <section className="glass rounded-2xl p-6">
        <SectionHeader icon={UserCircle2} title="প্রচারকারীর তথ্য (নিচের ব্যানার)" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>নাম</Label>
            <input className="input-field font-bangla" placeholder="মোঃ সাইফুল ইসলাম"
              value={form.promoterName} onChange={(e) => onChange({ promoterName: e.target.value })} />
          </div>
          <div>
            <Label required>পদবি</Label>
            <input className="input-field font-bangla" placeholder="সাধারণ সম্পাদক"
              value={form.promoterDesignation} onChange={(e) => onChange({ promoterDesignation: e.target.value })} />
          </div>
          <div>
            <Label required>এলাকা</Label>
            <input className="input-field font-bangla" placeholder="ঢাকা-১৭, মিরপুর"
              value={form.promoterArea} onChange={(e) => onChange({ promoterArea: e.target.value })} />
          </div>
          <div>
            <Label>যোগাযোগ</Label>
            <input className="input-field" placeholder="01700-000000"
              value={form.promoterContact} onChange={(e) => onChange({ promoterContact: e.target.value })} />
          </div>
        </div>
      </section>

      {/* ── Section 4: Theme ──────────────────────────────────────────── */}
      <section className="glass rounded-2xl p-6">
        <SectionHeader icon={Palette} title="থিম ও রঙ" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label>প্রাথমিক রঙ (Background)</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primaryColor}
                onChange={(e) => onChange({ primaryColor: e.target.value })}
                className="w-12 h-10 rounded-lg border-2 border-[var(--border)] cursor-pointer bg-transparent" />
              <input className="input-field flex-1" value={form.primaryColor}
                onChange={(e) => onChange({ primaryColor: e.target.value })}
                placeholder="#0a3318" />
            </div>
          </div>
          <div>
            <Label>অ্যাক্সেন্ট রঙ (Highlight)</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.accentColor}
                onChange={(e) => onChange({ accentColor: e.target.value })}
                className="w-12 h-10 rounded-lg border-2 border-[var(--border)] cursor-pointer bg-transparent" />
              <input className="input-field flex-1" value={form.accentColor}
                onChange={(e) => onChange({ accentColor: e.target.value })}
                placeholder="#FFD700" />
            </div>
          </div>
        </div>

        {/* AI toggle */}
        <div className="mt-5 flex items-center justify-between p-4 rounded-xl bg-[#0a1f10] border border-[var(--border)]">
          <div>
            <p className="font-bangla text-white text-sm font-medium flex items-center gap-2">
              <Sparkles size={15} className="text-yellow-400" /> Google Gemini AI দিয়ে উন্নত করুন
            </p>
            <p className="font-bangla text-xs text-[var(--text-muted)] mt-0.5">
              AI স্লোগান, রঙ ও লেআউট সুপারিশ করবে
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ enhanceWithGemini: !form.enhanceWithGemini })}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              form.enhanceWithGemini ? 'bg-green-600' : 'bg-[var(--border)]'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              form.enhanceWithGemini ? 'translate-x-6' : ''
            }`} />
          </button>
        </div>
      </section>
    </div>
  );
}
