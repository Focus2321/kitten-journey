import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { colors, radius } from '@/theme/tokens';

import { Pressable } from './Pressable';
import { Text } from './Text';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const TICK_LENGTH = 16;

type Props = { label: string; selected: boolean; onPress: () => void; size?: 'md' | 'sm' };

/**
 * Mood / choice chip. Motion row 4: press 0.96 → fill yellow in 120 ms → tick draws in 160 ms.
 */
export function Chip({ label, selected, onPress, size = 'md' }: Props) {
  const fill = useSharedValue(selected ? 1 : 0);
  const tick = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    fill.set(withTiming(selected ? 1 : 0, { duration: 120 }));
    tick.set(selected ? withDelay(120, withTiming(1, { duration: 160 })) : withTiming(0, { duration: 80 }));
  }, [selected, fill, tick]);

  const box = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(fill.value, [0, 1], [colors.ground, colors.sun]),
    borderColor: interpolateColor(fill.value, [0, 1], [colors.line, colors.sun]),
  }));
  const tickWrap = useAnimatedStyle(() => ({ width: 14 * Math.min(1, tick.value * 3), marginRight: 6 * Math.min(1, tick.value * 3) }));
  const tickProps = useAnimatedProps(() => ({ strokeDashoffset: TICK_LENGTH * (1 - tick.value) }));

  const h = size === 'md' ? 40 : 34;
  return (
    <Pressable onPress={onPress} haptics="selection" accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel={label}>
      <Animated.View style={[{ height: h, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center' }, box]}>
        <Animated.View style={[{ overflow: 'hidden', height: 14 }, tickWrap]}>
          <View style={{ width: 14, height: 14 }}>
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <AnimatedPath
                d="M3 7.5L5.8 10.2L11 4"
                stroke={colors.ink}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={TICK_LENGTH}
                animatedProps={tickProps}
              />
            </Svg>
          </View>
        </Animated.View>
        <Text variant={size === 'md' ? 'small' : 'caption'} weight={600} color={colors.ink}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
