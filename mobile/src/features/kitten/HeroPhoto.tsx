import { Image } from 'expo-image';
import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

import { Icon } from '@/components/ui';
import { photoSource, type Photo } from '@/data/photos';
import { colors } from '@/theme/tokens';

const PARALLAX = 12;
const DURATION = 240;
const ease = Easing.out(Easing.cubic);

type Props = {
  photo: Photo | null;
  /** +1 when moving to a sibling on the right, −1 to the left. Drives the parallax direction. */
  direction: 1 | -1;
  height?: number;
  children?: ReactNode;
};

/**
 * Motion M4 — the hero cross-fades between siblings with a 12 px parallax.
 * Each photo is its own keyed layer; Reanimated's entering/exiting animations do the overlap,
 * so nothing needs to be tracked in state or effects.
 */
export function HeroPhoto({ photo, direction, height = 340, children }: Props) {
  const { entering, exiting } = useMemo(
    () => ({
      entering: new Keyframe({
        0: { opacity: 0, transform: [{ translateX: PARALLAX * direction }] },
        100: { opacity: 1, transform: [{ translateX: 0 }], easing: ease },
      }).duration(DURATION),
      exiting: new Keyframe({
        0: { opacity: 1, transform: [{ translateX: 0 }] },
        100: { opacity: 0, transform: [{ translateX: -PARALLAX * direction }], easing: ease },
      }).duration(DURATION),
    }),
    [direction],
  );

  return (
    <View style={{ height, borderRadius: 36, overflow: 'hidden', backgroundColor: colors.surface }}>
      <Animated.View key={photo ?? 'none'} entering={entering} exiting={exiting} style={StyleSheet.absoluteFill}>
        <Layer photo={photo} />
      </Animated.View>
      {children}
    </View>
  );
}

function Layer({ photo }: { photo: Photo | null }) {
  if (!photo) {
    return (
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 8 }]}>
        <Icon name="camera" size={28} color={colors.muted} />
      </View>
    );
  }
  // Slight overscale so the parallax never shows an edge.
  return <Image source={photoSource(photo)} contentFit="cover" contentPosition={{ top: '35%', left: '50%' }} style={[StyleSheet.absoluteFill, { marginHorizontal: -PARALLAX }]} />;
}
