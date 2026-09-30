import { useLocalSearchParams } from 'expo-router';

import { KittenProfile } from '@/features/kitten/KittenProfile';

/** Screen 15 — /kitten/<id>. Sibling switching updates `id` in place via router.setParams. */
export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <KittenProfile id={Array.isArray(id) ? id[0] : (id ?? '')} />;
}
