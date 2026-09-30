import { Redirect } from 'expo-router';

import { useStore } from '@/data/store';
import { HomeLitter } from '@/features/litter/HomeLitter';
import { HomeExpecting } from '@/features/pregnancy/HomeExpecting';

/** Today tab: the home changes with the journey phase. */
export default function Today() {
  const phase = useStore((s) => s.phase);
  if (phase === 'new') return <Redirect href="/welcome" />;
  if (phase === 'expecting') return <HomeExpecting />;
  return <HomeLitter />;
}
