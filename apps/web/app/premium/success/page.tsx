import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to Premium | RemoteForge",
  robots: { index: false },
};

export default function PremiumSuccessPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="text-5xl">🎉</div>
      <h1 className="mt-6 text-3xl font-bold">You&apos;re now a Premium member!</h1>
      <p className="mt-3 text-muted-foreground">
        Your AI cover letters and priority job alerts are active. Your verified profile badge will
        appear on your profile within a few minutes.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/jobs"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse jobs now →
        </Link>
        <Link
          href="/profile"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
        >
          View my profile
        </Link>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Questions? Your subscription renews monthly. Cancel anytime from your profile.
      </p>
    </div>
  );
}
