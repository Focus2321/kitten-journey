import { ConvexReactClient } from 'convex/react';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
/** Clerk's publishable key for `<ClerkProvider>`. */
export const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

// Both come from `.env.local` (see docs/backend.md). Missing values are a setup bug — say so before anything else loads.
if (__DEV__ && (!convexUrl || !clerkPublishableKey)) {
  throw new Error('Missing EXPO_PUBLIC_CONVEX_URL or EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — copy them into mobile/.env.local and restart Metro.');
}

/** The one Convex client; `<ConvexProviderWithClerk>` feeds it Clerk's `convex` JWT. */
export const convex = new ConvexReactClient(convexUrl ?? '', { unsavedChangesWarning: false });
