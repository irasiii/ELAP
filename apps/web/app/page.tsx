import Link from 'next/link';
import { dateForDay, formatMatchDate, t } from '@elap/core';
import type { DayKey } from '@elap/core';
import { LiveFixtures } from '@/components/LiveFixtures';
import { getFixtures } from '@/lib/server/service';
import { getViewer } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const DAYS: DayKey[] = ['yesterday', 'today', 'tomorrow'];
const TITLES = { yesterday: 'yesterdayTitle', today: 'todayTitle', tomorrow: 'tomorrowTitle' } as const;

export default async function Home({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  const { day: dayParam } = await searchParams;
  const day: DayKey = DAYS.includes(dayParam as DayKey) ? (dayParam as DayKey) : 'today';
  const { timeZone, lang, country } = await getViewer();
  const date = dateForDay(day, timeZone);

  let fixtures;
  try {
    fixtures = await getFixtures(date, timeZone, country, lang);
  } catch {
    return <p className="empty">{t('loadError', lang)}</p>;
  }

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>{t(TITLES[day], lang)}</h1>
          <p className="muted">
            {formatMatchDate(`${date}T12:00:00Z`, 'UTC', lang)} · {t('localTimes', lang)}
          </p>
        </div>
        <nav className="day-tabs" aria-label={t('matches', lang)}>
          {DAYS.map((d) => (
            <Link key={d} href={d === 'today' ? '/' : `/?day=${d}`} className={d === day ? 'active' : ''} aria-current={d === day ? 'page' : undefined}>
              {t(d, lang)}
            </Link>
          ))}
        </nav>
      </div>
      {fixtures.sample && <p className="notice">{t('sampleData', lang)}</p>}
      <LiveFixtures initial={fixtures} />
    </main>
  );
}
