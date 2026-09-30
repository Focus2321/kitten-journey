import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Switch, TextInput, View } from 'react-native';

import { Avatar, AvatarStack, Button, Chip, haptic, IconButton, Pressable, Segmented, Sheet, Text, type SheetHandle } from '@/components/ui';
import { photoSource, type Photo } from '@/data/photos';
import { displayName, useStore, type Appetite, type Kitten, type Mother } from '@/data/store';
import { confirmDiscard } from '@/features/photos/confirmDiscard';
import { pickPhoto } from '@/features/photos/pickPhoto';
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
  const tasks = useStore((s) => s.tasks);
  const completeTask = useStore((s) => s.completeTask);

  const kitten = kittens.find((k) => k.id === id) ?? null;
  const who = describe(id, kitten, mother, kittens);

  const [food, setFood] = useState<Food | null>(null);
  const [moods, setMoods] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [isFirst, setIsFirst] = useState(false);
  const [firstName, setFirstName] = useState('');

  const toggleMood = (m: string) => setMoods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  const canSave = food !== null || moods.length > 0 || text.trim().length > 0 || photo !== null;

  const choosePhoto = async () => {
    const picked = await pickPhoto({ title: `Photo of ${who.storyName}`, canRemove: photo !== null });
    if (picked === 'remove') setPhoto(null);
    else if (picked) setPhoto(picked);
  };

  const save = () => {
    if (food !== null || moods.length > 0) addCheckin({ subjectId: id, appetite: food ? APPETITE[food] : null, mood: moods, note: null, photo: null });
    if (text.trim() || photo) {
      const first = isFirst && text.trim() ? firstName.trim() || 'A first' : null;
      addMoment({ subjectId: id, text: text.trim(), photo, first, kind: text.trim() ? 'moment' : 'photo' });
      // A real photo is what the "For today" photo task asks for.
      if (photo) tasks.filter((t) => !t.done && t.action === 'photo').forEach((t) => completeTask(t.id));
    }
    haptic('success');
    sheet.current?.close();
  };

  const requestClose = () => {
    if (!canSave) return true;
    confirmDiscard(`Discard ${who.storyName}’s day?`, () => sheet.current?.close());
    return false;
  };

  return (
    <Sheet ref={sheet} onRequestClose={requestClose}>
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
        <IconButton icon="close" label="Close" size={40} onPress={() => requestClose() && sheet.current?.close()} />
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
              accessibilityLabel="A moment worth keeping"
              scrollEnabled
              style={{ flex: 1, minHeight: 44, maxHeight: 22 * 5, paddingTop: 0, fontFamily: fonts[500], fontSize: 16, lineHeight: 22, color: colors.ink }}
            />
            {photo && (
              <Pressable onPress={choosePhoto} accessibilityRole="button" accessibilityLabel="Change or remove photo" haptics="selection">
                <Image source={photoSource(photo)} contentFit="cover" style={{ width: 52, height: 52, borderRadius: 14 }} />
              </Pressable>
            )}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton icon="camera" label={photo ? 'Change or remove photo' : 'Add a photo'} variant="ground" size={36} onPress={choosePhoto} />
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
              accessibilityLabel="What was the first?"
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
  );
}

// ---------------------------------------------------------------------------

function describe(id: string, kitten: Kitten | null, mother: Mother | null, kittens: Kitten[]) {
  const motherName = mother?.name || 'Mum';
  if (id === 'mother') {
    return {
      title: `${motherName}’s day`,
      storyName: motherName,
      avatar: <Avatar photo={mother?.photo} size={48} shape="squircle" ring={colors.paw} />,
      foodLabel: 'Ate her food',
      moodLabel: 'She was',
      moods: ['Cuddly', 'Sleepy', 'Restless', 'Hungry', 'Hiding', 'Not quite herself'],
      placeholder: 'Something she did today…',
      footnote: 'Off her food for a day, or not quite herself? It’s always fine to call your vet.',
    };
  }
  if (id === 'litter' || !kitten) {
    return {
      title: 'The litter’s day',
      storyName: 'the litter',
      avatar: <AvatarStack items={kittens.length ? kittens.slice(0, 4).map((k) => k.photo) : [null]} size={36} overlap={12} />,
      foodLabel: 'Fed well',
      moodLabel: 'They were',
      moods: ['Playful', 'Sleepy', 'Cuddly', 'Noisy', 'Squabbling', 'Not quite themselves'],
      placeholder: 'Something they did today…',
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
    footnote: `Off ${his} food for a day, or not quite ${reflexive(kitten)}? It’s always fine to call your vet.`,
  };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
