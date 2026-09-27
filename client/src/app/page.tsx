import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Shield, Image } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-চালিত ডিজাইন',
    desc: 'Google Gemini AI আপনার উপলক্ষ অনুযায়ী সেরা স্লোগান ও রঙ সুপারিশ করে',
  },
  {
    icon: Zap,
    title: 'তাৎক্ষণিক রেন্ডারিং',
    desc: 'মাত্র কয়েক সেকেন্ডে পেশাদার মানের HD পোস্টার তৈরি হয়',
  },
  {
    icon: Shield,
    title: 'নিরাপদ ও সুরক্ষিত',
    desc: 'আপনার ছবি ও তথ্য সম্পূর্ণ সুরক্ষিত। JWT দিয়ে প্রমাণিত ব্যবহারকারী',
  },
  {
    icon: Image,
    title: '1200×1600 HD আউটপুট',
    desc: 'প্রিন্ট ও সোশ্যাল মিডিয়া উপযোগী উচ্চ-রেজোলিউশন PNG ডাউনলোড করুন',
  },
];

const occasions = [
  { emoji: '🏆', label: 'বিজয় দিবস',      sub: 'Victory Day'       },
  { emoji: '🗳️', label: 'নির্বাচনী প্রচার', sub: 'Election Campaign' },
  { emoji: '🕊️', label: 'শোক / স্মরণ',    sub: 'Memorial'          },
  { emoji: '🌟', label: 'শুভেচ্ছা',         sub: 'Greetings'         },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="glass sticky top-0 z-50 border-b border-[#1a3a22]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-gradient font-bold text-xl font-bangla">✦ RISE পোস্টার</span>
          <div className="flex items-center gap-3">
            <Link href="/create" className="btn-primary py-2 px-5 text-sm">
              পোস্টার তৈরি করুন
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6">
        {/* decorative circles */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        />

        <div className="relative max-w-4xl mx-auto text-center fade-up">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-[#0c1e12] border border-[#1a3a22] text-green-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={14} className="text-yellow-400" />
            Google Gemini AI দ্বারা চালিত
          </span>

          {/* Headline */}
          <h1 className="font-bangla text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="text-gradient">পেশাদার</span>{' '}
            <span className="text-white">রাজনৈতিক পোস্টার</span>
            <br />
            <span className="text-white text-4xl md:text-5xl font-normal">মিনিটেই তৈরি করুন</span>
          </h1>

          <p className="text-[var(--text-secondary)] font-bangla text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            AI দিয়ে বাংলা স্লোগান, রঙ ও লেআউট সুপারিশ পান। ছবি আপলোড করুন,
            তথ্য দিন — সেকেন্ডে HD পোস্টার পাবেন।
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create" className="btn-gold text-lg px-8 py-3.5">
              <Sparkles size={18} /> বিনামূল্যে শুরু করুন
            </Link>
            <Link href="/create" className="btn-ghost text-lg px-8 py-3.5 font-bangla">
              উদাহরণ দেখুন <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Occasion pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-16 max-w-2xl mx-auto">
          {occasions.map((o) => (
            <Link
              key={o.label}
              href="/create"
              className="glass flex items-center gap-2 px-5 py-2.5 rounded-full hover:border-green-600 transition-all hover:scale-105 font-bangla text-sm"
            >
              <span className="text-xl">{o.emoji}</span>
              <span className="text-white">{o.label}</span>
              <span className="text-[var(--text-muted)] text-xs">{o.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#0f2519]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bangla text-3xl font-bold text-center text-gradient mb-3">
            কেন RISE পোস্টার?
          </h2>
          <p className="text-center text-[var(--text-secondary)] font-bangla mb-12">
            প্রযুক্তি ও শিল্পের অনন্য সমন্বয়
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass p-6 rounded-[var(--radius-lg)] hover:border-[var(--border-glow)] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-600/10 flex items-center justify-center mb-4 group-hover:bg-green-600/20 transition-colors">
                  <f.icon size={22} className="text-green-400" />
                </div>
                <h3 className="font-bangla font-semibold text-white mb-2">{f.title}</h3>
                <p className="font-bangla text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center glass rounded-2xl p-12">
          <h2 className="font-bangla text-3xl font-bold text-white mb-4">
            এখনই শুরু করুন
          </h2>
          <p className="font-bangla text-[var(--text-secondary)] mb-8 text-lg">
            বিনামূল্যে অ্যাকাউন্ট তৈরি করুন এবং আপনার প্রথম পোস্টার তৈরি করুন
          </p>
          <Link href="/create" className="btn-primary text-lg px-10 py-3.5">
            <Sparkles size={18} /> পোস্টার তৈরি করুন
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0f2519] py-8 px-6 text-center">
        <p className="font-bangla text-[var(--text-muted)] text-sm">
          © ২০২৪ RISE পোস্টার — Google Gemini ও Puppeteer দ্বারা চালিত
        </p>
      </footer>
    </main>
  );
}
