export type Lang = 'ar' | 'en' | 'fr';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

export const DEFAULT_LANG: Lang = 'ar';

export function isLang(v: unknown): v is Lang {
  return v === 'ar' || v === 'en' || v === 'fr';
}

export function dir(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/** Best supported language for a list of BCP-47 tags (e.g. from Accept-Language or the phone settings). */
export function matchLang(tags: (string | null | undefined)[]): Lang {
  for (const tag of tags) {
    const base = tag?.toLowerCase().split(/[-_]/)[0];
    if (isLang(base)) return base;
  }
  return DEFAULT_LANG;
}

/** Parses an Accept-Language header into tags ordered by preference. */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];
  return header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.trim(), q: q ? Number(q) : 1 };
    })
    .filter((x) => x.tag && !Number.isNaN(x.q))
    .sort((a, b) => b.q - a.q)
    .map((x) => x.tag);
}

const strings = {
  ar: {
    appName: 'ELAP',
    yesterday: 'أمس',
    today: 'اليوم',
    tomorrow: 'غدًا',
    yesterdayTitle: 'مباريات الأمس',
    todayTitle: 'مباريات اليوم',
    tomorrowTitle: 'مباريات الغد',
    matches: 'المباريات',
    leagues: 'الدوريات',
    favourites: 'المفضلة',
    settings: 'الإعدادات',
    language: 'اللغة',
    country: 'الدولة',
    autoCountry: 'تلقائي',
    localTimes: 'الأوقات بتوقيتك المحلي',
    lastUpdated: 'آخر تحديث',
    noMatches: 'لا توجد مباريات في هذا اليوم',
    tierLocal: 'بطولات بلدك',
    tierInternational: 'البطولات الدولية',
    tierOther: 'بطولات أخرى',
    competition: 'البطولة',
    kickoff: 'الموعد بتوقيتك',
    venue: 'الملعب',
    channel: 'القناة الناقلة',
    commentator: 'المعلق',
    unknown: 'غير معروف',
    whereToWatch: 'أين تشاهد المباراة رسميًا',
    watch: 'مشاهدة',
    noWatch: 'لم تُضف روابط مشاهدة رسمية لهذه المباراة بعد',
    events: 'أحداث المباراة',
    noEvents: 'لا توجد أحداث بعد',
    lineups: 'التشكيلة',
    noLineups: 'تُنشر التشكيلة عادة قبل المباراة بقليل',
    coach: 'المدرب',
    substitutes: 'البدلاء',
    sampleData: 'بيانات تجريبية — أضف مفتاح API-Football لعرض المباريات الحقيقية',
    allCountries: 'كل الدول',
    back: 'رجوع',
    goal: 'هدف',
    penaltyGoal: 'هدف (ركلة جزاء)',
    ownGoal: 'هدف (عكسي)',
    yellowCard: 'بطاقة صفراء',
    redCard: 'بطاقة حمراء',
    subst: 'تبديل',
    var: 'فار',
    loadError: 'تعذر تحميل البيانات. حاول مرة أخرى.',
    retry: 'إعادة المحاولة',
    vs: 'ضد',
    team: 'الفريق',
    teamUpdates: 'آخر أخبار الفريق',
    schedule: 'جدول المباريات القادمة',
    results: 'آخر النتائج',
    form: 'آخر 5 مباريات',
    noSchedule: 'لا توجد مباريات قادمة معلنة',
    noResults: 'لا توجد نتائج بعد',
    founded: 'تأسس',
    win: 'ف',
    draw: 'ت',
    loss: 'خ',
    dataSource: 'البيانات من API-Football',
    timesIn: 'الأوقات بتوقيت',
  },
  en: {
    appName: 'ELAP',
    yesterday: 'Yesterday',
    today: 'Today',
    tomorrow: 'Tomorrow',
    yesterdayTitle: "Yesterday's matches",
    todayTitle: "Today's matches",
    tomorrowTitle: "Tomorrow's matches",
    matches: 'Matches',
    leagues: 'Leagues',
    favourites: 'Favourites',
    settings: 'Settings',
    language: 'Language',
    country: 'Country',
    autoCountry: 'Automatic',
    localTimes: 'Times in your local timezone',
    lastUpdated: 'Last updated',
    noMatches: 'No matches on this day',
    tierLocal: 'Your country',
    tierInternational: 'International',
    tierOther: 'More competitions',
    competition: 'Competition',
    kickoff: 'Kickoff (your time)',
    venue: 'Venue',
    channel: 'TV channel',
    commentator: 'Commentator',
    unknown: 'Unknown',
    whereToWatch: 'Where to watch officially',
    watch: 'Watch',
    noWatch: 'No official watch links added for this match yet',
    events: 'Match events',
    noEvents: 'No events yet',
    lineups: 'Lineups',
    noLineups: 'Lineups are usually published shortly before kickoff',
    coach: 'Coach',
    substitutes: 'Substitutes',
    sampleData: 'Sample data — add an API-Football key to show real matches',
    allCountries: 'All countries',
    back: 'Back',
    goal: 'Goal',
    penaltyGoal: 'Goal (penalty)',
    ownGoal: 'Own goal',
    yellowCard: 'Yellow card',
    redCard: 'Red card',
    subst: 'Substitution',
    var: 'VAR',
    loadError: 'Could not load data. Please try again.',
    retry: 'Retry',
    vs: 'vs',
    team: 'Team',
    teamUpdates: 'Team updates',
    schedule: 'Upcoming schedule',
    results: 'Recent results',
    form: 'Last 5 matches',
    noSchedule: 'No upcoming matches announced',
    noResults: 'No results yet',
    founded: 'Founded',
    win: 'W',
    draw: 'D',
    loss: 'L',
    dataSource: 'Data from API-Football',
    timesIn: 'Times in',
  },
  fr: {
    appName: 'ELAP',
    yesterday: 'Hier',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    yesterdayTitle: "Matchs d'hier",
    todayTitle: "Matchs d'aujourd'hui",
    tomorrowTitle: 'Matchs de demain',
    matches: 'Matchs',
    leagues: 'Compétitions',
    favourites: 'Favoris',
    settings: 'Réglages',
    language: 'Langue',
    country: 'Pays',
    autoCountry: 'Automatique',
    localTimes: 'Heures dans votre fuseau horaire',
    lastUpdated: 'Dernière mise à jour',
    noMatches: 'Aucun match ce jour-là',
    tierLocal: 'Votre pays',
    tierInternational: 'International',
    tierOther: 'Autres compétitions',
    competition: 'Compétition',
    kickoff: "Coup d'envoi (votre heure)",
    venue: 'Stade',
    channel: 'Chaîne TV',
    commentator: 'Commentateur',
    unknown: 'Inconnu',
    whereToWatch: 'Où regarder officiellement',
    watch: 'Regarder',
    noWatch: "Aucun lien officiel ajouté pour ce match pour l'instant",
    events: 'Faits du match',
    noEvents: "Pas encore d'événements",
    lineups: 'Compositions',
    noLineups: "Les compositions sont publiées peu avant le coup d'envoi",
    coach: 'Entraîneur',
    substitutes: 'Remplaçants',
    sampleData: 'Données de démonstration — ajoutez une clé API-Football pour les vrais matchs',
    allCountries: 'Tous les pays',
    back: 'Retour',
    goal: 'But',
    penaltyGoal: 'But (penalty)',
    ownGoal: 'But contre son camp',
    yellowCard: 'Carton jaune',
    redCard: 'Carton rouge',
    subst: 'Remplacement',
    var: 'VAR',
    loadError: 'Impossible de charger les données. Réessayez.',
    retry: 'Réessayer',
    vs: 'contre',
    team: 'Équipe',
    teamUpdates: "Actualité de l'équipe",
    schedule: 'Prochains matchs',
    results: 'Derniers résultats',
    form: '5 derniers matchs',
    noSchedule: 'Aucun match à venir annoncé',
    noResults: 'Pas encore de résultats',
    founded: 'Fondé en',
    win: 'V',
    draw: 'N',
    loss: 'D',
    dataSource: 'Données API-Football',
    timesIn: 'Heures :',
  },
} as const;

export type StringKey = keyof (typeof strings)['ar'];

export function t(key: StringKey, lang: Lang = DEFAULT_LANG): string {
  return strings[lang][key];
}
