"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { getPublicApiUrl } from "@/lib/api-url";
import { Button } from "./ui/button";

interface EmailCaptureProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  source?: string;
  defaultJobAlerts?: boolean;
  defaultGigAlerts?: boolean;
}

export function EmailCapture({
  title = "Never miss an opportunity",
  description = "Get a weekly digest of remote jobs and AI gig platforms open to India — curated, not spammy.",
  submitLabel = "Subscribe for free",
  source = "web",
  defaultJobAlerts = true,
  defaultGigAlerts = false,
}: EmailCaptureProps = {}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wantsJobAlerts, setWantsJobAlerts] = useState(defaultJobAlerts);
  const [wantsGigAlerts, setWantsGigAlerts] = useState(defaultGigAlerts);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // The API expects E.164 (+919876543210); people type "+91 98765 43210".
    const normalizedPhone = phone.replace(/[\s()-]/g, "");

    let json: { success?: boolean; error?: string } = {};
    try {
      const res = await fetch(`${getPublicApiUrl()}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone: normalizedPhone || undefined,
          wantsJobAlerts,
          wantsGigAlerts,
          source,
        }),
      });
      json = await res.json();
    } catch {
      json = { success: false, error: "Couldn't reach the server. Please try again." };
    }

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
            <h2 className="mt-4 text-2xl font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
              {description}
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
                : submitLabel}
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
