import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Pressable, Text } from '@/components/ui';
import type { Appetite } from '@/data/store';
import { colors } from '@/theme/tokens';

import { APPETITE_OPTIONS } from './copy';

function Bowl({ kind, selected }: { kind: Appetite; selected: boolean }) {
  const stroke = selected ? colors.sun : colors.ink;
  return (
    <Svg width={30} height={24} viewBox="0 0 30 24">
      <Path d="M2 8h26c0 7-5.5 12-13 12S2 15 2 8z" fill={selected ? colors.sun : 'none'} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
      {kind === 'hungry' && <Path d="M9 5c1-2 3-2 4 0M17 4c1-2 3-2 4 0" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" />}
      {kind === 'picky' && <Path d="M11 14h8" fill="none" stroke={selected ? colors.ink : colors.ground} strokeWidth={2} strokeLinecap="round" />}
    </Svg>
  );
}

type Props = { value: Appetite | null; onChange: (a: Appetite) => void };

/** Three "Eating" tiles from the check-in sheet: 92px tall, black when selected. */
export function AppetiteTiles({ value, onChange }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {APPETITE_OPTIONS.map((o) => {
        const on = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            haptics="selection"
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={o.label}
            style={{
              flex: 1,
              height: 92,
              borderRadius: 22,
              backgroundColor: on ? colors.ink : colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}>
            <Bowl kind={o.value} selected={on} />
            <Text variant="small" weight={600} color={on ? colors.ground : colors.ink}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
