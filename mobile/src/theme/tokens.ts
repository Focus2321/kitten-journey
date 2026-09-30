// Kitten Journey design tokens — mirrors the Paper file "Kitten Journey — App UI".
import { Easing } from 'react-native-reanimated';

export const colors = {
  ground: '#FFFFFF',
  surface: '#F4F3EF',
  line: '#E7E5DF',
  dashed: '#D8D5CD',
  ink: '#15130F',
  muted: '#6E6A62',
  mutedOnDark: '#B9B5AC',
  sun: '#FFCE3A',
  sunSoft: '#FFF4CC',
  sunDivider: '#F3E3A6',
  paw: '#FFA7B4',
  pawSoft: '#FFE6EA',
  green: '#3DAA6D',
  greenSoft: '#E6F4EC',
  orange: '#F2994A',
  scrim: 'rgba(21,19,15,0.42)',
} as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const;

/** Horizontal page padding used on every phone screen. */
export const gutter = 20;

export const radius = { sm: 14, md: 20, lg: 24, xl: 28, xxl: 32, pill: 999 } as const;

export const fonts = {
  400: 'BricolageGrotesque_400Regular',
  500: 'BricolageGrotesque_500Medium',
  600: 'BricolageGrotesque_600SemiBold',
  700: 'BricolageGrotesque_700Bold',
  800: 'BricolageGrotesque_800ExtraBold',
} as const;
export type Weight = keyof typeof fonts;

type Variant = { size: number; line: number; weight: Weight; tracking?: number; upper?: boolean; color?: string };

/** Type scale. `tracking` is in em and converted to px by <Text>. */
export const type = {
  display: { size: 48, line: 50, weight: 800, tracking: -0.035 },
  headline: { size: 34, line: 36, weight: 800, tracking: -0.03 },
  title: { size: 28, line: 32, weight: 800, tracking: -0.025 },
  section: { size: 20, line: 24, weight: 700, tracking: -0.01 },
  lead: { size: 18, line: 24, weight: 600, tracking: -0.01 },
  body: { size: 16, line: 22, weight: 400 },
  bodyStrong: { size: 16, line: 22, weight: 600 },
  small: { size: 14, line: 18, weight: 400 },
  smallStrong: { size: 14, line: 18, weight: 700 },
  caption: { size: 12, line: 16, weight: 500, color: colors.muted },
  label: { size: 12, line: 14, weight: 600, tracking: 0.08, upper: true, color: colors.muted },
} satisfies Record<string, Variant>;
export type TypeVariant = keyof typeof type;

/**
 * Motion — "Soft, quick, never in the way".
 * Springs, not curves. Everything under 400 ms. Joy is earned (celebrate births and firsts, not chores).
 */
export const motion = {
  /** Bottom sheets: spring 380 / 32 (~320 ms). */
  sheet: { stiffness: 380, damping: 32, mass: 1 },
  /** Small UI moves: pills, switchers, slot pops. */
  snappy: { stiffness: 520, damping: 34, mass: 1 },
  /** Playful pops (slot fills, celebrations) — a touch of overshoot. */
  pop: { stiffness: 420, damping: 14, mass: 0.8 },
  press: { stiffness: 600, damping: 30, mass: 0.6 },
  scrimIn: { duration: 200, easing: Easing.out(Easing.cubic) },
  fade: { duration: 180, easing: Easing.out(Easing.quad) },
  stagger: 30,
  dismissDistance: 120,
} as const;
