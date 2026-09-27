'use client';

import type { OccasionType } from '@/types/poster';

interface Occasion {
  id: OccasionType;
  emoji: string;
  title: string;
  subtitle: string;
  gradient: string;
  border: string;
  description: string;
}

const OCCASIONS: Occasion[] = [
  {
    id: 'victory_day',
    emoji: '🏆',
    title: 'বিজয় দিবস',
    subtitle: 'Victory Day',
    description: '১৬ই ডিসেম্বর স্বাধীনতার বিজয় উদযাপন',
    gradient: 'from-emerald-950 via-emerald-900 to-emerald-800',
    border: 'border-emerald-600',
  },
  {
    id: 'election',
    emoji: '🗳️',
    title: 'নির্বাচনী প্রচার',
    subtitle: 'Election Campaign',
    description: 'ভোটার সংযোগ ও প্রার্থী প্রচারণা',
    gradient: 'from-blue-950 via-blue-900 to-blue-800',
    border: 'border-blue-500',
  },
  {
    id: 'memorial',
    emoji: '🕊️',
    title: 'শোক / স্মরণ',
    subtitle: 'Memorial',
    description: 'শ্রদ্ধাঞ্জলি ও স্মরণ অনুষ্ঠান',
    gradient: 'from-slate-950 via-slate-900 to-slate-800',
    border: 'border-slate-500',
  },
  {
    id: 'greetings',
    emoji: '🌟',
    title: 'শুভেচ্ছা',
    subtitle: 'Greetings',
    description: 'উৎসব ও বিশেষ দিনের শুভেচ্ছা বার্তা',
    gradient: 'from-amber-950 via-amber-900 to-amber-800',
    border: 'border-amber-500',
  },
];

interface Props {
  selected: OccasionType;
  onSelect: (id: OccasionType) => void;
}

export default function TemplateGallery({ selected, onSelect }: Props) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-bangla text-2xl font-bold text-white">উপলক্ষ বেছে নিন</h2>
        <p className="font-bangla text-[var(--text-muted)] mt-1 text-sm">
          আপনার পোস্টারের ধরন নির্বাচন করুন
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {OCCASIONS.map((occ) => {
          const isSelected = selected === occ.id;
          return (
            <button
              key={occ.id}
              onClick={() => onSelect(occ.id)}
              className={`
                relative group flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-200
                bg-gradient-to-br ${occ.gradient}
                ${isSelected
                  ? `${occ.border} scale-[1.03] shadow-[0_0_24px_rgba(34,197,94,0.3)]`
                  : 'border-[#1a3a22] hover:border-[#2d6a40] hover:scale-[1.01]'}
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}

              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {occ.emoji}
              </span>
              <p className="font-bangla font-bold text-white text-base leading-tight mb-1">
                {occ.title}
              </p>
              <p className="text-xs text-white/50 mb-2">{occ.subtitle}</p>
              <p className="font-bangla text-xs text-white/70 leading-snug">
                {occ.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
