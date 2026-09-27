'use client';

export const dynamic = 'force-dynamic';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body>
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>একটি ত্রুটি ঘটেছে</h2>
          <p style={{ color: '#666', marginTop: '8px' }}>অনাকাঙ্ক্ষিত সমস্যার জন্য আমরা দুঃখিত।</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '16px',
            }}
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </body>
    </html>
  );
}
