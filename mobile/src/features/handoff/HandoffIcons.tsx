import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

type P = { size?: number; color?: string };

/** House outline (screen 18 "Going to" row). Not in the shared icon set, so it lives here. */
export function HomeIcon({ size = 20, color = colors.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 11L12 4L20 11V19C20 19.6 19.6 20 19 20H15V14H9V20H5C4.4 20 4 19.6 4 19V11Z" fill="none" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
    </Svg>
  );
}

/** Rising trend line (screen 18 "How he grew" row). */
export function TrendIcon({ size = 20, color = colors.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 18L9.5 12L13 15L20 7M15 7H20V12" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Filled cat head used as the Kitten Journey wordmark on the shared page. */
export function CatMark({ size = 16, color = colors.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 9L5 4L9.5 7.5H14.5L19 4V9C20.2 10.3 21 12 21 14C21 18 17 21 12 21C7 21 3 18 3 14C3 12 3.8 10.3 5 9Z" fill={color} />
    </Svg>
  );
}

/** Big filled paw for firsts tiles without a photo. */
export function PawMark({ size = 54, color = colors.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 11.9c-2.3 0-4.2 1.9-4.2 3.6 0 2.4 2 3.6 4.2 3.6s4.2-1.2 4.2-3.6c0-1.7-1.9-3.6-4.2-3.6z" fill={color} />
      <Circle cx={6.2} cy={10.6} r={2} fill={color} />
      <Circle cx={9.6} cy={7.2} r={2.1} fill={color} />
      <Circle cx={14.4} cy={7.2} r={2.1} fill={color} />
      <Circle cx={17.8} cy={10.6} r={2} fill={color} />
    </Svg>
  );
}
