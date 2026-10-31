import 'server-only';
import { cookies } from 'next/headers';
import { DEFAULT_TIMEZONE, isValidTimeZone } from '@elap/core';

export const TZ_COOKIE = 'elap_tz';

/** The viewer's timezone, set by the TimezoneSync component on first visit. */
export async function viewerTimeZone(): Promise<string> {
  const value = (await cookies()).get(TZ_COOKIE)?.value;
  return isValidTimeZone(value) ? value : DEFAULT_TIMEZONE;
}
