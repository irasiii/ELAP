import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eventLabel, formatKickoff, formatMatchDate, formatUpdated, isInPlay, statusLabel, t } from '@elap/core';
import type { Lang, MatchDetail } from '@elap/core';
import { Crest } from '@/components/Crest';
import { Score } from '@/components/Score';
import { readId } from '@/lib/server/params';
import { getMatchDetail } from '@/lib/server/service';
import { getViewer } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

async function load(raw: string, lang: Lang): Promise<MatchDetail | null> {
  const id = readId(raw);
  return id ? getMatchDetail(id, lang) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { lang } = await getViewer();
  const m = await load((await params).id, lang).catch(() => null);
  if (!m) return { title: t('matches', lang) };
  return { title: `${m.home.name} ${t('vs', lang)} ${m.away.name} — ${m.league.name}` };
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { timeZone: tz, lang } = await getViewer();
  const m = await load(id, lang);
  if (!m) notFound();

  const live = isInPlay(m.status);
  const teamName = (teamId: number) => (teamId === m.home.id ? m.home.name : m.away.name);

  return (
    <main className="match-page">
      <Link href="/" className="back">{t('back', lang)}</Link>

      <section className="scoreboard" aria-label={t('matches', lang)}>
        <Link href={`/team/${m.home.id}`} className="side">
          <Crest team={m.home} size={64} />
          <strong>{m.home.name}</strong>
        </Link>
        <div className="mid">
          <Score match={m} timeZone={tz} lang={lang} className="big-score" />
          <span className={`chip${live ? ' chip-live' : ''}`}>{statusLabel(m, lang)}</span>
        </div>
        <Link href={`/team/${m.away.id}`} className="side">
          <Crest team={m.away} size={64} />
          <strong>{m.away.name}</strong>
        </Link>
      </section>
      <p className="updated">
        {t('lastUpdated', lang)}: <time dateTime={m.updatedAt}>{formatUpdated(m.updatedAt, tz, lang)}</time>
      </p>

      <div className="two-col">
        <div className="col-main">
          <section className="card">
            <table className="info">
              <tbody>
                <tr><th scope="row">{t('competition', lang)}</th><td>{m.league.name}{m.round ? ` · ${m.round}` : ''}</td></tr>
                <tr><th scope="row">{t('kickoff', lang)}</th><td>{formatMatchDate(m.kickoff, tz, lang)} · {formatKickoff(m.kickoff, tz, lang)}</td></tr>
                <tr><th scope="row">{t('venue', lang)}</th><td>{m.venue ?? t('unknown', lang)}</td></tr>
                <tr><th scope="row">{t('channel', lang)}</th><td>{m.broadcast.channel ?? t('unknown', lang)}</td></tr>
                <tr><th scope="row">{t('commentator', lang)}</th><td>{m.broadcast.commentator ?? t('unknown', lang)}</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="section-title">{t('whereToWatch', lang)}</h2>
            {m.broadcast.watch.length === 0 ? (
              <p className="muted">{t('noWatch', lang)}</p>
            ) : (
              <div className="watch-list">
                {m.broadcast.watch.map((w) => (
                  <a key={`${w.country}-${w.service}`} href={w.url} target="_blank" rel="noopener noreferrer" className="watch-link">
                    <span><span className="muted">{w.country} · </span>{w.service}</span>
                    <span className="accent">{t('watch', lang)} ↗</span>
                  </a>
                ))}
              </div>
            )}
            {m.broadcast.licensedStreamUrl && (
              <video className="player" src={m.broadcast.licensedStreamUrl} controls playsInline preload="none" />
            )}
          </section>

          <section>
            <h2 className="section-title">{t('events', lang)}</h2>
            {m.events.length === 0 ? (
              <p className="muted">{t('noEvents', lang)}</p>
            ) : (
              <ol className="card events">
                {m.events.map((e, i) => (
                  <li key={i}>
                    <span className="minute" dir="ltr">{e.minute}{e.extra ? `+${e.extra}` : ''}&apos;</span>
                    <span className={`dot dot-${e.type}${e.detail.includes('Red') ? ' dot-red' : ''}`} aria-hidden="true" />
                    <span>{eventLabel(e, lang)} · {teamName(e.teamId)}{e.player ? ` · ${e.player}` : ''}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="col-side">
          <h2 className="section-title">{t('lineups', lang)}</h2>
          {m.lineups.length === 0 ? (
            <p className="muted">{t('noLineups', lang)}</p>
          ) : (
            m.lineups.map((l) => (
              <section key={l.teamId} className="card lineup">
                <header className="card-head">
                  <h3>{teamName(l.teamId)}</h3>
                  {l.formation && <span className="code" dir="ltr">{l.formation}</span>}
                </header>
                <ul>
                  {l.startXI.map((p) => (
                    <li key={`${p.number}-${p.name}`}>
                      <span className="num" dir="ltr">{p.number ?? '–'}</span>
                      <span>{p.name}</span>
                    </li>
                  ))}
                </ul>
                {l.coach && <p className="muted coach">{t('coach', lang)}: {l.coach}</p>}
              </section>
            ))
          )}
        </aside>
      </div>
    </main>
  );
}
