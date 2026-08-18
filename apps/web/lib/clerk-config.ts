const rawClerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

/** Inlined at build time for client bundles — trim to avoid whitespace-only keys. */
export const clerkPublishableKey = rawClerkPublishableKey.trim();

/** True when a real Clerk publishable key was present at build time. */
export const isClerkEnabled = clerkPublishableKey.length > 0;
