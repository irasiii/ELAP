import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Stack } from 'expo-router';
import { countryName, t } from '@elap/core';
import { Crest } from '../components/Crest';
import { useFavourites } from '../lib/favourites';
import { usePrefs } from '../lib/prefs';
import { colors } from '../lib/theme';

export default function FavouritesScreen() {
  const { lang, row, textStart } = usePrefs();
  const { teams, ready, toggle } = useFavourites();

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t('favourites', lang) }} />
      {!ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
          data={teams}
          keyExtractor={(team) => String(team.id)}
          ListEmptyComponent={<Text style={[styles.empty, { textAlign: textStart }]}>{t('noFavourites', lang)}</Text>}
          renderItem={({ item }) => (
            <View style={[styles.card, { flexDirection: row }]}>
              <Pressable
                style={[styles.team, { flexDirection: row }]}
                onPress={() => router.push(`/team/${item.id}`)}
                accessibilityRole="link"
              >
                <Crest team={item} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { textAlign: textStart }]} numberOfLines={1}>{item.name}</Text>
                  {item.country && <Text style={[styles.country, { textAlign: textStart }]}>{countryName(item.country, lang)}</Text>}
                </View>
              </Pressable>
              <Pressable
                onPress={() => toggle(item)}
                style={styles.remove}
                accessibilityRole="button"
                accessibilityLabel={t('removeFavourite', lang)}
                hitSlop={8}
              >
                <Text style={styles.removeText}>★</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: colors.muted, marginTop: 24, fontSize: 14 },
  card: { alignItems: 'center', gap: 8, padding: 12, borderRadius: 16, backgroundColor: colors.surface },
  team: { flex: 1, alignItems: 'center', gap: 12, minWidth: 0 },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  country: { color: colors.muted, fontSize: 12, marginTop: 2 },
  remove: { padding: 8, borderRadius: 10, backgroundColor: colors.accent },
  removeText: { color: colors.accentInk, fontSize: 16, lineHeight: 18 },
});
