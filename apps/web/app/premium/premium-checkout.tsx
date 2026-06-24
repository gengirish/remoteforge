"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export function PremiumCheckout() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  async function handleCheckout() {
    if (!userId) {
      window.location.href = "/sign-in";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/premium/checkout`, {
        method: "POST",
        headers: { "X-Clerk-User-Id": userId },
      });
      const data = (await res.json()) as {
        data: { orderId: string; amount: number; keyId: string };
      };
      const { orderId, amount, keyId } = data.data;

      const rzp = new (window as unknown as { Razorpay: new (opts: Record<string, unknown>) => { open: () => void } }).Razorpay({
        key: keyId,
        amount,
        currency: "INR",
        name: "RemoteForge Premium",
        description: "1 month premium access",
        order_id: orderId,
        handler: () => {
          window.location.href = "/premium/success";
        },
        prefill: {},
        theme: { color: "#6366f1" },
      });
      rzp.open();
    } catch {
      // Razorpay error — user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      {loading ? "Loading…" : "Get Premium — ₹499/month"}
    </button>
  );
}
