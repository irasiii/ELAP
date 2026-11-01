'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isLang, t } from '@elap/core';
import type { Lang } from '@elap/core';

/** Error boundary for unexpected failures. Next.js passes retry() (and reset() in older versions). */
export default function Error({ error, retry, reset }: { error: unknown; retry?: () => void; reset?: () => void }) {
  const [lang, setLang] = useState<Lang>('ar');

  useEffect(() => {
    const current = document.documentElement.lang;
    if (isLang(current)) setLang(current);
  }, []);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const recover = retry ?? reset;
  return (
    <main className="status-page">
      <span className="code" aria-hidden="true">!</span>
      <h1>{t('errorTitle', lang)}</h1>
      <p>{t('loadError', lang)}</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button type="button" className="button" onClick={() => (recover ? recover() : window.location.reload())}>
          {t('retry', lang)}
        </button>
        <Link href="/" className="button" style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }}>
          {t('matches', lang)}
        </Link>
      </div>
    </main>
  );
}
