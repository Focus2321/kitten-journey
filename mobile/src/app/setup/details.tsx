import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button, Icon, IconButton, Pressable, Screen, Segmented, StepDots, Text, TopBar } from '@/components/ui';
import { addDays } from '@/data/dates';
import { useStore } from '@/data/store';
import { Gated } from '@/features/auth/Gate';
import { duePeriod, estimatedDue, STAGE_GUESSES, type StageGuess } from '@/features/pregnancy/copy';
import { enter } from '@/features/pregnancy/motion';
import { SquirclePhoto } from '@/features/setup/SquirclePhoto';
import { colors, fonts, radius } from '@/theme/tokens';

const LITTER_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
] as const;
type Litter = (typeof LITTER_OPTIONS)[number]['value'];

/** Ink pill choice — the design uses black selected pills here rather than the yellow Chip. */
function StagePill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      haptics="selection"
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={{ paddingVertical: 11, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: selected ? colors.ink : colors.surface }}>
      <Text variant="small" weight={selected ? 600 : 500} color={selected ? colors.ground : colors.ink} style={{ fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SetupDetails() {
  const today = useStore((s) => s.today);
  const mother = useStore((s) => s.mother);
  const setMother = useStore((s) => s.setMother);
  const completeSetup = useStore((s) => s.completeSetup);

  const name = mother?.name || 'her';
  const [stage, setStage] = useState<StageGuess | null>(null);
  const [litter, setLitter] = useState<Litter | null>(null);
  const [age, setAge] = useState('');
  const [ageOpen, setAgeOpen] = useState(false);

  const guess = STAGE_GUESSES.find((g) => g.id === stage) ?? null;
  const matingDate = guess?.daysAgo != null ? addDays(today, -guess.daysAgo) : null;
  const dueDate = matingDate ? estimatedDue(matingDate) : null;

  const finish = (save: boolean) => {
    if (save) {
      setMother({
        matingDate,
        dueDate,
        firstLitter: litter === 'yes' ? true : litter === 'no' ? false : null,
        age: age.trim() || null,
      });
    }
    completeSetup();
    router.dismissAll();
    router.replace('/');
  };

  return (
    <Screen
      keyboardShouldPersistTaps="handled"
      header={
        <TopBar
          left={<IconButton icon="back" label="Back" size={40} onPress={() => router.back()} />}
          center={<StepDots count={3} active={1} />}
          right={
            <Pressable onPress={() => finish(false)} haptics="none" hitSlop={10} accessibilityRole="button" accessibilityLabel="Skip">
              <Text variant="small" weight={600} style={{ fontSize: 15 }}>
                Skip
              </Text>
            </Pressable>
          }
        />
      }
      footer={<Button label={`Start ${name}'s journey`} onPress={() => finish(true)} />}>
      <Animated.View entering={enter(0)} style={{ paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <SquirclePhoto photo={mother?.photo ?? null} size={56} radius={20} badge={false} />
        <Text variant="title" style={{ flex: 1, lineHeight: 30 }}>
          What do you know about her?
        </Text>
      </Animated.View>
      <Animated.View entering={enter(1)} style={{ paddingTop: 10 }}>
        <Text variant="body" color={colors.muted}>
          Everything here is optional. “Not sure” is a perfectly good answer.
        </Text>
      </Animated.View>

      <Animated.View entering={enter(2)} style={{ paddingTop: 30, gap: 12 }}>
        <Text variant="lead" weight={700} style={{ lineHeight: 22 }}>
          How far along does she seem?
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {STAGE_GUESSES.map((g) => (
            <StagePill key={g.id} label={g.label} selected={stage === g.id} onPress={() => setStage((s) => (s === g.id ? null : g.id))} />
          ))}
        </View>
        {dueDate && (
          <Animated.View entering={enter(0)} style={{ backgroundColor: colors.sunSoft, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.sun, marginTop: 6 }} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="small" weight={700} style={{ fontSize: 15 }}>
                Kittens could arrive {duePeriod(dueDate)}
              </Text>
              <Text variant="small" style={{ lineHeight: 19 }}>
                A rough guess. We’ll keep it loose and tune it as she changes.
              </Text>
            </View>
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View entering={enter(3)} style={{ paddingTop: 28, gap: 12 }}>
        <Text variant="lead" weight={700} style={{ lineHeight: 22 }}>
          Is this her first litter?
        </Text>
        <Segmented options={LITTER_OPTIONS} value={litter} onChange={setLitter} tone="ground" />
      </Animated.View>

      <Animated.View entering={enter(4)} style={{ paddingTop: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text variant="lead" weight={700} style={{ lineHeight: 22 }}>
          Her age
        </Text>
        {ageOpen ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 14 }}>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 2 years"
              placeholderTextColor={colors.muted}
              autoFocus
              cursorColor={colors.sun}
              selectionColor={colors.sun}
              returnKeyType="done"
              accessibilityLabel="Her age"
              style={{ fontFamily: fonts[600], fontSize: 15, color: colors.ink, minWidth: 96, paddingVertical: 4 }}
            />
          </View>
        ) : (
          <Pressable
            onPress={() => setAgeOpen(true)}
            haptics="selection"
            accessibilityRole="button"
            accessibilityLabel="Add her age"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.pill, paddingVertical: 10, paddingHorizontal: 14 }}>
            <Text variant="small" weight={500} color={colors.muted} style={{ fontSize: 15 }}>
              Add if you know
            </Text>
            <Icon name="plus" size={14} color={colors.muted} />
          </Pressable>
        )}
      </Animated.View>
    </Screen>
  );
}

export default function SetupDetailsRoute() {
  return (
    <Gated>
      <SetupDetails />
    </Gated>
  );
}
