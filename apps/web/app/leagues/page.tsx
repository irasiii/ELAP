import type { Metadata } from 'next';
import { countryName, t } from '@elap/core';
import { getLeagues } from '@/lib/server/service';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'الدوريات حسب الدولة' };

export default async function LeaguesPage() {
  const countries = await getLeagues().catch(() => null);
  if (!countries) return <p className="empty">{t('loadError')}</p>;

  return (
    <main>
      <div className="page-head">
        <h1>{t('leagues')}</h1>
      </div>
      <div className="country-grid">
        {countries.map((c) => (
          <section key={c.country} className="card">
            <header className="card-head">
              <span className="code">{(c.code ?? c.country.slice(0, 3)).toUpperCase()}</span>
              <h2>{countryName(c.country)}</h2>
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
