"use client";

import { useState } from "react";
import type { ReferralData } from "@/lib/data";

const STATUS_LABELS: Record<string, string> = {
  clicked: "Link opened",
  signed_up: "Signed up",
  converted: "₹500 earned ✓",
};

const STATUS_COLORS: Record<string, string> = {
  clicked: "bg-gray-100 text-gray-600",
  signed_up: "bg-blue-100 text-blue-800",
  converted: "bg-green-100 text-green-800",
};

export function ReferClient({ data }: { data: ReferralData | null }) {
  const [copied, setCopied] = useState(false);

  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <p className="text-muted-foreground">
          Complete your profile first to get your referral link.
        </p>
        <a href="/profile" className="mt-4 inline-block text-primary hover:underline">
          Go to profile →
        </a>
      </div>
    );
  }

  function copy() {
    navigator.clipboard.writeText(data!.shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const balanceRupees = Math.floor(data.wallet.balancePaise / 100);
  const totalRupees = Math.floor(data.wallet.totalEarnedPaise / 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Refer &amp; Earn</h1>
      <p className="mt-2 text-muted-foreground">
        Share your link. Earn <strong>₹500</strong> for every friend who applies
        to their first remote job via RemoteForge.
      </p>

      <div className="mt-8 flex items-center gap-2">
        <input
          readOnly
          value={data.shareUrl}
          className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono"
        />
        <button
          onClick={copy}
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold">{data.clickCount}</p>
          <p className="text-sm text-muted-foreground">Link opens</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold">{data.signupCount}</p>
          <p className="text-sm text-muted-foreground">Sign-ups</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            ₹{balanceRupees.toLocaleString("en-IN")}
          </p>
          <p className="text-sm text-muted-foreground">Wallet balance</p>
        </div>
      </div>

      {totalRupees > 0 && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          ₹{totalRupees.toLocaleString("en-IN")} earned all time
        </p>
      )}

      <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
        <h2 className="font-semibold">How it works</h2>
        <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>1. Share your link with friends looking for remote work</li>
          <li>2. They sign up and complete their profile</li>
          <li>
            3. When they apply to their first job →{" "}
            <strong className="text-foreground">you earn ₹500</strong>
          </li>
        </ol>
      </div>

      {data.referrals.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Your referrals</h2>
          <div className="mt-3 divide-y divide-border rounded-xl border border-border">
            {data.referrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("en-IN")}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
