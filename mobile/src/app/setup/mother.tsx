import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button, IconButton, IconButtonSpacer, Screen, StepDots, Text, TopBar } from '@/components/ui';
import type { Photo } from '@/data/photos';
import { useStore } from '@/data/store';
import { Gated } from '@/features/auth/Gate';
import { enter } from '@/features/pregnancy/motion';
import { pickPhoto } from '@/features/photos/pickPhoto';
import { SquirclePhoto } from '@/features/setup/SquirclePhoto';
import { colors, fonts } from '@/theme/tokens';

function SetupMother() {
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const mother = useStore((s) => s.mother);
  const setMother = useStore((s) => s.setMother);

  const [name, setName] = useState(mother?.name ?? '');
  const [photo, setPhoto] = useState<Photo | null>(mother?.photo ?? null);
  const trimmed = name.trim();
  const born = flow === 'born';

  const choosePhoto = async () => {
    const picked = await pickPhoto({ title: 'Her photo', canRemove: photo !== null });
    if (picked === 'remove') setPhoto(null);
    else if (picked) setPhoto(picked);
  };

  const next = () => {
    if (!trimmed) return;
    setMother({ name: trimmed, photo });
    if (born) {
      // Kittens already here: skip the pregnancy (no "mum-to-be" phase) and go straight to the birth log.
      router.push('/birth');
      return;
    }
    router.push('/setup/details');
  };

  return (
    <Screen
      keyboardShouldPersistTaps="handled"
      header={
        <TopBar
          left={<IconButton icon="back" label="Back" size={40} onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} />}
          center={<StepDots count={3} active={0} />}
          right={<IconButtonSpacer size={40} />}
        />
      }
      footer={
        <View style={{ gap: 14, paddingBottom: 6 }}>
          <Button label="That's her" iconRight="arrow-right" variant="ink" onPress={next} disabled={!trimmed} />
          <Text variant="small" color={colors.muted} align="center">
            No photo handy? You can add one later.
          </Text>
        </View>
      }>
      <Animated.View entering={enter(0)} style={{ paddingTop: 12, paddingHorizontal: 4, gap: 8 }}>
        <Text variant="headline" align="center" style={{ fontSize: 38, lineHeight: 40 }}>
          {born ? 'Who’s the mum?' : 'Who’s the mum‑to‑be?'}
        </Text>
        <Text variant="body" color={colors.muted} align="center">
          A photo and a name is all we need.
        </Text>
      </Animated.View>

      <Animated.View entering={enter(1)} style={{ alignItems: 'center', paddingTop: 36 }}>
        <SquirclePhoto photo={photo} onPress={choosePhoto} />
      </Animated.View>

      <Animated.View entering={enter(2)} style={{ alignItems: 'center', paddingTop: 36, gap: 10 }}>
        <Text variant="label">Her name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Juniper"
          placeholderTextColor={colors.dashed}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={next}
          cursorColor={colors.sun}
          selectionColor={colors.sun}
          accessibilityLabel="Her name"
          style={{
            fontFamily: fonts[800],
            fontSize: 44,
            lineHeight: 48,
            letterSpacing: -1.5,
            color: colors.ink,
            textAlign: 'center',
            minWidth: 200,
            paddingVertical: 4,
          }}
        />
        <View style={{ width: 200, height: 2, backgroundColor: colors.ink, borderRadius: 1 }} />
      </Animated.View>
    </Screen>
  );
}

export default function SetupMotherRoute() {
  return (
    <Gated>
      <SetupMother />
    </Gated>
  );
}
