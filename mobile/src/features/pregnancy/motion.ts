import { Platform } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

/**
 * "Content fades up 8px with a 30 ms stagger" — pass the row index.
 * Usage: <Animated.View entering={enter(i)}>
 */
export function enter(i = 0) {
  const base = FadeInDown.duration(motion.fade.duration).delay(i * motion.stagger);
  // Reanimated web pins custom-initial-value keyframes with `position: absolute` once they end,
  // which collapses the layout — web keeps the stock FadeInDown offset instead.
  return Platform.OS === 'web' ? base : base.withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] });
}
