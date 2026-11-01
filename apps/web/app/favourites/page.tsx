import type { Metadata } from 'next';
import { t } from '@elap/core';
import { FavouritesList } from '@/components/FavouritesList';
import { getViewer } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getViewer();
  return { title: t('favourites', lang) };
}

export default async function FavouritesPage() {
  const { lang } = await getViewer();
  return (
    <main>
      <div className="page-head">
        <h1>{t('favourites', lang)}</h1>
      </div>
      <FavouritesList lang={lang} />
    </main>
  );
}
