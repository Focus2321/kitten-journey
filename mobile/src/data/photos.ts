import type { ImageSourcePropType } from 'react-native';

/** Every bundled photo. Screens reference photos by key so data stays serialisable. */
export const photos = {
  juniper: require('@/assets/photos/juniper.jpg'),
  juniperResting: require('@/assets/photos/juniper-resting.jpg'),
  juniperWk5: require('@/assets/photos/juniper-wk5.jpg'),
  juniperWk6: require('@/assets/photos/juniper-wk6.jpg'),
  juniperWk7: require('@/assets/photos/juniper-wk7.jpg'),
  pip: require('@/assets/photos/pip.jpg'),
  pipOlder: require('@/assets/photos/pip-older.jpg'),
  fig: require('@/assets/photos/fig.jpg'),
  biscuit: require('@/assets/photos/biscuit.jpg'),
  moth: require('@/assets/photos/moth.jpg'),
  mothPlay: require('@/assets/photos/moth-play.jpg'),
  nap: require('@/assets/photos/nap.jpg'),
  cuddle: require('@/assets/photos/cuddle.jpg'),
} satisfies Record<string, ImageSourcePropType>;

export type PhotoKey = keyof typeof photos;
