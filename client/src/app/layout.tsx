import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RISE Poster — রাজনৈতিক পোস্টার জেনারেটর',
  description:
    'AI-powered political poster generator for Bangladeshi campaigns. Create stunning Bangla posters in seconds.',
  keywords: 'poster, political, bangladesh, bangla, পোস্টার, নির্বাচন',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className="dark" suppressHydrationWarning>
      <body className="animated-bg antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
