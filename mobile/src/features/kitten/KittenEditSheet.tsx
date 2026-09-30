import { useRef, useState, type RefObject } from 'react';
import { TextInput, View } from 'react-native';

import { Avatar, Button, Icon, Pressable, Segmented, Sheet, Text, haptic, type SheetHandle } from '@/components/ui';
import { useStore, type Sex } from '@/data/store';
import { CollarPicker, swapNote } from '@/features/birth/CollarPicker';
import { GRAMS_ERROR, parseGrams, parseTime, TIME_ERROR } from '@/features/birth/parse';
import { confirmDiscard } from '@/features/photos/confirmDiscard';
import { colors, fonts, radius } from '@/theme/tokens';

const SEXES = [
  { value: 'boy', label: 'Boy' },
  { value: 'girl', label: 'Girl' },
  { value: 'unknown', label: 'Not sure' },
] as const;

/** Edit details — the same fields as the birth log, with the same checks, so a 4 am typo can be fixed later. */
export function KittenEditSheet({ id }: { id: string }) {
  const sheetRef = useRef<SheetHandle>(null);
  const kittens = useStore((s) => s.kittens);
  const kitten = kittens.find((k) => k.id === id);
  const updateKitten = useStore((s) => s.updateKitten);
  const setCollar = useStore((s) => s.setCollar);

  const [name, setName] = useState(kitten?.name ?? '');
  const [sex, setSex] = useState<Sex>(kitten?.sex ?? 'unknown');
  const [collarId, setCollarId] = useState(kitten?.tempId ?? '');
  const [coat, setCoat] = useState(kitten?.coat ?? '');
  const [time, setTime] = useState(kitten?.birthTime ?? '');
  const [grams, setGrams] = useState(kitten?.birthWeight ? String(kitten.birthWeight) : '');
  const [checked, setChecked] = useState(false);

  const coatRef = useRef<TextInput>(null);
  const timeRef = useRef<TextInput>(null);
  const gramsRef = useRef<TextInput>(null);

  if (!kitten) return null;

  const parsedTime = parseTime(time);
  const parsedGrams = parseGrams(grams);
  const timeError = time.trim() && !parsedTime ? TIME_ERROR : null;
  const gramsError = grams.trim() && parsedGrams === null ? GRAMS_ERROR : null;
  const shownError = checked ? (timeError ?? gramsError) : null;

  const trimmed = name.trim();
  const others = kittens.filter((k) => k.id !== kitten.id);
  const dirty =
    trimmed !== (kitten.name ?? '') || sex !== kitten.sex || collarId !== kitten.tempId || coat.trim() !== kitten.coat || time.trim() !== (kitten.birthTime ?? '') || grams.trim() !== (kitten.birthWeight ? String(kitten.birthWeight) : '');

  const save = () => {
    if (timeError || gramsError) {
      setChecked(true);
      haptic('medium');
      (timeError ? timeRef : gramsRef).current?.focus();
      return;
    }
    const patch: Parameters<typeof updateKitten>[1] = { name: trimmed || null, sex, coat: coat.trim(), birthTime: parsedTime };
    // Only touch the birth weight when it changed: updating it rewrites the birth-day weigh-in.
    if (parsedGrams !== kitten.birthWeight) patch.birthWeight = parsedGrams;
    updateKitten(kitten.id, patch);
    if (collarId !== kitten.tempId) setCollar(kitten.id, collarId);
    haptic('success');
    sheetRef.current?.close();
  };

  const requestClose = () => {
    if (!dirty) return true;
    confirmDiscard('Discard these changes?', () => sheetRef.current?.close());
    return false;
  };

  return (
    <Sheet ref={sheetRef} onRequestClose={requestClose}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar photo={kitten.photo} size={44} dot={kitten.name ? undefined : kitten.tempColor} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="section" style={{ fontSize: 22, lineHeight: 28 }}>
            Edit details
          </Text>
          <Text variant="small" color={colors.muted}>
            {kitten.tempId} Collar · all optional
          </Text>
        </View>
        <Pressable
          onPress={() => requestClose() && sheetRef.current?.close()}
          haptics="none"
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={16} strokeWidth={2.6} />
        </Pressable>
      </View>

      <Field label="Name" value={name} onChange={setName} placeholder={`${collarId} Collar`} returnKey="next" onSubmit={() => coatRef.current?.focus()} words />

      <View style={{ gap: 8 }}>
        <Text variant="label">Sex</Text>
        <Segmented options={SEXES} value={sex} onChange={setSex} />
      </View>

      <View style={{ gap: 8 }}>
        <Text variant="label">Collar</Text>
        <CollarPicker value={collarId} others={others} onPick={setCollarId} />
        <Text variant="small" color={colors.muted}>
          {swapNote(collarId, others, kitten.tempId) ?? (trimmed ? 'Their collar colour, handy until you can tell them apart.' : `Until they have a name, they’re ${collarId} Collar.`)}
        </Text>
      </View>

      <Field label="Coat" inputRef={coatRef} value={coat} onChange={setCoat} placeholder="Grey tabby" returnKey="next" onSubmit={() => timeRef.current?.focus()} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Field
          label="Born at"
          inputRef={timeRef}
          value={time}
          onChange={setTime}
          onBlur={() => timeError && setChecked(true)}
          placeholder="5:42"
          numeric
          invalid={checked && !!timeError}
          returnKey="next"
          onSubmit={() => gramsRef.current?.focus()}
        />
        <Field
          label="Birth weight (g)"
          inputRef={gramsRef}
          value={grams}
          onChange={setGrams}
          onBlur={() => gramsError && setChecked(true)}
          placeholder="102"
          numeric
          invalid={checked && !!gramsError}
          returnKey="done"
        />
      </View>
      {shownError && (
        <Text variant="caption" weight={600} color={colors.orange} accessibilityLiveRegion="polite" style={{ paddingHorizontal: 4, marginTop: -8 }}>
          {shownError}
        </Text>
      )}

      <Button label="Save changes" onPress={save} disabled={!dirty} style={{ height: 58 }} />
    </Sheet>
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
  numeric?: boolean;
  words?: boolean;
  invalid?: boolean;
  inputRef?: RefObject<TextInput | null>;
};

function Field({ label, value, onChange, onBlur, onSubmit, placeholder, returnKey, numeric, words, invalid, inputRef }: FieldProps) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, gap: 2, borderWidth: 1.5, borderColor: invalid ? colors.orange : 'transparent' }}>
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
        keyboardType={numeric ? 'numbers-and-punctuation' : 'default'}
        autoCapitalize={words ? 'words' : 'sentences'}
        autoCorrect={false}
        returnKeyType={returnKey}
        submitBehavior={returnKey === 'next' ? 'submit' : 'blurAndSubmit'}
        accessibilityLabel={label}
        aria-invalid={invalid}
        style={{ fontFamily: fonts[600], fontSize: 16, lineHeight: 21, color: colors.ink, padding: 0 }}
      />
    </View>
  );
}
