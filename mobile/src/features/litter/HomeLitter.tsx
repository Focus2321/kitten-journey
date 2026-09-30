import { router } from 'expo-router';
import { View } from 'react-native';

import { TAB_BAR_SPACE } from '@/components/TabBar';
import { Avatar, GuidanceCard, Pressable, Screen, SectionHeader, StageProgress, TaskRow, Text } from '@/components/ui';
import { DEMO, addDays, daysBetween, formatDayMonth, formatLong } from '@/data/dates';
import type { PhotoKey } from '@/data/photos';
import { latestWeight, useStore, weightBefore, weighedOn, type Task } from '@/data/store';
import { colors } from '@/theme/tokens';

import { Hero, MomentsRail, NamePrompt, WeighCard, type WeighTile } from './LitterCards';

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];
const GROWING_HERO: PhotoKey[] = ['pipOlder', 'mothPlay', 'nap', 'cuddle'];

/**
 * Today tab once the kittens are here.
 * Newborn (design 12): morning weigh-in card, for-today tasks, days 1–7 guidance.
 * Growing (week 6): the same skeleton with weekly weights, latest moments and weaning guidance.
 */
export function HomeLitter() {
  const phase = useStore((s) => s.phase);
  const today = useStore((s) => s.today);
  const mother = useStore((s) => s.mother);
  const birth = useStore((s) => s.birth);
  const kittens = useStore((s) => s.kittens);
  const weights = useStore((s) => s.weights);
  const moments = useStore((s) => s.moments);
  const tasks = useStore((s) => s.tasks);
  const toggleTask = useStore((s) => s.toggleTask);
  const nameKitten = useStore((s) => s.nameKitten);

  const growing = phase === 'growing';
  const birthDate = birth?.date ?? DEMO.birthDate;
  const days = Math.max(0, daysBetween(birthDate, today));
  const week = Math.floor(days / 7);
  const n = kittens.length;
  const countWord = (WORDS[n] ?? String(n)).toLowerCase();

  // Weigh-in tiles: daily while newborn, weekly once growing.
  const tiles: WeighTile[] = kittens.map((k) => {
    if (growing) {
      const latest = latestWeight(weights, k.id);
      const thisWeek = latest && daysBetween(latest.date, today) < 7 ? latest : null;
      const prev = thisWeek ? weightBefore(weights, k.id, addDays(thisWeek.date, -6)) : null;
      return { kitten: k, grams: thisWeek?.grams ?? null, delta: thisWeek && prev ? thisWeek.grams - prev.grams : null };
    }
    const todays = weighedOn(weights, k.id, today);
    const prev = weightBefore(weights, k.id, today);
    return { kitten: k, grams: todays?.grams ?? null, delta: todays && prev ? todays.grams - prev.grams : null };
  });
  const weighed = tiles.filter((t) => t.grams !== null).length;
  const toGo = n - weighed;
  // The weigh-in task is the card above the rows, so it is not repeated as a row.
  const otherTasks = tasks.filter((t) => t.action !== 'weigh-in');
  const doneCount = tasks.filter((t) => t.done).length;

  const openWeighIn = (kittenId?: string) => router.push(kittenId ? `/sheet/weigh-in?kitten=${kittenId}` : '/sheet/weigh-in');

  const onTask = (t: Task) => {
    switch (t.action) {
      case 'weigh-in':
        return openWeighIn();
      case 'mother-checkin':
        return router.push('/sheet/mother-checkin');
      case 'quick-add':
      case 'photo':
        return router.push('/sheet/quick-add');
      default:
        return toggleTask(t.id);
    }
  };

  const heroPhotos: (PhotoKey | null)[] = growing ? GROWING_HERO : kittens.map((k) => k.photo);
  const unnamed = kittens.filter((k) => !k.name);
  const latestMoments = [...moments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const headline = growing ? `${WORDS[week] ?? week} weeks and full of beans` : `${WORDS[n] ?? n} tiny tummies, all growing`;
  const sub = growing
    ? 'Weaning has started. Everyone is up since last Sunday, and the sofa is no longer safe.'
    : `Everyone gained a little yesterday. ${mother?.name ?? 'Mum'} is doing the heavy lifting.`;
  const stageProgress = growing ? Math.min(1, Math.max(0.1, (days - 21) / 42)) : Math.min(1, Math.max(0.08, days / 21));

  return (
    <Screen bottomInset={TAB_BAR_SPACE} contentStyle={{ gap: 24, paddingTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text variant="label" style={{ fontSize: 13 }}>
            {formatLong(today).split(' ')[0]}, {formatDayMonth(today)}
          </Text>
          <Text variant="headline" style={{ fontSize: 30, lineHeight: 34 }}>
            Today
          </Text>
        </View>
        <Pressable onPress={() => router.push('/sheet/mother-checkin')} accessibilityLabel={`Check in on ${mother?.name ?? 'mum'}`}>
          <Avatar photo={mother?.photo} size={44} shape="squircle" ring={colors.paw} ringWidth={2} />
        </Pressable>
      </View>

      <Hero photoKeys={heroPhotos} pill={growing ? `Growing · week ${week}` : `Newborns · day ${days}`} dot={growing ? colors.sun : colors.paw} />

      <View style={{ gap: 10 }}>
        <Text variant="headline" style={{ fontSize: 30, lineHeight: 32 }}>
          {headline}
        </Text>
        <Text variant="body" color={colors.muted} style={{ fontSize: 15 }}>
          {sub}
        </Text>
      </View>

      <StageProgress current={growing ? 'Growing' : 'Newborns'} progress={stageProgress} />

      <View>
        <SectionHeader title="For today" meta={`${doneCount} of ${tasks.length} done`} />
        <View style={{ gap: 10 }}>
          {n > 0 && (
            <WeighCard
              title={growing ? 'Sunday weigh-in' : 'Morning weigh-in'}
              subtitle={
                toGo === 0
                  ? growing
                    ? `All ${countWord} weighed · see you next Sunday`
                    : 'All weighed · same time tomorrow'
                  : growing
                    ? `Once a week is plenty now · ${toGo} to go`
                    : `Same time, same scale · ${toGo} to go`
              }
              tiles={tiles}
              onWeigh={openWeighIn}
            />
          )}
          {unnamed.map((k) => (
            <NamePrompt key={k.id} kitten={k} onName={(name) => nameKitten(k.id, name)} />
          ))}
          {otherTasks.map((t) => (
            <TaskRow key={t.id} title={t.title} subtitle={t.subtitle} photo={t.photo} icon={t.icon ?? undefined} done={t.done} onPress={() => onTask(t)} onToggle={() => toggleTask(t.id)} />
          ))}
        </View>
      </View>

      {growing && latestMoments.length > 0 && (
        <View>
          <SectionHeader title="Latest moments" meta="See all" onMetaPress={() => router.push('/journal')} />
          <MomentsRail moments={latestMoments} kittens={kittens} today={today} />
        </View>
      )}

      <View>
        <SectionHeader title={growing ? `Good to know · week ${week}` : 'Good to know · days 1–7'} />
        <GuidanceCard
          text={
            growing
              ? 'Weaning starts around now. Offer a little wet food in a shallow dish and let them explore it. Mum still does most of the feeding.'
              : 'Newborns mostly sleep and nurse. Weighing at the same time each day makes small changes easy to spot.'
          }
          onMore={() => {}}
        />
      </View>
    </Screen>
  );
}
