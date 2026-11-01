/** Favourite teams stored locally in the browser. No account or server storage needed. */

export interface FavouriteTeam {
  id: number;
  name: string;
  logo: string | null;
  /** API-Football country name, e.g. "Saudi-Arabia". */
  country?: string | null;
}

const KEY = 'elap.favourites.v1';
export const FAVOURITES_EVENT = 'elap:favourites';

function isTeam(value: unknown): value is FavouriteTeam {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'number' &&
    Number.isInteger(v.id) &&
    v.id > 0 &&
    typeof v.name === 'string' &&
    (v.logo == null || typeof v.logo === 'string') &&
    (v.country == null || typeof v.country === 'string')
  );
}

export function readFavourites(): FavouriteTeam[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isTeam) : [];
  } catch {
    return [];
  }
}

function writeFavourites(teams: FavouriteTeam[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(teams));
  window.dispatchEvent(new Event(FAVOURITES_EVENT));
}

export function isFavourite(id: number): boolean {
  return readFavourites().some((team) => team.id === id);
}

/** Adds the team if it is not saved, otherwise removes it. Returns the new list. */
export function toggleFavourite(team: FavouriteTeam): FavouriteTeam[] {
  const current = readFavourites();
  const next = current.some((t) => t.id === team.id) ? current.filter((t) => t.id !== team.id) : [team, ...current];
  writeFavourites(next);
  return next;
}
