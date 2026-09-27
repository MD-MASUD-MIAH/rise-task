import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 font-bangla">
      <h1 className="text-6xl font-bold text-green-500 mb-4">৪০৪</h1>
      <h2 className="text-2xl font-semibold text-white mb-2">পৃষ্ঠাটি পাওয়া যায়নি</h2>
      <p className="text-gray-400 mb-6">আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা সরানো হয়েছে।</p>
      <Link href="/" className="btn-primary py-2 px-6">
        হোমে ফিরে যান
      </Link>
    </div>
  );
}
