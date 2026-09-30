import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

type Source = 'camera' | 'library';

async function launch(source: Source): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 };
  try {
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera is off', 'Allow camera access in Settings to take photos for the story.');
        return null;
      }
      const result = await ImagePicker.launchCameraAsync(options);
      return result.canceled ? null : (result.assets[0]?.uri ?? null);
    }
    const result = await ImagePicker.launchImageLibraryAsync(options);
    return result.canceled ? null : (result.assets[0]?.uri ?? null);
  } catch {
    Alert.alert(
      source === 'camera' ? 'Camera unavailable' : 'Photos unavailable',
      source === 'camera' ? 'This device can’t take a photo right now. Try choosing one from your library.' : 'Your photo library couldn’t be opened.',
    );
    return null;
  }
}

/**
 * Asks where the photo should come from, then opens the camera or library.
 * Resolves to the picked photo's local URI, or null if the person cancels at any step.
 */
export function pickPhoto({ title = 'Add a photo', canRemove = false }: { title?: string; canRemove?: boolean } = {}): Promise<string | null | 'remove'> {
  return new Promise((resolve) => {
    const choices: { label: string; value: Source | 'remove' }[] = [
      { label: 'Take photo', value: 'camera' },
      { label: 'Choose from library', value: 'library' },
      ...(canRemove ? [{ label: 'Remove photo', value: 'remove' as const }] : []),
    ];
    const choose = (value: Source | 'remove' | null) => {
      if (value === null) resolve(null);
      else if (value === 'remove') resolve('remove');
      else launch(value).then(resolve);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          options: [...choices.map((c) => c.label), 'Cancel'],
          cancelButtonIndex: choices.length,
          destructiveButtonIndex: canRemove ? choices.length - 1 : undefined,
        },
        (i) => choose(choices[i]?.value ?? null),
      );
      return;
    }
    Alert.alert(title, undefined, [
      ...choices.map((c) => ({ text: c.label, style: c.value === 'remove' ? ('destructive' as const) : ('default' as const), onPress: () => choose(c.value) })),
      { text: 'Cancel', style: 'cancel', onPress: () => choose(null) },
    ], { cancelable: true, onDismiss: () => choose(null) });
  });
}
