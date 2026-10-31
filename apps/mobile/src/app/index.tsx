import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { countryName, dateForDay, deviceTimeZone, isInPlay, t } from '@elap/core';
import type { DayKey, FixturesResponse } from '@elap/core';
import { MatchRow } from '../components/MatchRow';
import { api } from '../lib/api';
import { colors, row, textStart } from '../lib/theme';

const DAYS: DayKey[] = ['yesterday', 'today', 'tomorrow'];
const LIVE_REFRESH_MS = 30_000;

export default function MatchesScreen() {
  const timeZone = useMemo(() => deviceTimeZone(), []);
  const [day, setDay] = useState<DayKey>('today');
  const [data, setData] = useState<FixturesResponse | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api.fixtures(dateForDay(day, timeZone), timeZone));
      setError(false);
    } catch {
      setError(true);
    }
  }, [day, timeZone]);

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

  const sections = (data?.groups ?? []).map((g) => ({ key: String(g.league.id), group: g, data: g.matches }));

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/leagues" style={styles.headerLink}>
              {t('leagues')}
            </Link>
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
            <Text style={[styles.tabText, d === day && styles.tabTextActive]}>{t(d)}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.caption}>{t('localTimes')} · {timeZone}</Text>

      {data?.sample && <Text style={styles.notice}>{t('sampleData')}</Text>}

      {!data && !error && <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />}

      {error && !data && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('loadError')}</Text>
          <Pressable onPress={load} style={styles.retry} accessibilityRole="button">
            <Text style={styles.retryText}>{t('retry')}</Text>
          </Pressable>
        </View>
      )}

      {data && (
        <SectionList
          sections={sections}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 0 }}
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
            <View style={[styles.sectionHead, { flexDirection: row }]}>
              <Text style={styles.code}>{(section.group.league.countryCode ?? section.group.league.country.slice(0, 3)).toUpperCase()}</Text>
              <Text style={[styles.league, { textAlign: textStart }]} numberOfLines={1}>{section.group.league.name}</Text>
              <Text style={styles.country}>{countryName(section.group.league.country)}</Text>
            </View>
          )}
          renderItem={({ item, index, section }) => (
            <View style={[styles.rowWrap, index === section.data.length - 1 && styles.rowLast]}>
              <MatchRow match={item} timeZone={timeZone} />
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>{t('noMatches')}</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerLink: { color: colors.accent, fontSize: 15, fontWeight: '600', padding: 8 },
  tabs: { margin: 16, marginBottom: 6, padding: 4, borderRadius: 14, backgroundColor: colors.surface, gap: 6 },
  tab: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.muted, fontSize: 14 },
  tabTextActive: { color: colors.accentInk, fontWeight: '700' },
  caption: { color: colors.muted, fontSize: 12, textAlign: 'center', marginBottom: 10 },
  notice: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.notice,
    color: colors.noticeText,
    fontSize: 13,
    textAlign: 'center',
  },
  sectionHead: {
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
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
