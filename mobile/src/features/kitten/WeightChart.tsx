import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/ui';
import { daysBetween } from '@/data/dates';
import type { Weight } from '@/data/store';
import { colors } from '@/theme/tokens';

const HEIGHT = 94;
const TOP = 9.2;
const BOTTOM = 84.7;

type Props = { weights: Weight[]; birthDate: string; today: string };

/**
 * The GROWING line: birth on the left, today on the right, the latest dot filled sun-yellow.
 * Daily weigh-ins collapse to one point per week once the kitten is older than two weeks,
 * so the line stays readable however many entries there are.
 */
export function WeightChart({ weights, birthDate, today }: Props) {
  const [width, setWidth] = useState(0);
  const points = pickPoints(weights, birthDate);
  const n = points.length;

  const grams = points.map((p) => p.grams);
  const min = Math.min(...grams);
  const max = Math.max(...grams);
  const span = max - min || 1;

  const x0 = 6;
  const x1 = Math.max(x0, width - 10);
  const xy = points.map((p, i) => ({
    x: n === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (n - 1),
    y: BOTTOM - ((p.grams - min) / span) * (BOTTOM - TOP),
  }));
  const d = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');

  const first = points[0];
  const mid = points[Math.floor((n - 1) / 2)];
  const last = points[n - 1];

  return (
    <View style={{ gap: 8 }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${Math.max(width, 1)} ${HEIGHT}`} preserveAspectRatio="none">
        <Path d={`M0 92H${width}`} stroke={colors.line} strokeWidth={2} strokeLinecap="round" strokeDasharray="2 6" fill="none" />
        {width > 0 && n > 1 && <Path d={d} stroke={colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
        {width > 0 &&
          xy.map((p, i) => {
            const isLast = i === n - 1;
            return <Circle key={i} cx={p.x} cy={p.y} r={isLast ? 8 : 4} fill={isLast ? colors.sun : colors.ground} stroke={colors.ink} strokeWidth={2.5} />;
          })}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" weight={600}>
          {first.date === birthDate ? `Birth · ${first.grams} g` : `${pointLabel(first.date, birthDate)} · ${first.grams} g`}
        </Text>
        {n > 2 && (
          <Text variant="caption" weight={600}>
            {pointLabel(mid.date, birthDate)}
          </Text>
        )}
        {n > 1 && (
          <Text variant="caption" weight={700} color={colors.ink}>
            {last.date === today ? 'Today' : pointLabel(last.date, birthDate)}
          </Text>
        )}
      </View>
    </View>
  );
}

/** "day 3" for the first fortnight, then "wk 3". */
function pointLabel(date: string, birthDate: string) {
  const days = daysBetween(birthDate, date);
  return days < 14 ? `day ${days}` : `wk ${Math.floor(days / 7)}`;
}

function pickPoints(weights: Weight[], birthDate: string): Weight[] {
  if (weights.length <= 8) return weights;
  const last = weights[weights.length - 1];
  const weekly = weights.filter((w) => daysBetween(birthDate, w.date) % 7 === 0);
  const out = weekly.includes(last) ? weekly : [...weekly, last];
  return out.length >= 2 ? out : [weights[0], last];
}
