import { View } from 'react-native';

import { haptic, Pressable } from '@/components/ui';
import { COLLARS, type Kitten } from '@/data/store';
import { colors } from '@/theme/tokens';

type Props = {
  /** The selected collar's tempId, or null to show none selected. */
  value: string | null;
  /** Littermates (not this kitten), so a worn colour can say who wears it. */
  others: Kitten[];
  onPick: (tempId: string) => void;
};

const who = (k: Kitten) => k.name ?? `${k.tempId} Collar`;

/** Every collar colour is tappable. Picking one a littermate wears swaps the two collars. */
export function CollarPicker({ value, others, onPick }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {COLLARS.map((c) => {
        const selected = c.tempId === value;
        const wearer = others.find((k) => k.tempId === c.tempId);
        return (
          <Pressable
            key={c.tempId}
            onPress={() => {
              onPick(c.tempId);
              haptic('selection');
            }}
            haptics="none"
            accessibilityRole="button"
            accessibilityLabel={`${c.tempId} collar`}
            accessibilityHint={wearer ? `${who(wearer)} wears this one. Picking it swaps their collars.` : 'Use this collar colour'}
            accessibilityState={{ selected }}
            style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: selected ? 2.5 : 0, borderColor: colors.ink }}>
            <View style={{ width: selected ? 24 : 34, height: selected ? 24 : 34, borderRadius: 17, backgroundColor: c.color }} />
          </Pressable>
        );
      })}
    </View>
  );
}

/** "Green Collar will wear Blue instead." when `tempId` is already on a littermate, else null. */
export function swapNote(tempId: string | null, others: Kitten[], giveBack: string): string | null {
  if (!tempId || tempId === giveBack) return null;
  const wearer = others.find((k) => k.tempId === tempId);
  return wearer ? `${who(wearer)} will wear ${giveBack} instead.` : null;
}
