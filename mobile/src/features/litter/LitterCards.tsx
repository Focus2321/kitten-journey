import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { Avatar, Button, Icon, PhotoPill, Pressable, Text } from '@/components/ui';
import { formatRelative } from '@/data/dates';
import { photoSource, type Photo } from '@/data/photos';
import { displayName, type Kitten, type Moment } from '@/data/store';
import { colors, fonts, radius } from '@/theme/tokens';

// ---------------------------------------------------------------------------
// Hero — four photos in a rounded 2×2 block with the stage pill on top.
// ---------------------------------------------------------------------------

export function Hero({ photoKeys, pill, dot }: { photoKeys: (Photo | null)[]; pill: string; dot?: string }) {
  const four = [0, 1, 2, 3].map((i) => photoKeys[i] ?? null);
  const cell = (key: Photo | null, i: number) =>
    key ? (
      <Image key={i} source={photoSource(key)} contentFit="cover" style={{ flex: 1 }} />
    ) : (
      <View key={i} style={{ flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="paw" size={22} color={colors.dashed} />
      </View>
    );
  return (
    <View style={{ height: 212, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.ground, gap: 4 }}>
      <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>{four.slice(0, 2).map(cell)}</View>
      <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>{four.slice(2, 4).map((k, i) => cell(k, i + 2))}</View>
      <PhotoPill label={pill} dot={dot} style={{ position: 'absolute', left: 14, top: 14 }} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Weigh-in card — "Morning weigh-in · 2 / 4" with a tile per kitten.
// ---------------------------------------------------------------------------

export type WeighTile = {
  kitten: Kitten;
  /** Grams recorded for this period, or null when still to do. */
  grams: number | null;
  /** Change versus the previous weigh-in, when both exist. */
  delta: number | null;
};

type WeighCardProps = {
  title: string;
  subtitle: string;
  tiles: WeighTile[];
  /** Tapping the card (or a pending tile) opens the weigh-in sheet. */
  onWeigh: (kittenId?: string) => void;
};

export function WeighCard({ title, subtitle, tiles, onWeigh }: WeighCardProps) {
  const done = tiles.filter((t) => t.grams !== null).length;
  const allDone = done === tiles.length && tiles.length > 0;
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 14 }}>
      {/* The header and each kitten are separate controls so screen readers reach every Weigh action. */}
      <Pressable
        onPress={() => onWeigh()}
        pressScale={0.985}
        haptics="none"
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${done} of ${tiles.length} weighed. ${subtitle}`}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" weight={700}>
            {title}
          </Text>
          <Text variant="small" color={colors.muted}>
            {subtitle}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: allDone ? colors.ink : colors.sun, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 10 }}>
          {allDone && <Icon name="check" size={14} color={colors.sun} strokeWidth={2.6} />}
          <Text variant="small" weight={700} style={{ fontSize: 13 }} color={allDone ? colors.ground : colors.ink}>
            {done} / {tiles.length}
          </Text>
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {tiles.map((t) => (
          <KittenTile key={t.kitten.id} tile={t} onPress={() => (t.grams === null ? onWeigh(t.kitten.id) : router.push(`/kitten/${t.kitten.id}`))} />
        ))}
      </View>
    </View>
  );
}

function KittenTile({ tile, onPress }: { tile: WeighTile; onPress: () => void }) {
  const { kitten, grams, delta } = tile;
  const done = grams !== null;
  const named = !!kitten.name;
  return (
    <Pressable
      onPress={onPress}
      haptics="selection"
      accessibilityRole="button"
      accessibilityLabel={done ? `${displayName(kitten)}, ${grams} grams${delta !== null && delta > 0 ? `, up ${delta}` : ''}` : `Weigh ${displayName(kitten)}`}
      accessibilityHint={done ? 'Opens their profile' : undefined}
      style={{
        flex: 1,
        alignItems: 'center',
        gap: 6,
        borderRadius: 18,
        paddingVertical: done ? 10 : 8,
        paddingHorizontal: 4,
        backgroundColor: done ? colors.ground : 'transparent',
        borderWidth: done ? 0 : 2,
        borderStyle: 'dashed',
        borderColor: colors.dashed,
      }}>
      <View>
        <Avatar photo={kitten.photo} size={48} />
        {done && (
          <View style={{ position: 'absolute', right: -4, bottom: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={12} color={colors.sun} strokeWidth={2.8} />
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {!named && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: kitten.tempColor }} />}
        <Text variant="small" weight={700} style={{ fontSize: 13 }} numberOfLines={1}>
          {displayName(kitten)}
        </Text>
      </View>
      {done ? (
        <Text variant="caption" weight={600} color={delta !== null && delta > 0 ? colors.green : colors.muted}>
          {grams} g{delta !== null && delta > 0 ? ` · +${delta}` : ''}
        </Text>
      ) : (
        <Text variant="caption" weight={600} color={colors.ink}>
          Weigh
        </Text>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Name prompt — "Orange Collar still needs a name"
// ---------------------------------------------------------------------------

export function NamePrompt({ kitten, onName }: { kitten: Kitten; onName: (name: string) => void }) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const trimmed = value.trim();
  return (
    <View style={{ backgroundColor: colors.pawSoft, borderRadius: radius.lg, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar photo={kitten.photo} size={44} ring={kitten.tempColor} ringWidth={3} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" weight={700}>
            {kitten.tempId} Collar still needs a name
          </Text>
          <Text variant="small" color={colors.muted}>
            No rush. The collar works until one sticks.
          </Text>
        </View>
        {!open && (
          <Pressable onPress={() => setOpen(true)} haptics="selection" accessibilityRole="button" accessibilityLabel={`Name ${kitten.tempId} Collar`} style={{ backgroundColor: colors.ground, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14 }}>
            <Text variant="small" weight={700}>
              Name
            </Text>
          </Pressable>
        )}
      </View>
      {open && (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Biscuit?"
            accessibilityLabel={`Name for ${kitten.tempId} Collar`}
            placeholderTextColor={colors.muted}
            selectionColor={colors.sun}
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => trimmed && onName(trimmed)}
            style={{ flex: 1, height: 48, borderRadius: radius.pill, backgroundColor: colors.ground, paddingHorizontal: 16, fontFamily: fonts[600], fontSize: 16, color: colors.ink }}
          />
          <Button label="Save" size="md" variant="ink" full={false} disabled={!trimmed} onPress={() => trimmed && onName(trimmed)} haptics="success" />
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Moments rail — latest photos and notes, newest first.
// ---------------------------------------------------------------------------

export function MomentsRail({ moments, kittens, motherName, today }: { moments: Moment[]; kittens: Kitten[]; motherName: string; today: string }) {
  const who = (m: Moment) => {
    if (m.subjectId === 'litter') return 'The litter';
    if (m.subjectId === 'mother') return motherName;
    const k = kittens.find((x) => x.id === m.subjectId);
    return k ? displayName(k) : '';
  };
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
      {moments.map((m) => {
        const isKitten = kittens.some((k) => k.id === m.subjectId);
        return (
          <Pressable
            key={m.id}
            onPress={() => isKitten && router.push(`/kitten/${m.subjectId}`)}
            haptics={isKitten ? 'light' : 'none'}
            pressScale={0.98}
            accessibilityRole={isKitten ? 'button' : undefined}
            accessibilityLabel={`${m.first ? `First: ${m.first}. ` : ''}${m.text}. ${who(m)}, ${formatRelative(m.date, today)}`}
            style={{ width: 168, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 8, gap: 8 }}>
            {m.photo ? (
              <Image source={photoSource(m.photo)} contentFit="cover" style={{ width: '100%', height: 120, borderRadius: 18 }} />
            ) : (
              <View style={{ height: 120, borderRadius: 18, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={m.kind === 'feeding' ? 'bottle' : 'sparkle'} size={22} color={colors.muted} />
              </View>
            )}
            <View style={{ paddingHorizontal: 6, paddingBottom: 4, gap: 4 }}>
              {m.first && (
                <View style={{ alignSelf: 'flex-start', backgroundColor: colors.sun, borderRadius: radius.pill, paddingVertical: 2, paddingHorizontal: 8 }}>
                  <Text variant="caption" weight={700} color={colors.ink} style={{ fontSize: 11 }}>
                    First · {m.first}
                  </Text>
                </View>
              )}
              <Text variant="small" numberOfLines={2}>
                {m.text}
              </Text>
              <Text variant="caption">
                {who(m)} · {formatRelative(m.date, today)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
