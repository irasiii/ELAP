import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { deviceTimeZone, formatKickoff, formatMatchDate, isInPlay, t } from '@elap/core';
import type { MatchDetail, MatchEvent } from '@elap/core';
import { Crest } from '../../components/Crest';
import { ScoreText, StatusChip } from '../../components/MatchRow';
import { api } from '../../lib/api';
import { colors, row, textStart } from '../../lib/theme';

function eventLabel(e: MatchEvent): string {
  if (e.type === 'goal') return e.detail === 'Penalty' ? 'هدف (ركلة جزاء)' : e.detail === 'Own Goal' ? 'هدف (عكسي)' : t('goal');
  if (e.type === 'card') return e.detail.includes('Red') ? 'بطاقة حمراء' : 'بطاقة صفراء';
  if (e.type === 'subst') return t('subst');
  return t('var');
}

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const timeZone = useMemo(() => deviceTimeZone(), []);
  const [m, setM] = useState<MatchDetail | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setM(await api.match(id));
      setError(false);
    } catch {
      setError(true);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!m || !isInPlay(m.status)) return;
    const timer = setInterval(load, 30_000);
    return () => clearInterval(timer);
  }, [m, load]);

  if (!m) {
    return (
      <View style={styles.center}>
        {error ? <Text style={styles.muted}>{t('loadError')}</Text> : <ActivityIndicator color={colors.accent} />}
      </View>
    );
  }

  const teamName = (teamId: number) => (teamId === m.home.id ? m.home.name : m.away.name);
  const info: [string, string][] = [
    [t('competition'), m.league.name + (m.round ? ` · ${m.round}` : '')],
    [t('kickoff'), `${formatMatchDate(m.kickoff, timeZone)} · ${formatKickoff(m.kickoff, timeZone)}`],
    [t('venue'), m.venue ?? t('unknown')],
    [t('channel'), m.broadcast.channel ?? t('unknown')],
    [t('commentator'), m.broadcast.commentator ?? t('unknown')],
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 20 }}>
      <Stack.Screen options={{ title: m.league.name }} />

      <View style={[styles.scoreboard, { flexDirection: row }]}>
        <View style={styles.side}>
          <Crest team={m.home} size={60} />
          <Text style={styles.teamName}>{m.home.name}</Text>
        </View>
        <View style={styles.mid}>
          <ScoreText match={m} timeZone={timeZone} size={36} />
          <StatusChip match={m} />
        </View>
        <View style={styles.side}>
          <Crest team={m.away} size={60} />
          <Text style={styles.teamName}>{m.away.name}</Text>
        </View>
      </View>

      <View style={styles.card}>
        {info.map(([k, v], i) => (
          <View key={k} style={[styles.infoRow, { flexDirection: row }, i > 0 && styles.divider]}>
            <Text style={styles.muted}>{k}</Text>
            <Text style={styles.infoValue}>{v}</Text>
          </View>
        ))}
      </View>

      <View>
        <Text style={[styles.h2, { textAlign: textStart }]}>{t('whereToWatch')}</Text>
        {m.broadcast.watch.length === 0 ? (
          <Text style={[styles.muted, { textAlign: textStart }]}>{t('noWatch')}</Text>
        ) : (
          m.broadcast.watch.map((w) => (
            <Pressable
              key={`${w.country}-${w.service}`}
              onPress={() => Linking.openURL(w.url)}
              style={[styles.watch, { flexDirection: row }]}
              accessibilityRole="link"
            >
              <Text style={styles.infoValue}>
                <Text style={styles.muted}>{w.country} · </Text>
                {w.service}
              </Text>
              <Text style={styles.accent}>{t('watch')} ↗</Text>
            </Pressable>
          ))
        )}
      </View>

      <View>
        <Text style={[styles.h2, { textAlign: textStart }]}>{t('events')}</Text>
        {m.events.length === 0 ? (
          <Text style={[styles.muted, { textAlign: textStart }]}>{t('noEvents')}</Text>
        ) : (
          <View style={styles.card}>
            {m.events.map((e, i) => (
              <View key={i} style={[styles.event, { flexDirection: row }]}>
                <Text style={styles.minute}>{e.minute}{e.extra ? `+${e.extra}` : ''}'</Text>
                <View
                  style={[
                    styles.dot,
                    e.type === 'goal' && { backgroundColor: colors.accent },
                    e.type === 'card' && { backgroundColor: e.detail.includes('Red') ? '#FF5A4F' : '#FFC93C', borderRadius: 2, height: 13 },
                  ]}
                />
                <Text style={[styles.infoValue, { flex: 1, textAlign: textStart }]}>
                  {eventLabel(e)} · {teamName(e.teamId)}{e.player ? ` · ${e.player}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={{ gap: 12 }}>
        <Text style={[styles.h2, { textAlign: textStart }]}>{t('lineups')}</Text>
        {m.lineups.length === 0 ? (
          <Text style={[styles.muted, { textAlign: textStart }]}>{t('noLineups')}</Text>
        ) : (
          m.lineups.map((l) => (
            <View key={l.teamId} style={styles.card}>
              <View style={[styles.infoRow, { flexDirection: row }]}>
                <Text style={styles.h3}>{teamName(l.teamId)}</Text>
                {l.formation && <Text style={styles.muted}>{l.formation}</Text>}
              </View>
              {l.startXI.map((p) => (
                <View key={`${p.number}-${p.name}`} style={[styles.player, { flexDirection: row }]}>
                  <Text style={styles.num}>{p.number ?? '–'}</Text>
                  <Text style={styles.infoValue}>{p.name}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scoreboard: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, alignItems: 'center' },
  side: { flex: 1, alignItems: 'center', gap: 8 },
  mid: { alignItems: 'center', gap: 8, paddingHorizontal: 8 },
  teamName: { color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' },
  infoRow: { justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.surface2 },
  infoValue: { color: colors.text, fontSize: 14, flexShrink: 1 },
  muted: { color: colors.muted, fontSize: 14 },
  accent: { color: colors.accent, fontWeight: '600' },
  h2: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  h3: { color: colors.text, fontSize: 15, fontWeight: '600' },
  watch: {
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  event: { alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  minute: { color: colors.muted, fontWeight: '700', width: 40, textAlign: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.muted },
  player: { gap: 12, paddingHorizontal: 16, paddingVertical: 6 },
  num: { color: colors.muted, fontWeight: '700', width: 24, textAlign: 'center' },
});
