import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Lang, League, Match, Team } from '@elap/core';
import { cached } from './cache';

type Tr = Partial<Record<Lang, string>>;
interface NamesFile {
  leagues?: Record<string, Tr>;
  teams?: Record<string, Tr>;
}

const FILE = path.join(process.cwd(), 'data', 'names.json');

async function load(): Promise<NamesFile> {
  return cached('names', 300, async () => {
    try {
      return JSON.parse(await readFile(FILE, 'utf8')) as NamesFile;
    } catch {
      return {};
    }
  });
}

/** Translates team and league names into the viewer's language using data/names.json. */
export async function localizer(lang: Lang) {
  const file = await load();
  const team = <T extends Team>(t: T): T => ({ ...t, name: file.teams?.[t.name]?.[lang] ?? t.name });
  const league = <L extends League>(l: L): L => ({ ...l, name: file.leagues?.[String(l.id)]?.[lang] ?? l.name });
  const match = <M extends Match>(m: M): M => ({ ...m, home: team(m.home), away: team(m.away), league: league(m.league) });
  return { team, league, match };
}
