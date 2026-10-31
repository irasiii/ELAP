import { Image, StyleSheet, Text, View } from 'react-native';
import { crestInitials } from '@elap/core';
import type { Team } from '@elap/core';
import { colors } from '../lib/theme';

const PALETTE = ['#7AA2FF', '#FF8A7A', '#9FE3B4', '#FFB547', '#E8E8E8', '#7FD3FF', '#D6A6FF'];

export function Crest({ team, size = 30 }: { team: Team; size?: number }) {
  if (team.logo) {
    return <Image source={{ uri: team.logo }} style={{ width: size, height: size }} resizeMode="contain" accessibilityIgnoresInvertColors />;
  }
  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: PALETTE[team.id % PALETTE.length] }]}
      accessible={false}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{crestInitials(team.name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.accentInk, fontWeight: '700' },
});
