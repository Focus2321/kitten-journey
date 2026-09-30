import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Switch, TextInput, View } from 'react-native';

import { Avatar, AvatarStack, Button, Chip, IconButton, Pressable, Segmented, Sheet, Text, type SheetHandle } from '@/components/ui';
import { photos, type PhotoKey } from '@/data/photos';
import { displayName, useStore, type Appetite, type Kitten } from '@/data/store';
import { colors, fonts, radius } from '@/theme/tokens';

import { reflexive, subject } from './guidance';

type Food = 'all' | 'some' | 'little';
const FOOD: readonly { value: Food; label: string }[] = [
  { value: 'all', label: 'All of it' },
  { value: 'some', label: 'Some' },
  { value: 'little', label: 'Not much' },
];
const APPETITE: Record<Food, Appetite> = { all: 'hungry', some: 'normal', little: 'picky' };

/**
 * Screen 16 — "Pip today". One sheet for a kitten, the whole litter ('litter') or the mother ('mother').
 * Everything is optional; saving with only a mood is fine.
 */
export function KittenDaySheet({ id }: { id: string }) {
  const sheet = useRef<SheetHandle>(null);
  const kittens = useStore((s) => s.kittens);
  const mother = useStore((s) => s.mother);
  const addMoment = useStore((s) => s.addMoment);
  const addCheckin = useStore((s) => s.addCheckin);

  const kitten = kittens.find((k) => k.id === id) ?? null;
  const who = describe(id, kitten, mother?.name ?? 'Mum', kittens.length);

  const [food, setFood] = useState<Food | null>(null);
  const [moods, setMoods] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<PhotoKey | null>(null);
  const [isFirst, setIsFirst] = useState(false);
  const [firstName, setFirstName] = useState('');

  const toggleMood = (m: string) => setMoods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  const canSave = food !== null || moods.length > 0 || text.trim().length > 0;

  const save = () => {
    if (food !== null || moods.length > 0) addCheckin({ subjectId: id, appetite: food ? APPETITE[food] : null, mood: moods, note: null, photo: null });
    if (text.trim()) {
      addMoment({ subjectId: id, text: text.trim(), photo, first: isFirst ? firstName.trim() || 'A first' : null, kind: 'moment' });
    }
    sheet.current?.close();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Sheet ref={sheet} scroll>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {who.avatar}
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="title" style={{ fontSize: 22, lineHeight: 26 }}>
              {who.title}
            </Text>
            <Text variant="small" color={colors.muted}>
              Tap what fits. Skip what doesn’t.
            </Text>
          </View>
          <IconButton icon="close" label="Close" size={40} onPress={() => sheet.current?.close()} />
        </View>

        <View style={{ gap: 10 }}>
          <Text variant="label">{who.foodLabel}</Text>
          <Segmented options={FOOD} value={food} onChange={setFood} />
        </View>

        <View style={{ gap: 10 }}>
          <Text variant="label">{who.moodLabel}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {who.moods.map((m) => (
              <Chip key={m} label={m} selected={moods.includes(m)} onPress={() => toggleMood(m)} />
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="label">A moment worth keeping?</Text>
            <Text variant="caption">Optional</Text>
          </View>
          <View style={{ backgroundColor: colors.surface, borderRadius: 22, padding: 14, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <TextInput
                value={text}
                onChangeText={setText}
                multiline
                placeholder={who.placeholder}
                placeholderTextColor={colors.muted}
                style={{ flex: 1, minHeight: 44, paddingTop: 0, fontFamily: fonts[500], fontSize: 16, lineHeight: 22, color: colors.ink }}
              />
              {photo && (
                <Pressable onPress={() => setPhoto(null)} accessibilityLabel="Remove photo" haptics="selection">
                  <Image source={photos[photo]} contentFit="cover" style={{ width: 52, height: 52, borderRadius: 14 }} />
                </Pressable>
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <IconButton icon="camera" label="Add a photo" variant="ground" size={36} onPress={() => setPhoto(photo ? null : who.photo)} />
                <IconButton icon="mic" label="Dictate" variant="ground" size={36} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, paddingLeft: 12, paddingRight: 6, borderRadius: radius.pill, backgroundColor: colors.ground }}>
                <Text variant="small" weight={600}>
                  It’s a first
                </Text>
                <Switch
                  value={isFirst}
                  onValueChange={setIsFirst}
                  trackColor={{ false: colors.line, true: colors.sun }}
                  thumbColor={colors.ground}
                  ios_backgroundColor={colors.line}
                  style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                  accessibilityLabel="This was a first"
                />
              </View>
            </View>
            {isFirst && (
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="What was it? e.g. First pounce"
                placeholderTextColor={colors.muted}
                style={{ height: 44, paddingHorizontal: 14, borderRadius: radius.sm, backgroundColor: colors.ground, fontFamily: fonts[600], fontSize: 15, color: colors.ink }}
              />
            )}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Button label={`Save to ${who.storyName}’s story`} onPress={save} disabled={!canSave} haptics="success" />
          <Text variant="caption" align="center">
            {who.footnote}
          </Text>
        </View>
      </Sheet>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------

function describe(id: string, kitten: Kitten | null, motherName: string, litterSize: number) {
  if (id === 'mother') {
    return {
      title: `${motherName}’s day`,
      storyName: motherName,
      avatar: <Avatar photo="juniper" size={48} shape="squircle" ring={colors.paw} />,
      foodLabel: 'Ate her food',
      moodLabel: 'She was',
      moods: ['Cuddly', 'Sleepy', 'Restless', 'Hungry', 'Hiding', 'Not quite herself'],
      placeholder: 'Something she did today…',
      photo: 'juniperResting' as PhotoKey,
      footnote: 'Off her food for a day, or not quite herself? It’s always fine to call your vet.',
    };
  }
  if (id === 'litter' || !kitten) {
    return {
      title: 'The litter’s day',
      storyName: 'the litter',
      avatar: <AvatarStack items={['pip', 'fig', 'biscuit', 'moth'].slice(0, Math.max(1, litterSize)) as PhotoKey[]} size={36} overlap={12} />,
      foodLabel: 'Fed well',
      moodLabel: 'They were',
      moods: ['Playful', 'Sleepy', 'Cuddly', 'Noisy', 'Squabbling', 'Not quite themselves'],
      placeholder: 'Something they did today…',
      photo: 'nap' as PhotoKey,
      footnote: 'One of them off their food, or not quite themselves? It’s always fine to call your vet.',
    };
  }
  const name = displayName(kitten);
  const his = kitten.sex === 'boy' ? 'his' : kitten.sex === 'girl' ? 'her' : 'their';
  return {
    title: `${name} today`,
    storyName: name,
    avatar: <Avatar photo={kitten.photo} size={48} ring={colors.sun} dot={kitten.name ? undefined : kitten.tempColor} />,
    foodLabel: `Ate ${his} food`,
    moodLabel: `${cap(subject(kitten))} ${kitten.sex === 'unknown' ? 'were' : 'was'}`,
    moods: ['Playful', 'Zoomies', 'Cuddly', 'Sleepy', 'Shy', `Not quite ${reflexive(kitten)}`],
    placeholder: `Something ${name} did today…`,
    photo: (kitten.photo ?? 'pip') as PhotoKey,
    footnote: `Off ${his} food for a day, or not quite ${reflexive(kitten)}? It’s always fine to call your vet.`,
  };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
