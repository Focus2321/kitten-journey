import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Avatar, AvatarStack, Button, Icon, IconButton, Screen, Text, type IconName } from '@/components/ui';
import { daysBetween, formatDayMonth, formatShort } from '@/data/dates';
import { photoSource } from '@/data/photos';
import { displayName, type Moment } from '@/data/store';
import { colors, gutter, radius } from '@/theme/tokens';

import { GrowthLine } from './GrowthLine';
import { CatMark, PawMark } from './HandoffIcons';
import { NotFound } from './NotFound';
import { ageAt, dayOffsets, useStory, type Include } from './story';

const STEP = 50;

/** Screen 19 — the read-only story page the new family opens from the link. */
export function SharedStoryScreen({ id, include }: { id?: string; include: Include }) {
  const story = useStory(id);
  if (!story) return <NotFound />;

  const { name, pro, owner, home, mother, siblings, birthDate, weights, latestWeight, firsts, moments, note, comfort, today } = story;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // Sections are numbered so the stagger stays even when some are hidden.
  let step = 0;
  const enter = () => FadeInDown.duration(380).delay(step++ * STEP);

  const authors = [owner.name, owner.child, mother?.name].filter(Boolean) as string[];
  const ageWeeks = birthDate ? Math.floor(daysBetween(birthDate, today) / 7) : null;
  const showGrowth = include.growth && weights.length > 0;
  const showFirsts = include.firsts && firsts.length > 0;
  const showMoments = include.firsts && moments.length > 0;
  const showFamily = include.family && (mother !== null || siblings.length > 0);

  return (
    <Screen padded={false} contentStyle={{ paddingBottom: 44 }}>
      {/* Wordmark bar */}
      <View style={{ paddingHorizontal: gutter, paddingTop: 8, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: colors.sun, alignItems: 'center', justifyContent: 'center' }}>
            <CatMark />
          </View>
          <Text variant="smallStrong">Kitten Journey</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text variant="caption" style={{ fontSize: 13 }}>
            Shared by {owner.name || `${name}’s family`}
          </Text>
          <IconButton icon="close" label="Close" size={36} onPress={close} />
        </View>
      </View>

      {/* Hero */}
      <Animated.View entering={enter()} style={{ paddingHorizontal: 12 }}>
        <View style={{ height: 430, borderRadius: 36, overflow: 'hidden', backgroundColor: colors.surface }}>
          {story.kitten.photo ? (
            <Image source={photoSource(story.kitten.photo)} contentFit="cover" contentPosition={{ top: '35%', left: '50%' }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="cat" size={64} color={colors.dashed} />
            </View>
          )}
          <View style={{ position: 'absolute', top: 14, left: 14, height: 32, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.ground, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.paw }} />
            <Text variant="small" weight={700} style={{ fontSize: 13, lineHeight: 16 }}>
              For {home?.names ?? `${name}’s new family`}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Intro */}
      <Animated.View entering={enter()} style={{ paddingHorizontal: gutter, paddingTop: 26, gap: 14 }}>
        <Text variant="headline" style={{ fontSize: 42, lineHeight: 42, letterSpacing: -0.035 * 42 }}>
          This is {name}.
        </Text>
        <Text variant="body" style={{ fontSize: 17, lineHeight: 25 }}>
          {note}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.pawSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="small" weight={800} style={{ fontSize: 13, lineHeight: 16 }}>
              {(authors[0] ?? name).slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text variant="small" weight={600} color={colors.muted}>
            {authors.length ? joinNames(authors) : `From ${name}’s first home`}
          </Text>
        </View>
      </Animated.View>

      {/* Stat tiles */}
      <Animated.View entering={enter()} style={{ paddingHorizontal: gutter, paddingTop: 26, flexDirection: 'row', gap: 8 }}>
        <Stat label="Born" value={birthDate ? formatDayMonth(birthDate) : 'Not sure'} />
        {home ? <Stat label="Arrives" value={story.weeksAtMove !== null ? `${story.weeksAtMove} weeks` : formatShort(home.movingDay)} /> : ageWeeks !== null && <Stat label="Age" value={`${ageWeeks} weeks`} />}
        {latestWeight && <Stat label="Weighs" value={`${latestWeight.grams} g`} />}
      </Animated.View>

      {/* Growth */}
      {showGrowth && (
        <Animated.View entering={enter()} style={{ paddingHorizontal: gutter, paddingTop: 32, gap: 12 }}>
          <Heading>How {pro.subj} grew</Heading>
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 }}>
            {weights.length >= 2 ? (
              <GrowthLine weights={weights} days={dayOffsets(weights, birthDate)} delay={step * STEP} />
            ) : (
              <Text variant="small" color={colors.muted}>
                {name} weighed {weights[0].grams} g at birth. More weigh-ins will follow.
              </Text>
            )}
          </View>
        </Animated.View>
      )}

      {/* Firsts rail */}
      {showFirsts && (
        <Animated.View entering={enter()} style={{ paddingTop: 32, gap: 12 }}>
          <View style={{ paddingHorizontal: gutter }}>
            <Heading>{pro.Poss} firsts</Heading>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: gutter, gap: 10 }}>
            {firsts.map((m, i) => (
              <FirstCard key={m.id} moment={m} index={i} birthDate={birthDate} />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Lately */}
      {showMoments && (
        <Animated.View entering={enter()} style={{ paddingHorizontal: gutter, paddingTop: 32, gap: 12 }}>
          <Heading>Lately</Heading>
          <View style={{ gap: 8 }}>
            {moments.slice(0, 3).map((m) => (
              <View key={m.id} style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {m.photo ? (
                  <Image source={photoSource(m.photo)} contentFit="cover" style={{ width: 48, height: 48, borderRadius: 14 }} />
                ) : (
                  <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="sparkle" size={20} />
                  </View>
                )}
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="caption" weight={600}>
                    {ageAt(birthDate, m.date)}
                  </Text>
                  <Text variant="small" weight={600}>
                    {m.text}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* First week */}
      <Animated.View entering={enter()} style={{ paddingHorizontal: gutter, paddingTop: 32, gap: 12 }}>
        <Heading>{pro.Poss} first week with you</Heading>
        <View style={{ borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.lg, paddingVertical: 4, paddingHorizontal: 16 }}>
          <Tip n={1} title="Start with one quiet room" body={`Litter, water and ${comfort} close by. Let ${pro.obj} come to you.`} divider />
          <Tip n={2} title={`Keep ${pro.poss} food the same`} body={`Ask what ${pro.subj} ${pro.subj === 'they' ? 'eat' : 'eats'} now and change slowly, if at all.`} divider />
          <Tip n={3} title="Ask your vet about vaccines" body="Kittens usually need a course of vaccines. Bring this page along." />
        </View>
      </Animated.View>

      {/* Family */}
      {showFamily && (
        <Animated.View entering={enter()} style={{ paddingHorizontal: gutter, paddingTop: 32, gap: 12 }}>
          <Heading>Where {pro.subj} comes from</Heading>
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            {mother ? <Avatar photo={mother.photo} size={64} shape="squircle" /> : <AvatarStack items={siblings.slice(0, 3).map((k) => k.photo)} size={40} overlap={12} />}
            <View style={{ flex: 1, gap: 6 }}>
              <Text variant="small" weight={700} style={{ fontSize: 15, lineHeight: 19 }}>
                {mother ? `Mum is ${mother.name}` : `${pro.Poss} siblings`}
              </Text>
              {siblings.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {mother && <AvatarStack items={siblings.map((k) => k.photo)} size={26} overlap={8} />}
                  <Text variant="small" weight={500} color={colors.muted} style={{ fontSize: 13, lineHeight: 17, flex: 1 }} numberOfLines={1}>
                    {joinNames(siblings.map(displayName))}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      )}

      {/* Keep writing */}
      <Animated.View entering={enter()} style={{ paddingHorizontal: gutter, paddingTop: 32, gap: 14 }}>
        <View style={{ backgroundColor: colors.ink, borderRadius: radius.xl, padding: 22, gap: 16 }}>
          <View style={{ gap: 6 }}>
            <Text variant="section" weight={800} color={colors.ground} style={{ fontSize: 22, lineHeight: 26, letterSpacing: -0.02 * 22 }}>
              Keep writing {name}’s story
            </Text>
            <Text variant="small" color={colors.mutedOnDark} style={{ lineHeight: 20 }}>
              Everything above comes with {pro.obj}. Add your own moments from day one.
            </Text>
          </View>
          <Button label="Continue in the app" onPress={close} style={{ height: 54 }} />
        </View>
        <Text variant="caption" weight={500} align="center" style={{ lineHeight: 16 }}>
          Care notes are illustrative. Your vet knows best.
        </Text>
      </Animated.View>
    </Screen>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <Text variant="section" style={{ letterSpacing: -0.015 * 20 }}>
      {children}
    </Text>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, gap: 4 }}>
      <Text variant="caption" weight={600} style={{ lineHeight: 14 }}>
        {label}
      </Text>
      <Text variant="bodyStrong" weight={700} style={{ lineHeight: 20 }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const FIRST_ICONS: [RegExp, IconName][] = [
  [/eye/i, 'eye'],
  [/litter/i, 'box'],
  [/sofa|climb/i, 'sofa'],
  [/name/i, 'heart'],
];

/** 150px firsts card. Cycles pink paw tile → photo → yellow icon tile so the rail reads like the design. */
function FirstCard({ moment, index, birthDate }: { moment: Moment; index: number; birthDate: string | null }) {
  const kind = moment.photo && index % 3 === 1 ? 'photo' : index % 3 === 2 ? 'sun' : 'paw';
  const icon = FIRST_ICONS.find(([re]) => re.test(moment.first ?? ''))?.[1];
  return (
    <View style={{ width: 150, gap: 8 }}>
      {kind === 'photo' && moment.photo ? (
        <Image source={photoSource(moment.photo)} contentFit="cover" style={{ height: 170, borderRadius: 22 }} />
      ) : (
        <View style={{ height: 170, borderRadius: 22, backgroundColor: kind === 'sun' ? colors.sunSoft : colors.pawSoft, alignItems: 'center', justifyContent: 'center' }}>
          {icon && kind === 'sun' ? <Icon name={icon} size={56} strokeWidth={1.6} /> : <PawMark />}
        </View>
      )}
      <Text variant="caption" weight={600} style={{ lineHeight: 14 }}>
        {ageAt(birthDate, moment.date)}
      </Text>
      <Text variant="small" weight={700} style={{ fontSize: 15, lineHeight: 19 }}>
        {moment.first}
      </Text>
    </View>
  );
}

function Tip({ n, title, body, divider }: { n: number; title: string; body: string; divider?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, borderBottomWidth: divider ? 1 : 0, borderBottomColor: colors.line }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.sunSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="small" weight={800} style={{ fontSize: 13, lineHeight: 16 }}>
          {n}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="small" weight={700} style={{ fontSize: 15, lineHeight: 20 }}>
          {title}
        </Text>
        <Text variant="small" color={colors.muted} style={{ lineHeight: 19 }}>
          {body}
        </Text>
      </View>
    </View>
  );
}

/** "Fig, Biscuit & Moth" */
function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}
