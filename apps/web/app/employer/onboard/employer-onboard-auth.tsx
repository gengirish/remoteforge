"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { isClerkEnabled } from "@/lib/clerk-config";
import OnboardClient from "./onboard-client";

export function EmployerOnboardAuth() {
  if (!isClerkEnabled) {
    return (
      <p className="text-center text-sm text-gray-600">
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
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 text-center">
          <p className="mb-4 text-sm text-gray-700">Sign in to create your employer profile.</p>
          <SignInButton mode="modal">
            <button className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Sign in to continue
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}
