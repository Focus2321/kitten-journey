import { useEffect, useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Avatar, Pressable, Text } from '@/components/ui';
import { displayName, type Kitten } from '@/data/store';
import { colors, motion, radius } from '@/theme/tokens';

type Props = { kittens: Kitten[]; activeId: string; onChange: (id: string) => void };

/**
 * Motion M4 — "Small taps that answer back".
 * The black pill slides to the tapped sibling (spring ≈ 240 ms) while the row re-flows around it.
 */
export function SiblingSwitcher({ kittens, activeId, onChange }: Props) {
  const layouts = useRef<Record<string, { x: number; width: number }>>({});
  const [target, setTarget] = useState<{ x: number; width: number } | null>(null);
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  const shown = useSharedValue(0);

  const remember = (id: string) => (e: LayoutChangeEvent) => {
    const { x: lx, width } = e.nativeEvent.layout;
    layouts.current[id] = { x: lx, width };
    if (id === activeId) setTarget({ x: lx, width });
  };

  useEffect(() => {
    const t = layouts.current[activeId];
    if (t) setTarget(t);
  }, [activeId]);

  useEffect(() => {
    if (!target) return;
    if (shown.get() === 0) {
      x.set(target.x);
      w.set(target.width);
      shown.set(1);
    } else {
      x.set(withSpring(target.x, motion.snappy));
      w.set(withSpring(target.width, motion.snappy));
    }
  }, [target, x, w, shown]);

  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }], width: w.value, opacity: shown.value }));
  const spring = LinearTransition.springify().stiffness(motion.snappy.stiffness).damping(motion.snappy.damping);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, gap: 4 }}>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 4, bottom: 4, left: 0, borderRadius: radius.pill, backgroundColor: colors.ink }, pill]} />
      {kittens.map((k) => {
        const on = k.id === activeId;
        return (
          <Animated.View key={k.id} layout={spring} onLayout={remember(k.id)}>
            <Pressable
              onPress={() => onChange(k.id)}
              haptics="selection"
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={displayName(k)}
              pressScale={0.94}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingLeft: on ? 3 : 0, paddingRight: on ? 12 : 0 }}>
              <Avatar photo={k.photo} size={on ? 34 : 40} ring={on ? colors.sun : undefined} ringWidth={2} dot={k.name ? undefined : k.tempColor} />
              {on && (
                <Text variant="smallStrong" color={colors.ground}>
                  {displayName(k)}
                </Text>
              )}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
