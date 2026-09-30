import { useLocalSearchParams } from 'expo-router';

import { KittenDaySheet } from '@/features/kitten/KittenDaySheet';

/** Screen 16 — /sheet/kitten-day/<id>, where id is a kitten, 'litter' or 'mother'. */
export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <KittenDaySheet id={Array.isArray(id) ? id[0] : (id ?? 'litter')} />;
}
