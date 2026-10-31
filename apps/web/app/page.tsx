import Link from 'next/link';
import { dateForDay, formatMatchDate, t } from '@elap/core';
import type { DayKey } from '@elap/core';
import { LiveFixtures } from '@/components/LiveFixtures';
import { getFixtures } from '@/lib/server/service';
import { viewerTimeZone } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const DAYS: DayKey[] = ['yesterday', 'today', 'tomorrow'];

export default async function Home({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  const { day: dayParam } = await searchParams;
  const day: DayKey = DAYS.includes(dayParam as DayKey) ? (dayParam as DayKey) : 'today';
  const tz = await viewerTimeZone();
  const date = dateForDay(day, tz);

  let fixtures;
  try {
    fixtures = await getFixtures(date, tz);
  } catch {
    return <p className="empty">{t('loadError')}</p>;
  }

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>{day === 'today' ? 'مباريات اليوم' : day === 'yesterday' ? 'مباريات الأمس' : 'مباريات الغد'}</h1>
          <p className="muted">
            {formatMatchDate(`${date}T12:00:00Z`, 'UTC')} · {t('localTimes')}
          </p>
        </div>
        <nav className="day-tabs" aria-label="اختيار اليوم">
          {DAYS.map((d) => (
            <Link key={d} href={d === 'today' ? '/' : `/?day=${d}`} className={d === day ? 'active' : ''} aria-current={d === day ? 'page' : undefined}>
              {t(d)}
            </Link>
          ))}
        </nav>
      </div>
      {fixtures.sample && <p className="notice">{t('sampleData')}</p>}
      <LiveFixtures initial={fixtures} />
    </main>
  );
}
