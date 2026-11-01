import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** A team saved on this device. No account or server storage needed. */
export interface FavouriteTeam {
  id: number;
  name: string;
  logo: string | null;
  /** API-Football country name, e.g. "Saudi-Arabia". */
  country?: string | null;
}

const KEY = 'elap.favourites.v1';

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

interface FavouritesValue {
  teams: FavouriteTeam[];
  ready: boolean;
  isFavourite: (id: number) => boolean;
  toggle: (team: FavouriteTeam) => void;
}

const Ctx = createContext<FavouritesValue | null>(null);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<FavouriteTeam[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setTeams(parsed.filter(isTeam));
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<FavouritesValue>(
    () => ({
      teams,
      ready,
      isFavourite: (id) => teams.some((team) => team.id === id),
      toggle: (team) =>
        setTeams((current) => {
          const next = current.some((t) => t.id === team.id) ? current.filter((t) => t.id !== team.id) : [team, ...current];
          AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
          return next;
        }),
    }),
    [teams, ready],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavourites(): FavouritesValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('useFavourites must be used inside FavouritesProvider');
  return value;
}
