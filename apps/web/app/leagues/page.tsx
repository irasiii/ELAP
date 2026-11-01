import type { Metadata } from 'next';
import { countryName, t } from '@elap/core';
import { getLeagues } from '@/lib/server/service';
import { getViewer } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getViewer();
  return { title: t('leagues', lang) };
}

export default async function LeaguesPage() {
  const { lang, country } = await getViewer();
  const countries = await getLeagues(country, lang).catch(() => null);
  if (!countries) return <p className="empty">{t('loadError', lang)}</p>;

  return (
    <main>
      <div className="page-head">
        <h1>{t('leagues', lang)}</h1>
      </div>
      <div className="country-grid">
        {countries.map((c) => (
          <section key={c.country} className={`card${c.code && c.code === country ? ' card-mine' : ''}`}>
            <header className="card-head">
              <span className="code">{(c.code ?? c.country.slice(0, 3)).toUpperCase()}</span>
              <h2>{countryName(c.country, lang)}</h2>
            </header>
            <ul className="league-list">
              {c.leagues.map((l) => (
                <li key={l.id}>{l.name}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
