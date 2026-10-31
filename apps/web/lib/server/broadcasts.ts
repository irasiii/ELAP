import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Broadcast, Match, WatchLink } from '@elap/core';
import { cached } from './cache';

interface BroadcastFile {
  leagues?: Record<string, { channel?: string; commentator?: string; watch?: WatchLink[] }>;
  matches?: Record<string, Partial<Broadcast>>;
}

const FILE = path.join(process.cwd(), 'data', 'broadcasts.json');

async function load(): Promise<BroadcastFile> {
  // Re-read every 60 s so edits show up without a restart.
  return cached('broadcasts', 60, async () => {
    try {
      return JSON.parse(await readFile(FILE, 'utf8')) as BroadcastFile;
    } catch {
      return {};
    }
  });
}

function isSafeHttpUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function withBroadcasts<T extends Match>(matches: T[]): Promise<T[]> {
  const file = await load();
  return matches.map((m) => {
    const league = file.leagues?.[String(m.league.id)] ?? {};
    const own = file.matches?.[String(m.id)] ?? {};
    const watch = [...(own.watch ?? []), ...(league.watch ?? [])].filter((w) => isSafeHttpUrl(w.url));
    return {
      ...m,
      broadcast: {
        channel: own.channel ?? league.channel ?? null,
        commentator: own.commentator ?? league.commentator ?? null,
        watch,
        licensedStreamUrl: isSafeHttpUrl(own.licensedStreamUrl) ? own.licensedStreamUrl : null,
      },
    };
  });
}
