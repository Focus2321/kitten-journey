import { router } from 'expo-router';
import { forwardRef, useEffect, useImperativeHandle, type ReactNode } from 'react';
import { Dimensions, Platform, Pressable as RNPressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, motion } from '@/theme/tokens';

export type SheetHandle = { close: (after?: () => void) => void };

type Props = {
  children: ReactNode;
  /** Called after the sheet has animated out. Defaults to router.back(). */
  onClosed?: () => void;
  /**
   * Called when the person taps the scrim, drags the sheet down or taps a Close button wired to
   * `close()`. Return false to keep the sheet open (e.g. to confirm discarding a draft first).
   */
  onRequestClose?: () => boolean;
};

const SCREEN_H = Dimensions.get('window').height;

/**
 * Bottom sheet used by every quick-add / check-in route (presented as transparentModal).
 * Motion row 1: rises with spring 380/32, scrim 0 → 42% in 200 ms, drag past 120 px to dismiss.
 * Use a ref to close programmatically: sheetRef.current?.close(() => router.replace(...)).
 *
 * Content always scrolls. With the keyboard up, a spacer grows under the content so the sheet
 * rises above the keyboard (up to its max height) and the focused field is scrolled into view.
 */
export const Sheet = forwardRef<SheetHandle, Props>(function Sheet({ children, onClosed, onRequestClose }, ref) {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(SCREEN_H);
  const scrim = useSharedValue(0);

  useEffect(() => {
    y.set(withSpring(0, motion.sheet));
    scrim.set(withTiming(1, motion.scrimIn));
  }, [y, scrim]);

  const finish = (after?: () => void) => {
    if (after) after();
    else if (onClosed) onClosed();
    else if (router.canGoBack()) router.back();
  };

  const close = (after?: () => void) => {
    scrim.set(withTiming(0, { duration: 180 }));
    y.set(
      withTiming(SCREEN_H * 0.7, { duration: 220 }, (done) => {
        if (done) runOnJS(finish)(after);
      }),
    );
  };

  /** Dismissals the person started — these can be vetoed by `onRequestClose`. */
  const requestClose = () => {
    if (onRequestClose && !onRequestClose()) {
      y.set(withSpring(0, motion.sheet));
      return;
    }
    close();
  };

  useImperativeHandle(ref, () => ({ close }));

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((e) => {
      y.value = e.translationY > 0 ? e.translationY : e.translationY * 0.15;
    })
    .onEnd((e) => {
      if (e.translationY > motion.dismissDistance || e.velocityY > 900) runOnJS(requestClose)();
      else y.value = withSpring(0, motion.sheet);
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  const bottomPad = Math.max(insets.bottom, 16) + 18;

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrimStyle]} importantForAccessibility="no-hide-descendants">
        <RNPressable style={StyleSheet.absoluteFill} onPress={requestClose} accessible={false} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { maxHeight: SCREEN_H - insets.top - 24 }, sheetStyle]} accessibilityViewIsModal>
        <GestureDetector gesture={pan}>
          <View style={styles.grabArea}>
            <View style={styles.grabber} />
          </View>
        </GestureDetector>
        <KeyboardAwareScrollView
          mode="layout"
          bottomOffset={24}
          // The content already ends with safe-area padding, which the keyboard covers anyway.
          extraKeyboardSpace={16 - bottomPad}
          style={{ flexShrink: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}>
          <View style={{ paddingHorizontal: 20, paddingBottom: bottomPad, gap: 20 }}>{children}</View>
        </KeyboardAwareScrollView>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.ground,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  grabArea: { alignItems: 'center', paddingTop: 10, paddingBottom: 14 },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.line },
});
