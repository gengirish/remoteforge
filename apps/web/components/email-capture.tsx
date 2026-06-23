"use client";

import { useState } from "react";
import { getPublicApiUrl } from "@/lib/api-url";
import { Button } from "./ui/button";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wantsJobAlerts, setWantsJobAlerts] = useState(true);
  const [wantsGigAlerts, setWantsGigAlerts] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch(`${getPublicApiUrl()}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        phone: phone || undefined,
        wantsJobAlerts,
        wantsGigAlerts,
      }),
    });

    const json = await res.json();
    if (json.success) {
      setStatus("done");
      setMessage("You're subscribed! Check your inbox.");
    } else {
      setStatus("error");
      setMessage(json.error ?? "Something went wrong");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-muted/30 p-6"
    >
      <h3 className="text-lg font-semibold">Get job & gig alerts</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Weekly digest of remote jobs and AI gig opportunities for India.
      </p>

      <div className="mt-4 space-y-3">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
        <input
          type="tel"
          placeholder="+91 WhatsApp (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={wantsJobAlerts}
            onChange={(e) => setWantsJobAlerts(e.target.checked)}
          />
          Send me remote job alerts
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={wantsGigAlerts}
            onChange={(e) => setWantsGigAlerts(e.target.checked)}
          />
          Send me AI gig alerts
        </label>
      </div>

      <Button type="submit" className="mt-4" disabled={status === "loading"}>
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </Button>

      {message && (
        <p
          className={`mt-2 text-sm ${status === "error" ? "text-red-600" : "text-emerald-600"}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
