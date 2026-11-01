import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { countryName, dateForDay, formatUpdated, isInPlay, t } from '@elap/core';
import type { DayKey, FixturesResponse, LeagueTier } from '@elap/core';
import { MatchRow } from '../components/MatchRow';
import { api } from '../lib/api';
import { usePrefs } from '../lib/prefs';
import { colors } from '../lib/theme';

const DAYS: DayKey[] = ['yesterday', 'today', 'tomorrow'];
const LIVE_REFRESH_MS = 30_000;
const TIER_TITLE: Record<LeagueTier, 'tierLocal' | 'tierInternational' | 'tierOther'> = {
  local: 'tierLocal',
  international: 'tierInternational',
  other: 'tierOther',
};

export default function MatchesScreen() {
  const { lang, country, timeZone, row, textStart } = usePrefs();
  const [day, setDay] = useState<DayKey>('today');
  const [data, setData] = useState<FixturesResponse | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api.fixtures(dateForDay(day, timeZone), timeZone, { country, lang }));
      setError(false);
    } catch {
      setError(true);
    }
  }, [day, timeZone, country, lang]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const anyLive = !!data?.groups.some((g) => g.matches.some((m) => isInPlay(m.status)));

  // Refresh every 30 s while a match is live and the app is in the foreground.
  useEffect(() => {
    if (!anyLive) return;
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') load();
    }, LIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [anyLive, load]);

  const sections = (data?.groups ?? []).map((g, i, all) => ({
    key: String(g.league.id),
    group: g,
    tierTitle: i === 0 || all[i - 1].tier !== g.tier ? t(TIER_TITLE[g.tier], lang) : null,
    data: g.matches,
  }));

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Link href="/favourites" style={styles.headerLink}>{t('favourites', lang)}</Link>
              <Link href="/leagues" style={styles.headerLink}>{t('leagues', lang)}</Link>
              <Link href="/settings" style={styles.headerLink}>{t('settings', lang)}</Link>
            </View>
          ),
        }}
      />

      <View style={[styles.tabs, { flexDirection: row }]} accessibilityRole="tablist">
        {DAYS.map((d) => (
          <Pressable
            key={d}
            onPress={() => setDay(d)}
            style={[styles.tab, d === day && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: d === day }}
          >
            <Text style={[styles.tabText, d === day && styles.tabTextActive]}>{t(d, lang)}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.caption}>
        {t('localTimes', lang)} · {timeZone}
        {data ? `\n${t('lastUpdated', lang)}: ${formatUpdated(data.updatedAt, timeZone, lang)}` : ''}
      </Text>

      {data?.sample && <Text style={styles.notice}>{t('sampleData', lang)}</Text>}

      {!data && !error && <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />}

      {error && !data && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('loadError', lang)}</Text>
          <Pressable onPress={load} style={styles.retry} accessibilityRole="button">
            <Text style={styles.retryText}>{t('retry', lang)}</Text>
          </Pressable>
        </View>
      )}

      {data && (
        <SectionList
          sections={sections}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          stickySectionHeadersEnabled={false}
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
          renderSectionHeader={({ section }) => (
            <View>
              {section.tierTitle && <Text style={[styles.tier, { textAlign: textStart }]}>{section.tierTitle}</Text>}
              <View style={[styles.sectionHead, { flexDirection: row }]}>
                <Text style={styles.code}>{(section.group.league.countryCode ?? section.group.league.country.slice(0, 3)).toUpperCase()}</Text>
                <Text style={[styles.league, { textAlign: textStart }]} numberOfLines={1}>{section.group.league.name}</Text>
                <Text style={styles.country}>{countryName(section.group.league.country, lang)}</Text>
              </View>
            </View>
          )}
          renderItem={({ item, index, section }) => (
            <View style={[styles.rowWrap, index === section.data.length - 1 && styles.rowLast]}>
              <MatchRow match={item} />
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>{t('noMatches', lang)}</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerLink: { color: colors.accent, fontSize: 14, fontWeight: '600', padding: 8 },
  tabs: { margin: 16, marginBottom: 6, padding: 4, borderRadius: 14, backgroundColor: colors.surface, gap: 6 },
  tab: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.muted, fontSize: 14 },
  tabTextActive: { color: colors.accentInk, fontWeight: '700' },
  caption: { color: colors.muted, fontSize: 12, textAlign: 'center', marginBottom: 10, lineHeight: 18 },
  notice: { marginHorizontal: 16, marginBottom: 10, padding: 10, borderRadius: 12, backgroundColor: colors.notice, color: colors.noticeText, fontSize: 13, textAlign: 'center' },
  tier: { color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 18, marginBottom: 2 },
  sectionHead: { alignItems: 'center', gap: 10, marginTop: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  code: { fontSize: 11, fontWeight: '700', color: colors.muted, backgroundColor: colors.line, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  league: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  country: { color: colors.muted, fontSize: 12 },
  rowWrap: { backgroundColor: colors.surface },
  rowLast: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: 'hidden' },
  empty: { alignItems: 'center', marginTop: 40, gap: 12 },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: 24 },
  retry: { backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  retryText: { color: colors.accentInk, fontWeight: '700' },
});
