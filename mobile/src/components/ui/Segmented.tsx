import { useEffect, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors, motion, radius } from '@/theme/tokens';

import { Pressable } from './Pressable';
import { Text } from './Text';

type Props<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  /** 'ink' = black selected pill on surface track (check-in). 'ground' = white pills on surface (appetite). */
  tone?: 'ink' | 'ground';
};

/** Segmented control with a sliding selected pill (spring). Nothing selected is a valid state. */
export function Segmented<T extends string>({ options, value, onChange, tone = 'ink' }: Props<T>) {
  const [w, setW] = useState(0);
  const index = options.findIndex((o) => o.value === value);
  const seg = w / options.length;
  const x = useSharedValue(0);
  const visible = useSharedValue(index >= 0 ? 1 : 0);
  useEffect(() => {
    if (index < 0 || seg <= 0) return;
    // First placement jumps; later changes slide.
    x.set(visible.get() === 0 ? index * seg : withSpring(index * seg, motion.snappy));
    visible.set(withSpring(1, motion.snappy));
  }, [index, seg, x, visible]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { scale: 0.9 + 0.1 * visible.value }], opacity: visible.value }));

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width - 8)}
      style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, height: 52 }}>
      {seg > 0 && (
        <Animated.View
          style={[
            { position: 'absolute', top: 4, left: 4, bottom: 4, width: seg, borderRadius: radius.pill, backgroundColor: tone === 'ink' ? colors.ink : colors.ground },
            pill,
          ]}
        />
      )}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            haptics="selection"
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="small" weight={600} color={on && tone === 'ink' ? colors.ground : colors.ink}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
