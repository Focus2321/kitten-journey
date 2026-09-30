import { Image } from 'expo-image';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { Text, haptic } from '@/components/ui';
import { photoSource, type Photo } from '@/data/photos';
import { colors, motion } from '@/theme/tokens';

export type SlotRect = { x: number; y: number; width: number; height: number };
export type LitterSlotsHandle = { measureSlot: (index: number) => Promise<SlotRect | null> };

type Props = {
  count: number;
  active: number;
  /** Photo (or null for a photoless kitten) per filled slot. */
  filled: (Photo | null | undefined)[];
};

export const SLOT = 30;

/**
 * Progress row for the birth flow: filled slots show the kitten's photo, the active one is a sun
 * circle with its number, the rest are dashed. A slot pops 1 → 1.12 → 1 when it fills (motion M2).
 */
export const LitterSlots = forwardRef<LitterSlotsHandle, Props>(function LitterSlots({ count, active, filled }, ref) {
  const refs = useRef<(View | null)[]>([]);

  useImperativeHandle(ref, () => ({
    measureSlot: (index) =>
      new Promise((resolve) => {
        const node = refs.current[index];
        if (!node) return resolve(null);
        node.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
      }),
  }));

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          ref={(n) => {
            refs.current[i] = n;
          }}
          collapsable={false}>
          <Slot index={i} active={i === active} photo={filled[i]} isFilled={i < filled.length} />
        </View>
      ))}
    </View>
  );
});

function Slot({ index, active, photo, isFilled }: { index: number; active: boolean; photo: Photo | null | undefined; isFilled: boolean }) {
  const scale = useSharedValue(1);
  const wasFilled = useRef(isFilled);
  useEffect(() => {
    if (isFilled && !wasFilled.current) {
      wasFilled.current = true;
      haptic('light');
      scale.set(withSequence(withSpring(1.12, motion.pop), withSpring(1, motion.snappy)));
    }
  }, [isFilled, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (isFilled) {
    return (
      <Animated.View style={[{ width: SLOT, height: SLOT, borderRadius: SLOT / 2, overflow: 'hidden', backgroundColor: colors.surface }, style]}>
        {photo ? (
          <Image source={photoSource(photo)} contentFit="cover" style={{ width: SLOT, height: SLOT }} />
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="caption" weight={800} color={colors.sun} style={{ fontSize: 13 }}>
              {index + 1}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  }
  if (active) {
    return (
      <View style={{ width: SLOT, height: SLOT, borderRadius: SLOT / 2, backgroundColor: colors.sun, borderWidth: 2.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="caption" weight={800} style={{ fontSize: 13, lineHeight: 15 }} color={colors.ink}>
          {index + 1}
        </Text>
      </View>
    );
  }
  return (
    <View style={{ width: SLOT, height: SLOT, borderRadius: SLOT / 2, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.dashed, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="caption" weight={600} style={{ fontSize: 13, lineHeight: 15 }} color={colors.muted}>
        {index + 1}
      </Text>
    </View>
  );
}
