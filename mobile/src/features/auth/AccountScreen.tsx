import { useAuth, useUser } from '@clerk/expo';
import { useConvex, useConvexAuth } from 'convex/react';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { Button, Card, Icon, IconButton, IconButtonSpacer, Pressable, Screen, Text, TopBar } from '@/components/ui';
import { useStore } from '@/data/store';
import { exitDemo, stopSession } from '@/data/sync';
import { colors, radius } from '@/theme/tokens';

import { api } from '../../../convex/_generated/api';

const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

/** Account modal: who's signed in, sign out, delete, and the way out of the demo. */
export function AccountScreen() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const convex = useConvex();
  const demo = useStore((s) => s.demo);
  const [working, setWorking] = useState<'signout' | 'delete' | 'demo' | null>(null);

  const email = user?.primaryEmailAddress?.emailAddress ?? null;

  /** Private data leaves the device the moment they tap, before Clerk has answered. */
  const doSignOut = async () => {
    setWorking('signout');
    stopSession();
    useStore.getState().reset();
    try {
      await signOut();
      if (router.canDismiss()) router.dismissAll();
      router.replace('/auth/sign-in');
    } catch (e) {
      setWorking(null);
      Alert.alert('Couldn’t sign out', e instanceof Error ? e.message : 'Try again in a moment.');
    }
  };

  const doDelete = async () => {
    if (!user) return;
    setWorking('delete');
    try {
      // Server data first (needs the session), then the Clerk user, then the local copy.
      if (isAuthenticated) await convex.mutation(api.family.deleteAll, {});
      await user.delete();
      stopSession();
      useStore.getState().reset();
      await signOut();
      if (router.canDismiss()) router.dismissAll();
      router.replace('/auth/sign-in');
    } catch (e) {
      setWorking(null);
      Alert.alert('Couldn’t delete your account', e instanceof Error ? e.message : 'Try again in a moment.');
    }
  };

  const confirmDelete = () =>
    Alert.alert('Delete your account?', 'Every weigh-in, moment and photo goes with it. This can’t be undone.', [
      { text: 'Keep my account', style: 'cancel' },
      { text: 'Delete everything', style: 'destructive', onPress: doDelete },
    ]);

  const leaveDemo = async () => {
    setWorking('demo');
    await exitDemo();
    setWorking(null);
    close();
  };

  const toSignIn = () => {
    if (router.canDismiss()) router.dismiss();
    router.push('/auth/sign-in');
  };

  return (
    <Screen
      header={
        <TopBar left={<IconButton icon="close" label="Close" onPress={close} />} center={<Text variant="label">Account</Text>} right={<IconButtonSpacer />} />
      }>
      <View style={{ gap: 12, paddingTop: 4 }}>
        {demo && (
          <Card tone="sun" style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="sparkle" size={22} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyStrong" weight={700}>
                  You’re exploring the demo
                </Text>
                <Text variant="small" color={colors.muted}>
                  Juniper’s story is just for looking — nothing here is saved.
                </Text>
              </View>
            </View>
            <Button
              label={isSignedIn ? 'Back to my family' : 'Leave the demo'}
              variant="ink"
              size="md"
              iconRight="arrow-right"
              disabled={working !== null}
              leading={working === 'demo' ? <ActivityIndicator size="small" color={colors.ground} /> : undefined}
              onPress={leaveDemo}
            />
          </Card>
        )}

        {isSignedIn ? (
          <>
            <Card style={{ gap: 2 }}>
              <Text variant="label">Signed in as</Text>
              <Text variant="bodyStrong" weight={700} numberOfLines={1}>
                {email ?? '…'}
              </Text>
              <Text variant="small" color={colors.muted} style={{ paddingTop: 6 }}>
                Her story is saved to this account and follows you to any phone.
              </Text>
            </Card>

            <Button
              label="Sign out"
              variant="surface"
              size="md"
              disabled={working !== null}
              leading={working === 'signout' ? <ActivityIndicator size="small" color={colors.ink} /> : undefined}
              onPress={doSignOut}
            />

            <View style={{ paddingTop: 20, gap: 10 }}>
              <Text variant="label">Danger zone</Text>
              <Pressable
                onPress={confirmDelete}
                disabled={working !== null}
                pressScale={0.98}
                accessibilityRole="button"
                accessibilityLabel="Delete account"
                style={{ borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.line, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: working !== null ? 0.5 : 1 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong" weight={700} color={colors.orange}>
                    Delete account
                  </Text>
                  <Text variant="small" color={colors.muted}>
                    Removes your family, photos and sign-in for good.
                  </Text>
                </View>
                {working === 'delete' ? <ActivityIndicator size="small" color={colors.orange} /> : <Icon name="chevron-right" size={18} color={colors.muted} />}
              </Pressable>
            </View>
          </>
        ) : (
          <Card style={{ gap: 12 }}>
            <View style={{ gap: 2 }}>
              <Text variant="bodyStrong" weight={700}>
                Not signed in
              </Text>
              <Text variant="small" color={colors.muted}>
                An account keeps her story safe and brings it to any phone.
              </Text>
            </View>
            <Button label="Sign in" variant="ink" size="md" iconRight="arrow-right" onPress={toSignIn} disabled={working !== null} />
          </Card>
        )}
      </View>
    </Screen>
  );
}
