import Link from 'next/link';
import { t } from '@elap/core';
import { getViewer } from '@/lib/viewer';

export default async function NotFound() {
  const { lang } = await getViewer();
  return (
    <main className="status-page">
      <span className="code" aria-hidden="true">404</span>
      <h1>{t('notFound', lang)}</h1>
      <p>{t('notFoundBody', lang)}</p>
      <Link href="/" className="button">
        {t('matches', lang)}
      </Link>
    </main>
  );
}
