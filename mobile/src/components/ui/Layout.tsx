import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { Platform, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { photoSource, type Photo } from '@/data/photos';
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

/** White phone screen with safe areas, 20px gutters and an optional pinned footer. The footer rides on top of the keyboard and focused inputs scroll clear of both. */
export function Screen({ children, footer, header, scroll = true, padded = true, bottomInset = 0, contentStyle, ...rest }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(0);
  const content = [{ paddingHorizontal: padded ? gutter : 0, paddingBottom: 24 + bottomInset }, contentStyle];
  const footerPad = Math.max(insets.bottom, 16) + 4;
  // With the keyboard up the home-indicator inset is hidden, so the footer only needs a small gap above the keys.
  const footerDrop = footer ? footerPad - 12 : 0;
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground, paddingTop: insets.top }}>
      {header}
      {scroll ? (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          bottomOffset={footer ? footerHeight - footerDrop + 16 : 24}
          extraKeyboardSpace={footer ? -footerDrop : -bottomInset}
          contentContainerStyle={content}
          {...rest}>
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View style={[{ flex: 1 }, content]}>{children}</View>
      )}
      {footer && (
        <KeyboardStickyView offset={{ closed: 0, opened: footerDrop }} onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)} style={{ paddingHorizontal: gutter, paddingTop: 12, paddingBottom: footerPad, gap: 12, backgroundColor: colors.ground }}>
          {footer}
        </KeyboardStickyView>
      )}
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
          <Pressable onPress={onMetaPress} haptics="none" accessibilityRole="button">
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
          <Pressable onPress={onMore} haptics="none" hitSlop={10} accessibilityRole="button" accessibilityLabel="More guidance">
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
  photo?: Photo | null;
  icon?: IconName;
  done?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
};

/** "For today" row: thumbnail or icon tile, title/subtitle, round check. The row and the check are separate controls. */
export function TaskRow({ title, subtitle, photo, icon, done, onPress, onToggle }: TaskRowProps) {
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <Pressable
        onPress={onPress ?? onToggle}
        pressScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {photo ? (
          <Image source={photoSource(photo)} contentFit="cover" style={{ width: 48, height: 48, borderRadius: 12 }} />
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
      </Pressable>
      <Pressable onPress={onToggle} haptics="success" hitSlop={10} accessibilityRole="checkbox" accessibilityLabel={`${title} done`} accessibilityState={{ checked: !!done }}>
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
    </View>
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
