'use client';

import { useEffect, useState } from 'react';
import { t } from '@elap/core';
import type { Lang } from '@elap/core';
import { FAVOURITES_EVENT, isFavourite, toggleFavourite, type FavouriteTeam } from '@/lib/favourites';

/** Star toggle on a team page. Favourites live in localStorage, so no account is needed. */
export function FavouriteButton({ team, lang }: { team: FavouriteTeam; lang: Lang }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(isFavourite(team.id));
    sync();
    window.addEventListener(FAVOURITES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FAVOURITES_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [team.id]);

  const label = t(on ? 'removeFavourite' : 'addFavourite', lang);
  return (
    <button
      type="button"
      className={`fav-btn${on ? ' is-on' : ''}`}
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={() => {
        toggleFavourite(team);
        setOn(isFavourite(team.id));
      }}
    >
      <span aria-hidden="true">{on ? '★' : '☆'}</span>
      <span className="fav-label">{label}</span>
    </button>
  );
}
