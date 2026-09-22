"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { isClerkEnabled } from "@/lib/clerk-config";
import OnboardClient from "./onboard-client";

export function EmployerOnboardAuth() {
  if (!isClerkEnabled) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Employer sign-in is not configured yet. Please try again later.
      </p>
    );
  }

  return (
    <>
      <SignedIn>
        <OnboardClient />
      </SignedIn>
      <SignedOut>
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-center">
          <p className="mb-4 text-sm text-muted-foreground">Sign in to create your employer profile.</p>
          <SignInButton mode="modal">
            <button className="btn-brand rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground">
              Sign in to continue
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}
