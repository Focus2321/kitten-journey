import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { Avatar, Icon, IconButton, Pressable, Sheet, Text, haptic, type IconName, type SheetHandle } from '@/components/ui';
import type { Photo } from '@/data/photos';
import { displayName, useStore } from '@/data/store';
import { pickPhoto } from '@/features/photos/pickPhoto';
import { colors, motion, radius } from '@/theme/tokens';

type Subject = 'litter' | 'mother' | string;
type Kind = 'moment' | 'weight' | 'feeding' | 'photo';

const TILES: { kind: Kind; title: string; sub: string; icon: IconName; bg: string }[] = [
  { kind: 'moment', title: 'Moment', sub: 'A first, a funny habit', icon: 'sparkle', bg: colors.pawSoft },
  { kind: 'weight', title: 'Weight', sub: 'One kitten at a time', icon: 'scale', bg: colors.sunSoft },
  { kind: 'feeding', title: 'Feeding', sub: 'Nursing, bottle or bowl', icon: 'bottle', bg: colors.surface },
  { kind: 'photo', title: 'Photo', sub: 'Into their album', icon: 'camera', bg: colors.surface },
];

const FEEDS = [
  { label: 'Nursing', text: 'Nursed and settled.' },
  { label: 'Bottle', text: 'Had a bottle.' },
  { label: 'Bowl', text: 'Ate from the bowl.' },
] as const;

/**
 * Screen 13 — "What happened?" quick add. Moment and Weight hand off to their own sheets
 * (this sheet closes, then `router.replace` swaps it for the next one so the scrim never stacks
 * and back still lands on the home). Feeding asks how, Photo opens the camera or library; both log
 * with a small confirmation, and cancelling logs nothing.
 */
export default function QuickAdd() {
  const sheetRef = useRef<SheetHandle>(null);
  const kittens = useStore((s) => s.kittens);
  const mother = useStore((s) => s.mother);
  const addMoment = useStore((s) => s.addMoment);
  const tasks = useStore((s) => s.tasks);
  const completeTask = useStore((s) => s.completeTask);

  const [subject, setSubject] = useState<Subject>('litter');
  const [logged, setLogged] = useState<{ title: string; sub: string } | null>(null);
  const [feeding, setFeeding] = useState(false);

  const subjectName = subject === 'litter' ? 'the litter' : subject === 'mother' ? (mother?.name ?? 'Mum') : displayName(kittens.find((k) => k.id === subject) ?? { name: null, tempId: '' });

  const closeThen = (href: string) => sheetRef.current?.close(() => router.replace(href));

  const confirm = (title: string, sub: string) => {
    haptic('success');
    setLogged({ title, sub });
    setTimeout(() => sheetRef.current?.close(), 950);
  };

  const pick = (kind: Kind) => {
    switch (kind) {
      case 'moment':
        return closeThen(`/sheet/kitten-day/${subject}`);
      case 'weight':
        return closeThen(subject === 'litter' || subject === 'mother' ? '/sheet/weigh-in' : `/sheet/weigh-in?kitten=${subject}`);
      case 'feeding':
        return setFeeding(true);
      case 'photo':
        return addPhoto();
    }
  };

  const logFeeding = (feed: (typeof FEEDS)[number]) => {
    addMoment({ subjectId: subject, kind: 'feeding', text: feed.text, photo: null, first: null });
    confirm(`${feed.label} logged`, `For ${subjectName} · just now`);
  };

  const addPhoto = async () => {
    const photo = await pickPhoto({ title: `Photo of ${subjectName}` });
    if (!photo || photo === 'remove') return;
    addMoment({ subjectId: subject, kind: 'photo', text: 'A photo of today.', photo, first: null });
    tasks.filter((t) => t.action === 'photo' && !t.done).forEach((t) => completeTask(t.id));
    confirm('Added to the album', `${subjectName} · today`);
  };

  return (
    <Sheet ref={sheetRef}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="title">What happened?</Text>
          <Text variant="body" color={colors.muted}>
            Pick one. It only takes a few seconds.
          </Text>
        </View>
        <IconButton icon="close" label="Close" size={40} onPress={() => sheetRef.current?.close()} />
      </View>

      {logged ? (
        <Animated.View entering={FadeIn.duration(160)} style={{ alignItems: 'center', gap: 12, paddingVertical: 28 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={28} color={colors.sun} strokeWidth={2.6} />
          </View>
          <Text variant="section">{logged.title}</Text>
          <Text variant="small" color={colors.muted}>
            {logged.sub}
          </Text>
        </Animated.View>
      ) : feeding ? (
        <Animated.View entering={FadeIn.duration(160)} style={{ gap: 12 }}>
          <Text variant="label">{`How did ${subjectName} eat?`}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {FEEDS.map((f) => (
              <Pressable
                key={f.label}
                onPress={() => logFeeding(f)}
                haptics="selection"
                accessibilityRole="button"
                accessibilityLabel={`${f.label} feeding for ${subjectName}`}
                style={{ flex: 1, height: 52, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="body" weight={600} style={{ fontSize: 15 }}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => setFeeding(false)} haptics="none" hitSlop={10} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: 6 }}>
            <Text variant="small" weight={600} color={colors.muted}>
              Back
            </Text>
          </Pressable>
        </Animated.View>
      ) : (
        <>
          <View style={{ gap: 10 }}>
            <Text variant="label">For</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <SubjectAvatar label="All" selected={subject === 'litter'} onPress={() => setSubject('litter')} />
              {mother && <SubjectAvatar label={mother.name} photo={mother.photo} selected={subject === 'mother'} onPress={() => setSubject('mother')} />}
              {kittens.map((k) => (
                <SubjectAvatar key={k.id} label={displayName(k)} photo={k.photo} dot={k.name ? undefined : k.tempColor} selected={subject === k.id} onPress={() => setSubject(k.id)} />
              ))}
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {TILES.slice(0, 2).map((t, i) => (
                <Tile key={t.kind} {...t} index={i} onPress={() => pick(t.kind)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {TILES.slice(2, 4).map((t, i) => (
                <Tile key={t.kind} {...t} index={i + 2} onPress={() => pick(t.kind)} />
              ))}
            </View>
          </View>
        </>
      )}
    </Sheet>
  );
}

function SubjectAvatar({ label, photo, dot, selected, onPress }: { label: string; photo?: Photo | null; dot?: string; selected: boolean; onPress: () => void }) {
  const isAll = photo === undefined;
  return (
    <Pressable onPress={onPress} haptics="selection" accessibilityRole="button" accessibilityLabel={isAll ? 'For the whole litter' : `For ${label}`} accessibilityState={{ selected }} style={{ alignItems: 'center', gap: 6, width: 58 }}>
      <View style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: selected ? colors.ink : 'transparent' }}>
        {isAll ? (
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="people" size={20} color={colors.sun} />
          </View>
        ) : (
          <Avatar photo={photo} size={42} dot={dot} />
        )}
      </View>
      <Text variant="caption" weight={selected ? 700 : 600} color={selected ? colors.ink : colors.muted} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Tiles fade up 8 px with a 30 ms stagger (motion M1). */
function Tile({ title, sub, icon, bg, index, onPress }: { title: string; sub: string; icon: IconName; bg: string; index: number; onPress: () => void }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(withDelay(120 + index * motion.stagger, withTiming(1, motion.fade)));
  }, [v, index]);
  const lift = useSharedValue(0);
  useEffect(() => {
    lift.set(withDelay(120 + index * motion.stagger, withSpring(1, motion.snappy)));
  }, [lift, index]);
  const style = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: 8 * (1 - lift.value) }] }));
  return (
    <Animated.View style={[{ flex: 1 }, style]}>
      <Pressable onPress={onPress} pressScale={0.97} accessibilityRole="button" accessibilityLabel={`${title}: ${sub}`} style={{ height: 124, borderRadius: radius.lg, backgroundColor: bg, padding: 16, justifyContent: 'space-between' }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} />
        </View>
        <View style={{ gap: 1 }}>
          <Text variant="bodyStrong" weight={700} style={{ fontSize: 17 }}>
            {title}
          </Text>
          <Text variant="caption" style={{ fontSize: 13 }}>
            {sub}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
