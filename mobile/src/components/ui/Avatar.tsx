import { Image } from 'expo-image';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { photos, type PhotoKey } from '@/data/photos';
import { colors } from '@/theme/tokens';

import { Icon } from './Icon';

type Props = {
  photo?: PhotoKey | null;
  size?: number;
  /** Ring colour (e.g. sun for "selected", paw for the mother). */
  ring?: string;
  ringWidth?: number;
  /** Squircle instead of a circle (used for the mother). */
  shape?: 'circle' | 'squircle';
  /** Temporary-ID colour dot shown when a kitten has no name yet. */
  dot?: string;
  style?: StyleProp<ViewStyle>;
};

/** Photo avatar. With no photo it renders the dashed "add later" placeholder — unknowns never block. */
export function Avatar({ photo, size = 44, ring, ringWidth = 3, shape = 'circle', dot, style }: Props) {
  const r = shape === 'circle' ? size / 2 : size * 0.3;
  return (
    <View style={[{ width: size, height: size }, style]}>
      {photo ? (
        <Image
          source={photos[photo]}
          contentFit="cover"
          style={{ width: size, height: size, borderRadius: r, borderWidth: ring ? ringWidth : 0, borderColor: ring }}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: r,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: ring ?? colors.dashed,
            backgroundColor: colors.ground,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="camera" size={Math.max(14, size * 0.36)} color={colors.muted} />
        </View>
      )}
      {dot && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: Math.max(10, size * 0.26),
            height: Math.max(10, size * 0.26),
            borderRadius: 99,
            backgroundColor: dot,
            borderWidth: 2,
            borderColor: colors.ground,
          }}
        />
      )}
    </View>
  );
}

/** Overlapping avatar stack (family pill, sibling rows). */
export function AvatarStack({ items, size = 32, overlap = 10 }: { items: (PhotoKey | null)[]; size?: number; overlap?: number }) {
  const step = size - overlap;
  return (
    <View style={{ width: step * (items.length - 1) + size, height: size }}>
      {items.map((p, i) => (
        <Avatar key={i} photo={p} size={size} ring={colors.ground} ringWidth={2} style={{ position: 'absolute', left: i * step }} />
      ))}
    </View>
  );
}
