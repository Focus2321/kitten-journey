import { Alert } from 'react-native';

/** "Discard this …?" — keeps the draft unless the person explicitly throws it away. */
export function confirmDiscard(title: string, onDiscard: () => void) {
  Alert.alert(title, 'What you’ve entered hasn’t been saved.', [
    { text: 'Keep editing', style: 'cancel' },
    { text: 'Discard', style: 'destructive', onPress: onDiscard },
  ]);
}
