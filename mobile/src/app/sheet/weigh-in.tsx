import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { Avatar, Button, Icon, IconButton, Pressable, Sheet, Text, haptic, type SheetHandle } from '@/components/ui';
import { daysBetween, formatShort } from '@/data/dates';
import { displayName, useStore, weightBefore, weighedOn, type Kitten } from '@/data/store';
import { DrawnCheck, RollingNumber, Ruler, type RulerHandle } from '@/features/litter/WeighParts';
import { colors, radius } from '@/theme/tokens';

const WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const word = (n: number) => WORDS[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** When the previous weigh-in actually was — "yesterday", "last week" or "on 21 Sep" — never assumed. */
function whenLabel(date: string, today: string) {
  const days = daysBetween(date, today);
  if (days === 1) return 'yesterday';
  if (days === 7) return 'last week';
  return `on ${formatShort(date)}`;
}

/**
 * Screen 14 — weigh-in sheet. One kitten at a time, starting with the first not weighed today
 * (or `?kitten=`). Motion M3: gram ruler with a selection tick per gram, rolling digits, the check
 * draws in on save, the next kitten slides in, and a settled summary once everyone is done.
 */
export default function WeighIn() {
  const sheetRef = useRef<SheetHandle>(null);
  const params = useLocalSearchParams<{ kitten?: string }>();

  const phase = useStore((s) => s.phase);
  const today = useStore((s) => s.today);
  const kittens = useStore((s) => s.kittens);
  const weights = useStore((s) => s.weights);
  const addWeight = useStore((s) => s.addWeight);
  const tasks = useStore((s) => s.tasks);
  const toggleTask = useStore((s) => s.toggleTask);

  const growing = phase === 'growing';
  const isDone = (k: Kitten) => !!weighedOn(weights, k.id, today);

  const [currentId, setCurrentId] = useState<string | null>(() => {
    const asked = kittens.find((k) => k.id === params.kitten);
    return asked?.id ?? kittens.find((k) => !isDone(k))?.id ?? null;
  });
  const [summary, setSummary] = useState(() => kittens.length > 0 && kittens.every(isDone) && !params.kitten);
  const [saving, setSaving] = useState(false);
  /** Grams picked so far, per kitten — falls back to the suggested start below. */
  const [picked, setPicked] = useState<Record<string, number>>({});

  const current = kittens.find((k) => k.id === currentId) ?? null;
  const prev = current ? weightBefore(weights, current.id, today) : null;
  const doneCount = kittens.filter(isDone).length;
  const leftCount = kittens.length - doneCount;

  const todays = current ? weighedOn(weights, current.id, today) : null;
  const sinceLabel = prev ? whenLabel(prev.date, today) : '';
  // Starting point: today's reading when adjusting one, else a little above last time (a nudge rather
  // than a scroll), else the birth weight.
  const start = todays?.grams ?? (prev ? prev.grams + 7 : (current?.birthWeight ?? (growing ? 500 : 100)));
  const min = Math.max(10, start - 120);
  const max = start + 300;
  const rulerRef = useRef<RulerHandle>(null);
  const grams = (currentId ? picked[currentId] : undefined) ?? start;
  const setGrams = (g: number) => {
    if (currentId) setPicked((p) => ({ ...p, [currentId]: g }));
  };

  // Card slide: out to the left, next one in from the right (280 ms spring).
  const cardX = useSharedValue(0);
  const cardO = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardO.value, transform: [{ translateX: cardX.value }] }));

  const nextAfter = (id: string) => {
    const order = [...kittens.filter((k) => k.id !== id)];
    return order.find((k) => !isDone(k))?.id ?? null;
  };

  const save = () => {
    if (!current || saving) return;
    setSaving(true);
    haptic('success');
    addWeight(current.id, grams);
    const next = nextAfter(current.id);
    setTimeout(() => {
      cardX.set(withTiming(-40, { duration: 120 }));
      cardO.set(withTiming(0, { duration: 120 }));
    }, 260);
    setTimeout(() => {
      if (next) {
        setCurrentId(next);
        cardX.set(40);
        cardX.set(withSpring(0, { stiffness: 380, damping: 32 }));
        cardO.set(withTiming(1, { duration: 160 }));
      } else {
        setSummary(true);
      }
      setSaving(false);
    }, 400);
  };

  const finish = () => {
    tasks.filter((t) => t.action === 'weigh-in' && !t.done).forEach((t) => toggleTask(t.id));
    sheetRef.current?.close();
  };

  const delta = prev ? grams - prev.grams : null;
  const nextName = current ? (() => {
    const n = nextAfter(current.id);
    const k = kittens.find((x) => x.id === n);
    return k ? displayName(k) : null;
  })() : null;

  const subtitle = summary
    ? growing
      ? 'Everyone weighed for the week.'
      : 'Everyone weighed for today.'
    : leftCount === 0
      ? 'Everyone is weighed. Adjusting one.'
      : `${cap(word(doneCount))} done, ${word(leftCount)} to go.${leftCount <= 2 ? ' Nearly there.' : ''}`;

  return (
    <Sheet ref={sheetRef}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="title">{summary ? `All ${word(kittens.length)} weighed` : growing ? 'Sunday weigh-in' : 'Morning weigh-in'}</Text>
          <Text variant="body" color={colors.muted}>
            {subtitle}
          </Text>
        </View>
        <IconButton icon="close" label="Close" size={40} onPress={() => sheetRef.current?.close()} />
      </View>

      {summary ? (
        <Summary kittens={kittens} today={today} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {kittens.map((k) => (
              <KittenPill key={k.id} kitten={k} state={k.id === currentId ? 'current' : isDone(k) ? 'done' : 'pending'} onPress={() => !saving && setCurrentId(k.id)} />
            ))}
          </View>

          {current && (
            <Animated.View style={[{ backgroundColor: colors.sunSoft, borderRadius: radius.xl, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16, gap: 6 }, cardStyle]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {!current.name && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: current.tempColor }} />}
                <Text variant="body" weight={700} style={{ fontSize: 15 }}>
                  {current.name ?? `${current.tempId} Collar`}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Pressable onPress={() => rulerRef.current?.scrollTo(grams - 1)} haptics="none" accessibilityRole="button" accessibilityLabel="One gram less" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: colors.ink }} />
                </Pressable>
                <View accessible accessibilityRole="text" accessibilityLabel={`${grams} grams`} accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <RollingNumber value={grams} />
                  <Text variant="title" weight={700} style={{ fontSize: 24, lineHeight: 30 }}>
                    g
                  </Text>
                </View>
                <Pressable onPress={() => rulerRef.current?.scrollTo(grams + 1)} haptics="none" accessibilityRole="button" accessibilityLabel="One gram more" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="plus" size={20} color={colors.sun} strokeWidth={2.4} />
                </Pressable>
              </View>
              <DeltaPill delta={delta} sinceLabel={sinceLabel} />
              <View style={{ paddingTop: 8 }}>
                <Ruler key={current.id} ref={rulerRef} min={min} max={max} initial={start} onChange={setGrams} />
              </View>
            </Animated.View>
          )}

          <Button
            label={saving ? 'Saved' : nextName ? `Save · next up, ${nextName}` : leftCount <= 1 ? 'Save · that’s everyone' : 'Save'}
            iconRight={saving ? undefined : 'arrow-right'}
            leading={saving ? <DrawnCheck size={22} /> : undefined}
            onPress={save}
            disabled={!current}
            haptics="none"
          />
        </>
      )}

      {summary && <Button label="Done" variant="ink" onPress={finish} haptics="success" />}
    </Sheet>
  );
}

function KittenPill({ kitten, state, onPress }: { kitten: Kitten; state: 'done' | 'current' | 'pending'; onPress: () => void }) {
  const name = displayName(kitten);
  if (state === 'current') {
    return (
      <Pressable onPress={onPress} haptics="none" accessibilityRole="button" accessibilityLabel={`${name}, weighing now`} accessibilityState={{ selected: true }} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 56, borderRadius: radius.pill, backgroundColor: colors.ink, padding: 4, paddingRight: 14, flexShrink: 1 }}>
        <Avatar photo={kitten.photo} size={48} ring={colors.sun} ringWidth={2} dot={kitten.name ? undefined : kitten.tempColor} />
        <Text variant="small" weight={700} color={colors.ground} numberOfLines={1}>
          {name}
        </Text>
      </Pressable>
    );
  }
  if (state === 'done') {
    return (
      <Pressable onPress={onPress} haptics="selection" accessibilityRole="button" accessibilityLabel={`${name}, weighed`} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 56, borderRadius: radius.pill, backgroundColor: colors.surface, padding: 4, paddingRight: 8 }}>
        <Avatar photo={kitten.photo} size={48} style={{ opacity: 0.55 }} />
        <Icon name="check" size={16} strokeWidth={2.6} />
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} haptics="selection" accessibilityRole="button" accessibilityLabel={`${name}, to weigh`} style={{ height: 56, width: 56, borderRadius: 28, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.dashed, alignItems: 'center', justifyContent: 'center' }}>
      <Avatar photo={kitten.photo} size={46} dot={kitten.name ? undefined : kitten.tempColor} />
    </Pressable>
  );
}

function DeltaPill({ delta, sinceLabel }: { delta: number | null; sinceLabel: string }) {
  const up = delta !== null && delta > 0;
  const down = delta !== null && delta < 0;
  const text = delta === null ? 'First weigh-in' : delta === 0 ? `Same as ${sinceLabel}` : up ? `${delta} g more than ${sinceLabel}` : `${-delta} g less than ${sinceLabel}`;
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.ground, borderRadius: radius.pill, paddingVertical: 6, paddingLeft: up ? 8 : 12, paddingRight: 12 }}>
      {up && <Icon name="arrow-up" size={14} color={colors.green} strokeWidth={2.6} />}
      <Text variant="caption" weight={600} style={{ fontSize: 13 }} color={up ? colors.green : down ? colors.orange : colors.muted}>
        {text}
      </Text>
    </View>
  );
}

/** "All four weighed" — rows settle in 40 ms apart. */
function Summary({ kittens, today }: { kittens: Kitten[]; today: string }) {
  const weights = useStore((s) => s.weights);
  const rows = kittens.map((k) => {
    const now = weighedOn(weights, k.id, today);
    const before = weightBefore(weights, k.id, today);
    const delta = now && before ? now.grams - before.grams : null;
    return { kitten: k, grams: now?.grams ?? null, delta, since: before?.date ?? null };
  });
  // Only claim what the scale showed: no comparison without an earlier weight, and a dip is named as one.
  const compared = rows.filter((r) => r.delta !== null);
  const anyDown = compared.some((r) => (r.delta as number) < 0);
  const allUp = compared.length === rows.length && compared.every((r) => (r.delta as number) > 0);
  const sinceDates = [...new Set(compared.map((r) => r.since))];
  const since = sinceDates.length === 1 && sinceDates[0] ? ` since ${whenLabel(sinceDates[0], today).replace(/^on /, '')}` : '';
  const line = allUp
    ? `Everyone’s up${since}. Nice work.`
    : anyDown
      ? 'All logged. Small dips happen — keep an eye on the next weigh-in.'
      : compared.length === 0
        ? 'All logged. The next weigh-in will show how they’re growing.'
        : 'All logged.';
  return (
    <View style={{ gap: 8 }}>
      {rows.map((r, i) => (
        <Settle key={r.kitten.id} delay={i * 40}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 10, paddingRight: 14 }}>
            <Avatar photo={r.kitten.photo} size={44} dot={r.kitten.name ? undefined : r.kitten.tempColor} />
            <Text variant="bodyStrong" weight={700} style={{ flex: 1 }}>
              {displayName(r.kitten)}
            </Text>
            <Text variant="bodyStrong" weight={700}>
              {r.grams !== null ? `${r.grams} g` : '—'}
            </Text>
            {r.delta !== null && (
              <View style={{ backgroundColor: r.delta > 0 ? colors.greenSoft : colors.ground, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 8 }}>
                <Text variant="caption" weight={700} color={r.delta > 0 ? colors.green : r.delta < 0 ? colors.orange : colors.muted}>
                  {r.delta > 0 ? `+${r.delta} g` : `${r.delta} g`}
                </Text>
              </View>
            )}
          </View>
        </Settle>
      ))}
      <Settle delay={rows.length * 40 + 40}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 6 }}>
          <DrawnCheck size={20} color={colors.green} delay={rows.length * 40 + 80} />
          <Text variant="small" color={colors.muted}>
            {line}
          </Text>
        </View>
      </Settle>
    </View>
  );
}

function Settle({ children, delay }: { children: ReactNode; delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(withDelay(delay, withSpring(1, { stiffness: 380, damping: 30 })));
  }, [v, delay]);
  const style = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: 10 * (1 - v.value) }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}
