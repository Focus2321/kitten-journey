import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, IconButton, IconButtonSpacer, Screen, Text, TopBar } from '@/components/ui';
import { colors } from '@/theme/tokens';

/** Friendly empty state for an unknown kitten id (both handoff screens). */
export function NotFound() {
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <Screen header={<TopBar left={<IconButton icon="close" label="Close" onPress={back} />} right={<IconButtonSpacer />} />}>
      <View style={{ paddingTop: 48, gap: 12 }}>
        <Text variant="label">Story</Text>
        <Text variant="headline">We couldn’t find that kitten.</Text>
        <Text variant="body" color={colors.muted}>
          The link may be old, or the story hasn’t been made yet. Nothing is lost.
        </Text>
        <View style={{ paddingTop: 16 }}>
          <Button label="Go back" variant="surface" size="md" full={false} onPress={back} />
        </View>
      </View>
    </Screen>
  );
}
