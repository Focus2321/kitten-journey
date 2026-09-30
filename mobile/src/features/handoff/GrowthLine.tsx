import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Text } from '@/components/ui';
import type { Weight } from '@/data/store';
import { colors } from '@/theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const H = 120;
const PAD_X = 8;
const PAD_Y = 10;

type Props = { weights: Weight[]; days: number[]; delay?: number };

/**
 * Self-contained weight line for the shared story: an ink line that draws in, sun dots at the ends,
 * and a faint baseline. Needs two or more samples — callers show a note otherwise.
 */
export function GrowthLine({ weights, days, delay = 0 }: Props) {
  const [width, setWidth] = useState(0);
  const draw = useSharedValue(0);

  useEffect(() => {
    if (width > 0) draw.set(withDelay(delay + 120, withTiming(1, { duration: 700 })));
  }, [width, delay, draw]);

  const n = weights.length;
  const minG = Math.min(...weights.map((w) => w.grams));
  const maxG = Math.max(...weights.map((w) => w.grams));
  const minD = days[0] ?? 0;
  const maxD = days[n - 1] ?? 1;
  const spanG = Math.max(1, maxG - minG);
  const spanD = Math.max(1, maxD - minD);

  const pts = weights.map((w, i) => ({
    x: PAD_X + ((days[i] - minD) / spanD) * (width - PAD_X * 2),
    y: PAD_Y + (1 - (w.grams - minG) / spanG) * (H - PAD_Y * 2),
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const length = pts.reduce((acc, p, i) => (i === 0 ? 0 : acc + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y)), 0);

  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - draw.value) }));
  const endProps = useAnimatedProps(() => ({ opacity: draw.value > 0.95 ? 1 : 0 }));

  const first = pts[0];
  const last = pts[n - 1];

  return (
    <View style={{ gap: 10 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={{ height: H }}>
        {width > 0 && (
          <Svg width={width} height={H}>
            <Line x1={PAD_X} y1={H - PAD_Y} x2={width - PAD_X} y2={H - PAD_Y} stroke={colors.line} strokeWidth={1} />
            <AnimatedPath d={d} stroke={colors.ink} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={length} animatedProps={lineProps} />
            <Circle cx={first.x} cy={first.y} r={5} fill={colors.sun} stroke={colors.ground} strokeWidth={2} />
            <AnimatedCircle cx={last.x} cy={last.y} r={6} fill={colors.sun} stroke={colors.ground} strokeWidth={2} animatedProps={endProps} />
          </Svg>
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text variant="caption">Birth</Text>
          <Text variant="smallStrong">{weights[0].grams} g</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="caption">Now</Text>
          <Text variant="smallStrong">{weights[n - 1].grams} g</Text>
        </View>
      </View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
