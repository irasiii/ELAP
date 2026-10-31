import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatKickoff, formatMatchDate, isInPlay, statusLabel, t } from '@elap/core';
import type { MatchDetail, MatchEvent } from '@elap/core';
import { Crest } from '@/components/Crest';
import { Score } from '@/components/Score';
import { getMatchDetail } from '@/lib/server/service';
import { viewerTimeZone } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

async function load(id: string): Promise<MatchDetail | null> {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return getMatchDetail(n);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const m = await load((await params).id).catch(() => null);
  if (!m) return { title: 'المباراة' };
  return {
    title: `${m.home.name} ضد ${m.away.name} — ${m.league.name}`,
    description: `موعد مباراة ${m.home.name} و${m.away.name} في ${m.league.name}، القناة الناقلة، المعلق، التشكيلة والأحداث.`,
  };
}

function eventLabel(e: MatchEvent): string {
  if (e.type === 'goal') return e.detail === 'Penalty' ? `${t('goal')} (ركلة جزاء)` : e.detail === 'Own Goal' ? `${t('goal')} (عكسي)` : t('goal');
  if (e.type === 'card') return e.detail.includes('Red') ? 'بطاقة حمراء' : 'بطاقة صفراء';
  if (e.type === 'subst') return t('subst');
  return t('var');
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [m, tz] = await Promise.all([load(id), viewerTimeZone()]);
  if (!m) notFound();

  const live = isInPlay(m.status);
  const teamName = (teamId: number) => (teamId === m.home.id ? m.home.name : m.away.name);

  return (
    <main className="match-page">
      <Link href="/" className="back">→ {t('back')}</Link>

      <section className="scoreboard" aria-label="النتيجة">
        <div className="side">
          <Crest team={m.home} size={64} />
          <strong>{m.home.name}</strong>
        </div>
        <div className="mid">
          <Score match={m} timeZone={tz} className="big-score" />
          <span className={`chip${live ? ' chip-live' : ''}`}>{statusLabel(m)}</span>
        </div>
        <div className="side">
          <Crest team={m.away} size={64} />
          <strong>{m.away.name}</strong>
        </div>
      </section>

      <div className="two-col">
        <div className="col-main">
          <section className="card">
            <table className="info">
              <tbody>
                <tr><th scope="row">{t('competition')}</th><td>{m.league.name}{m.round ? ` · ${m.round}` : ''}</td></tr>
                <tr><th scope="row">{t('kickoff')}</th><td>{formatMatchDate(m.kickoff, tz)} · {formatKickoff(m.kickoff, tz)}</td></tr>
                <tr><th scope="row">{t('venue')}</th><td>{m.venue ?? t('unknown')}</td></tr>
                <tr><th scope="row">{t('channel')}</th><td>{m.broadcast.channel ?? t('unknown')}</td></tr>
                <tr><th scope="row">{t('commentator')}</th><td>{m.broadcast.commentator ?? t('unknown')}</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="section-title">{t('whereToWatch')}</h2>
            {m.broadcast.watch.length === 0 ? (
              <p className="muted">{t('noWatch')}</p>
            ) : (
              <div className="watch-list">
                {m.broadcast.watch.map((w) => (
                  <a key={`${w.country}-${w.service}`} href={w.url} target="_blank" rel="noopener noreferrer" className="watch-link">
                    <span><span className="muted">{w.country} · </span>{w.service}</span>
                    <span className="accent">{t('watch')} ↗</span>
                  </a>
                ))}
              </div>
            )}
            {m.broadcast.licensedStreamUrl && (
              <video className="player" src={m.broadcast.licensedStreamUrl} controls playsInline preload="none" />
            )}
          </section>

          <section>
            <h2 className="section-title">{t('events')}</h2>
            {m.events.length === 0 ? (
              <p className="muted">{t('noEvents')}</p>
            ) : (
              <ol className="card events">
                {m.events.map((e, i) => (
                  <li key={i}>
                    <span className="minute" dir="ltr">{e.minute}{e.extra ? `+${e.extra}` : ''}&apos;</span>
                    <span className={`dot dot-${e.type}${e.detail.includes('Red') ? ' dot-red' : ''}`} aria-hidden="true" />
                    <span>{eventLabel(e)} · {teamName(e.teamId)}{e.player ? ` · ${e.player}` : ''}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="col-side">
          <h2 className="section-title">{t('lineups')}</h2>
          {m.lineups.length === 0 ? (
            <p className="muted">{t('noLineups')}</p>
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
                {l.coach && <p className="muted coach">{t('coach')}: {l.coach}</p>}
              </section>
            ))
          )}
        </aside>
      </div>
    </main>
  );
}
