"use client";

import { Bell } from "lucide-react";
import { useId, useState } from "react";
import { getPublicApiUrl } from "@/lib/api-url";
import { Button } from "./ui/button";

interface EmailCaptureProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  source?: string;
  /** Per-platform intent, e.g. "approval-alert:mercor". Must match the API's signal regex. */
  signal?: string;
  defaultJobAlerts?: boolean;
  defaultGigAlerts?: boolean;
  /** "compact" = one row (email + button + status), no phone or preference checkboxes. */
  variant?: "full" | "compact";
}

export function EmailCapture({
  title = "Never miss an opportunity",
  description = "Get a weekly digest of remote jobs and AI gig platforms open to India — curated, not spammy.",
  submitLabel = "Subscribe for free",
  source = "web",
  signal,
  defaultJobAlerts = true,
  defaultGigAlerts = false,
  variant = "full",
}: EmailCaptureProps = {}) {
  const idBase = useId();
  const emailId = `${idBase}-email`;
  const phoneId = `${idBase}-phone`;
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
          signal,
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

  const buttonLabel =
    status === "loading" ? "Subscribing..." : status === "done" ? "Subscribed!" : submitLabel;

  const statusMessage = message && (
    <p
      role="status"
      className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-emerald-600"}`}
    >
      {message}
    </p>
  );

  if (variant === "compact") {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="inline-flex shrink-0 rounded-full bg-primary/10 p-2 text-primary">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor={emailId} className="sr-only">
              Email address
            </label>
            <input
              id={emailId}
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field flex-1"
            />
            <Button
              type="submit"
              className="shrink-0"
              disabled={status === "loading" || status === "done"}
            >
              {buttonLabel}
            </Button>
          </div>
          {statusMessage}
        </form>
      </section>
    );
  }

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
              <label htmlFor={emailId} className="text-sm font-medium">
                Email address
              </label>
              <input
                id={emailId}
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label htmlFor={phoneId} className="text-sm font-medium">
                WhatsApp <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id={phoneId}
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
            {buttonLabel}
          </Button>

          {statusMessage}
        </form>
      </div>
    </section>
  );
}
