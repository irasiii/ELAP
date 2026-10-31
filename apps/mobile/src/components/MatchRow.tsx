import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { formatKickoff, hasScore, isInPlay, statusLabel } from '@elap/core';
import type { Match } from '@elap/core';
import { colors, row } from '../lib/theme';
import { Crest } from './Crest';

/** Score in reading order: each team's goals sit beside that team. */
export function ScoreText({ match, timeZone, size = 18 }: { match: Match; timeZone: string; size?: number }) {
  const live = isInPlay(match.status);
  const color = live ? colors.accent : match.status === 'finished' ? colors.muted : colors.text;
  if (!hasScore(match)) {
    return <Text style={[styles.score, { fontSize: size, color }]}>{formatKickoff(match.kickoff, timeZone)}</Text>;
  }
  return (
    <View style={{ flexDirection: row, gap: 6 }}>
      <Text style={[styles.score, { fontSize: size, color }]}>{match.score.home}</Text>
      <Text style={[styles.score, { fontSize: size, color }]}>-</Text>
      <Text style={[styles.score, { fontSize: size, color }]}>{match.score.away}</Text>
    </View>
  );
}

export function StatusChip({ match }: { match: Match }) {
  const live = isInPlay(match.status);
  return (
    <Text style={[styles.chip, live && styles.chipLive]}>{statusLabel(match)}</Text>
  );
}

export function MatchRow({ match, timeZone }: { match: Match; timeZone: string }) {
  return (
    <Pressable
      onPress={() => router.push(`/match/${match.id}`)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface2 }]}
      accessibilityRole="button"
      accessibilityLabel={`${match.home.name} ضد ${match.away.name}، ${statusLabel(match)}`}
    >
      <View style={[styles.team, { flexDirection: row }]}>
        <Crest team={match.home} />
        <Text style={styles.name} numberOfLines={1}>{match.home.name}</Text>
      </View>
      <View style={styles.center}>
        <ScoreText match={match} timeZone={timeZone} />
        <StatusChip match={match} />
      </View>
      <View style={[styles.team, { flexDirection: row === 'row' ? 'row-reverse' : 'row' }]}>
        <Crest team={match.away} />
        <Text style={styles.name} numberOfLines={1}>{match.away.name}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: row,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
    minHeight: 60,
  },
  team: { flex: 1, alignItems: 'center', gap: 8, minWidth: 0 },
  name: { color: colors.text, fontSize: 14, fontWeight: '500', flexShrink: 1 },
  center: { width: 92, alignItems: 'center', gap: 2 },
  score: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  chip: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
    backgroundColor: colors.line,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  chipLive: { backgroundColor: colors.accent, color: colors.accentInk },
});
