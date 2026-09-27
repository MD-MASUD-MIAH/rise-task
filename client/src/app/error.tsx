'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 font-bangla">
      <h2 className="text-2xl font-bold text-red-400 mb-3">একটি সমস্যা দেখা দিয়েছে</h2>
      <p className="text-gray-400 mb-6">অনাকাঙ্ক্ষিত ত্রুটির জন্য দুঃখিত।</p>
      <button
        onClick={() => reset()}
        className="btn-primary py-2 px-6"
      >
        পুনরায় চেষ্টা করুন
      </button>
    </div>
  );
}
