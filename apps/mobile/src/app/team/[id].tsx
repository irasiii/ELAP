import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { countryName, formatUpdated, storyText, t } from '@elap/core';
import type { FormResult, TeamDetail } from '@elap/core';
import { Crest } from '../../components/Crest';
import { MatchRow } from '../../components/MatchRow';
import { api } from '../../lib/api';
import { usePrefs } from '../../lib/prefs';
import { colors } from '../../lib/theme';

const FORM_KEY: Record<FormResult, 'win' | 'draw' | 'loss'> = { W: 'win', D: 'draw', L: 'loss' };
const FORM_BG: Record<FormResult, string> = { W: colors.accent, D: colors.draw, L: colors.loss };

export default function TeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang, timeZone, row, textStart } = usePrefs();
  const [d, setD] = useState<TeamDetail | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setD(await api.team(id, lang));
      setError(false);
    } catch {
      setError(true);
    }
  }, [id, lang]);

  useEffect(() => {
    load();
  }, [load]);

  if (!d) {
    return (
      <View style={styles.center}>
        {error ? <Text style={styles.muted}>{t('loadError', lang)}</Text> : <ActivityIndicator color={colors.accent} />}
      </View>
    );
  }

  const facts = [d.team.country ? countryName(d.team.country, lang) : null, d.team.venue, d.team.founded ? `${t('founded', lang)} ${d.team.founded}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={colors.accent}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
    >
      <Stack.Screen options={{ title: d.team.name }} />

      <View>
        <View style={[styles.head, { flexDirection: row }]}>
          <Crest team={d.team} size={64} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.title, { textAlign: textStart }]}>{d.team.name}</Text>
            {!!facts && <Text style={[styles.muted, { textAlign: textStart }]}>{facts}</Text>}
            {d.form.length > 0 && (
              <View style={[styles.form, { flexDirection: row }]} accessibilityLabel={t('form', lang)}>
                {d.form.map((r, i) => (
                  <Text key={i} style={[styles.badge, { backgroundColor: FORM_BG[r] }]}>{t(FORM_KEY[r], lang)}</Text>
                ))}
              </View>
            )}
          </View>
        </View>
        <Text style={styles.updated}>
          {t('lastUpdated', lang)}: {formatUpdated(d.updatedAt, timeZone, lang)}
        </Text>
      </View>

      {d.sample && <Text style={styles.notice}>{t('sampleData', lang)}</Text>}

      <View>
        <Text style={[styles.h2, { textAlign: textStart }]}>{t('teamUpdates', lang)}</Text>
        <View style={styles.card}>
          {d.story.map((u, i) => (
            <Pressable
              key={`${u.kind}-${u.matchId}`}
              onPress={() => router.push(`/match/${u.matchId}`)}
              style={[styles.story, { flexDirection: row }, i > 0 && styles.divider]}
              accessibilityRole="link"
            >
              <View
                style={[
                  styles.storyDot,
                  u.kind === 'next'
                    ? { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.accent }
                    : { backgroundColor: u.kind === 'live' ? colors.accent : FORM_BG[u.result ?? 'D'] },
                ]}
              />
              <Text style={[styles.storyText, { textAlign: textStart }]}>{storyText(u, lang, timeZone)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <Text style={[styles.h2, { textAlign: textStart }]}>{t('schedule', lang)}</Text>
        {d.upcoming.length === 0 ? (
          <Text style={[styles.muted, { textAlign: textStart }]}>{t('noSchedule', lang)}</Text>
        ) : (
          <View style={styles.card}>
            {d.upcoming.map((m) => (
              <MatchRow key={m.id} match={m} showDate />
            ))}
          </View>
        )}
      </View>

      <View>
        <Text style={[styles.h2, { textAlign: textStart }]}>{t('results', lang)}</Text>
        {d.recent.length === 0 ? (
          <Text style={[styles.muted, { textAlign: textStart }]}>{t('noResults', lang)}</Text>
        ) : (
          <View style={styles.card}>
            {d.recent.map((m) => (
              <MatchRow key={m.id} match={m} showDate />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  head: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, alignItems: 'center', gap: 16 },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  muted: { color: colors.muted, fontSize: 13 },
  form: { gap: 6, marginTop: 6 },
  badge: { width: 26, height: 26, borderRadius: 7, overflow: 'hidden', textAlign: 'center', lineHeight: 26, fontWeight: '700', fontSize: 12, color: colors.accentInk },
  updated: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 8 },
  notice: { padding: 10, borderRadius: 12, backgroundColor: colors.notice, color: colors.noticeText, fontSize: 13, textAlign: 'center' },
  h2: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' },
  divider: { borderTopWidth: 1, borderTopColor: colors.surface2 },
  story: { gap: 12, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'flex-start' },
  storyDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  storyText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },
});
