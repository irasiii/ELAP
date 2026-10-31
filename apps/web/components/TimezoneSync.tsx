'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deviceTimeZone } from '@elap/core';

/** Stores the browser's timezone in a cookie so server-rendered pages show local kickoff times. */
export function TimezoneSync({ current }: { current: string }) {
  const router = useRouter();
  useEffect(() => {
    const tz = deviceTimeZone();
    if (tz !== current) {
      document.cookie = `elap_tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    }
  }, [current, router]);
  return null;
}
