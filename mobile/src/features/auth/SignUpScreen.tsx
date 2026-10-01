import { useAuth, useSignUp } from '@clerk/expo';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { enter } from '@/features/pregnancy/motion';

import { AuthScreen, CodeStep, describeError, Field, fieldMessage, FooterLink, looksLikeEmail, Problem, SubmitButton } from './AuthKit';
import { leaveAuth } from './SignInScreen';

const MIN_PASSWORD = 8;

/** Email + password sign-up, then the emailed code that verifies the address. */
export function SignUpScreen() {
  const { isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const busy = fetchStatus === 'fetching';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'credentials' | 'code'>('credentials');
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [passwordHint, setPasswordHint] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isSignedIn) leaveAuth();
  }, [isSignedIn]);

  const fields = errors.fields as unknown as Record<string, { message: string; longMessage?: string } | null>;
  const emailError = emailHint ?? fieldMessage(fields, 'emailAddress');
  const passwordError = passwordHint ?? fieldMessage(fields, 'password');
  const codeError = fieldMessage(fields, 'code');

  const finish = async () => {
    const { error } = await signUp.finalize();
    if (error) setProblem(describeError(error));
  };

  const sendCode = async () => {
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      setProblem(describeError(error));
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (busy) return;
    setProblem(null);
    const trimmed = email.trim();
    let bad = false;
    if (!looksLikeEmail(trimmed)) {
      setEmailHint('That doesn’t look like an email address.');
      bad = true;
    } else setEmailHint(null);
    if (password.length < MIN_PASSWORD) {
      setPasswordHint(`Use at least ${MIN_PASSWORD} characters.`);
      bad = true;
    } else setPasswordHint(null);
    if (bad) return;

    const { error } = await signUp.password({ emailAddress: trimmed, password });
    if (error) {
      // Short or breached passwords and bad emails arrive as field errors; anything else is a one-liner.
      setProblem(fields.emailAddress || fields.password ? null : describeError(error));
      return;
    }
    if (signUp.status === 'complete') {
      await finish();
      return;
    }
    if (signUp.status === 'missing_requirements' && signUp.unverifiedFields.includes('email_address')) {
      if (!(await sendCode())) return;
      setCode('');
      setStep('code');
      return;
    }
    setProblem('We couldn’t finish creating your account. Try again in a moment.');
  };

  const verify = async () => {
    if (busy || code.length < 6) return;
    setProblem(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setProblem(fields.code ? null : describeError(error));
      return;
    }
    if (signUp.status === 'complete') await finish();
    else setProblem('That code didn’t finish the sign-up. Try sending a new one.');
  };

  const resend = async () => {
    if (busy) return;
    setProblem(null);
    if (await sendCode()) setProblem('We sent a new code.');
  };

  const changeEmail = async () => {
    await signUp.reset();
    setCode('');
    setProblem(null);
    setStep('credentials');
  };

  if (step === 'code') {
    return (
      <AuthScreen title="Check your email" subtitle="Enter the code to confirm it’s really you." footer={<SubmitButton label="Confirm" busyLabel="Checking…" busy={busy} disabled={code.length < 6} onPress={verify} />}>
        <CodeStep email={email.trim()} code={code} onCode={setCode} error={codeError} busy={busy} onVerify={verify} onResend={resend} onChangeEmail={changeEmail} />
        <Problem message={problem} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Keep her story safe"
      subtitle="An account saves every weigh-in, photo and first — on any phone."
      footer={
        <View style={{ gap: 14, paddingBottom: 6 }}>
          <SubmitButton label="Create account" busyLabel="Creating…" busy={busy} disabled={!email.trim() || !password} onPress={submit} />
          <FooterLink prompt="Already have an account?" action="Sign in" onPress={() => router.replace('/auth/sign-in')} />
        </View>
      }>
      <Animated.View entering={enter(2)}>
        <Field
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setEmailHint(null);
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          autoFocus
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={emailError}
        />
      </Animated.View>
      <Animated.View entering={enter(3)} style={{ gap: 6 }}>
        <Field
          label="Password"
          inputRef={passwordRef}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setPasswordHint(null);
          }}
          placeholder="At least 8 characters"
          secure
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
          error={passwordError}
        />
        {!passwordError && (
          <Text variant="caption" style={{ paddingHorizontal: 4 }}>
            {MIN_PASSWORD}+ characters. We check it against known leaks, so pick something you don’t use elsewhere.
          </Text>
        )}
      </Animated.View>
      <Problem message={problem} />
    </AuthScreen>
  );
}
