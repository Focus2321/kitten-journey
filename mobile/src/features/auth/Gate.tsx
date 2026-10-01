import { useAuth } from '@clerk/expo';
import { useConvexAuth } from 'convex/react';
import { Redirect } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { useStore } from '@/data/store';
import { startSession, stopSession, useSync } from '@/data/sync';
import { colors } from '@/theme/tokens';

/**
 * Mounted once in the root layout: turns Convex's auth state into a sync session.
 * Gated on Convex's `isAuthenticated` (the backend accepted the token), not Clerk's `isSignedIn`.
 */
export function FamilySync() {
  const { isAuthenticated } = useConvexAuth();
  useEffect(() => {
    if (isAuthenticated) startSession();
    else stopSession();
  }, [isAuthenticated]);
  return null;
}

export type GateState = 'loading' | 'signed-out' | 'ready';

/** Where a private screen stands: still working out who this is, nobody signed in, or good to go. Demo mode is always ready. */
export function useGate(): GateState {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const hydrated = useSync((s) => s.hydrated);
  const demo = useStore((s) => s.demo);
  if (demo) return 'ready';
  if (!isLoaded || isLoading) return 'loading';
  if (!isSignedIn) return 'signed-out';
  // Signed in with Clerk but Convex hasn't accepted the token yet (or the snapshot hasn't landed): keep it calm.
  if (!isAuthenticated || !hydrated) return 'loading';
  return 'ready';
}

/** Calm full-screen wait — the brand row and a quiet spinner, no copy to read. */
export function LoadingScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground, paddingTop: insets.top, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.sun }} />
        <Text variant="bodyStrong" weight={700} style={{ fontSize: 17, letterSpacing: -0.34 }}>
          kitten journey
        </Text>
      </View>
      <ActivityIndicator color={colors.muted} />
    </View>
  );
}

/** Wrap a private screen: waits while auth/hydration settle, sends signed-out people to sign in, otherwise renders. */
export function Gated({ children }: { children: ReactNode }) {
  const gate = useGate();
  if (gate === 'loading') return <LoadingScreen />;
  if (gate === 'signed-out') return <Redirect href="/auth/sign-in" />;
  return <>{children}</>;
}
