'use client';

import { useEffect, useState } from 'react';
import { countryName, createElapClient, formatUpdated, isInPlay, isLang, t } from '@elap/core';
import type { FixturesResponse, LeagueTier } from '@elap/core';
import { MatchRow } from './MatchRow';

const REFRESH_MS = 30_000;
const TIER_TITLE: Record<LeagueTier, 'tierLocal' | 'tierInternational' | 'tierOther'> = {
  local: 'tierLocal',
  international: 'tierInternational',
  other: 'tierOther',
};

/** Renders the server-fetched fixtures, then refreshes every 30 s while any match is live. */
export function LiveFixtures({ initial }: { initial: FixturesResponse }) {
  const [data, setData] = useState(initial);
  const lang = isLang(data.lang) ? data.lang : 'ar';
  const anyLive = data.groups.some((g) => g.matches.some((m) => isInPlay(m.status)));

  useEffect(() => setData(initial), [initial]);

  useEffect(() => {
    if (!anyLive) return;
    const client = createElapClient(window.location.origin);
    const timer = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        setData(await client.fixtures(data.date, data.timezone, { country: data.country, lang }));
      } catch {
        /* keep showing the last good data */
      }
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [anyLive, data.date, data.timezone, data.country, lang]);

  const updated = (
    <p className="updated" aria-live="polite">
      {t('lastUpdated', lang)}: <time dateTime={data.updatedAt}>{formatUpdated(data.updatedAt, data.timezone, lang)}</time>
      {anyLive ? ' ·' : ''} {anyLive ? <span className="live-dot" aria-hidden="true" /> : null}
    </p>
  );

  if (data.groups.length === 0)
    return (
      <>
        {updated}
        <p className="empty">{t('noMatches', lang)}</p>
      </>
    );

  return (
    <div className="groups">
      {updated}
      {data.groups.map((g, i) => (
        <div key={g.league.id} className="group">
          {(i === 0 || data.groups[i - 1].tier !== g.tier) && <h2 className="tier-title">{t(TIER_TITLE[g.tier], lang)}</h2>}
          <section className="card">
            <header className="card-head">
              {g.league.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.league.logo} alt="" width={22} height={22} />
              ) : (
                <span className="code">{(g.league.countryCode ?? g.league.country.slice(0, 3)).toUpperCase()}</span>
              )}
              <h3>{g.league.name}</h3>
              <span className="muted">{countryName(g.league.country, lang)}</span>
            </header>
            {g.matches.map((m) => (
              <MatchRow key={m.id} match={m} timeZone={data.timezone} lang={lang} />
            ))}
          </section>
        </div>
      ))}
    </div>
  );
}
