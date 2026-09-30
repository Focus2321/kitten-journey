import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';

import { TAB_BAR_SPACE } from '@/components/TabBar';
import { Avatar, Card, Icon, PhotoPill, Pressable, Screen, Text } from '@/components/ui';
import { ageLabel, ageSentence, formatShort, pregnancyWeek } from '@/data/dates';
import { photoSource } from '@/data/photos';
import { displayName, latestWeight, useStore, type Kitten } from '@/data/store';
import { colors, radius } from '@/theme/tokens';

/**
 * Family tab. No dedicated artboard — it borrows the home's header, the profile's photo hero
 * and the story's kitten grid so it feels like the same app.
 */
export function FamilyTab() {
  const phase = useStore((s) => s.phase);
  const mother = useStore((s) => s.mother);
  const kittens = useStore((s) => s.kittens);
  const weights = useStore((s) => s.weights);
  const homes = useStore((s) => s.homes);
  const today = useStore((s) => s.today);
  const birthDate = useStore((s) => s.birth?.date ?? null);

  const eyebrow = birthDate && kittens.length ? `${kittens.length} kitten${kittens.length === 1 ? '' : 's'} · ${ageLabel(birthDate, today)}` : mother?.matingDate ? `Expecting · week ${pregnancyWeek(mother.matingDate, today)}` : 'Expecting';

  const motherSub = (() => {
    if (!mother) return '';
    if (phase === 'expecting' || phase === 'new') return mother.firstLitter ? 'Mum-to-be · her first litter' : 'Mum-to-be';
    return kittens.length ? `Mum of ${kittens.length} · doing the heavy lifting` : 'Mum';
  })();

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <View style={{ paddingTop: 8, gap: 2 }}>
        <Text variant="label">{eyebrow}</Text>
        <Text variant="headline">Family</Text>
      </View>

      {mother && (
        <Pressable onPress={() => router.push('/journal')} pressScale={0.98} accessibilityRole="button" accessibilityLabel={`${mother.name}'s journal`} style={{ marginTop: 20 }}>
          <Card style={{ borderRadius: radius.xl, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar photo={mother.photo} size={64} shape="squircle" ring={colors.paw} ringWidth={3} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="section">{mother.name}</Text>
              <Text variant="small" color={colors.muted}>
                {motherSub}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} strokeWidth={2.6} />
          </Card>
        </Pressable>
      )}

      {kittens.length === 0 ? (
        <View style={{ marginTop: 24, borderRadius: radius.xl, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.dashed, padding: 24, alignItems: 'center', gap: 10 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.sunSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="paw" size={26} color={colors.sun} />
          </View>
          <Text variant="section" align="center">
            Kittens will appear here
          </Text>
          <Text variant="small" color={colors.muted} align="center">
            {mother?.dueDate ? `Due around ${formatShort(mother.dueDate)}. Each one gets a page of their own.` : 'Once they arrive, each one gets a page of their own.'}
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 28, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text variant="section">The kittens</Text>
            {birthDate && (
              <Text variant="small" color={colors.muted}>
                {ageSentence(birthDate, today)}
              </Text>
            )}
          </View>
          {kittens.map((k) => (
            <KittenCard key={k.id} kitten={k} weight={latestWeight(weights, k.id)?.grams ?? null} home={homes.find((h) => h.kittenId === k.id) ?? null} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function KittenCard({ kitten, weight, home }: { kitten: Kitten; weight: number | null; home: { names: string; movingDay: string } | null }) {
  const name = displayName(kitten);
  const sexWord = kitten.sex === 'boy' ? 'boy' : kitten.sex === 'girl' ? 'girl' : null;
  const sub = [[kitten.coat, sexWord].filter(Boolean).join(' '), weight ? `${weight} g` : null].filter(Boolean).join(' · ');
  return (
    <Pressable onPress={() => router.push(`/kitten/${kitten.id}`)} pressScale={0.98} accessibilityRole="button" accessibilityLabel={name}>
      <View style={{ borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surface }}>
        <View style={{ height: 200, backgroundColor: colors.line }}>
          {kitten.photo ? (
            <Image source={photoSource(kitten.photo)} contentFit="cover" contentPosition={{ top: '35%', left: '50%' }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="camera" size={28} color={colors.muted} />
            </View>
          )}
          {!kitten.name && <PhotoPill label={`${kitten.tempId} collar · no name yet`} dot={kitten.tempColor} style={{ position: 'absolute', left: 12, top: 12 }} />}
          {home && <PhotoPill label={`Moving to ${home.names} · ${formatShort(home.movingDay)}`} dot={colors.paw} style={{ position: 'absolute', left: 12, bottom: 12 }} />}
        </View>
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="section">{name}</Text>
              {!kitten.name && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: kitten.tempColor }} />}
            </View>
            <Text variant="small" color={colors.muted}>
              {sub || kitten.tagline || ''}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} strokeWidth={2.6} />
        </View>
      </View>
    </Pressable>
  );
}
