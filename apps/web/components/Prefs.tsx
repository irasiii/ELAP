'use client';

import { useRouter } from 'next/navigation';
import { COUNTRIES, LANGS, t } from '@elap/core';
import type { Lang } from '@elap/core';

function setCookie(name: string, value: string | null) {
  document.cookie = value
    ? `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`
    : `${name}=; path=/; max-age=0; samesite=lax`;
}

/** Language and country pickers. Saved in cookies so every server-rendered page follows them. */
export function Prefs({ lang, country, countryChosen }: { lang: Lang; country: string | null; countryChosen: boolean }) {
  const router = useRouter();
  return (
    <div className="prefs">
      <label>
        <span className="sr-only">{t('language', lang)}</span>
        <select
          value={lang}
          onChange={(e) => {
            setCookie('elap_lang', e.target.value);
            router.refresh();
          }}
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">{t('country', lang)}</span>
        <select
          value={countryChosen ? (country ?? '') : ''}
          onChange={(e) => {
            setCookie('elap_country', e.target.value || null);
            router.refresh();
          }}
        >
          <option value="">
            {t('autoCountry', lang)}
            {!countryChosen && country ? ` (${COUNTRIES.find((c) => c.code === country)?.names[lang] ?? country})` : ''}
          </option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.names[lang]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
