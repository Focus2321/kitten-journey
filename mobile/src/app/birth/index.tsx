import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { Button, Chip, Icon, IconButton, Pressable, Screen, StepDots, Text, TopBar } from '@/components/ui';
import { addDays, formatShort } from '@/data/dates';
import { useStore } from '@/data/store';
import { CatHead } from '@/features/birth/CatHead';
import { colors, motion, radius } from '@/theme/tokens';

const MIN = 1;
const MAX = 8;
const TILTS = [-8, 5, -3, 9, -6, 4, -2, 7];

type When = 'today' | 'yesterday' | 'pick';

/** Screen 08 — "The kittens are here!": when, and how many. Unknowns are fine; defaults are today and 4. */
export default function BirthStart() {
  const today = useStore((s) => s.today);
  const startBirth = useStore((s) => s.startBirth);

  const [when, setWhen] = useState<When>('today');
  const [picked, setPicked] = useState<string>(addDays(today, -2));
  const [count, setCount] = useState(4);

  const date = when === 'today' ? today : when === 'yesterday' ? addDays(today, -1) : picked;

  // The big number pops a little every time it changes.
  const pop = useSharedValue(1);
  const numberStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const bump = (next: number) => {
    const clamped = Math.min(MAX, Math.max(MIN, next));
    if (clamped === count) return;
    setCount(clamped);
    pop.set(withSequence(withSpring(1.08, motion.press), withSpring(1, motion.snappy)));
  };

  const start = () => {
    startBirth({ date, count });
    router.push('/birth/kitten/0');
  };

  return (
    <Screen
      header={<TopBar left={<IconButton icon="close" label="Close" onPress={() => router.back()} />} center={<StepDots count={3} active={0} />} />}
      footer={<Button label="Meet them one by one" variant="ink" iconRight="arrow-right" onPress={start} />}
      contentStyle={{ gap: 28, paddingTop: 8 }}>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.paw }} />
          <Text variant="label">Juniper’s big day</Text>
        </View>
        <Text variant="display" style={{ fontSize: 44, lineHeight: 44 }}>
          The kittens are here!
        </Text>
        <Text variant="body" color={colors.muted}>
          Congratulations. Two quick things, then you can go back to staring at them.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="label">When were they born?</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <WhenButton label="Today" sub={formatShort(today)} selected={when === 'today'} onPress={() => setWhen('today')} />
          <WhenButton label="Yesterday" sub={formatShort(addDays(today, -1))} selected={when === 'yesterday'} onPress={() => setWhen('yesterday')} />
          <WhenButton label="Pick" icon selected={when === 'pick'} onPress={() => setWhen('pick')} />
        </View>
        {when === 'pick' && (
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
              {Array.from({ length: 14 }, (_, i) => addDays(today, -(i + 2))).map((iso) => (
                <Chip key={iso} label={formatShort(iso)} size="sm" selected={picked === iso} onPress={() => setPicked(iso)} />
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      <View style={{ gap: 12 }}>
        <Text variant="label">How many kittens?</Text>
        <View style={{ backgroundColor: colors.pawSoft, borderRadius: radius.xl, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 20, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => bump(count - 1)}
              accessibilityLabel="One fewer"
              style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center', opacity: count <= MIN ? 0.5 : 1 }}>
              <View style={{ width: 18, height: 2.5, borderRadius: 2, backgroundColor: colors.ink }} />
            </Pressable>
            <Animated.Text
              style={[
                { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 96, lineHeight: 100, letterSpacing: -0.05 * 96, color: colors.ink },
                numberStyle,
              ]}>
              {count}
            </Animated.Text>
            <Pressable
              onPress={() => bump(count + 1)}
              accessibilityLabel="One more"
              style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', opacity: count >= MAX ? 0.5 : 1 }}>
              <Icon name="plus" size={22} color={colors.ground} strokeWidth={2.4} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, minHeight: 34, flexWrap: 'wrap' }}>
            {Array.from({ length: count }, (_, i) => (
              <Animated.View key={i} entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} layout={LinearTransition.springify().stiffness(520).damping(34)}>
                <CatHead rotate={TILTS[i % TILTS.length]} />
              </Animated.View>
            ))}
          </View>
        </View>
        <Text variant="small" color={colors.muted}>
          Counting is hard at 4 am. You can always change this later.
        </Text>
      </View>
    </Screen>
  );
}

function WhenButton({ label, sub, icon, selected, onPress }: { label: string; sub?: string; icon?: boolean; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      haptics="selection"
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        flex: 1,
        height: 52,
        borderRadius: 18,
        backgroundColor: selected ? colors.ink : colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: icon ? 'row' : 'column',
        gap: icon ? 6 : 0,
      }}>
      {icon && <Icon name="calendar" size={16} color={selected ? colors.ground : colors.ink} />}
      <Text variant="body" weight={600} style={{ fontSize: 15, lineHeight: 18 }} color={selected ? colors.ground : colors.ink}>
        {label}
      </Text>
      {sub && (
        <Text variant="caption" style={{ fontSize: 11, lineHeight: 13 }} weight={600} color={selected ? colors.sun : colors.muted}>
          {sub}
        </Text>
      )}
    </Pressable>
  );
}
