import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Avatar, Button, Screen, Text, haptic } from '@/components/ui';
import { formatLong } from '@/data/dates';
import { photos, type PhotoKey } from '@/data/photos';
import { displayName, useStore } from '@/data/store';
import { colors, motion, radius } from '@/theme/tokens';

const W = 350;
const H = 330;
const STAGGER = 60;

/** Design 11 collage positions for the first four kittens (x, y, size, tilt). */
const SPOTS = [
  { x: 28, y: 58, size: 118, rot: -10 },
  { x: 244, y: 52, size: 118, rot: 9 },
  { x: 52, y: 188, size: 112, rot: 7 },
  { x: 226, y: 190, size: 112, rot: -6 },
];

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

/** Screen 11 — "Welcome, little ones". Photos stagger in 60 ms apart; the CTA lands on the family home. */
export default function BirthComplete() {
  const kittens = useStore((s) => s.kittens);
  const mother = useStore((s) => s.mother);
  const birth = useStore((s) => s.birth);
  const today = useStore((s) => s.today);
  const finishBirth = useStore((s) => s.finishBirth);

  const bornOn = birth?.date ?? today;
  const n = kittens.length;
  const countWord = WORDS[n] ?? String(n);

  useEffect(() => {
    const t = setTimeout(() => haptic('success'), STAGGER * Math.min(n, 4) + 200);
    return () => clearTimeout(t);
  }, [n]);

  const go = () => {
    finishBirth();
    router.dismissAll();
    router.replace('/');
  };

  return (
    <Screen
      footer={
        <View style={{ gap: 14 }}>
          <Text variant="small" color={colors.muted} align="center">
            The first days are mostly milk and sleep. We’ll keep things quiet.
          </Text>
          <Button label="Go to the family" variant="ink" onPress={go} haptics="medium" />
        </View>
      }
      contentStyle={{ gap: 28, paddingTop: 40, alignItems: 'center' }}>
      <View style={{ width: W, height: H }}>
        <Confetti />
        <Pop delay={0} style={{ position: 'absolute', left: 125, top: 95 }}>
          <View style={{ width: 140, height: 140, borderRadius: 70, borderWidth: 6, borderColor: colors.paw, overflow: 'hidden', backgroundColor: colors.surface }}>
            {mother?.photo && <Image source={photos[mother.photo]} contentFit="cover" style={{ width: 128, height: 128 }} />}
          </View>
        </Pop>
        {kittens.slice(0, 4).map((k, i) => {
          const s = SPOTS[i];
          return (
            <Pop key={k.id} delay={STAGGER * (i + 1)} style={{ position: 'absolute', left: s.x, top: s.y, transform: [{ rotate: `${s.rot}deg` }] }}>
              <Polaroid photo={k.photo} size={s.size} label={displayName(k)} />
            </Pop>
          );
        })}
      </View>

      <View style={{ gap: 12, alignItems: 'center' }}>
        <Text variant="display" align="center" style={{ fontSize: 44, lineHeight: 46 }}>
          Welcome, little ones
        </Text>
        <Text variant="body" color={colors.muted} align="center">
          {mother?.name ?? 'Mum'} and her {countWord} {n === 1 ? 'kitten' : 'kittens'} are all together in one place. Born {formatLong(bornOn)}.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {kittens.map((k, i) => (
          <Pop key={k.id} delay={STAGGER * (Math.min(n, 4) + 1) + 40 * i}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: radius.pill, paddingVertical: 6, paddingLeft: 6, paddingRight: 14 }}>
              <Avatar photo={k.photo} size={28} />
              {!k.name && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: k.tempColor }} />}
              <Text variant="body" weight={600} style={{ fontSize: 15 }}>
                {k.name ?? `${k.tempId} Collar`}
              </Text>
            </View>
          </Pop>
        ))}
      </View>
    </Screen>
  );
}

function Polaroid({ photo, size, label }: { photo: PhotoKey | null; size: number; label: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 30,
        borderWidth: 5,
        borderColor: colors.ground,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        shadowColor: colors.ink,
        shadowOpacity: 0.14,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {photo ? (
        <Image source={photos[photo]} contentFit="cover" style={{ width: size, height: size }} />
      ) : (
        <Text variant="small" weight={700} color={colors.muted}>
          {label}
        </Text>
      )}
    </View>
  );
}

/** Scales up from 0.6 with a springy pop after `delay` ms. */
function Pop({ children, delay, style }: { children: ReactNode; delay: number; style?: object }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(withDelay(delay, withSpring(1, motion.pop)));
  }, [v, delay]);
  const o = useSharedValue(0);
  useEffect(() => {
    o.set(withDelay(delay, withTiming(1, { duration: 160 })));
  }, [o, delay]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ scale: 0.6 + 0.4 * v.value }] }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}

function Confetti() {
  const dot = (x: number, y: number, size: number, color: string, extra?: object) => (
    <View key={`${x}-${y}`} style={[{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: color }, extra]} />
  );
  return (
    <>
      {dot(34, 40, 12, colors.sun)}
      {dot(330, 28, 10, colors.paw)}
      {dot(350, 190, 14, colors.sun, { borderRadius: 4, transform: [{ rotate: '24deg' }] })}
      {dot(22, 220, 9, colors.ink)}
      {dot(300, 300, 8, colors.paw)}
      <Svg width={34} height={24} viewBox="0 0 34 24" style={{ position: 'absolute', left: 72, top: 6 }}>
        <Path d="M2 12c4-8 8-8 10 0s6 8 10 0 6-8 10 0" stroke={colors.paw} strokeWidth={3} strokeLinecap="round" fill="none" />
      </Svg>
      <Svg width={34} height={24} viewBox="0 0 34 24" style={{ position: 'absolute', left: 268, top: 250 }}>
        <Path d="M2 12c4-8 8-8 10 0s6 8 10 0 6-8 10 0" stroke={colors.sun} strokeWidth={3} strokeLinecap="round" fill="none" />
      </Svg>
    </>
  );
}
