import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { Avatar, Icon, Text } from '@/components/ui';
import type { Photo } from '@/data/photos';
import { colors, motion, radius } from '@/theme/tokens';

type Props = {
  text: string;
  photo?: Photo | null;
  /** How long the toast stays before fading (ms). */
  duration?: number;
};

/** Ink pill that drops in from above, hangs around, then fades. Mount it with a fresh `key` per message. */
export function Toast({ text, photo, duration = 1800 }: Props) {
  const y = useSharedValue(-16);
  const opacity = useSharedValue(0);
  useEffect(() => {
    y.set(withSpring(0, motion.snappy));
    opacity.set(withTiming(1, { duration: 140 }));
    opacity.set(withDelay(duration, withTiming(0, { duration: 180 })));
  }, [y, opacity, duration]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.ink,
          borderRadius: radius.pill,
          paddingVertical: 8,
          paddingLeft: 8,
          paddingRight: 14,
          shadowColor: colors.ink,
          shadowOpacity: 0.18,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        },
        style,
      ]}>
      {photo ? <Avatar photo={photo} size={28} /> : <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.sun }} />}
      <Text variant="small" weight={700} color={colors.ground}>
        {text}
      </Text>
      <Icon name="check" size={16} color={colors.sun} strokeWidth={2.6} />
    </Animated.View>
  );
}
