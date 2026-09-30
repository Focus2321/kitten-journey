import { useLocalSearchParams } from 'expo-router';

import { ShareStoryScreen } from '@/features/handoff/ShareStoryScreen';

/** Screen 18 — choose what travels with the kitten, then create the link. */
export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ShareStoryScreen id={id} />;
}
