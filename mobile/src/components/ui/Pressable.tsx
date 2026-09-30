import * as Haptics from 'expo-haptics';
import { Platform, Pressable as RNPressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export type HapticKind = 'none' | 'selection' | 'light' | 'medium' | 'success';

export function haptic(kind: HapticKind) {
  if (kind === 'none' || Platform.OS === 'web') return;
  if (kind === 'selection') Haptics.selectionAsync();
  else if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
}

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. 0.96 for chips/buttons, 0.98 for big cards, 1 to disable. */
  pressScale?: number;
  haptics?: HapticKind;
};

/** Pressable with a spring press-scale and optional haptic. Use for every tappable surface. */
export function Pressable({ style, pressScale = 0.96, haptics = 'light', onPressIn, onPressOut, onPress, ...rest }: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.set(withSpring(pressScale, motion.press));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, motion.press));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        haptic(haptics);
        onPress?.(e);
      }}
      style={[style, animated]}
    />
  );
}
