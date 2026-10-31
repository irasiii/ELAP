import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { t } from '@elap/core';
import { TimezoneSync } from '@/components/TimezoneSync';
import { viewerTimeZone } from '@/lib/viewer';
import './globals.css';

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap';

export const metadata: Metadata = {
  title: { default: 'ELAP — مباريات اليوم والنتائج المباشرة', template: '%s · ELAP' },
  description: 'مواعيد مباريات اليوم بتوقيتك المحلي، النتائج المباشرة، التشكيلات، والقنوات الناقلة لأهم الدوريات في كل دولة.',
};

export const viewport: Viewport = { themeColor: '#0D1210' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tz = await viewerTimeZone();
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={FONTS_URL} />
      </head>
      <body>
        <TimezoneSync current={tz} />
        <header className="site-header">
          <div className="wrap header-row">
            <Link href="/" className="brand" aria-label="ELAP">
              <span className="brand-mark">E</span>
              <span className="brand-word">ELAP</span>
            </Link>
            <nav className="main-nav" aria-label="القائمة الرئيسية">
              <Link href="/">{t('matches')}</Link>
              <Link href="/leagues">{t('leagues')}</Link>
            </nav>
          </div>
        </header>
        <div className="wrap">{children}</div>
        <footer className="site-footer wrap">
          <span>ELAP</span>
          <span className="muted">البيانات من API-Football · الأوقات بتوقيت {tz}</span>
        </footer>
      </body>
    </html>
  );
}
