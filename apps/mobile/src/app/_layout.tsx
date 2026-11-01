import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { t } from '@elap/core';
import { FavouritesProvider } from '../lib/favourites';
import { PrefsProvider, usePrefs } from '../lib/prefs';
import { colors } from '../lib/theme';

function Screens() {
  const { lang } = usePrefs();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerBackTitle: t('back', lang),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'ELAP' }} />
      <Stack.Screen name="match/[id]" options={{ title: t('matches', lang) }} />
      <Stack.Screen name="team/[id]" options={{ title: t('team', lang) }} />
      <Stack.Screen name="favourites" options={{ title: t('favourites', lang) }} />
      <Stack.Screen name="leagues" options={{ title: t('leagues', lang) }} />
      <Stack.Screen name="settings" options={{ title: t('settings', lang) }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PrefsProvider>
      <FavouritesProvider>
        <StatusBar style="light" />
        <Screens />
      </FavouritesProvider>
    </PrefsProvider>
  );
}
