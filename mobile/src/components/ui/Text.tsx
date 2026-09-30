import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { colors, fonts, type, type TypeVariant, type Weight } from '@/theme/tokens';

export type TProps = TextProps & {
  variant?: TypeVariant;
  weight?: Weight;
  color?: string;
  align?: TextStyle['textAlign'];
};

/** All text in the app goes through this so the Bricolage weights map correctly on Android. */
export function Text({ variant = 'body', weight, color, align, style, ...rest }: TProps) {
  const v = type[variant] as (typeof type)[TypeVariant] & { tracking?: number; upper?: boolean; color?: string };
  const w = weight ?? v.weight;
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: fonts[w],
          fontSize: v.size,
          lineHeight: v.line,
          letterSpacing: v.tracking ? v.tracking * v.size : 0,
          textTransform: v.upper ? 'uppercase' : 'none',
          color: color ?? v.color ?? colors.ink,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}
