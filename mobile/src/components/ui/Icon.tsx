import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export type IconName =
  | 'back'
  | 'close'
  | 'plus'
  | 'check'
  | 'chevron-right'
  | 'arrow-right'
  | 'arrow-up'
  | 'camera'
  | 'mic'
  | 'share'
  | 'sun'
  | 'cat'
  | 'image'
  | 'sparkle'
  | 'scale'
  | 'bottle'
  | 'eye'
  | 'paw'
  | 'sofa'
  | 'box'
  | 'more'
  | 'heart'
  | 'calendar'
  | 'pencil'
  | 'lock'
  | 'link'
  | 'people'
  | 'person';

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number };

/** Hand-drawn 24px stroke icon set. Keep strokes round and friendly. */
export function Icon({ name, size = 20, color = colors.ink, strokeWidth = 2 }: Props) {
  const s = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths(name, s, color)}
    </Svg>
  );
}

function paths(name: IconName, s: object, color: string) {
  switch (name) {
    case 'back':
      return <Path d="M15 5l-7 7 7 7" {...s} />;
    case 'close':
      return <Path d="M6 6l12 12M18 6L6 18" {...s} />;
    case 'plus':
      return <Path d="M12 5v14M5 12h14" {...s} />;
    case 'check':
      return <Path d="M5 12.5l4.5 4.5L19 7.5" {...s} />;
    case 'chevron-right':
      return <Path d="M9 5l7 7-7 7" {...s} />;
    case 'arrow-right':
      return <Path d="M5 12h14M13 6l6 6-6 6" {...s} />;
    case 'arrow-up':
      return <Path d="M12 19V5M6 11l6-6 6 6" {...s} />;
    case 'camera':
      return (
        <>
          <Path d="M4 8.5A2.5 2.5 0 016.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0120 8.5v8A2.5 2.5 0 0117.5 19h-11A2.5 2.5 0 014 16.5z" {...s} />
          <Circle cx={12} cy={12.5} r={3.2} {...s} />
        </>
      );
    case 'mic':
      return (
        <>
          <Rect x={9} y={3} width={6} height={11} rx={3} {...s} />
          <Path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" {...s} />
        </>
      );
    case 'share':
      return <Path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" {...s} />;
    case 'sun':
      return (
        <>
          <Circle cx={12} cy={12} r={4} {...s} />
          <Path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" {...s} />
        </>
      );
    case 'cat':
      return <Path d="M5 20v-8.5L4 4l4.5 3.2a9 9 0 017 0L20 4l-1 7.5V20M9 13.5h.01M15 13.5h.01M10.5 16.5c1 .7 2 .7 3 0" {...s} />;
    case 'image':
      return (
        <>
          <Rect x={3.5} y={4.5} width={17} height={15} rx={3.5} {...s} />
          <Path d="M3.5 16l4.5-4.5 4 4 2.5-2.5 6 6" {...s} />
          <Circle cx={15.5} cy={9} r={1.5} {...s} />
        </>
      );
    case 'sparkle':
      return (
        <Path
          d="M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7zM19 16.5c.25 1.6.9 2.25 2.5 2.5-1.6.25-2.25.9-2.5 2.5-.25-1.6-.9-2.25-2.5-2.5 1.6-.25 2.25-.9 2.5-2.5z"
          {...s}
        />
      );
    case 'scale':
      return (
        <>
          <Rect x={3.5} y={4} width={17} height={16} rx={5} {...s} />
          <Path d="M8 10a4.5 4.5 0 018 0M12 10l1.5-2" {...s} />
        </>
      );
    case 'bottle':
      return <Path d="M10 3h4M10.5 3v3.5L8.5 9v10.5A1.5 1.5 0 0010 21h4a1.5 1.5 0 001.5-1.5V9l-2-2.5V3M8.5 13h7" {...s} />;
    case 'eye':
      return (
        <>
          <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" {...s} />
          <Circle cx={12} cy={12} r={2.8} fill={color} />
        </>
      );
    case 'paw':
      return (
        <>
          <Path d="M12 12.5c-2.8 0-5 2.6-5 4.6 0 1.7 1.4 2.4 2.7 2.4.9 0 1.5-.4 2.3-.4s1.4.4 2.3.4c1.3 0 2.7-.7 2.7-2.4 0-2-2.2-4.6-5-4.6z" fill={color} />
          <Circle cx={6} cy={10} r={1.8} fill={color} />
          <Circle cx={9.5} cy={6.5} r={1.8} fill={color} />
          <Circle cx={14.5} cy={6.5} r={1.8} fill={color} />
          <Circle cx={18} cy={10} r={1.8} fill={color} />
        </>
      );
    case 'sofa':
      return <Path d="M5 11V8a3 3 0 013-3h8a3 3 0 013 3v3M3.5 12.5a2 2 0 014 0V15h9v-2.5a2 2 0 014 0V18h-17zM6 18v2M18 18v2" {...s} />;
    case 'box':
      return <Path d="M4 8.5L6 5h12l2 3.5M4 8.5V18a2 2 0 002 2h12a2 2 0 002-2V8.5M4 8.5h16M9.5 12.5h5" {...s} />;
    case 'more':
      return (
        <>
          <Circle cx={6} cy={12} r={1.6} fill={color} />
          <Circle cx={12} cy={12} r={1.6} fill={color} />
          <Circle cx={18} cy={12} r={1.6} fill={color} />
        </>
      );
    case 'heart':
      return <Path d="M12 19.5s-7.5-4.4-7.5-10A4.3 4.3 0 0112 7a4.3 4.3 0 017.5 2.5c0 5.6-7.5 10-7.5 10z" {...s} />;
    case 'calendar':
      return (
        <>
          <Rect x={4} y={5.5} width={16} height={14.5} rx={3.5} {...s} />
          <Path d="M8 3.5v4M16 3.5v4M4 10.5h16" {...s} />
        </>
      );
    case 'pencil':
      return <Path d="M15.5 5.5l3 3M5 19l1-4L16 5a2.1 2.1 0 013 3L9 18z" {...s} />;
    case 'lock':
      return (
        <>
          <Rect x={5} y={10.5} width={14} height={10} rx={3} {...s} />
          <Path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" {...s} />
        </>
      );
    case 'link':
      return <Path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" {...s} />;
    case 'people':
      return (
        <>
          <Circle cx={8.5} cy={9} r={3} {...s} />
          <Circle cx={16.5} cy={9} r={3} {...s} />
          <Path d="M3 19c.6-3 2.8-4.5 5.5-4.5S13.4 16 14 19M13 14.8c1-.5 2.2-.8 3.5-.3 2 .6 3.2 2.1 3.5 4.5" {...s} />
        </>
      );
    case 'person':
      return (
        <>
          <Circle cx={12} cy={8.5} r={3.5} {...s} />
          <Path d="M5 20c.7-3.6 3.4-5.5 7-5.5s6.3 1.9 7 5.5" {...s} />
        </>
      );
  }
}
