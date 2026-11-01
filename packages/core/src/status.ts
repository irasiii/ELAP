import type { Lang } from './i18n';
import type { Match, MatchEvent, MatchStatus } from './types';
import { t } from './i18n';

/** Maps API-Football's short status codes to ELAP's statuses. */
export function mapApiStatus(short: string | null | undefined): MatchStatus {
  switch (short) {
    case '1H':
    case '2H':
    case 'ET':
    case 'BT':
    case 'P':
    case 'LIVE':
    case 'INT':
      return 'live';
    case 'HT':
      return 'halftime';
    case 'FT':
    case 'AET':
    case 'PEN':
      return 'finished';
    case 'PST':
    case 'SUSP':
      return 'postponed';
    case 'CANC':
    case 'ABD':
    case 'AWD':
    case 'WO':
      return 'cancelled';
    default:
      return 'scheduled';
  }
}

export function isInPlay(status: MatchStatus): boolean {
  return status === 'live' || status === 'halftime';
}

const labels: Record<Lang, Record<MatchStatus, string>> = {
  ar: { scheduled: 'لم تبدأ', live: 'مباشر', halftime: 'استراحة', finished: 'انتهت', postponed: 'مؤجلة', cancelled: 'ملغاة' },
  en: { scheduled: 'Not started', live: 'Live', halftime: 'Half-time', finished: 'Full-time', postponed: 'Postponed', cancelled: 'Cancelled' },
  fr: { scheduled: 'À venir', live: 'En direct', halftime: 'Mi-temps', finished: 'Terminé', postponed: 'Reporté', cancelled: 'Annulé' },
};

/** "مباشر 67'" for live matches, otherwise the plain status label. */
export function statusLabel(match: Pick<Match, 'status' | 'minute'>, lang: Lang): string {
  const base = labels[lang][match.status];
  if (match.status === 'live' && match.minute != null) return `${base} ${match.minute}'`;
  return base;
}

export function hasScore(match: Pick<Match, 'status' | 'score'>): boolean {
  return match.status !== 'scheduled' && match.score.home != null && match.score.away != null;
}

export function eventLabel(e: Pick<MatchEvent, 'type' | 'detail'>, lang: Lang): string {
  if (e.type === 'goal') return e.detail === 'Penalty' ? t('penaltyGoal', lang) : e.detail === 'Own Goal' ? t('ownGoal', lang) : t('goal', lang);
  if (e.type === 'card') return e.detail.includes('Red') ? t('redCard', lang) : t('yellowCard', lang);
  if (e.type === 'subst') return t('subst', lang);
  return t('var', lang);
}
