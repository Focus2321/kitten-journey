import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActionSheetIOS, Alert, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, GuidanceCard, Icon, IconButton, Pressable, Screen, SectionHeader, Text, type IconName } from '@/components/ui';
import { ageLabel, ageSentence, daysBetween, formatRelative } from '@/data/dates';
import { photoSource } from '@/data/photos';
import { displayName, firstsFor, latestWeight, momentsFor, pronoun, useStore, weightsFor, type Kitten, type Moment } from '@/data/store';
import { pickPhoto } from '@/features/photos/pickPhoto';
import { colors, gutter, radius } from '@/theme/tokens';

import { guidanceFor, UPCOMING_FIRSTS, weightLine } from './guidance';
import { HeroPhoto } from './HeroPhoto';
import { SiblingSwitcher } from './SiblingSwitcher';
import { WeightChart } from './WeightChart';

const FOOTER_SPACE = 120;

/** Screen 15 — a kitten's own page. Switching siblings swaps the data in place, so the scroll position stays. */
export function KittenProfile({ id }: { id: string }) {
  const insets = useSafeAreaInsets();
  const kittens = useStore((s) => s.kittens);
  const weights = useStore((s) => s.weights);
  const moments = useStore((s) => s.moments);
  const homes = useStore((s) => s.homes);
  const updateKitten = useStore((s) => s.updateKitten);
  const today = useStore((s) => s.today);
  const birthDate = useStore((s) => s.birth?.date ?? null);

  const [showAll, setShowAll] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const kitten = kittens.find((k) => k.id === id);
  if (!kitten) {
    return (
      <Screen>
        <View style={{ paddingTop: 8, gap: 16 }}>
          <IconButton icon="back" label="Back" onPress={() => router.back()} />
          <Text variant="headline">We couldn’t find that kitten.</Text>
          <Text variant="body" color={colors.muted}>
            They may not have been born yet.
          </Text>
        </View>
      </Screen>
    );
  }

  const index = kittens.indexOf(kitten);
  const name = displayName(kitten);
  const his = pronoun(kitten);
  const kWeights = weightsFor(weights, kitten.id);
  const latest = latestWeight(weights, kitten.id);
  const birthWeight = kitten.birthWeight ?? kWeights[0]?.grams ?? null;
  const firsts = firstsFor(moments, kitten.id);
  const kMoments = momentsFor(moments, kitten.id);
  const home = homes.find((h) => h.kittenId === kitten.id);
  const ageDays = birthDate ? daysBetween(birthDate, today) : 0;
  const photoCount = kMoments.filter((m) => m.photo).length + (kitten.photo ? 1 : 0);
  const guidance = guidanceFor(kitten, ageDays);

  const age = birthDate ? ageSentence(birthDate, today) : null;
  const [ageNumber, ...ageRest] = (age ?? '').split(' ');

  const changePhoto = async () => {
    const picked = await pickPhoto({ title: `Photo of ${name}`, canRemove: kitten.photo !== null });
    if (picked === 'remove') updateKitten(kitten.id, { photo: null });
    else if (picked) updateKitten(kitten.id, { photo: picked });
  };

  const openMore = () => {
    const actions = [
      { label: 'Edit details', run: () => router.push(`/sheet/edit-kitten/${kitten.id}`) },
      { label: kitten.photo ? 'Change photo' : 'Add a photo', run: changePhoto },
      { label: `Share ${name}’s story`, run: () => router.push(`/share/${kitten.id}`) },
    ];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({ title: name, options: [...actions.map((a) => a.label), 'Cancel'], cancelButtonIndex: actions.length }, (i) => actions[i]?.run());
      return;
    }
    Alert.alert(name, undefined, [...actions.map((a) => ({ text: a.label, onPress: a.run })), { text: 'Cancel', style: 'cancel' }]);
  };

  const switchTo = (next: string) => {
    if (next === kitten.id) return;
    setDirection(kittens.findIndex((k) => k.id === next) >= index ? 1 : -1);
    router.setParams({ id: next });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <Screen
        bottomInset={FOOTER_SPACE}
        padded={false}
        header={
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: gutter, paddingTop: 8, height: 60 }}>
            <IconButton icon="back" label="Back" onPress={() => router.back()} />
            <SiblingSwitcher kittens={kittens} activeId={kitten.id} onChange={switchTo} />
            <IconButton icon="more" label={`More for ${name}`} onPress={openMore} />
          </View>
        }>
        {/* Hero */}
        <View style={{ paddingHorizontal: gutter, paddingTop: 12, gap: 18 }}>
          <HeroPhoto photo={kitten.photo} direction={direction}>
            {age && (
              <View
                style={{
                  position: 'absolute',
                  left: 14,
                  bottom: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: colors.ground,
                  borderRadius: radius.pill,
                  paddingVertical: 6,
                  paddingLeft: 6,
                  paddingRight: 14,
                }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.sun, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="smallStrong" weight={800}>
                    {ageNumber}
                  </Text>
                </View>
                <Text variant="smallStrong">{ageRest.join(' ')}</Text>
              </View>
            )}
            {photoCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  right: 14,
                  bottom: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(21,19,15,0.72)',
                  borderRadius: radius.pill,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}>
                <Icon name="image" size={14} color={colors.ground} strokeWidth={2.2} />
                <Text variant="smallStrong" color={colors.ground}>
                  {photoCount}
                </Text>
              </View>
            )}
          </HeroPhoto>

          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text variant="display">{name}</Text>
              {!kitten.name && <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: kitten.tempColor, marginTop: 6 }} />}
            </View>
            <Text variant="body" color={colors.muted}>
              {tagline(kitten)}
            </Text>
          </View>
        </View>

        {/* Growing */}
        <View style={{ paddingHorizontal: gutter, paddingTop: 24 }}>
          <Card style={{ borderRadius: radius.xl, padding: 20, gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ gap: 4 }}>
                <Text variant="label">Growing</Text>
                {latest ? (
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text variant="headline" style={{ fontSize: 40, lineHeight: 42 }}>
                      {latest.grams}
                    </Text>
                    <Text variant="lead" weight={700}>
                      g
                    </Text>
                  </View>
                ) : (
                  <Text variant="headline" style={{ fontSize: 40, lineHeight: 42 }} color={colors.dashed}>
                    — g
                  </Text>
                )}
              </View>
              {latest && birthWeight && latest.grams > birthWeight && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.ground, borderRadius: radius.pill, paddingVertical: 6, paddingLeft: 8, paddingRight: 12 }}>
                  <Icon name="arrow-up" size={14} color={colors.green} strokeWidth={2.2} />
                  <Text variant="caption" weight={600} color={colors.ink}>
                    {gainLabel(latest.grams, birthWeight, his)}
                  </Text>
                </View>
              )}
            </View>
            {kWeights.length > 0 && birthDate ? (
              <WeightChart weights={kWeights} birthDate={birthDate} today={today} />
            ) : (
              <View style={{ height: 94, borderRadius: radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.dashed, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="scale" size={22} color={colors.muted} />
              </View>
            )}
            <Text variant="small" style={{ fontSize: 15, lineHeight: 20 }}>
              {weightLine(kWeights.length, ageDays)}
            </Text>
          </Card>
        </View>

        {/* Firsts */}
        <View style={{ paddingTop: 30, gap: 14 }}>
          <View style={{ paddingHorizontal: gutter }}>
            <SectionHeader title={`${cap(his)} firsts`} meta={firsts.length ? `${firsts.length} so far` : 'None yet'} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: gutter, gap: 10 }} style={{ marginTop: -12 }}>
            {firsts.map((f, i) => (
              <FirstCard key={f.id} first={f} birthDate={birthDate} index={i} />
            ))}
            {upcoming(firsts, ageDays).map((u) => (
              <View
                key={u.label}
                style={{ width: 128, height: 150, borderRadius: radius.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.dashed, padding: 12, justifyContent: 'space-between' }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="calendar" size={18} color={colors.muted} />
                </View>
                <View style={{ gap: 2 }}>
                  <Text variant="bodyStrong" weight={700} style={{ lineHeight: 20 }}>
                    {u.label}
                  </Text>
                  <Text variant="small" color={colors.muted} style={{ fontSize: 13, lineHeight: 16 }}>
                    {u.hint}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          {firsts.length === 0 && (
            <Text variant="small" color={colors.muted} style={{ paddingHorizontal: gutter }}>
              Nothing yet, and that’s normal. The first few come slowly, then all at once.
            </Text>
          )}
        </View>

        {/* Guidance */}
        <View style={{ paddingHorizontal: gutter, paddingTop: 24 }}>
          <GuidanceCard eyebrow={guidance.eyebrow} text={guidance.text} />
        </View>

        {/* Moments */}
        <View style={{ paddingHorizontal: gutter, paddingTop: 30, gap: 2 }}>
          <SectionHeader
            title="Moments"
            meta={kMoments.length > 2 ? (showAll ? 'Show fewer' : `See all ${kMoments.length}`) : undefined}
            onMetaPress={() => setShowAll((v) => !v)}
          />
          <View style={{ gap: 12 }}>
            {(showAll ? kMoments : kMoments.slice(0, 2)).map((m) => (
              <MomentRow key={m.id} moment={m} today={today} />
            ))}
            {kMoments.length === 0 && (
              <Card style={{ borderRadius: radius.lg, padding: 16, gap: 4 }}>
                <Text variant="bodyStrong" weight={700}>
                  Nothing written down yet
                </Text>
                <Text variant="small" color={colors.muted}>
                  Small things count. A first purr or a favourite sleeping spot is a moment.
                </Text>
              </Card>
            )}
          </View>
        </View>

        {/* Share */}
        <View style={{ paddingHorizontal: gutter, paddingTop: 24 }}>
          <Pressable onPress={() => router.push(`/share/${kitten.id}`)} pressScale={0.98} accessibilityRole="button" accessibilityLabel={`Share ${name}'s story`}>
            <Card tone="ground" style={{ borderRadius: radius.xl, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 60, height: 60 }}>
                <View style={{ position: 'absolute', left: 6, top: 4, width: 48, height: 56, borderRadius: 12, backgroundColor: colors.pawSoft, transform: [{ rotate: '-8deg' }] }} />
                {kitten.photo ? (
                  <Image source={photoSource(kitten.photo)} contentFit="cover" style={{ position: 'absolute', left: 6, top: 2, width: 48, height: 56, borderRadius: 12, borderWidth: 3, borderColor: colors.ground, transform: [{ rotate: '5deg' }] }} />
                ) : (
                  <View style={{ position: 'absolute', left: 6, top: 2, width: 48, height: 56, borderRadius: 12, borderWidth: 3, borderColor: colors.ground, backgroundColor: colors.surface, transform: [{ rotate: '5deg' }] }} />
                )}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyStrong" weight={700} style={{ lineHeight: 20 }}>
                  {home ? `${home.names} will love this` : `Found ${name}’s person?`}
                </Text>
                <Text variant="small" color={colors.muted} style={{ lineHeight: 19 }}>
                  {home ? `Send ${his} story, photos and care notes before moving day.` : `Send ${his} story, photos and care notes in one link.`}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} strokeWidth={2.6} />
            </Card>
          </Pressable>
        </View>
      </Screen>

      {/* Floating actions */}
      <View style={{ position: 'absolute', left: gutter, right: gutter, bottom: Math.max(insets.bottom, 16) + 16, flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={() => router.push(`/sheet/kitten-day/${kitten.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`Add to ${name}'s day`}
          style={{
            flex: 1,
            height: 60,
            borderRadius: radius.pill,
            backgroundColor: colors.ink,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 8,
            shadowColor: colors.ink,
            shadowOpacity: 0.18,
            shadowRadius: 30,
            shadowOffset: { width: 0, height: 10 },
            elevation: 8,
          }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.sun, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={18} strokeWidth={3} />
          </View>
          <Text variant="bodyStrong" color={colors.ground}>
            {name}’s day
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/share/${kitten.id}`)}
          accessibilityRole="button"
          accessibilityLabel="Share"
          style={{
            height: 60,
            paddingHorizontal: 20,
            borderRadius: radius.pill,
            backgroundColor: colors.ground,
            borderWidth: 1.5,
            borderColor: colors.line,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            shadowColor: colors.ink,
            shadowOpacity: 0.1,
            shadowRadius: 30,
            shadowOffset: { width: 0, height: 10 },
            elevation: 6,
          }}>
          <Icon name="share" size={18} strokeWidth={2.4} />
          <Text variant="bodyStrong">Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------

const FIRST_TONES = [colors.sunSoft, colors.pawSoft, colors.surface] as const;

function iconForFirst(label: string): IconName {
  if (/eye/i.test(label)) return 'eye';
  if (/step|walk|pounce|climb|sofa/i.test(label)) return 'paw';
  if (/litter|box/i.test(label)) return 'check';
  if (/name/i.test(label)) return 'heart';
  if (/vet/i.test(label)) return 'calendar';
  return 'sparkle';
}

function FirstCard({ first, birthDate, index }: { first: Moment; birthDate: string | null; index: number }) {
  const bg = FIRST_TONES[index % FIRST_TONES.length];
  const icon = iconForFirst(first.first ?? '');
  const iconColor = bg === colors.pawSoft ? colors.paw : colors.sun;
  return (
    <View style={{ width: 128, height: 150, borderRadius: radius.lg, backgroundColor: bg, padding: 14, justifyContent: 'space-between' }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={iconColor} strokeWidth={2.2} />
      </View>
      <View style={{ gap: 2 }}>
        <Text variant="bodyStrong" weight={700} style={{ lineHeight: 20 }} numberOfLines={2}>
          {first.first}
        </Text>
        <Text variant="small" color={colors.muted} style={{ fontSize: 13, lineHeight: 16 }}>
          {birthDate ? ageLabel(birthDate, first.date) : ''}
        </Text>
      </View>
    </View>
  );
}

function MomentRow({ moment, today }: { moment: Moment; today: string }) {
  const label = `${formatRelative(moment.date, today)}${moment.first ? ' · first' : ''}`;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: 10, paddingLeft: 10, paddingRight: 16 }}>
      {moment.photo && !moment.first ? (
        <Image source={photoSource(moment.photo)} contentFit="cover" style={{ width: 72, height: 72, borderRadius: 18 }} />
      ) : (
        <View style={{ width: 72, height: 72, borderRadius: 18, backgroundColor: moment.first ? colors.pawSoft : colors.ground, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sparkle" size={28} />
        </View>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="label">{label}</Text>
        <Text variant="bodyStrong" style={{ lineHeight: 21 }}>
          {moment.text}
        </Text>
      </View>
    </View>
  );
}

/** "Grey tabby boy · firstborn · fearless", or a collar hint until named. */
function tagline(k: Kitten) {
  const sexWord = k.sex === 'boy' ? 'boy' : k.sex === 'girl' ? 'girl' : null;
  const parts = [[k.coat, sexWord].filter(Boolean).join(' '), k.name ? k.tagline : `${k.tempId} collar · no name yet`].filter(Boolean);
  return parts.join(' · ');
}

function gainLabel(now: number, birth: number, his: string) {
  const ratio = now / birth;
  if (ratio >= 2) return `${Math.round(ratio)}× ${his} birth weight`;
  return `+${now - birth} g since birth`;
}

/** Up to two dashed "coming up" cards, skipping anything already logged. */
function upcoming(firsts: Moment[], ageDays: number) {
  const logged = firsts.map((f) => f.first ?? '');
  return UPCOMING_FIRSTS.filter((u) => !logged.some((l) => u.match.test(l)))
    .filter((u) => u.day >= ageDays - 7)
    .slice(0, firsts.length ? 1 : 2);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
