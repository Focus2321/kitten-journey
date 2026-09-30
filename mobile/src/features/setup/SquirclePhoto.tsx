import { Image } from 'expo-image';
import { View } from 'react-native';

import { Icon, Pressable } from '@/components/ui';
import { photoSource, type Photo } from '@/data/photos';
import { colors } from '@/theme/tokens';

type Props = {
  photo: Photo | null;
  size?: number;
  /** Corner radius — the design uses 64 on a 196 squircle. */
  radius?: number;
  rotate?: number;
  onPress?: () => void;
  /** Camera badge in the bottom-right corner. */
  badge?: boolean;
};

/** Tilted squircle photo with a black camera badge. Dashed placeholder when there is no photo yet. */
export function SquirclePhoto({ photo, size = 196, radius = 64, rotate = -4, onPress, badge = true }: Props) {
  const badgeSize = Math.round(size * 0.245);
  return (
    <Pressable onPress={onPress} pressScale={0.97} accessibilityRole="button" accessibilityLabel={photo ? 'Change her photo' : 'Add her photo'} style={{ width: size, height: size }}>
      <View style={{ width: size, height: size, transform: [{ rotate: `${rotate}deg` }] }}>
        {photo ? (
          <Image source={photoSource(photo)} contentFit="cover" style={{ width: size, height: size, borderRadius: radius }} />
        ) : (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: colors.dashed,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="cat" size={Math.round(size * 0.3)} color={colors.muted} strokeWidth={1.6} />
          </View>
        )}
      </View>
      {badge && (
        <View
          style={{
            position: 'absolute',
            bottom: 4,
            right: -6,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: colors.ink,
            borderWidth: 4,
            borderColor: colors.ground,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="camera" size={Math.round(badgeSize * 0.42)} color={colors.ground} />
        </View>
      )}
    </Pressable>
  );
}
