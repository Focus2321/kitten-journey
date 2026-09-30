import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, Pressable, Text, type IconName } from '@/components/ui';
import { photos } from '@/data/photos';
import { useStore } from '@/data/store';
import { enter } from '@/features/pregnancy/motion';
import { colors, gutter, radius } from '@/theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Choice({ title, subtitle, icon, tone, onPress }: { title: string; subtitle: string; icon: IconName; tone: 'sun' | 'surface'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      pressScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{
        backgroundColor: tone === 'sun' ? colors.sun : colors.surface,
        borderRadius: radius.lg,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      }}>
      <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="lead" weight={700} style={{ fontSize: 19 }}>
          {title}
        </Text>
        <Text variant="small" color={tone === 'sun' ? colors.ink : colors.muted} style={{ lineHeight: 19 }}>
          {subtitle}
        </Text>
      </View>
      <Icon name="arrow-right" size={20} />
    </Pressable>
  );
}

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const loadDemo = useStore((s) => s.loadDemo);

  const startSetup = (flow: 'expecting' | 'born') => {
    loadDemo('new');
    router.push(flow === 'born' ? { pathname: '/setup/mother', params: { flow } } : '/setup/mother');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground, paddingTop: insets.top + 8, paddingHorizontal: gutter, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
      <Animated.View entering={enter(0)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.sun }} />
        <Text variant="bodyStrong" weight={700} style={{ fontSize: 17, letterSpacing: -0.34 }}>
          kitten journey
        </Text>
      </Animated.View>

      <Animated.View entering={enter(1)} style={{ marginTop: 22, height: 300, borderRadius: radius.xxl, backgroundColor: colors.surface, overflow: 'hidden' }}>
        <Image source={photos.cuddle} contentFit="cover" style={{ width: '100%', height: '100%' }} accessibilityLabel="A mother cat holding her kitten" />
        <View
          style={{
            position: 'absolute',
            left: 16,
            bottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.ground,
            borderRadius: radius.pill,
            paddingVertical: 8,
            paddingLeft: 8,
            paddingRight: 14,
            transform: [{ rotate: '-3deg' }],
          }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.paw }} />
          <Text variant="small" weight={600}>
            Day one, together
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={enter(2)} style={{ paddingTop: 28, gap: 8 }}>
        <Text variant="headline" style={{ fontSize: 38, lineHeight: 40 }}>
          Where’s her story right now?
        </Text>
        <Text variant="body" color={colors.muted}>
          Pick one — you can always change it later.
        </Text>
      </Animated.View>

      <View style={{ paddingTop: 22, gap: 10 }}>
        <Animated.View entering={enter(3)}>
          <Choice title="She's expecting" subtitle="Follow the pregnancy together" icon="heart" tone="sun" onPress={() => startSetup('expecting')} />
        </Animated.View>
        <Animated.View entering={enter(4)}>
          <Choice title="The kittens are here" subtitle="Start with mum and her litter" icon="paw" tone="surface" onPress={() => startSetup('born')} />
        </Animated.View>
      </View>

      <View style={{ flex: 1 }} />

      <Animated.View entering={enter(5)} style={{ alignItems: 'center', paddingTop: 20 }}>
        <Pressable onPress={() => router.push('/demo')} haptics="none" hitSlop={12} accessibilityRole="link" accessibilityLabel="Explore a demo">
          <Text variant="small" color={colors.muted} align="center">
            Not sure yet? Explore a demo instead
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
