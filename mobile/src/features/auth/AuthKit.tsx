import { isClerkRuntimeError } from '@clerk/expo';
import { useState, type ReactNode, type RefObject } from 'react';
import { ActivityIndicator, TextInput, View, type TextInputProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, Pressable, Screen, Text } from '@/components/ui';
import { enter } from '@/features/pregnancy/motion';
import { colors, fonts, gutter, radius } from '@/theme/tokens';

/** Shared pieces for the sign-in / sign-up screens so both read as one app. */

type ClerkishError = { code?: string; message: string; longMessage?: string } | null | undefined;

/** A sentence for an error that isn't tied to a field — network trouble gets friendlier copy than Clerk's. */
export function describeError(error: ClerkishError): string | null {
  if (!error) return null;
  const code = error.code ?? '';
  if (isClerkRuntimeError(error) && (code.includes('network') || code.includes('offline'))) return 'Looks like you’re offline. Check your connection and try again.';
  if (code === 'network_error' || /network request failed/i.test(error.message)) return 'Looks like you’re offline. Check your connection and try again.';
  return error.longMessage ?? error.message;
}

/** The `fields` map from a Clerk hook — we only read `message`. */
export type FieldErrors = Record<string, { message: string; longMessage?: string } | null | undefined>;

export const fieldMessage = (fields: FieldErrors, ...names: string[]) => {
  for (const n of names) {
    const e = fields[n];
    if (e) return e.longMessage ?? e.message;
  }
  return null;
};

export const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

/** Sign-in / sign-up chrome: brand row, big headline, body, then the form; footer pinned above the keyboard. */
export function AuthScreen({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Screen keyboardShouldPersistTaps="handled" footer={footer} contentStyle={{ paddingTop: Math.max(8, 20 - insets.top / 4) }}>
      <Animated.View entering={enter(0)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.sun }} />
        <Text variant="bodyStrong" weight={700} style={{ fontSize: 17, letterSpacing: -0.34 }}>
          kitten journey
        </Text>
      </Animated.View>
      <Animated.View entering={enter(1)} style={{ paddingTop: 28, gap: 8 }}>
        <Text variant="headline" style={{ fontSize: 38, lineHeight: 40 }}>
          {title}
        </Text>
        <Text variant="body" color={colors.muted}>
          {subtitle}
        </Text>
      </Animated.View>
      <View style={{ paddingTop: 24, gap: 10 }}>{children}</View>
    </Screen>
  );
}

type FieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string | null;
  inputRef?: RefObject<TextInput | null>;
  /** Password fields get a show/hide toggle. */
  secure?: boolean;
};

/** Surface-tinted field with a small label; turns orange and shows the message when invalid. */
export function Field({ label, error, inputRef, secure, ...input }: FieldProps) {
  const [shown, setShown] = useState(false);
  const invalid = !!error;
  return (
    <View style={{ gap: 6 }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          paddingLeft: 16,
          paddingRight: secure ? 8 : 16,
          paddingVertical: 10,
          borderWidth: 1.5,
          borderColor: invalid ? colors.orange : 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="caption" weight={600} color={invalid ? colors.orange : undefined} style={{ fontSize: 11, lineHeight: 13 }}>
            {label}
          </Text>
          <TextInput
            ref={inputRef}
            placeholderTextColor={colors.dashed}
            cursorColor={colors.sun}
            selectionColor={colors.sun}
            autoCorrect={false}
            secureTextEntry={secure && !shown}
            accessibilityLabel={label}
            aria-invalid={invalid}
            style={{ fontFamily: fonts[600], fontSize: 17, lineHeight: 22, color: colors.ink, padding: 0 }}
            {...input}
          />
        </View>
        {secure && (
          <Pressable
            onPress={() => setShown((v) => !v)}
            haptics="selection"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={shown ? 'Hide password' : 'Show password'}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: shown ? colors.ground : 'transparent' }}>
            <Icon name="eye" size={20} color={shown ? colors.ink : colors.muted} />
          </Pressable>
        )}
      </View>
      {error && (
        <Text variant="small" color={colors.orange} style={{ paddingHorizontal: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

/** Non-field problem (wrong details, offline, server hiccup). Warm, one line, never clears the form. */
export function Problem({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View accessibilityLiveRegion="polite" style={{ backgroundColor: colors.pawSoft, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12 }}>
      <Text variant="small" weight={600}>
        {message}
      </Text>
    </View>
  );
}

/** Primary action that shows progress and locks while Clerk is working. */
export function SubmitButton({ label, busyLabel, busy, disabled, onPress }: { label: string; busyLabel: string; busy: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Button
      label={busy ? busyLabel : label}
      iconRight={busy ? undefined : 'arrow-right'}
      leading={busy ? <ActivityIndicator size="small" color={colors.ground} /> : undefined}
      variant="ink"
      onPress={onPress}
      disabled={busy || disabled}
    />
  );
}

/** Footer link: "Already have an account? Sign in". */
export function FooterLink({ prompt, action, onPress }: { prompt: string; action: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} haptics="none" hitSlop={12} accessibilityRole="link" accessibilityLabel={action} style={{ alignItems: 'center', paddingHorizontal: gutter }}>
      <Text variant="small" color={colors.muted} align="center">
        {prompt} <Text variant="smallStrong">{action}</Text>
      </Text>
    </Pressable>
  );
}

/** The six-digit email code step, shared by sign-up verification and sign-in device checks. */
export function CodeStep({
  email,
  code,
  onCode,
  error,
  busy,
  onVerify,
  onResend,
  onChangeEmail,
}: {
  email: string;
  code: string;
  onCode: (code: string) => void;
  error: string | null;
  busy: boolean;
  onVerify: () => void;
  onResend: () => void;
  onChangeEmail: () => void;
}) {
  return (
    <>
      <Animated.View entering={enter(2)}>
        <Field
          label="Code"
          value={code}
          onChangeText={(t) => onCode(t.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={onVerify}
          error={error}
        />
      </Animated.View>
      <Animated.View entering={enter(3)} style={{ paddingTop: 6, gap: 14 }}>
        <Text variant="small" color={colors.muted}>
          We sent it to <Text variant="smallStrong">{email}</Text>. It can take a minute to arrive.
        </Text>
        <View style={{ flexDirection: 'row', gap: 18 }}>
          <Pressable onPress={onResend} disabled={busy} haptics="none" hitSlop={8} accessibilityRole="button" accessibilityLabel="Resend code">
            <Text variant="smallStrong" color={busy ? colors.muted : colors.ink}>
              Resend code
            </Text>
          </Pressable>
          <Pressable onPress={onChangeEmail} disabled={busy} haptics="none" hitSlop={8} accessibilityRole="button" accessibilityLabel="Use a different email">
            <Text variant="smallStrong" color={busy ? colors.muted : colors.ink}>
              Use a different email
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
}
