import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { SyncBanner } from '@/components/SyncBanner';
import { clerkPublishableKey, convex } from '@/data/convex';
import { useStore } from '@/data/store';
import { FamilySync } from '@/features/auth/Gate';

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

  // Real families follow the device clock: roll "today" over when the app comes back to the front.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') useStore.getState().syncToday();
    });
    return () => sub.remove();
  }, []);

  if (!loaded && !error) return null;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ground }}>
          <KeyboardProvider>
            <StatusBar style="dark" />
            <FamilySync />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
              <Stack.Screen name="auth/sign-in" options={{ animation: 'fade' }} />
              <Stack.Screen name="auth/sign-up" options={{ animation: 'fade' }} />
              <Stack.Screen name="account" options={{ presentation: 'modal' }} />
              <Stack.Screen name="birth/complete" options={{ animation: 'fade', gestureEnabled: false }} />
              <Stack.Screen name="sheet/mother-checkin" options={sheet} />
              <Stack.Screen name="sheet/quick-add" options={sheet} />
              <Stack.Screen name="sheet/weigh-in" options={sheet} />
              <Stack.Screen name="sheet/kitten-day/[id]" options={sheet} />
              <Stack.Screen name="sheet/edit-kitten/[id]" options={sheet} />
              <Stack.Screen name="shared/[id]" options={{ presentation: 'modal' }} />
            </Stack>
            {/* Overlay after the Stack so it floats above whatever screen is showing. */}
            <SyncBanner />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
