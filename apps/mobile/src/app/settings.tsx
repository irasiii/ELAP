import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COUNTRIES, LANGS, t } from '@elap/core';
import { usePrefs } from '../lib/prefs';
import { colors } from '../lib/theme';

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { row } = usePrefs();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.option, { flexDirection: row }]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Text style={styles.optionText}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioOn]} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { lang, country, countryChosen, setLang, setCountry, textStart, timeZone } = usePrefs();
  const detected = COUNTRIES.find((c) => c.code === country)?.names[lang] ?? country;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}>
      <View>
        <Text style={[styles.h2, { textAlign: textStart }]}>{t('language', lang)}</Text>
        <View style={styles.card}>
          {LANGS.map((l) => (
            <Option key={l.code} label={l.label} selected={l.code === lang} onPress={() => setLang(l.code)} />
          ))}
        </View>
      </View>

      <View>
        <Text style={[styles.h2, { textAlign: textStart }]}>{t('country', lang)}</Text>
        <View style={styles.card}>
          <Option
            label={`${t('autoCountry', lang)}${!countryChosen && detected ? ` (${detected})` : ''}`}
            selected={!countryChosen}
            onPress={() => setCountry(null)}
          />
          {COUNTRIES.map((c) => (
            <Option key={c.code} label={c.names[lang]} selected={countryChosen && c.code === country} onPress={() => setCountry(c.code)} />
          ))}
        </View>
      </View>

      <Text style={[styles.muted, { textAlign: textStart }]}>
        {t('localTimes', lang)}: {timeZone}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  h2: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' },
  option: { minHeight: 50, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.surface2 },
  optionText: { color: colors.text, fontSize: 15 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border },
  radioOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  muted: { color: colors.muted, fontSize: 13 },
});
