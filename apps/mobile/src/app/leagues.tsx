import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { countryName, t } from '@elap/core';
import type { CountryLeagues } from '@elap/core';
import { api } from '../lib/api';
import { usePrefs } from '../lib/prefs';
import { colors } from '../lib/theme';

export default function LeaguesScreen() {
  const { lang, country, row, textStart } = usePrefs();
  const [data, setData] = useState<CountryLeagues[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setData(null);
    api.leagues({ country, lang }).then(setData).catch(() => setError(true));
  }, [country, lang]);

  if (!data) {
    return (
      <View style={styles.center}>
        {error ? <Text style={styles.muted}>{t('loadError', lang)}</Text> : <ActivityIndicator color={colors.accent} />}
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={data}
      keyExtractor={(c) => c.country}
      renderItem={({ item }) => {
        const mine = !!item.code && item.code === country;
        return (
          <View style={[styles.card, mine && styles.mine]}>
            <View style={[styles.head, { flexDirection: row }]}>
              <Text style={styles.code}>{(item.code ?? item.country.slice(0, 3)).toUpperCase()}</Text>
              <Text style={[styles.country, { textAlign: textStart }]}>{countryName(item.country, lang)}</Text>
            </View>
            {item.leagues.map((l) => (
              <Text key={l.id} style={[styles.league, { textAlign: textStart }]}>{l.name}</Text>
            ))}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  muted: { color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' },
  mine: { borderWidth: 2, borderColor: colors.accent },
  head: { alignItems: 'center', gap: 12, padding: 14 },
  code: { fontSize: 12, fontWeight: '700', color: colors.accentInk, backgroundColor: colors.accent, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  country: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
  league: { color: colors.text, fontSize: 14, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.surface2 },
});
