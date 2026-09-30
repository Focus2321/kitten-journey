import { useEffect } from 'react';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Pressable } from '@/components/ui';
import { colors, motion } from '@/theme/tokens';

const W = 48;
const H = 30;
const PAD = 3;
const KNOB = H - PAD * 2;

type Props = { value: boolean; onChange: (next: boolean) => void; label: string };

/** 48×30 switch. On: ink track, sun knob. Off: line track, white knob. Spring 520/34. */
export function Toggle({ value, onChange, label }: Props) {
  const t = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    t.set(withSpring(value ? 1 : 0, motion.snappy));
  }, [value, t]);

  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(t.value, [0, 1], [colors.line, colors.ink]) }));
  const knob = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], [colors.ground, colors.sun]),
    transform: [{ translateX: t.value * (W - PAD * 2 - KNOB) }],
  }));

  return (
    <Pressable
      onPress={() => onChange(!value)}
      haptics="selection"
      pressScale={0.94}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}>
      <Animated.View style={[{ width: W, height: H, borderRadius: H / 2, padding: PAD, justifyContent: 'center' }, track]}>
        <Animated.View style={[{ width: KNOB, height: KNOB, borderRadius: KNOB / 2 }, knob]} />
      </Animated.View>
    </Pressable>
  );
}
