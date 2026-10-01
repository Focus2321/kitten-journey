import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { TAB_BAR_SPACE } from '@/components/TabBar';
import { Avatar, Card, GuidanceCard, Icon, IconButton, PhotoPill, Pressable, Screen, SectionHeader, StageProgress, TaskRow, Text } from '@/components/ui';
import { formatDayMonth, formatLong } from '@/data/dates';
import { photoSource, type Photo } from '@/data/photos';
import { useStore, type Appetite, type Task } from '@/data/store';
import { pickPhoto } from '@/features/photos/pickPhoto';
import { colors, radius } from '@/theme/tokens';

import { APPETITE_OPTIONS, arrivalSentence, expectingPill, PREGNANCY_WEEKS, weekCopy, weekFor } from './copy';
import { enter } from './motion';

const plural = (n: number, one: string) => `${n} ${n === 1 ? one : `${one}s`}`;

const openCheckin = (appetite?: Appetite) =>
  router.push(appetite ? { pathname: '/sheet/mother-checkin', params: { appetite } } : '/sheet/mother-checkin');

/** "How's her appetite today?" — three white pills that jump straight into the check-in sheet. */
function AppetiteCard({ name, logged }: { name: string; logged: Appetite | null }) {
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 12 }}>
      <Text variant="bodyStrong" weight={700} style={{ lineHeight: 20 }}>
        {logged ? `${name} today` : "How's her appetite today?"}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {APPETITE_OPTIONS.map((o) => {
          const on = logged === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => openCheckin(o.value)}
              haptics="selection"
              accessibilityRole="button"
              accessibilityLabel={`${o.label} — check in`}
              style={{ flex: 1, height: 44, borderRadius: radius.pill, backgroundColor: on ? colors.ink : colors.ground, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="small" weight={600} color={on ? colors.ground : colors.ink} style={{ fontSize: 15 }}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Day-one empty state: "Her story · Nothing yet". */
function EmptyStory() {
  return (
    <Pressable
      onPress={() => openCheckin()}
      pressScale={0.98}
      accessibilityRole="button"
      accessibilityLabel="Add her first moment"
      style={{ borderRadius: radius.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.dashed, padding: 18, alignItems: 'center', gap: 10 }}>
      <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="plus" size={22} />
      </View>
      <Text variant="bodyStrong" weight={700} align="center">
        Her first moment goes here
      </Text>
      <Text variant="small" color={colors.muted} align="center" style={{ maxWidth: 260 }}>
        A photo, a note, a funny habit. Tap + whenever something happens.
      </Text>
    </Pressable>
  );
}

export function HomeExpecting() {
  const mother = useStore((s) => s.mother);
  const today = useStore((s) => s.today);
  const checkins = useStore((s) => s.checkins);
  const tasks = useStore((s) => s.tasks);
  const toggleTask = useStore((s) => s.toggleTask);
  const completeTask = useStore((s) => s.completeTask);
  const addCheckin = useStore((s) => s.addCheckin);

  const name = mother?.name ?? 'Mum';
  const motherCheckins = checkins.filter((c) => c.subjectId === 'mother').sort((a, b) => b.date.localeCompare(a.date));
  const firstDay = motherCheckins.length === 0;
  const todays = motherCheckins.find((c) => c.date === today) ?? null;
  const latestPhoto: Photo | null = motherCheckins.find((c) => c.photo)?.photo ?? null;
  const heroPhoto: Photo | null = latestPhoto ?? mother?.photo ?? null;

  const week = weekFor(mother, today);
  const copy = weekCopy(week);
  const progress = week === null ? 0.1 : Math.min(1, week / PREGNANCY_WEEKS);
  const doneCount = tasks.filter((t) => t.done).length;
  const bellyPhotoToday = motherCheckins.find((c) => c.date === today && c.photo)?.photo ?? null;

  /** The task is only done once a real photo is in her journal. */
  const addBellyPhoto = async (t: Task) => {
    const photo = await pickPhoto({ title: 'Belly photo' });
    if (!photo || photo === 'remove') return;
    addCheckin({ subjectId: 'mother', appetite: null, mood: [], note: null, photo });
    completeTask(t.id);
  };

  const renderTask = (t: Task, i: number) => {
    if (t.action === 'mother-checkin') {
      return (
        <Animated.View key={t.id} entering={enter(i)}>
          {t.done && todays ? (
            <TaskRow title={`Checked in on ${name}`} subtitle={t.subtitle} photo={todays.photo ?? mother?.photo ?? t.photo} done onPress={() => openCheckin()} onToggle={() => toggleTask(t.id)} />
          ) : (
            <AppetiteCard name={name} logged={todays?.appetite ?? null} />
          )}
        </Animated.View>
      );
    }
    if (t.action === 'photo') {
      const title = firstDay ? 'Take her first belly photo' : week ? `Week ${week} belly photo` : t.title;
      const subtitle = t.done && bellyPhotoToday ? 'Added today' : firstDay ? 'Future you will love this one' : t.subtitle;
      return (
        <Animated.View key={t.id} entering={enter(i)}>
          <TaskRow
            title={title}
            subtitle={subtitle}
            photo={t.done ? bellyPhotoToday : null}
            icon="camera"
            done={t.done}
            onPress={() => (t.done ? router.push('/journal') : addBellyPhoto(t))}
            onToggle={() => toggleTask(t.id)}
          />
        </Animated.View>
      );
    }
    return (
      <Animated.View key={t.id} entering={enter(i)}>
        <TaskRow title={t.title} subtitle={t.subtitle} photo={t.photo} icon={t.icon ?? 'sparkle'} done={t.done} onToggle={() => toggleTask(t.id)} />
      </Animated.View>
    );
  };

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      {/* Header */}
      <View style={{ paddingTop: 4, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text variant="label" style={{ fontSize: 13, lineHeight: 16 }}>
            {formatLong(today).split(' ')[0]}, {formatDayMonth(today)}
          </Text>
          <Text variant="title" style={{ fontSize: 30, lineHeight: 34 }}>
            Today
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <IconButton icon="person" label="Account" size={40} onPress={() => router.push('/account')} />
          <Pressable
            onPress={() => router.push('/journal')}
            onLongPress={() => router.push('/demo')}
            delayLongPress={600}
            haptics="none"
            accessibilityRole="button"
            accessibilityLabel={`${name}'s journal`}>
            <Avatar photo={mother?.photo} size={44} shape="squircle" ring={colors.paw} ringWidth={2} />
          </Pressable>
        </View>
      </View>

      {/* Hero */}
      <Animated.View entering={enter(0)} style={{ paddingTop: 18, gap: 14 }}>
        <Pressable onPress={() => router.push('/journal')} pressScale={0.99} haptics="none" accessibilityRole="button" accessibilityLabel="Open her journal">
          <View style={{ height: 212, borderRadius: radius.xl, backgroundColor: colors.surface, overflow: 'hidden' }}>
            {heroPhoto ? (
              <Image source={photoSource(heroPhoto)} contentFit="cover" style={{ width: '100%', height: '100%' }} />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="cat" size={56} color={colors.dashed} strokeWidth={1.5} />
              </View>
            )}
            <PhotoPill label={expectingPill(week, firstDay)} style={{ position: 'absolute', top: 14, left: 14 }} />
          </View>
        </Pressable>
        <View style={{ gap: 4 }}>
          <Text variant="title" style={{ fontSize: 30, lineHeight: 32 }}>
            {firstDay ? `Welcome to the family, ${name}` : copy.headline(name)}
          </Text>
          <Text variant="small" color={colors.muted} style={{ fontSize: 15, lineHeight: 21 }}>
            {firstDay ? 'Her story starts today. A few small moments a day is plenty.' : arrivalSentence(mother, today)}
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={enter(1)} style={{ paddingTop: 18 }}>
        <StageProgress current="Expecting" progress={progress} />
      </Animated.View>

      {/* For today */}
      <View style={{ paddingTop: 30 }}>
        <SectionHeader title="For today" meta={tasks.length ? `${doneCount} of ${tasks.length} done` : undefined} />
        <View style={{ gap: 10 }}>{tasks.length ? tasks.map(renderTask) : <AppetiteCard name={name} logged={todays?.appetite ?? null} />}</View>
      </View>

      {/* Her story */}
      <View style={{ paddingTop: 26 }}>
        {firstDay ? (
          <>
            <SectionHeader title="Her story" meta="Nothing yet" />
            <Animated.View entering={enter(2)}>
              <EmptyStory />
            </Animated.View>
          </>
        ) : (
          <>
            <SectionHeader title="Her story" meta="Open the journal" onMetaPress={() => router.push('/journal')} />
            <Animated.View entering={enter(2)}>
              <Pressable
                onPress={() => router.push('/journal')}
                pressScale={0.98}
                accessibilityRole="button"
                accessibilityLabel="Open her pregnancy journal"
                style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                {heroPhoto ? (
                  <Image source={photoSource(heroPhoto)} contentFit="cover" style={{ width: 48, height: 48, borderRadius: 16 }} />
                ) : (
                  <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="cat" size={22} color={colors.muted} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong" weight={700}>
                    {name}’s pregnancy journal
                  </Text>
                  <Text variant="small" color={colors.muted}>
                    {plural(motherCheckins.length, 'check-in')} · {plural(motherCheckins.filter((c) => c.photo).length, 'belly photo')}
                  </Text>
                </View>
                <Icon name="chevron-right" size={18} color={colors.muted} />
              </Pressable>
            </Animated.View>
          </>
        )}
      </View>

      {/* Good to know */}
      <Animated.View entering={enter(3)} style={{ paddingTop: 26, gap: 12 }}>
        <SectionHeader title={firstDay || week === null ? 'Good to know' : 'Good to know this week'} />
        <GuidanceCard text={copy.guidance} />
      </Animated.View>

      {/* Birth entry — quiet, but there when she needs it. */}
      <Animated.View entering={enter(4)} style={{ paddingTop: 26 }}>
        <Pressable onPress={() => router.push('/birth')} pressScale={0.98} accessibilityRole="button" accessibilityLabel="Start the birth log">
          <Card tone="paw" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="paw" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" weight={700}>
                Kittens arriving?
              </Text>
              <Text variant="small" color={colors.muted}>
                Start the birth log — one kitten at a time
              </Text>
            </View>
            <Icon name="arrow-right" size={20} />
          </Card>
        </Pressable>
      </Animated.View>
    </Screen>
  );
}
