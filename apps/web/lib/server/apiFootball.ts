import 'server-only';
import { cached } from './cache';

const BASE_URL = 'https://v3.football.api-sports.io';

export function hasApiKey(): boolean {
  return !!process.env.API_FOOTBALL_KEY;
}

interface ApiEnvelope<T> {
  errors: unknown;
  results: number;
  response: T;
}

/**
 * GET an API-Football endpoint through the shared cache.
 * The key is read from the API_FOOTBALL_KEY environment variable and never leaves the server.
 */
export async function apiFootball<T>(
  path: string,
  params: Record<string, string | number>,
  ttlSeconds: number,
): Promise<T> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new Error('API_FOOTBALL_KEY is not set');

  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
  const url = `${BASE_URL}${path}${qs ? `?${qs}` : ''}`;

  return cached(`af:${url}`, ttlSeconds, async () => {
    const res = await fetch(url, {
      headers: { 'x-apisports-key': key },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`API-Football ${res.status} for ${path}`);
    const body = (await res.json()) as ApiEnvelope<T>;
    const errors = body.errors;
    const hasErrors = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0;
    if (hasErrors) throw new Error(`API-Football error for ${path}: ${JSON.stringify(errors)}`);
    return body.response;
  });
}
