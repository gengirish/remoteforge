"use client";

import { useState } from "react";

const TASK_TYPES = ["rlhf", "annotation", "code-review", "translation", "survey", "other"];
const HOURS_OPTIONS = [5, 10, 20, 40];

export function GigEarningsForm({
  platformId,
  apiUrl,
}: {
  platformId: string;
  apiUrl: string;
}) {
  const [form, setForm] = useState({
    taskType: "rlhf",
    hoursPerWeek: "10",
    earningsUsdMonth: "",
    city: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch(`${apiUrl}/api/gigs/earnings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformId,
          taskType: form.taskType,
          hoursPerWeek: Number(form.hoursPerWeek),
          earningsUsdMonth: Number(form.earningsUsdMonth),
          city: form.city || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/15 p-4 text-sm text-green-800 dark:text-green-300">
        Thanks! Your earnings report helps other Indian freelancers benchmark their income.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border p-5">
      <h3 className="font-semibold">Share your real earnings (anonymous)</h3>
      <p className="text-sm text-muted-foreground">
        Help the community know what this platform actually pays in India.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Task type</label>
          <select
            value={form.taskType}
            onChange={(e) => setForm((f) => ({ ...f, taskType: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Hours per week</label>
          <select
            value={form.hoursPerWeek}
            onChange={(e) => setForm((f) => ({ ...f, hoursPerWeek: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {HOURS_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h} hrs/week
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Monthly earnings (USD)</label>
          <input
            type="number"
            required
            min={1}
            max={50000}
            value={form.earningsUsdMonth}
            onChange={(e) => setForm((f) => ({ ...f, earningsUsdMonth: e.target.value }))}
            placeholder="e.g. 800"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">City (optional)</label>
          <input
            type="text"
            maxLength={100}
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="Bangalore, Pune…"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500">Submission failed. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting…" : "Submit anonymously"}
      </button>
    </form>
  );
}
