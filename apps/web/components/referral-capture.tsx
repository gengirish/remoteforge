"use client";

import { useEffect } from "react";

export function ReferralCapture({ apiUrl }: { apiUrl: string }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("ref");
    if (!code) return;
    const stored = localStorage.getItem("rf_ref");
    if (stored === code) return;
    localStorage.setItem("rf_ref", code);
    fetch(`${apiUrl}/api/referral/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).catch(() => {});
  }, [apiUrl]);

  return null;
}
