import { useAuth, useSignIn } from '@clerk/expo';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { enter } from '@/features/pregnancy/motion';

import { AuthScreen, CodeStep, describeError, Field, fieldMessage, FooterLink, looksLikeEmail, Problem, SubmitButton } from './AuthKit';

/** Signed in from anywhere: leave the auth screens for the home. */
export function leaveAuth() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/');
}

/** Email + password sign-in. New devices (or MFA) get a one-time email code before the session is finalised. */
export function SignInScreen() {
  const { isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const busy = fetchStatus === 'fetching';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'credentials' | 'code'>('credentials');
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isSignedIn) leaveAuth();
  }, [isSignedIn]);

  // Clerk's field errors come back on `identifier` for the email; anything else is a one-line problem.
  const fields = errors.fields as unknown as Record<string, { message: string; longMessage?: string } | null>;
  const emailError = emailHint ?? fieldMessage(fields, 'identifier', 'emailAddress');
  const passwordError = fieldMessage(fields, 'password');
  const codeError = fieldMessage(fields, 'code');

  const finish = async () => {
    const { error } = await signIn.finalize();
    if (error) setProblem(describeError(error));
  };

  const submit = async () => {
    if (busy) return;
    setProblem(null);
    const trimmed = email.trim();
    if (!looksLikeEmail(trimmed)) {
      setEmailHint('That doesn’t look like an email address.');
      return;
    }
    setEmailHint(null);
    if (!password) {
      passwordRef.current?.focus();
      return;
    }
    const { error } = await signIn.password({ emailAddress: trimmed, password });
    if (error) {
      // Field errors render inline; this catches wrong-details-without-a-field, offline and server trouble.
      setProblem(fields.identifier || fields.password ? null : describeError(error));
      return;
    }
    if (signIn.status === 'complete') {
      await finish();
      return;
    }
    if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
      // A device we haven't seen (or MFA): confirm with a code sent to the email on the account.
      const sent = await signIn.mfa.sendEmailCode();
      if (sent.error) {
        setProblem(describeError(sent.error));
        return;
      }
      setCode('');
      setStep('code');
      return;
    }
    setProblem('We couldn’t finish signing you in. Try again in a moment.');
  };

  const verify = async () => {
    if (busy || code.length < 6) return;
    setProblem(null);
    const { error } = await signIn.mfa.verifyEmailCode({ code });
    if (error) {
      setProblem(fields.code ? null : describeError(error));
      return;
    }
    if (signIn.status === 'complete') await finish();
    else setProblem('That code didn’t finish the sign-in. Try sending a new one.');
  };

  const resend = async () => {
    if (busy) return;
    setProblem(null);
    const { error } = await signIn.mfa.sendEmailCode();
    setProblem(error ? describeError(error) : 'We sent a new code.');
  };

  const changeEmail = async () => {
    await signIn.reset();
    setCode('');
    setProblem(null);
    setStep('credentials');
  };

  if (step === 'code') {
    return (
      <AuthScreen title="Check your email" subtitle="A quick code keeps your family’s story yours." footer={<SubmitButton label="Confirm" busyLabel="Checking…" busy={busy} disabled={code.length < 6} onPress={verify} />}>
        <CodeStep email={email.trim()} code={code} onCode={setCode} error={codeError} busy={busy} onVerify={verify} onResend={resend} onChangeEmail={changeEmail} />
        <Problem message={problem} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to pick up where her story left off."
      footer={
        <View style={{ gap: 14, paddingBottom: 6 }}>
          <SubmitButton label="Sign in" busyLabel="Signing in…" busy={busy} disabled={!email.trim() || !password} onPress={submit} />
          <FooterLink prompt="New here?" action="Create an account" onPress={() => router.replace('/auth/sign-up')} />
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
      <Animated.View entering={enter(3)}>
        <Field
          label="Password"
          inputRef={passwordRef}
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secure
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          error={passwordError}
        />
      </Animated.View>
      <Problem message={problem} />
      <Animated.View entering={enter(4)} style={{ paddingTop: 10 }}>
        <FooterLink prompt="Just looking?" action="Explore the demo without an account" onPress={() => router.push({ pathname: '/demo', params: { from: 'auth' } })} />
      </Animated.View>
    </AuthScreen>
  );
}
