import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { retryNow, useSync, type SyncStatus } from '@/data/sync';
import { colors, gutter, radius } from '@/theme/tokens';

import { Pressable, Text } from './ui';

/** "Saving…" only once a push has taken a while, so quick saves stay invisible. */
const SAVING_DELAY = 1500;

/**
 * Sits above everything (root layout): a quiet "Saving…" pill for slow pushes and a "Couldn't save" pill with
 * Retry when a write failed. A failed write never looks saved.
 */
export function SyncBanner() {
  const insets = useSafeAreaInsets();
  const status = useSync((s) => s.status);
  const message = useSync((s) => s.message);
  // `slow` resets on every status change (adjusted during render), and only the timer callback sets it.
  const [slow, setSlow] = useState(false);
  const [seen, setSeen] = useState<SyncStatus>(status);
  if (seen !== status) {
    setSeen(status);
    setSlow(false);
  }

  useEffect(() => {
    if (status !== 'saving') return;
    const t = setTimeout(() => setSlow(true), SAVING_DELAY);
    return () => clearTimeout(t);
  }, [status]);

  const show = status === 'error' || (status === 'saving' && slow);
  if (!show) return null;
  const error = status === 'error';

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + 8, left: gutter, right: gutter, alignItems: 'center' }}>
      <Animated.View
        entering={FadeInUp.duration(180)}
        exiting={FadeOutUp.duration(140)}
        accessibilityLiveRegion="polite"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.ink,
          borderRadius: radius.pill,
          paddingVertical: 8,
          paddingLeft: 14,
          paddingRight: error ? 6 : 14,
          maxWidth: '100%',
        }}>
        {!error && <ActivityIndicator size="small" color={colors.ground} />}
        <Text variant="small" weight={600} color={colors.ground} numberOfLines={2} style={{ flexShrink: 1 }}>
          {error ? (message ? `Couldn't save — ${message}` : 'Couldn’t save — retrying') : 'Saving…'}
        </Text>
        {error && (
          <Pressable
            onPress={retryNow}
            accessibilityRole="button"
            accessibilityLabel="Retry saving"
            style={{ backgroundColor: colors.sun, borderRadius: radius.pill, paddingHorizontal: 12, height: 30, justifyContent: 'center' }}>
            <Text variant="smallStrong">Retry</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}
