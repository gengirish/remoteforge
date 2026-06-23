"use client";

import { useState } from "react";
import { getPublicApiUrl } from "@/lib/api-url";
import { Button } from "./ui/button";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface FeaturedCheckoutProps {
  jobId: string;
  jobTitle: string;
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export function FeaturedCheckout({ jobId, jobTitle }: FeaturedCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${getPublicApiUrl()}/api/featured/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      if (!json.success) {
        setMessage(json.error ?? "Checkout failed");
        return;
      }

      await loadRazorpay();

      const { orderId, amount, keyId } = json.data;
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency: "INR",
        name: "RemoteForge",
        description: `Featured listing: ${jobTitle}`,
        order_id: orderId,
        theme: { color: "#2563eb" },
        handler: () => {
          setMessage("Payment received! Your job will be featured shortly.");
        },
      });
      rzp.open();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Checkout error");
    } finally {
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
      >
        {loading ? "Loading..." : "Pay with Razorpay"}
      </Button>
      {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
    </div>
  );
}
