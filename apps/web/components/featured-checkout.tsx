"use client";

import { useState } from "react";
import { getPublicApiUrl } from "@/lib/api-url";
import { Button } from "./ui/button";

interface FeaturedCheckoutProps {
  jobId: string;
  jobTitle: string;
}

export function FeaturedCheckout({ jobId, jobTitle }: FeaturedCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${getPublicApiUrl()}/api/featured/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      if (!json.success) {
        setMessage(json.error ?? "Checkout failed");
        return;
      }

      // Dodo hosts the checkout, so we hand the browser over rather than
      // opening a modal. Keep loading true: this navigates away.
      window.location.href = json.data.checkoutUrl;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Checkout error");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-sm font-medium">Feature this job — ₹4,999/mo</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Pin to top of listings. Includes Vettd screening upsell banner.
      </p>
      <Button
        type="button"
        size="sm"
        className="mt-3"
        disabled={loading}
        onClick={handleCheckout}
        aria-label={`Feature ${jobTitle} for ₹4,999 per month`}
      >
        {loading ? "Redirecting…" : "Feature this job"}
      </Button>
      {message && <p className="mt-2 text-sm text-destructive">{message}</p>}
    </div>
  );
}
