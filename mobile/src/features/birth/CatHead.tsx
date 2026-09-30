import Svg, { Path } from 'react-native-svg';

/** Little black cat-head silhouette used by the kitten counter (design 08). */
export function CatHead({ size = 34, color = '#15130F', rotate = 0 }: { size?: number; color?: string; rotate?: number }) {
  const h = Math.round((size * 30) / 34);
  return (
    <Svg width={size} height={h} viewBox="0 0 34 30" style={{ transform: [{ rotate: `${rotate}deg` }] }}>
      <Path d="M4 4l8 6h10l8-6 1 14c0 7-6.5 11-14 11S3 25 3 18z" fill={color} />
    </Svg>
  );
}
