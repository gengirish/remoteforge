"use client";

import { Bell } from "lucide-react";
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
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid lg:grid-cols-5">
        <div className="relative bg-primary px-8 py-10 text-primary-foreground lg:col-span-2">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative">
            <div className="inline-flex rounded-full bg-white/15 p-2.5">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Never miss an opportunity</h2>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
              Get a weekly digest of remote jobs and AI gig platforms open to
              India — curated, not spammy.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-10 lg:col-span-3">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium">
                WhatsApp <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+91 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field mt-1.5"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Alert preferences</legend>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50">
                <input
                  type="checkbox"
                  checked={wantsJobAlerts}
                  onChange={(e) => setWantsJobAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Remote job alerts
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50">
                <input
                  type="checkbox"
                  checked={wantsGigAlerts}
                  onChange={(e) => setWantsGigAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                AI gig platform alerts
              </label>
            </fieldset>
          </div>

          <Button
            type="submit"
            className="mt-6 w-full sm:w-auto"
            disabled={status === "loading" || status === "done"}
          >
            {status === "loading"
              ? "Subscribing..."
              : status === "done"
                ? "Subscribed!"
                : "Subscribe for free"}
          </Button>

          {message && (
            <p
              role="status"
              className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-emerald-600"}`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
