import { router, useLocalSearchParams, type Href } from 'expo-router';
import { View } from 'react-native';

import { Icon, IconButton, Pressable, Screen, Text, TopBar } from '@/components/ui';
import { DEMO } from '@/data/dates';
import { useStore, type Phase } from '@/data/store';
import { exitDemo } from '@/data/sync';
import { colors, radius } from '@/theme/tokens';

type Entry = { n: string; title: string; phase: Phase; href: Href; prep?: () => void };

const s = () => useStore.getState();

/** Birth flow with the first `saved` kittens already recorded. */
function birthWith(saved: number) {
  s().loadDemo('expecting');
  s().startBirth({ date: DEMO.birthDate, count: 4 });
  const seeds = [
    { name: 'Pip', sex: 'boy', coat: 'Grey tabby', photo: 'pip', birthTime: '05:42', birthWeight: 102 },
    { name: 'Fig', sex: 'girl', coat: 'Calico', photo: 'fig', birthTime: '06:10', birthWeight: 94 },
    { name: null, sex: 'boy', coat: 'Cream', photo: 'biscuit', birthTime: '06:31', birthWeight: 98 },
    { name: 'Moth', sex: 'girl', coat: 'Black & white', photo: 'moth', birthTime: '07:05', birthWeight: 89 },
  ] as const;
  seeds.slice(0, saved).forEach((k, i) => s().saveKitten(i, k));
}

const ENTRIES: Entry[] = [
  { n: '01', title: 'Welcome', phase: 'new', href: '/welcome' },
  { n: '02', title: 'Meet the mum-to-be', phase: 'new', href: '/setup/mother' },
  { n: '03', title: 'What you know', phase: 'new', href: '/setup/details', prep: () => s().setMother({ name: 'Juniper', photo: 'juniper' }) },
  {
    n: '04',
    title: 'Home · day one (empty)',
    phase: 'expecting',
    href: '/',
    prep: () => useStore.setState({ checkins: [], tasks: s().tasks.map((t) => ({ ...t, done: false })) }),
  },
  { n: '05', title: 'Home · expecting week 7', phase: 'expecting', href: '/' },
  { n: '06', title: "Juniper's check-in", phase: 'expecting', href: '/sheet/mother-checkin' },
  { n: '07', title: 'Pregnancy journal', phase: 'expecting', href: '/journal' },
  { n: '08', title: "Birth · they're here", phase: 'expecting', href: '/birth' },
  { n: '09', title: 'Birth · kitten 1 of 4', phase: 'expecting', href: '/birth/kitten/0', prep: () => birthWith(0) },
  { n: '10', title: 'Birth · kitten 3 of 4 (temp ID)', phase: 'expecting', href: '/birth/kitten/2', prep: () => birthWith(2) },
  { n: '11', title: 'Birth · litter complete', phase: 'expecting', href: '/birth/complete', prep: () => birthWith(4) },
  { n: '12', title: 'Home · newborns day 5', phase: 'newborn', href: '/' },
  { n: '13', title: 'Quick add · what happened?', phase: 'newborn', href: '/sheet/quick-add' },
  { n: '14', title: 'Quick add · weigh-in', phase: 'newborn', href: '/sheet/weigh-in' },
  { n: '12b', title: 'Home · growing week 6', phase: 'growing', href: '/' },
  { n: '15', title: 'Pip · profile week 6', phase: 'growing', href: '/kitten/pip' },
  { n: '16', title: "Pip's day · check-in", phase: 'growing', href: '/sheet/kitten-day/pip' },
  { n: '—', title: 'Family', phase: 'growing', href: '/family' },
  { n: '17', title: 'Family story', phase: 'growing', href: '/story' },
  { n: '18', title: "Share Pip's story", phase: 'growing', href: '/share/pip' },
  { n: '19', title: 'As Sam & Rosa see it', phase: 'growing', href: '/shared/pip' },
];

const PHASES: { phase: Phase; label: string }[] = [
  { phase: 'new', label: 'New' },
  { phase: 'expecting', label: 'Expecting' },
  { phase: 'newborn', label: 'Newborn' },
  { phase: 'growing', label: 'Growing' },
];

/**
 * Demo data is never synced: `loadDemo` flags every phase but 'new' as demo, so the 'new' entries flag it by hand —
 * otherwise walking the onboarding screens from here would write into a signed-in family.
 */
function load(phase: Phase) {
  s().loadDemo(phase);
  if (phase === 'new') useStore.setState({ demo: true });
}

/** Every screen in the design, reachable in one tap, each with its demo data loaded. */
export default function Demo() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const phase = useStore((st) => st.phase);
  const demo = useStore((st) => st.demo);
  // Arrived from the sign-in screen: the tabs aren't underneath us, so replace instead of dismissing to them.
  const fromAuth = from === 'auth';

  const goHome = (href: Href) => {
    if (fromAuth) {
      if (router.canDismiss()) router.dismissAll();
      router.replace(href);
    } else router.dismissTo(href);
  };

  const open = (e: Entry) => {
    load(e.phase);
    e.prep?.();
    if (e.href === '/' || e.href === '/family' || e.href === '/story') goHome(e.href);
    else router.push(e.href);
  };

  const leave = async () => {
    await exitDemo();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/');
  };

  return (
    <Screen header={<TopBar left={<IconButton icon="back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />} center={<Text variant="bodyStrong">Demo</Text>} />}>
      <View style={{ gap: 20, paddingTop: 4 }}>
        <View style={{ gap: 6 }}>
          <Text variant="title">The whole journey</Text>
          <Text variant="body" color={colors.muted}>
            Every screen from the design, with Juniper&apos;s story loaded for that moment. Nothing here is saved.
          </Text>
        </View>

        {demo && (
          <Pressable
            pressScale={0.98}
            accessibilityRole="button"
            accessibilityLabel="Leave the demo"
            onPress={leave}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.sun, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 16 }}>
            <Text variant="bodyStrong" style={{ flex: 1 }}>
              Back to my family
            </Text>
            <Icon name="arrow-right" size={18} />
          </Pressable>
        )}

        <View style={{ gap: 10 }}>
          <Text variant="label">Jump to a phase</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {PHASES.map((p) => {
              const on = p.phase === phase;
              return (
                <Pressable
                  key={p.phase}
                  haptics="selection"
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    load(p.phase);
                    goHome('/');
                  }}
                  style={{ paddingHorizontal: 16, height: 40, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: on ? colors.ink : colors.surface }}>
                  <Text variant="small" weight={700} color={on ? colors.ground : colors.ink}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text variant="label">Screens</Text>
          {ENTRIES.map((e) => (
            <Pressable
              key={e.n + e.title}
              pressScale={0.98}
              accessibilityRole="button"
              onPress={() => open(e)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 16 }}>
              <Text variant="smallStrong" color={colors.muted} style={{ width: 30 }}>
                {e.n}
              </Text>
              <Text variant="bodyStrong" style={{ flex: 1 }}>
                {e.title}
              </Text>
              <Icon name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
