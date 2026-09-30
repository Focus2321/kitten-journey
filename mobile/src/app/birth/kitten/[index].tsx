import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState, type RefObject } from 'react';
import { TextInput, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { Button, Icon, IconButton, Pressable, Screen, Segmented, Text, TopBar, haptic } from '@/components/ui';
import { photoSource, type Photo } from '@/data/photos';
import { collarFor, collarOf, displayName, useStore, type Sex } from '@/data/store';
import { CollarPicker, swapNote } from '@/features/birth/CollarPicker';
import { LitterSlots, SLOT, type LitterSlotsHandle } from '@/features/birth/LitterSlots';
import { Toast } from '@/features/birth/Toast';
import { GRAMS_ERROR, parseGrams, parseTime, TIME_ERROR } from '@/features/birth/parse';
import { pickPhoto } from '@/features/photos/pickPhoto';
import { colors, fonts, radius } from '@/theme/tokens';

const PHOTO = 300;
const SEX_OPTIONS = [
  { value: 'boy', label: 'Boy' },
  { value: 'girl', label: 'Girl' },
  { value: 'unknown', label: 'Not sure yet' },
] as const;

/**
 * Screens 09 / 10 — one kitten at a time. Everything is optional: a photo, a name (or the collar
 * colour as a temporary ID), sex, coat, time and weight. Saving plays motion M2: the photo shrinks
 * and flies into its litter slot, the slot pops, and the next kitten's screen carries the toast.
 */
export default function BirthKitten() {
  const params = useLocalSearchParams<{ index: string; toast?: string; toastPhoto?: string }>();
  const index = Math.max(0, parseInt(params.index ?? '0', 10) || 0);

  const count = useStore((s) => s.birth?.count ?? Math.max(s.kittens.length, index + 1));
  const kittens = useStore((s) => s.kittens);
  const saveKitten = useStore((s) => s.saveKitten);
  const existing = kittens[index];
  // Default: their own collar, else the next colour nobody wears. Any colour can be picked instead.
  const fallback = collarFor(kittens, index);
  const [collarId, setCollarId] = useState<string>(fallback.tempId);
  const collar = collarOf(collarId);
  const others = kittens.filter((_, i) => i !== index);
  const isLast = index >= count - 1;

  const [photo, setPhoto] = useState<Photo | null>(existing?.photo ?? null);
  const [name, setName] = useState(existing?.name ?? '');
  const [collarMode, setCollarMode] = useState(!!existing && !existing.name);
  const [sex, setSex] = useState<Sex | null>(existing?.sex ?? null);
  const [coat, setCoat] = useState(existing?.coat ?? '');
  const [time, setTime] = useState(existing?.birthTime ?? '');
  const [grams, setGrams] = useState(existing?.birthWeight ? String(existing.birthWeight) : '');
  const [saving, setSaving] = useState(false);
  const [filledCount, setFilledCount] = useState(Math.min(index, kittens.length));
  const [checked, setChecked] = useState({ time: false, grams: false });

  const timeRef = useRef<TextInput>(null);
  const gramsRef = useRef<TextInput>(null);

  const slotsRef = useRef<LitterSlotsHandle>(null);
  const photoRef = useRef<View>(null);

  // Motion M2 — the photo flies into its slot, the details fade away underneath it.
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);
  const rot = useSharedValue(-2);
  const photoOpacity = useSharedValue(1);
  const detailsOpacity = useSharedValue(1);
  const photoStyle = useAnimatedStyle(() => ({
    opacity: photoOpacity.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }, { rotate: `${rot.value}deg` }],
  }));
  const detailsStyle = useAnimatedStyle(() => ({ opacity: detailsOpacity.value }));

  const choosePhoto = async () => {
    const who = collarMode || !name.trim() ? `${collar.tempId} Collar` : name.trim();
    const picked = await pickPhoto({ title: `Photo of ${who}`, canRemove: photo !== null });
    if (picked === 'remove') setPhoto(null);
    else if (picked) setPhoto(picked);
  };

  // Empty is fine (everything is optional); anything typed has to make sense.
  const parsedTime = parseTime(time);
  const parsedGrams = parseGrams(grams);
  const timeError = time.trim() && !parsedTime ? TIME_ERROR : null;
  const gramsError = grams.trim() && parsedGrams === null ? GRAMS_ERROR : null;
  const shownError = (checked.time && timeError) || (checked.grams && gramsError) || null;

  const goNext = (toast: string, toastPhoto: Photo | null) => {
    if (isLast) router.push('/birth/complete');
    else router.push({ pathname: '/birth/kitten/[index]', params: { index: String(index + 1), toast, toastPhoto: toastPhoto ?? '' } });
  };

  const save = async () => {
    if (saving) return;
    if (timeError || gramsError) {
      setChecked({ time: true, grams: true });
      haptic('medium');
      (gramsError ? gramsRef : timeRef).current?.focus();
      return;
    }
    setSaving(true);
    const trimmed = name.trim();
    saveKitten(index, {
      name: collarMode || !trimmed ? null : trimmed,
      photo,
      sex: sex ?? 'unknown',
      coat: coat.trim(),
      birthTime: parsedTime,
      birthWeight: parsedGrams,
    }, collarId);
    const shown = displayName({ name: collarMode || !trimmed ? null : trimmed, tempId: collar.tempId });
    const remaining = count - index - 1;
    const toast = remaining > 0 ? `${shown}’s in · ${remaining} to go` : `${shown}’s in · that’s everyone`;

    // Where is the photo, where is the slot? Then fly.
    const slot = await slotsRef.current?.measureSlot(index);
    const from = await new Promise<{ x: number; y: number; w: number; h: number } | null>((resolve) => {
      const node = photoRef.current;
      if (!node) return resolve(null);
      node.measureInWindow((x, y, w, h) => resolve({ x, y, w, h }));
    });

    detailsOpacity.set(withTiming(0, { duration: 120 }));
    if (slot && from) {
      const dx = slot.x + slot.width / 2 - (from.x + from.w / 2);
      const dy = slot.y + slot.height / 2 - (from.y + from.h / 2);
      const fly = { duration: 240, easing: Easing.inOut(Easing.cubic) };
      tx.set(withDelay(120, withTiming(dx, fly)));
      ty.set(withDelay(120, withTiming(dy, fly)));
      scale.set(withDelay(120, withTiming(SLOT / PHOTO, fly)));
      rot.set(withDelay(120, withTiming(0, fly)));
    } else {
      scale.set(withDelay(120, withTiming(0.2, { duration: 240 })));
    }
    photoOpacity.set(withDelay(340, withTiming(0, { duration: 60 })));

    setTimeout(() => setFilledCount(index + 1), 360); // slot pops + light haptic inside LitterSlots
    setTimeout(() => goNext(toast, photo), 520);
  };

  const filled = Array.from({ length: filledCount }, (_, i) => (i === index ? photo : kittens[i]?.photo));

  return (
    <>
      <Stack.Screen options={{ animation: 'fade' }} />
      <Screen
        keyboardShouldPersistTaps="handled"
        header={
          <TopBar
            left={<IconButton icon="back" label="Back" onPress={() => router.back()} />}
            center={<LitterSlots ref={slotsRef} count={count} active={index} filled={filled} />}
            right={
              <Pressable onPress={save} haptics="none" hitSlop={10} accessibilityRole="button" accessibilityLabel="Later" accessibilityHint="Saves what you have entered and moves on" disabled={saving}>
                <Text variant="body" weight={600} color={colors.muted} style={{ fontSize: 15 }}>
                  Later
                </Text>
              </Pressable>
            }
          />
        }
        footer={
          <Button
            label={isLast ? 'That’s everyone' : index === count - 2 ? 'Next kitten · last one' : 'Next kitten'}
            iconRight="arrow-right"
            onPress={save}
            disabled={saving}
          />
        }
        contentStyle={{ gap: 24, paddingTop: 6 }}>
        <View style={{ alignItems: 'center', paddingTop: 8 }}>
          <Animated.View ref={photoRef} collapsable={false} entering={FadeInDown.duration(220)} style={[{ width: PHOTO, height: PHOTO }, photoStyle]}>
            {photo ? (
              <Image source={photoSource(photo)} contentFit="cover" style={{ width: PHOTO, height: PHOTO, borderRadius: 36 }} />
            ) : (
              <Pressable onPress={choosePhoto} pressScale={0.98} accessibilityRole="button" accessibilityLabel="Add a photo" style={{ width: PHOTO, height: PHOTO, borderRadius: 36, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.dashed, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="camera" size={24} />
                </View>
                <Text variant="small" weight={600} color={colors.muted}>
                  Add a photo · or later
                </Text>
              </Pressable>
            )}
            {photo && (
              <Pressable
                onPress={choosePhoto}
                haptics="selection"
                accessibilityRole="button"
                accessibilityLabel="Change or remove photo"
                style={{ position: 'absolute', left: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.ground, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 12 }}>
                <Icon name="camera" size={16} />
                <Text variant="caption" weight={600} color={colors.ink} style={{ fontSize: 13 }}>
                  Change
                </Text>
              </Pressable>
            )}
          </Animated.View>
          {params.toast ? (
            <View pointerEvents="none" style={{ position: 'absolute', top: 18, left: 0, right: 0, alignItems: 'center' }}>
              <Toast key={params.toast} text={params.toast} photo={params.toastPhoto ? (params.toastPhoto as Photo) : null} />
            </View>
          ) : null}
        </View>

        <Animated.View entering={FadeInDown.duration(220).delay(40)} style={[{ gap: 20 }, detailsStyle]}>
          <View style={{ gap: 6, paddingHorizontal: 4 }}>
            <Text variant="label">{collarMode ? 'Temporary name' : 'Their name'}</Text>
            {collarMode ? (
              <Pressable onPress={() => setCollarMode(false)} haptics="none" accessibilityRole="button" accessibilityLabel={`${collar.tempId} Collar, temporary name`} accessibilityHint="Type a real name instead" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 2, borderBottomColor: colors.ink, paddingBottom: 8 }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: collar.color }} />
                <Text variant="display" style={{ fontSize: 44, lineHeight: 50 }}>
                  {collar.tempId} Collar
                </Text>
              </Pressable>
            ) : (
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Their name"
                placeholderTextColor={colors.dashed}
                selectionColor={colors.sun}
                cursorColor={colors.sun}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                accessibilityLabel="Their name"
                style={{ fontFamily: fonts[800], fontSize: 44, lineHeight: 50, letterSpacing: -0.035 * 44, color: colors.ink, borderBottomWidth: 2, borderBottomColor: colors.ink, paddingBottom: 8, paddingTop: 0 }}
              />
            )}
          </View>

          <View style={{ gap: 12 }}>
            <Text variant="small" color={colors.muted}>
              {swapNote(collarId, others, fallback.tempId) ?? (collarMode ? 'Picked a colour — you can give them a real name anytime.' : 'No name yet? Tap a collar colour instead')}
            </Text>
            <CollarPicker
              value={collarMode ? collarId : null}
              others={others}
              onPick={(tempId) => {
                setCollarId(tempId);
                setCollarMode(true);
                setName('');
              }}
            />
          </View>

          <Segmented options={SEX_OPTIONS} value={sex} onChange={setSex} tone="ground" />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Field label="Coat" value={coat} onChange={setCoat} placeholder="Grey tabby" flex={1.4} returnKey="next" onSubmit={() => timeRef.current?.focus()} />
            <Field
              label="Born at"
              inputRef={timeRef}
              value={time}
              onChange={setTime}
              onBlur={() => setChecked((c) => ({ ...c, time: true }))}
              placeholder="5:42"
              invalid={checked.time && !!timeError}
              returnKey="next"
              onSubmit={() => gramsRef.current?.focus()}
            />
            <Field
              label="Weight"
              inputRef={gramsRef}
              value={grams}
              onChange={setGrams}
              onBlur={() => setChecked((c) => ({ ...c, grams: true }))}
              placeholder="102 g"
              invalid={checked.grams && !!gramsError}
              returnKey="done"
            />
          </View>
          <Text variant="caption" color={shownError ? colors.orange : undefined} weight={shownError ? 600 : undefined} accessibilityLiveRegion="polite" style={{ paddingHorizontal: 4 }}>
            {shownError ?? 'All optional. Fill in what you know; the rest can wait.'}
          </Text>
        </Animated.View>
      </Screen>
    </>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  placeholder: string;
  returnKey: 'next' | 'done';
  invalid?: boolean;
  inputRef?: RefObject<TextInput | null>;
  flex?: number;
};

function Field({ label, value, onChange, onBlur, onSubmit, placeholder, returnKey, invalid, inputRef, flex = 1 }: FieldProps) {
  const numeric = label !== 'Coat';
  return (
    <View style={{ flex, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, gap: 1, borderWidth: 1.5, borderColor: invalid ? colors.orange : 'transparent' }}>
      <Text variant="caption" weight={600} color={invalid ? colors.orange : undefined} style={{ fontSize: 11, lineHeight: 13 }}>
        {label}
      </Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.dashed}
        selectionColor={colors.sun}
        // Numbers-and-punctuation keeps a return key on iOS, so the keyboard can always be closed or advanced.
        keyboardType={numeric ? 'numbers-and-punctuation' : 'default'}
        returnKeyType={returnKey}
        submitBehavior={returnKey === 'next' ? 'submit' : 'blurAndSubmit'}
        autoCorrect={false}
        accessibilityLabel={label === 'Weight' ? 'Weight in grams' : label}
        aria-invalid={invalid}
        style={{ fontFamily: fonts[600], fontSize: 15, lineHeight: 20, color: colors.ink, padding: 0 }}
      />
    </View>
  );
}
