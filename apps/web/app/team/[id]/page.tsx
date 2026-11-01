import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { countryName, formatUpdated, storyText, t } from '@elap/core';
import type { FormResult, Lang, TeamDetail } from '@elap/core';
import { Crest } from '@/components/Crest';
import { MatchRow } from '@/components/MatchRow';
import { readId } from '@/lib/server/params';
import { getTeam } from '@/lib/server/service';
import { getViewer } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

async function load(raw: string, lang: Lang): Promise<TeamDetail | null> {
  const id = readId(raw);
  return id ? getTeam(id, lang) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { lang } = await getViewer();
  const d = await load((await params).id, lang).catch(() => null);
  return { title: d ? d.team.name : t('team', lang) };
}

const FORM_KEY: Record<FormResult, 'win' | 'draw' | 'loss'> = { W: 'win', D: 'draw', L: 'loss' };

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { timeZone: tz, lang } = await getViewer();
  const d = await load(id, lang);
  if (!d) notFound();

  const facts = [
    d.team.country ? countryName(d.team.country, lang) : null,
    d.team.venue,
    d.team.founded ? `${t('founded', lang)} ${d.team.founded}` : null,
  ].filter(Boolean);

  return (
    <main className="team-page">
      <Link href="/" className="back">{t('back', lang)}</Link>

      <section className="team-head card">
        <Crest team={d.team} size={72} />
        <div className="team-head-text">
          <h1>{d.team.name}</h1>
          {facts.length > 0 && <p className="muted">{facts.join(' · ')}</p>}
          {d.form.length > 0 && (
            <div className="form" aria-label={t('form', lang)}>
              <span className="muted">{t('form', lang)}</span>
              {d.form.map((r, i) => (
                <span key={i} className={`form-badge form-${r}`}>{t(FORM_KEY[r], lang)}</span>
              ))}
            </div>
          )}
        </div>
      </section>
      <p className="updated">
        {t('lastUpdated', lang)}: <time dateTime={d.updatedAt}>{formatUpdated(d.updatedAt, tz, lang)}</time>
      </p>
      {d.sample && <p className="notice">{t('sampleData', lang)}</p>}

      <div className="two-col">
        <div className="col-main">
          <section>
            <h2 className="section-title">{t('schedule', lang)}</h2>
            {d.upcoming.length === 0 ? (
              <p className="muted">{t('noSchedule', lang)}</p>
            ) : (
              <div className="card">
                {d.upcoming.map((m) => (
                  <MatchRow key={m.id} match={m} timeZone={tz} lang={lang} showDate />
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="section-title">{t('results', lang)}</h2>
            {d.recent.length === 0 ? (
              <p className="muted">{t('noResults', lang)}</p>
            ) : (
              <div className="card">
                {d.recent.map((m) => (
                  <MatchRow key={m.id} match={m} timeZone={tz} lang={lang} showDate />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="col-side">
          <h2 className="section-title">{t('teamUpdates', lang)}</h2>
          <ol className="card story">
            {d.story.map((u) => (
              <li key={`${u.kind}-${u.matchId}`} className={`story-${u.kind}`}>
                <Link href={`/match/${u.matchId}`}>
                  <span className={`story-dot story-dot-${u.result ?? u.kind}`} aria-hidden="true" />
                  <span>{storyText(u, lang, tz)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  );
}
