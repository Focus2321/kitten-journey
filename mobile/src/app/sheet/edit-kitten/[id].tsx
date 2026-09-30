import { useLocalSearchParams } from 'expo-router';

import { KittenEditSheet } from '@/features/kitten/KittenEditSheet';

/** /sheet/edit-kitten/<id> — correct a kitten's name, sex, coat and birth details from their profile. */
export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <KittenEditSheet id={Array.isArray(id) ? id[0] : (id ?? '')} />;
}
