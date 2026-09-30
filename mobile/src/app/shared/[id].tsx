import { useLocalSearchParams } from 'expo-router';

import { SharedStoryScreen } from '@/features/handoff/SharedStoryScreen';
import { decodeInclude } from '@/features/handoff/story';

/** Screen 19 — the story as the new family sees it (modal). `include` mirrors the owner's choices. */
export default function Screen() {
  const { id, include } = useLocalSearchParams<{ id: string; include?: string }>();
  return <SharedStoryScreen id={id} include={decodeInclude(include)} />;
}
