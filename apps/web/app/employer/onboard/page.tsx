import { EmployerOnboardAuth } from "./employer-onboard-auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer Onboarding | RemoteForge",
  robots: { index: false },
};

export default function EmployerOnboardPage() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-muted/50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Create your employer profile</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Takes 60 seconds. Post your first job free.
        </p>
        <EmployerOnboardAuth />
      </div>
    </main>
  );
}
