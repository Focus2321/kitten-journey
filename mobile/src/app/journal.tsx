import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Icon, IconButton, Pressable, Screen, SectionHeader, Text } from '@/components/ui';
import { addDays, formatDayMonth, formatRelative, formatShort, toDate } from '@/data/dates';
import { photos } from '@/data/photos';
import { useStore, type Checkin } from '@/data/store';
import { appetiteLabel, duePeriod, PREGNANCY_WEEKS, weekCopy, weekFor } from '@/features/pregnancy/copy';
import { enter } from '@/features/pregnancy/motion';
import { colors, gutter, radius } from '@/theme/tokens';

const TILTS = [-3, 2, -2];

/** Next Sunday strictly after `iso`. */
function nextSunday(iso: string): string {
  const dow = toDate(iso).getDay();
  return addDays(iso, dow === 0 ? 7 : 7 - dow);
}

function Pill({ label }: { label: string }) {
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 11 }}>
      <Text variant="caption" weight={500} color={colors.ink} style={{ fontSize: 13 }}>
        {label}
      </Text>
    </View>
  );
}

function Moment({ label, dot, children, last, index }: { label: string; dot: 'today' | 'paw' | 'ink' | 'start'; children: ReactNode; last?: boolean; index: number }) {
  const dotStyle =
    dot === 'today'
      ? { backgroundColor: colors.sun, borderWidth: 2, borderColor: colors.ink }
      : dot === 'paw'
        ? { backgroundColor: colors.paw }
        : dot === 'ink'
          ? { backgroundColor: colors.ink }
          : { backgroundColor: colors.ground, borderWidth: 2, borderColor: colors.ink };
  return (
    <Animated.View entering={enter(index)} style={{ flexDirection: 'row', gap: 14 }}>
      <View style={{ width: 14, alignItems: 'center', paddingTop: 6, gap: 6 }}>
        <View style={[{ width: 12, height: 12, borderRadius: 6 }, dotStyle]} />
        {!last && <View style={{ width: 2, flex: 1, backgroundColor: colors.line, borderRadius: 1 }} />}
      </View>
      <View style={{ flex: 1, gap: 8, paddingBottom: last ? 0 : 18 }}>
        <Text variant="label">{label}</Text>
        {children}
      </View>
    </Animated.View>
  );
}

export default function Journal() {
  const insets = useSafeAreaInsets();
  const mother = useStore((s) => s.mother);
  const today = useStore((s) => s.today);
  const phase = useStore((s) => s.phase);
  const checkins = useStore((s) => s.checkins);

  const name = mother?.name ?? 'Mum';
  const expecting = phase === 'expecting';
  const mine = checkins.filter((c) => c.subjectId === 'mother');
  const newestFirst = [...mine].sort((a, b) => b.date.localeCompare(a.date));
  const oldestFirst = [...newestFirst].reverse();
  const withPhotos = oldestFirst.filter((c) => c.photo);
  const startISO = oldestFirst[0]?.date ?? today;

  const week = weekFor(mother, today);
  const copy = weekCopy(week);
  const shownWeek = week === null ? null : Math.min(week, PREGNANCY_WEEKS);

  const subtitle = mother?.dueDate
    ? `Started ${formatDayMonth(startISO)} · kittens around ${duePeriod(mother.dueDate)}`
    : `Started ${formatDayMonth(startISO)} · we'll learn her timing as she goes`;

  const openCheckin = () => router.push('/sheet/mother-checkin');

  const checkinLabel = (c: Checkin) => `${formatRelative(c.date, today).toUpperCase()} · CHECK-IN`;
  const checkinText = (c: Checkin) => c.note ?? [appetiteLabel(c.appetite) && `Eating: ${appetiteLabel(c.appetite)?.toLowerCase()}`, c.mood.length ? c.mood.join(', ') : null].filter(Boolean).join(' · ');

  return (
    <View style={{ flex: 1 }}>
      <Screen bottomInset={80} contentStyle={{ paddingTop: 8 }}>
        {/* Top */}
        <Animated.View entering={enter(0)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <IconButton icon="back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.pawSoft, borderRadius: radius.pill, paddingVertical: 4, paddingLeft: 4, paddingRight: 14 }}>
            <Avatar photo={mother?.photo} size={36} />
            <Text variant="small" weight={600}>
              {name} · {expecting ? 'mum‑to‑be' : 'mum'}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={enter(1)} style={{ paddingTop: 18, gap: 8 }}>
          <Text variant="headline" style={{ fontSize: 40, lineHeight: 42 }}>
            {expecting ? 'Her pregnancy, week by week' : `${name}'s pregnancy, looking back`}
          </Text>
          <Text variant="body" color={colors.muted}>
            {subtitle}
          </Text>
        </Animated.View>

        {/* Week card */}
        <Animated.View entering={enter(2)} style={{ paddingTop: 24 }}>
          <View style={{ backgroundColor: colors.pawSoft, borderRadius: radius.xl, padding: 20, gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text variant="display" style={{ lineHeight: 48 }}>
                {expecting ? (shownWeek === null ? 'Expecting' : `Week ${shownWeek}`) : 'Kittens here'}
              </Text>
              {expecting && shownWeek !== null && (
                <Text variant="small" weight={600}>
                  of about {PREGNANCY_WEEKS}
                </Text>
              )}
            </View>
            {expecting && shownWeek !== null && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {Array.from({ length: PREGNANCY_WEEKS }, (_, i) => {
                  const w = i + 1;
                  if (w === shownWeek) return <View key={w} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.ground, borderWidth: 4, borderColor: colors.ink }} />;
                  return <View key={w} style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: w < shownWeek ? colors.ink : colors.paw }} />;
                })}
              </View>
            )}
            <Text variant="body">{expecting ? copy.journal : `${name} carried her litter for about ${PREGNANCY_WEEKS} weeks. Every check-in from that time lives here.`}</Text>
          </View>
        </Animated.View>

        {/* Belly photos */}
        <View style={{ paddingTop: 30 }}>
          <SectionHeader title="Belly photos" meta={withPhotos.length ? 'Every Sunday' : 'None yet'} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -gutter }}
            contentContainerStyle={{ paddingHorizontal: gutter + 2, paddingTop: 6, paddingBottom: 10, gap: 12, alignItems: 'flex-start' }}>
            {withPhotos.map((c, i) => {
              const latest = i === withPhotos.length - 1;
              return (
                <Animated.View
                  key={c.id}
                  entering={enter(3 + i)}
                  style={{
                    backgroundColor: colors.ground,
                    borderWidth: 1,
                    borderColor: colors.line,
                    borderRadius: radius.md,
                    padding: 6,
                    paddingBottom: 10,
                    gap: 8,
                    transform: [{ rotate: `${TILTS[i % TILTS.length]}deg` }],
                  }}>
                  <Image source={photos[c.photo!]} contentFit="cover" style={{ width: 104, height: 120, borderRadius: 15 }} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
                    <Text variant="caption" weight={600} color={colors.ink} style={{ fontSize: 13 }}>
                      {formatShort(c.date)}
                    </Text>
                    {latest && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.paw }} />}
                  </View>
                </Animated.View>
              );
            })}
            {expecting && (
              <Animated.View entering={enter(3 + withPhotos.length)}>
                <Pressable
                  onPress={openCheckin}
                  accessibilityRole="button"
                  accessibilityLabel="Add the next belly photo"
                  style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: colors.dashed, borderRadius: radius.md, padding: 6, paddingBottom: 10, gap: 8 }}>
                  <View style={{ width: 104, height: 120, borderRadius: 15, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="camera" size={24} color={colors.muted} />
                  </View>
                  <Text variant="caption" weight={600} style={{ fontSize: 13, paddingLeft: 4 }}>
                    {formatShort(withPhotos.length ? nextSunday(withPhotos[withPhotos.length - 1].date) : today)}
                  </Text>
                </Pressable>
              </Animated.View>
            )}
          </ScrollView>
        </View>

        {/* Moments */}
        <View style={{ paddingTop: 24 }}>
          <SectionHeader title="Moments" meta={`${mine.length} ${mine.length === 1 ? 'check-in' : 'check-ins'}`} />
          <View>
            {newestFirst.map((c, i) => (
              <Moment key={c.id} index={i} label={checkinLabel(c)} dot={c.date === today ? 'today' : c.photo ? 'paw' : 'ink'}>
                {checkinText(c) ? (
                  <Text variant="lead" style={{ fontSize: 17, lineHeight: 23 }}>
                    {checkinText(c)}
                  </Text>
                ) : null}
                {(c.appetite || c.mood.length > 0) && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {appetiteLabel(c.appetite) && <Pill label={appetiteLabel(c.appetite)!} />}
                    {c.mood.map((m) => (
                      <Pill key={m} label={m} />
                    ))}
                  </View>
                )}
                {c.photo && <Image source={photos[c.photo]} contentFit="cover" style={{ width: 120, height: 120, borderRadius: radius.sm }} />}
              </Moment>
            ))}
            <Moment index={newestFirst.length} label={`${formatShort(startISO).toUpperCase()} · THE BEGINNING`} dot="start" last>
              <Text variant="lead" style={{ fontSize: 17, lineHeight: 23 }}>
                Started {name}’s journey
              </Text>
              {mine.length === 0 && (
                <Text variant="small" color={colors.muted}>
                  Her first check-in will show up here. Tap the button below to add one.
                </Text>
              )}
            </Moment>
          </View>
        </View>
      </Screen>

      {/* Floating "Add to her story" */}
      <Animated.View entering={enter(6)} style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 16) + 16, alignItems: 'center' }}>
        <Pressable
          onPress={openCheckin}
          haptics="medium"
          accessibilityRole="button"
          accessibilityLabel="Add to her story"
          style={{
            height: 60,
            borderRadius: radius.pill,
            backgroundColor: colors.ink,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 8,
            paddingRight: 24,
            shadowColor: colors.ink,
            shadowOpacity: 0.22,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.sun, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={20} strokeWidth={3} />
          </View>
          <Text variant="bodyStrong" color={colors.ground} style={{ lineHeight: 20 }}>
            Add to her story
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
