'use client';

import { useEffect, useState } from 'react';
import { countryName, createElapClient, isInPlay, t } from '@elap/core';
import type { FixturesResponse } from '@elap/core';
import { MatchRow } from './MatchRow';

const REFRESH_MS = 30_000;

/** Renders the server-fetched fixtures, then refreshes every 30 s while any match is live. */
export function LiveFixtures({ initial }: { initial: FixturesResponse }) {
  const [data, setData] = useState(initial);
  const anyLive = data.groups.some((g) => g.matches.some((m) => isInPlay(m.status)));

  useEffect(() => setData(initial), [initial]);

  useEffect(() => {
    if (!anyLive) return;
    const client = createElapClient(window.location.origin);
    const timer = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        setData(await client.fixtures(data.date, data.timezone));
      } catch {
        /* keep showing the last good data */
      }
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [anyLive, data.date, data.timezone]);

  if (data.groups.length === 0) return <p className="empty">{t('noMatches')}</p>;

  return (
    <div className="groups">
      {data.groups.map((g) => (
        <section key={g.league.id} className="card">
          <header className="card-head">
            {g.league.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={g.league.logo} alt="" width={22} height={22} />
            ) : (
              <span className="code">{(g.league.countryCode ?? g.league.country.slice(0, 3)).toUpperCase()}</span>
            )}
            <h2>{g.league.name}</h2>
            <span className="muted">{countryName(g.league.country)}</span>
          </header>
          {g.matches.map((m) => (
            <MatchRow key={m.id} match={m} timeZone={data.timezone} />
          ))}
        </section>
      ))}
    </div>
  );
}
