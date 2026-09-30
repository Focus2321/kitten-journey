import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { photos, type PhotoKey } from '@/data/photos';
import { colors, gutter, radius } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

type ScreenProps = ScrollViewProps & {
  children: ReactNode;
  /** Fixed element pinned to the bottom (primary CTA). */
  footer?: ReactNode;
  /** Fixed element pinned to the top, above the scroll (top bar). */
  header?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Extra bottom space inside the scroll (e.g. to clear the tab bar). */
  bottomInset?: number;
  contentStyle?: StyleProp<ViewStyle>;
};

/** White phone screen with safe areas, 20px gutters and an optional pinned footer. */
export function Screen({ children, footer, header, scroll = true, padded = true, bottomInset = 0, contentStyle, ...rest }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const content = [{ paddingHorizontal: padded ? gutter : 0, paddingBottom: 24 + bottomInset }, contentStyle];
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground, paddingTop: insets.top }}>
      {header}
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={content} {...rest}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, content]}>{children}</View>
      )}
      {footer && <View style={{ paddingHorizontal: gutter, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) + 4, gap: 12 }}>{footer}</View>}
    </View>
  );
}

/** Top bar: 44pt buttons either side, optional centred content (label, progress dots, switcher). */
export function TopBar({ left, center, right }: { left?: ReactNode; center?: ReactNode; right?: ReactNode }) {
  return (
    <View style={{ height: 64, paddingHorizontal: gutter, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ minWidth: 44 }}>{left}</View>
      <View style={{ flex: 1, alignItems: 'center' }}>{center}</View>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

/** Onboarding progress dots: active is a 24px black pill. */
export function StepDots({ count, active }: { count: number; active: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ width: i === active ? 22 : 6, height: 6, borderRadius: 3, backgroundColor: i === active ? colors.ink : colors.line }} />
      ))}
    </View>
  );
}

export function Card({ children, tone = 'surface', style }: { children: ReactNode; tone?: 'surface' | 'sun' | 'paw' | 'ground' | 'ink'; style?: StyleProp<ViewStyle> }) {
  const bg = { surface: colors.surface, sun: colors.sunSoft, paw: colors.pawSoft, ground: colors.ground, ink: colors.ink }[tone];
  return (
    <View style={[{ backgroundColor: bg, borderRadius: radius.lg, padding: 16, borderWidth: tone === 'ground' ? 1.5 : 0, borderColor: colors.line }, style]}>{children}</View>
  );
}

/** Section title row: "For today ........ 1 of 3 done" */
export function SectionHeader({ title, meta, onMetaPress }: { title: string; meta?: string; onMetaPress?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
      <Text variant="section">{title}</Text>
      {meta &&
        (onMetaPress ? (
          <Pressable onPress={onMetaPress} haptics="none">
            <Text variant="small" weight={700}>
              {meta}
            </Text>
          </Pressable>
        ) : (
          <Text variant="small" color={colors.muted}>
            {meta}
          </Text>
        ))}
    </View>
  );
}

/** Yellow guidance card. Always carries the "General guidance · ask your vet" footnote. */
export function GuidanceCard({ eyebrow, text, onMore }: { eyebrow?: string; text: string; onMore?: () => void }) {
  return (
    <View style={{ backgroundColor: colors.sunSoft, borderRadius: radius.lg, padding: 18, gap: 12 }}>
      {eyebrow && <Text variant="label" color={colors.ink}>{eyebrow}</Text>}
      <Text variant="lead">{text}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="caption">General guidance · ask your vet if unsure</Text>
        {onMore && (
          <Pressable onPress={onMore} haptics="none" hitSlop={10}>
            <Text variant="small" weight={700}>
              More
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

type TaskRowProps = {
  title: string;
  subtitle?: string;
  photo?: PhotoKey | null;
  icon?: IconName;
  done?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
};

/** "For today" row: thumbnail or icon tile, title/subtitle, round check. */
export function TaskRow({ title, subtitle, photo, icon, done, onPress, onToggle }: TaskRowProps) {
  return (
    <Pressable onPress={onPress ?? onToggle} pressScale={0.98} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      {photo ? (
        <Image source={photos[photo]} contentFit="cover" style={{ width: 48, height: 48, borderRadius: 12 }} />
      ) : (
        <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon ?? 'sparkle'} size={20} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" weight={700}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="small" color={colors.muted}>
            {subtitle}
          </Text>
        )}
      </View>
      <Pressable onPress={onToggle} haptics="success" hitSlop={10} accessibilityRole="checkbox" accessibilityState={{ checked: !!done }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: done ? colors.ink : 'transparent',
            borderWidth: done ? 0 : 1.5,
            borderColor: colors.dashed,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {done && <Icon name="check" size={16} color={colors.ground} strokeWidth={2.4} />}
        </View>
      </Pressable>
    </Pressable>
  );
}

const STAGES = ['Expecting', 'Birth', 'Newborns', 'Growing', 'New homes'] as const;
export type Stage = (typeof STAGES)[number];

/** Five-segment journey bar. `progress` fills the current segment (0–1). */
export function StageProgress({ current, progress = 0.6 }: { current: Stage; progress?: number }) {
  const ci = STAGES.indexOf(current);
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {STAGES.map((s, i) => (
        <View key={s} style={{ flex: 1, gap: 8 }}>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surface, overflow: 'hidden' }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.sun, width: i < ci ? '100%' : i === ci ? `${Math.round(progress * 100)}%` : '0%' }} />
          </View>
          <Text variant="caption" weight={i === ci ? 700 : 500} color={i === ci ? colors.ink : colors.muted} numberOfLines={1}>
            {s}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** White pill overlaid on hero photos: "● Newborns · day 5" */
export function PhotoPill({ label, dot = colors.paw, style }: { label: string; dot?: string | null; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.ground, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 12, alignSelf: 'flex-start' }, style]}>
      {dot && <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: dot }} />}
      <Text variant="small" weight={700}>
        {label}
      </Text>
    </View>
  );
}

/** Placeholder used by route stubs until a screen is built. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <Screen>
      <View style={{ paddingTop: 80, gap: 8 }}>
        <Text variant="label">Not built yet</Text>
        <Text variant="headline">{title}</Text>
      </View>
    </Screen>
  );
}
