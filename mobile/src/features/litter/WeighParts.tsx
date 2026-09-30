import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { ScrollView, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { haptic } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

// ---------------------------------------------------------------------------
// Ruler — horizontal gram scale, snaps per gram, selection haptic per gram (motion M3).
// ---------------------------------------------------------------------------

/** Pixels per gram. */
const PX = 10;
const RULER_H = 44;

export type RulerHandle = { scrollTo: (grams: number, animated?: boolean) => void };

type RulerProps = { min: number; max: number; initial: number; onChange: (grams: number) => void };

export const Ruler = forwardRef<RulerHandle, RulerProps>(function Ruler({ min, max, initial, onChange }, ref) {
  const [width, setWidth] = useState(0);
  const scroll = useRef<ScrollView>(null);
  const last = useRef(initial);
  const lastHaptic = useRef(0);
  const half = width / 2;

  useImperativeHandle(ref, () => ({
    scrollTo: (grams, animated = true) => {
      const g = Math.min(max, Math.max(min, grams));
      scroll.current?.scrollTo({ x: (g - min) * PX, animated });
    },
  }));

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const g = Math.min(max, Math.max(min, min + Math.round(e.nativeEvent.contentOffset.x / PX)));
    if (g === last.current) return;
    last.current = g;
    onChange(g);
    const now = Date.now();
    if (now - lastHaptic.current > 28) {
      lastHaptic.current = now;
      haptic('selection');
    }
  };

  const ticks: ReactNode[] = [];
  for (let g = min; g <= max; g++) {
    const major = g % 5 === 0;
    ticks.push(
      <View key={g} style={{ width: PX, height: RULER_H, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 2, height: major ? 22 : 14, borderRadius: 1, backgroundColor: major ? colors.ink : colors.dashed, opacity: major ? 0.7 : 1 }} />
      </View>,
    );
  }

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ height: RULER_H, justifyContent: 'center' }}>
      {width > 0 && (
        <ScrollView
          ref={scroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={PX}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={onScroll}
          contentOffset={{ x: (initial - min) * PX, y: 0 }}
          contentContainerStyle={{ paddingHorizontal: half - PX / 2 }}>
          {ticks}
        </ScrollView>
      )}
      {/* Edge fades (stepped, no gradients). */}
      {[0, 1, 2].map((i) => (
        <View key={`l${i}`} pointerEvents="none" style={{ position: 'absolute', left: i * 22, top: 0, bottom: 0, width: 22, backgroundColor: colors.sunSoft, opacity: 0.85 - i * 0.3 }} />
      ))}
      {[0, 1, 2].map((i) => (
        <View key={`r${i}`} pointerEvents="none" style={{ position: 'absolute', right: i * 22, top: 0, bottom: 0, width: 22, backgroundColor: colors.sunSoft, opacity: 0.85 - i * 0.3 }} />
      ))}
      {/* Centre marker: ink 8×34 r4 with a sun 4×30 core. */}
      <View pointerEvents="none" style={{ position: 'absolute', left: half - 4, top: (RULER_H - 34) / 2, width: 8, height: 34, borderRadius: 4, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 4, height: 30, borderRadius: 2, backgroundColor: colors.sun }} />
      </View>
    </View>
  );
});

// ---------------------------------------------------------------------------
// Rolling number — each digit rolls 6 px in 90 ms when it changes.
// ---------------------------------------------------------------------------

export function RollingNumber({ value, size = 84 }: { value: number; size?: number }) {
  // Direction of the last change, derived during render (React's "adjust state on prop change" pattern).
  const [last, setLast] = useState(value);
  const [up, setUp] = useState(true);
  if (value !== last) {
    setUp(value > last);
    setLast(value);
  }
  const chars = String(value).split('');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      {chars.map((c, i) => (
        <Digit key={`${chars.length}-${i}`} char={c} up={up} size={size} />
      ))}
    </View>
  );
}

function Digit({ char, up, size }: { char: string; up: boolean; size: number }) {
  const y = useSharedValue(0);
  const o = useSharedValue(1);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    y.set(up ? 6 : -6);
    o.set(0.2);
    y.set(withTiming(0, { duration: 90 }));
    o.set(withTiming(1, { duration: 90 }));
  }, [char, up, y, o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: y.value }] }));
  return (
    <Animated.Text style={[{ fontFamily: fonts[800], fontSize: size, lineHeight: size * 1.05, letterSpacing: -0.04 * size, color: colors.ink }, style]}>
      {char}
    </Animated.Text>
  );
}

// ---------------------------------------------------------------------------
// Drawn check — the tick draws in when a weight is saved.
// ---------------------------------------------------------------------------

const AnimatedPath = Animated.createAnimatedComponent(Path);
const TICK_LENGTH = 30;

export function DrawnCheck({ size = 24, color = colors.ink, delay = 0 }: { size?: number; color?: string; delay?: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    const id = setTimeout(() => t.set(withTiming(1, { duration: 220 })), delay);
    return () => clearTimeout(id);
  }, [t, delay]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: TICK_LENGTH * (1 - t.value) }));
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <AnimatedPath d="M4 12.5l5 5L20 7" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={TICK_LENGTH} animatedProps={props} />
    </Svg>
  );
}
