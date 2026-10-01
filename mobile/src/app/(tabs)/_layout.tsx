import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { Gated } from '@/features/auth/Gate';
import { colors } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <Gated>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        // Keep the three tabs attached: a detached scene re-attached mid-fade after the birth flow came back blank.
        detachInactiveScreens={false}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.ground }, animation: 'fade' }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="family" />
        <Tabs.Screen name="story" />
      </Tabs>
    </Gated>
  );
}
