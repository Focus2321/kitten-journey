import type { CatColor } from './types'

export const INK = '#15130F'
export const PINK = '#FFA7B4'
export const SUN = '#FFCE3A'
export const WHITE = '#FFFFFF'

export type Fur = {
  base: string
  /** Stripe colour (tabby / ginger only). */
  stripe?: string
  /** Lighter tint for muzzle, belly and inner paws. */
  light: string
  /** Darker shade for far legs and tail tips. */
  shade: string
  /** Calico: [ginger, black] patch colours. */
  patches?: [string, string]
  /** Fur too dark for ink eyes: draw sun-coloured irises instead. */
  dark?: boolean
}

export const FUR: Record<CatColor, Fur> = {
  ginger: { base: '#F4A259', stripe: '#E0843A', light: '#FBDDB9', shade: '#D98A45' },
  tabby: { base: '#A39A8C', stripe: '#6E6A62', light: '#DDD6C8', shade: '#8A8275' },
  grey: { base: '#B8B4AC', light: '#E4E1DA', shade: '#9C9891' },
  black: { base: '#2A2723', light: '#4B463F', shade: '#1B1915', dark: true },
  cream: { base: '#F3E3C7', light: '#FBF3E4', shade: '#E2CDA6' },
  calico: { base: '#F7F2E8', light: '#FFFFFF', shade: '#E6DFD2', patches: ['#F4A259', '#2A2723'] },
}

/** Whisker ink, lightened on dark fur so it stays visible on both light and dark backgrounds. */
export const whiskerColor = (fur: Fur) => (fur.dark ? '#B8B4AC' : INK)

/** Colour used for a tail tip / accent marking. */
export const tipColor = (fur: Fur) => fur.stripe ?? fur.patches?.[0] ?? fur.shade
