"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { isClerkEnabled } from "@/lib/clerk-config";
import { getPublicApiUrl } from "@/lib/api-url";

export function PremiumCheckout() {
  if (!isClerkEnabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Premium checkout requires sign-in, which is not configured yet.
      </p>
    );
  }

  return <PremiumCheckoutInner />;
}

function PremiumCheckoutInner() {
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const apiUrl = getPublicApiUrl();

  async function handleCheckout() {
    if (!userId) {
      window.location.href = "/sign-in";
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/premium/checkout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      const json = (await res.json()) as
        | { success: true; data: { checkoutUrl: string } }
        | { success: false; error: string };

      if (!json.success) {
        setError(json.error ?? "Checkout is unavailable right now.");
        setLoading(false);
        return;
      }

      // Dodo's hosted checkout collects payment and returns the customer to
      // /premium/success; the entitlement itself is granted by the webhook.
      window.location.href = json.data.checkoutUrl;
    } catch {
      setError("Could not reach checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Redirecting…" : "Get Premium — ₹499/month"}
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
