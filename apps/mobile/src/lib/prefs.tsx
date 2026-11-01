import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { deviceTimeZone, dir, isLang, matchLang } from '@elap/core';
import type { Lang } from '@elap/core';

interface Prefs {
  lang: Lang;
  /** ISO alpha-2 country used to put local competitions first. */
  country: string | null;
  /** True when the user picked the country; otherwise it follows the phone's region. */
  countryChosen: boolean;
  timeZone: string;
  setLang: (l: Lang | null) => void;
  setCountry: (c: string | null) => void;
  /** Row direction for the current language (Arabic reads right-to-left). */
  row: 'row' | 'row-reverse';
  rowReverse: 'row' | 'row-reverse';
  textStart: 'left' | 'right';
}

const KEY = 'elap.prefs.v1';
const Ctx = createContext<Prefs | null>(null);

function detect() {
  const locales = getLocales();
  return {
    lang: matchLang(locales.map((l) => l.languageTag)),
    country: locales.find((l) => l.regionCode)?.regionCode?.toUpperCase() ?? null,
  };
}

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const detected = useMemo(detect, []);
  const [savedLang, setSavedLang] = useState<Lang | null>(null);
  const [savedCountry, setSavedCountry] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const v = JSON.parse(raw) as { lang?: string; country?: string };
        if (isLang(v.lang)) setSavedLang(v.lang);
        if (v.country && /^[A-Z]{2}$/.test(v.country)) setSavedCountry(v.country);
      })
      .catch(() => undefined);
  }, []);

  const persist = (lang: Lang | null, country: string | null) =>
    AsyncStorage.setItem(KEY, JSON.stringify({ lang, country })).catch(() => undefined);

  const lang = savedLang ?? detected.lang;
  // If the phone itself runs RTL, React Native already mirrors rows; otherwise mirror for Arabic ourselves.
  const wantRtl = dir(lang) === 'rtl';
  const mirrored = wantRtl !== I18nManager.isRTL;

  const value: Prefs = {
    lang,
    country: savedCountry ?? detected.country,
    countryChosen: !!savedCountry,
    timeZone: deviceTimeZone(),
    setLang: (l) => {
      setSavedLang(l);
      persist(l, savedCountry);
    },
    setCountry: (c) => {
      setSavedCountry(c);
      persist(savedLang, c);
    },
    row: mirrored ? 'row-reverse' : 'row',
    rowReverse: mirrored ? 'row' : 'row-reverse',
    textStart: wantRtl ? 'right' : 'left',
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs(): Prefs {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePrefs must be used inside PrefsProvider');
  return v;
}
