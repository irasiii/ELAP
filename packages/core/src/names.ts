import type { Lang } from './i18n';

/** Arabic names for the countries API-Football returns in English. Add more as ELAP grows. */
const COUNTRY_AR: Record<string, string> = {
  World: 'دولي',
  'Saudi Arabia': 'السعودية',
  Egypt: 'مصر',
  Morocco: 'المغرب',
  Algeria: 'الجزائر',
  Tunisia: 'تونس',
  'United-Arab-Emirates': 'الإمارات',
  'United Arab Emirates': 'الإمارات',
  Qatar: 'قطر',
  Kuwait: 'الكويت',
  Jordan: 'الأردن',
  Iraq: 'العراق',
  England: 'إنجلترا',
  Spain: 'إسبانيا',
  Italy: 'إيطاليا',
  Germany: 'ألمانيا',
  France: 'فرنسا',
  Portugal: 'البرتغال',
  Netherlands: 'هولندا',
  Turkey: 'تركيا',
  Australia: 'أستراليا',
  USA: 'الولايات المتحدة',
  Brazil: 'البرازيل',
  Argentina: 'الأرجنتين',
};

export function countryName(country: string, lang: Lang = 'ar'): string {
  return lang === 'ar' ? COUNTRY_AR[country] ?? country : country;
}

/** One or two letters for a placeholder crest. Skips the Arabic article "ال" so clubs don't all show the same letters. */
export function crestInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const strip = (w: string) => (w.startsWith('ال') && w.length > 2 ? w.slice(2) : w);
  const first = strip(words[0] ?? '?');
  if (/^[A-Za-z]/.test(first)) {
    return ((words.length > 1 ? first[0] + strip(words[1])[0] : first.slice(0, 2)) || '?').toUpperCase();
  }
  return first.slice(0, 1) || '?';
}
