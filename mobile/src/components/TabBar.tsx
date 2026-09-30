import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/data/store';
import { colors, motion, radius } from '@/theme/tokens';

import { Icon, type IconName } from './ui/Icon';
import { Pressable } from './ui/Pressable';
import { Text } from './ui/Text';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Today', icon: 'sun' },
  family: { label: 'Family', icon: 'cat' },
  story: { label: 'Story', icon: 'heart' },
};

/** Height screens should leave clear at the bottom of their scroll content. */
export const TAB_BAR_SPACE = 110;

/**
 * Floating white pill with Today / Family / Story plus the sun "+" button.
 * The + opens Juniper's check-in while expecting, and "What happened?" once kittens arrive.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const phase = useStore((s) => s.phase);

  const onAdd = () => router.push(phase === 'expecting' || phase === 'new' ? '/sheet/mother-checkin' : '/sheet/quick-add');

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 12), paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        accessibilityRole="tablist"
        style={{
          flex: 1,
          height: 64,
          borderRadius: radius.pill,
          backgroundColor: colors.ground,
          borderWidth: 1,
          borderColor: colors.line,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 6,
          shadowColor: colors.ink,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}>
        {state.routes.map((route, i) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === i;
          return (
            <Pressable
              key={route.key}
              haptics="selection"
              // iOS has no per-item "tab" trait: the tablist container carries the tab-bar trait, items are selectable buttons.
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              onPress={() => {
                const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
              }}
              style={{ flex: focused ? 1.35 : 1 }}>
              <Animated.View
                layout={LinearTransition.springify().stiffness(motion.snappy.stiffness).damping(motion.snappy.damping)}
                style={{
                  height: 52,
                  borderRadius: radius.pill,
                  backgroundColor: focused ? colors.ink : 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}>
                <Icon name={tab.icon} size={20} color={focused ? colors.ground : colors.muted} />
                {focused && (
                  <Text variant="smallStrong" color={colors.ground}>
                    {tab.label}
                  </Text>
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={onAdd}
        haptics="medium"
        pressScale={0.92}
        accessibilityRole="button"
        accessibilityLabel={phase === 'expecting' ? 'Check in on your cat' : 'Add something'}
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.sun,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.ink,
          shadowOpacity: 0.12,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}>
        <Icon name="plus" size={28} strokeWidth={2.6} />
      </Pressable>
    </View>
  );
}
