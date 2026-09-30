import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

/** Sheets are routes presented over the current screen; the <Sheet> component animates itself. */
const sheet = { presentation: 'transparentModal', animation: 'none', contentStyle: { backgroundColor: 'transparent' } } as const;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ground }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="birth/complete" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="sheet/mother-checkin" options={sheet} />
        <Stack.Screen name="sheet/quick-add" options={sheet} />
        <Stack.Screen name="sheet/weigh-in" options={sheet} />
        <Stack.Screen name="sheet/kitten-day/[id]" options={sheet} />
        <Stack.Screen name="shared/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
