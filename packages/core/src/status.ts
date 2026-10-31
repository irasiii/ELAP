import type { Lang } from './i18n';
import type { Match, MatchStatus } from './types';

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
  ar: {
    scheduled: 'لم تبدأ',
    live: 'مباشر',
    halftime: 'استراحة',
    finished: 'انتهت',
    postponed: 'مؤجلة',
    cancelled: 'ملغاة',
  },
  en: {
    scheduled: 'Not started',
    live: 'Live',
    halftime: 'Half-time',
    finished: 'Full-time',
    postponed: 'Postponed',
    cancelled: 'Cancelled',
  },
};

/** "مباشر 67'" for live matches, otherwise the plain status label. */
export function statusLabel(match: Pick<Match, 'status' | 'minute'>, lang: Lang = 'ar'): string {
  const base = labels[lang][match.status];
  if (match.status === 'live' && match.minute != null) return `${base} ${match.minute}'`;
  return base;
}

export function hasScore(match: Pick<Match, 'status' | 'score'>): boolean {
  return match.status !== 'scheduled' && match.score.home != null && match.score.away != null;
}
