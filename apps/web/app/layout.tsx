import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { dir, t } from '@elap/core';
import { Prefs } from '@/components/Prefs';
import { TimezoneSync } from '@/components/TimezoneSync';
import { getViewer } from '@/lib/viewer';
import './globals.css';

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap';

const DESCRIPTIONS = {
  ar: 'مواعيد مباريات اليوم بتوقيتك المحلي، النتائج المباشرة، التشكيلات، والقنوات الناقلة — بطولات بلدك أولًا.',
  en: "Today's matches in your local time, live scores, lineups and TV channels — your country's competitions first.",
  fr: "Les matchs du jour à votre heure, scores en direct, compositions et chaînes TV — les compétitions de votre pays d'abord.",
};

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getViewer();
  return {
    title: { default: `ELAP — ${t('todayTitle', lang)}`, template: '%s · ELAP' },
    description: DESCRIPTIONS[lang],
  };
}

export const viewport: Viewport = { themeColor: '#0D1210' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  const { lang } = viewer;
  return (
    <html lang={lang} dir={dir(lang)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={FONTS_URL} />
      </head>
      <body>
        <TimezoneSync current={viewer.timeZone} />
        <header className="site-header">
          <div className="wrap header-row">
            <Link href="/" className="brand" aria-label="ELAP">
              <span className="brand-mark">E</span>
              <span className="brand-word">ELAP</span>
            </Link>
            <nav className="main-nav" aria-label={t('matches', lang)}>
              <Link href="/">{t('matches', lang)}</Link>
              <Link href="/leagues">{t('leagues', lang)}</Link>
            </nav>
            <Prefs lang={lang} country={viewer.country} countryChosen={viewer.countryChosen} />
          </div>
        </header>
        <div className="wrap">{children}</div>
        <footer className="site-footer wrap">
          <span>ELAP</span>
          <span className="muted">
            {t('dataSource', lang)} · {t('timesIn', lang)} {viewer.timeZone}
          </span>
        </footer>
      </body>
    </html>
  );
}
