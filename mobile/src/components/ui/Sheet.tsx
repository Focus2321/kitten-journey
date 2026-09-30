import { router } from 'expo-router';
import { forwardRef, useEffect, useImperativeHandle, type ReactNode } from 'react';
import { Dimensions, Pressable as RNPressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, motion } from '@/theme/tokens';

export type SheetHandle = { close: (after?: () => void) => void };

type Props = {
  children: ReactNode;
  /** Called after the sheet has animated out. Defaults to router.back(). */
  onClosed?: () => void;
  /** Wrap content in a ScrollView (long sheets). */
  scroll?: boolean;
};

const SCREEN_H = Dimensions.get('window').height;

/**
 * Bottom sheet used by every quick-add / check-in route (presented as transparentModal).
 * Motion row 1: rises with spring 380/32, scrim 0 → 42% in 200 ms, drag past 120 px to dismiss.
 * Use a ref to close programmatically: sheetRef.current?.close(() => router.replace(...)).
 */
export const Sheet = forwardRef<SheetHandle, Props>(function Sheet({ children, onClosed, scroll }, ref) {
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

  useImperativeHandle(ref, () => ({ close }));

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((e) => {
      y.value = e.translationY > 0 ? e.translationY : e.translationY * 0.15;
    })
    .onEnd((e) => {
      if (e.translationY > motion.dismissDistance || e.velocityY > 900) runOnJS(close)();
      else y.value = withSpring(0, motion.sheet);
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  const body = (
    <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16) + 18, gap: 20 }}>{children}</View>
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrimStyle]}>
        <RNPressable style={StyleSheet.absoluteFill} onPress={() => close()} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View style={[styles.sheet, { maxHeight: SCREEN_H - insets.top - 24 }, sheetStyle]}>
        <GestureDetector gesture={pan}>
          <View style={styles.grabArea}>
            <View style={styles.grabber} />
          </View>
        </GestureDetector>
        {scroll ? <ScrollView bounces={false} showsVerticalScrollIndicator={false}>{body}</ScrollView> : body}
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
