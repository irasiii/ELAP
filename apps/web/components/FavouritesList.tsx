'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { countryName, t } from '@elap/core';
import type { Lang } from '@elap/core';
import { FAVOURITES_EVENT, readFavourites, toggleFavourite, type FavouriteTeam } from '@/lib/favourites';
import { Crest } from './Crest';

export function FavouritesList({ lang }: { lang: Lang }) {
  const [teams, setTeams] = useState<FavouriteTeam[] | null>(null);

  useEffect(() => {
    const sync = () => setTeams(readFavourites());
    sync();
    window.addEventListener(FAVOURITES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FAVOURITES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (teams === null) return <p className="empty">{t('loading', lang)}</p>;
  if (teams.length === 0) return <p className="empty">{t('noFavourites', lang)}</p>;

  return (
    <div className="favourites-grid">
      {teams.map((team) => (
        <div className="card favourite" key={team.id}>
          <Link href={`/team/${team.id}`} className="favourite-team">
            <Crest team={team} size={40} />
            <span className="favourite-name">
              <strong>{team.name}</strong>
              {team.country && <span className="muted"> · {countryName(team.country, lang)}</span>}
            </span>
          </Link>
          <button type="button" className="fav-remove" onClick={() => setTeams(toggleFavourite(team))}>
            {t('removeFavourite', lang)}
          </button>
        </div>
      ))}
    </div>
  );
}
