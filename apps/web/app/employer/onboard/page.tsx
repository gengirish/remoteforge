import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import OnboardClient from "./onboard-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer Onboarding | RemoteForge",
  robots: { index: false },
};

export default function EmployerOnboardPage() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Create your employer profile</h1>
        <p className="mb-8 text-sm text-gray-500">
          Takes 60 seconds. Post your first job free.
        </p>
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
      </div>
    </main>
  );
}
