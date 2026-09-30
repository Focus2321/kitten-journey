import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { Pressable, type HapticKind } from './Pressable';
import { Text } from './Text';

type Variant = 'sun' | 'ink' | 'surface' | 'outline' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'lg' | 'md' | 'sm';
  iconLeft?: IconName;
  iconRight?: IconName;
  /** Custom leading element, e.g. an avatar. */
  leading?: ReactNode;
  disabled?: boolean;
  full?: boolean;
  haptics?: HapticKind;
  style?: StyleProp<ViewStyle>;
};

const bg: Record<Variant, string> = {
  sun: colors.sun,
  ink: colors.ink,
  surface: colors.surface,
  outline: colors.ground,
  ghost: 'transparent',
};

const heights = { lg: 60, md: 48, sm: 38 };

export function Button({ label, onPress, variant = 'sun', size = 'lg', iconLeft, iconRight, leading, disabled, full = true, haptics = 'light', style }: Props) {
  const fg = variant === 'ink' ? colors.ground : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      haptics={haptics}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: size === 'sm' ? 16 : 24,
          backgroundColor: bg[variant],
          borderWidth: variant === 'outline' ? 1.5 : 0,
          alignSelf: full ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}>
      {leading}
      {iconLeft && <Icon name={iconLeft} size={size === 'sm' ? 16 : 18} color={fg} />}
      <Text variant={size === 'sm' ? 'smallStrong' : 'bodyStrong'} weight={700} color={fg}>
        {label}
      </Text>
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} color={fg} />}
    </Pressable>
  );
}

type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  label: string;
  variant?: 'surface' | 'ground' | 'ink' | 'sun';
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** 44pt round button — back, close, share, more. */
export function IconButton({ icon, onPress, label, variant = 'surface', size = 44, style }: IconButtonProps) {
  const background = { surface: colors.surface, ground: colors.ground, ink: colors.ink, sun: colors.sun }[variant];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: background, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Icon name={icon} size={Math.round(size * 0.42)} color={variant === 'ink' ? colors.ground : colors.ink} />
    </Pressable>
  );
}

/** Invisible spacer that matches IconButton so centred titles stay centred. */
export function IconButtonSpacer({ size = 44 }: { size?: number }) {
  return <View style={{ width: size, height: size }} />;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});
