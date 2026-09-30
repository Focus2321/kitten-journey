import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar, Button, Chip, haptic, Icon, Pressable, Sheet, Text, type SheetHandle } from '@/components/ui';
import { photos, type PhotoKey } from '@/data/photos';
import { useStore, type Appetite } from '@/data/store';
import { AppetiteTiles } from '@/features/pregnancy/AppetiteTiles';
import { moodOptions } from '@/features/pregnancy/copy';
import { enter } from '@/features/pregnancy/motion';
import { colors, fonts } from '@/theme/tokens';

const APPETITES: Appetite[] = ['hungry', 'normal', 'picky'];

export default function MotherCheckin() {
  const sheetRef = useRef<SheetHandle>(null);
  const { appetite: preset } = useLocalSearchParams<{ appetite?: string }>();

  const mother = useStore((s) => s.mother);
  const phase = useStore((s) => s.phase);
  const tasks = useStore((s) => s.tasks);
  const addCheckin = useStore((s) => s.addCheckin);
  const toggleTask = useStore((s) => s.toggleTask);

  const name = mother?.name ?? 'Mum';
  const expecting = phase === 'expecting';
  const moods = moodOptions(expecting);
  // Bundled stand-in for the camera: a belly photo while expecting, a resting shot once the kittens are here.
  const bundledPhoto: PhotoKey = expecting ? 'juniperWk7' : 'juniperResting';

  const [appetite, setAppetite] = useState<Appetite | null>(APPETITES.find((a) => a === preset) ?? null);
  const [mood, setMood] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<PhotoKey | null>(null);

  const toggleMood = (m: string) => setMood((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]));

  const save = () => {
    addCheckin({ subjectId: 'mother', appetite, mood, note: note.trim() || null, photo });
    tasks.filter((t) => t.action === 'mother-checkin' && !t.done).forEach((t) => toggleTask(t.id));
    haptic('success');
    sheetRef.current?.close();
  };

  const canSave = appetite !== null || mood.length > 0 || note.trim().length > 0 || photo !== null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} pointerEvents="box-none">
      <Sheet ref={sheetRef}>
        {/* Header */}
        <Animated.View entering={enter(0)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar photo={mother?.photo} size={44} shape="squircle" ring={colors.paw} ringWidth={2} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="section" style={{ fontSize: 22, lineHeight: 28 }}>
              {name} today
            </Text>
            <Text variant="small" color={colors.muted}>
              Two taps and you’re done
            </Text>
          </View>
          <Pressable
            onPress={() => sheetRef.current?.close()}
            haptics="none"
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={8}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={16} strokeWidth={2.6} />
          </Pressable>
        </Animated.View>

        {/* Eating */}
        <Animated.View entering={enter(1)} style={{ gap: 10 }}>
          <Text variant="label">Eating</Text>
          <AppetiteTiles value={appetite} onChange={(a) => setAppetite((cur) => (cur === a ? null : a))} />
        </Animated.View>

        {/* Mood */}
        <Animated.View entering={enter(2)} style={{ gap: 10 }}>
          <Text variant="label">How does she seem?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {moods.map((m) => (
              <Chip key={m} label={m} selected={mood.includes(m)} onPress={() => toggleMood(m)} />
            ))}
          </View>
        </Animated.View>

        {/* Note + photo */}
        <Animated.View entering={enter(3)} style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, minHeight: 76, backgroundColor: colors.surface, borderRadius: 22, paddingVertical: 14, paddingHorizontal: 16, gap: 4 }}>
            <Text variant="label">Anything else? (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="A funny habit, a worry, a win"
              placeholderTextColor={colors.muted}
              multiline
              cursorColor={colors.sun}
              selectionColor={colors.sun}
              accessibilityLabel="Anything else"
              style={{ fontFamily: fonts[400], fontSize: 15, lineHeight: 21, color: colors.ink, padding: 0, minHeight: 21 }}
            />
          </View>
          <Pressable
            onPress={() => setPhoto((p) => (p ? null : bundledPhoto))}
            haptics="selection"
            accessibilityRole="button"
            accessibilityLabel={photo ? 'Remove photo' : 'Add a photo'}
            style={{
              width: 76,
              borderRadius: 22,
              borderWidth: photo ? 0 : 2,
              borderStyle: 'dashed',
              borderColor: colors.dashed,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}>
            {photo ? (
              <Image source={photos[photo]} contentFit="cover" style={{ width: '100%', height: '100%' }} />
            ) : (
              <>
                <Icon name="camera" size={22} />
                <Text variant="caption" weight={600} color={colors.ink}>
                  Photo
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={enter(4)} style={{ gap: 12, paddingTop: 2 }}>
          <Button label="Save to her day" onPress={save} disabled={!canSave} style={{ height: 58 }} />
          <Text variant="small" color={colors.muted} align="center" style={{ fontSize: 13 }}>
            Off her food for a whole day? That’s worth a quick call to your vet.
          </Text>
        </Animated.View>
      </Sheet>
    </KeyboardAvoidingView>
  );
}
