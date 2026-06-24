"use client";

import { useState } from "react";
import Link from "next/link";

const inputClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full";

type FormState = {
  displayName: string;
  role: string;
  company: string;
  salaryUsd: string;
  city: string;
  appliedCount: string;
  story: string;
};

export function SubmitClient({ apiUrl }: { apiUrl: string }) {
  const [form, setForm] = useState<FormState>({
    displayName: "",
    role: "",
    company: "",
    salaryUsd: "",
    city: "",
    appliedCount: "",
    story: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.story.length < 50) {
      setError("Story must be at least 50 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/community/wins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          role: form.role,
          company: form.company,
          salaryUsd: form.salaryUsd ? Number(form.salaryUsd) : undefined,
          city: form.city || undefined,
          appliedCount: form.appliedCount ? Number(form.appliedCount) : undefined,
          story: form.story,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-8 text-center">
        <p className="text-lg font-semibold">Story submitted!</p>
        <p className="mt-2 text-muted-foreground">
          Your story has been submitted for review. Stories usually appear within 24 hours.
        </p>
        <Link
          href="/community/wins"
          className="mt-6 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          View success stories →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="displayName" className="text-sm font-medium">
            Your name <span className="text-red-500">*</span>
          </label>
          <input
            id="displayName"
            type="text"
            value={form.displayName}
            onChange={set("displayName")}
            placeholder="Can be a pseudonym"
            className={inputClass}
            required
            maxLength={80}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-sm font-medium">
            City <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="city"
            type="text"
            value={form.city}
            onChange={set("city")}
            placeholder="Bangalore, Pune…"
            className={inputClass}
            maxLength={100}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-sm font-medium">
            Role you landed <span className="text-red-500">*</span>
          </label>
          <input
            id="role"
            type="text"
            value={form.role}
            onChange={set("role")}
            placeholder="Senior Software Engineer"
            className={inputClass}
            required
            maxLength={100}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="company" className="text-sm font-medium">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            id="company"
            type="text"
            value={form.company}
            onChange={set("company")}
            placeholder="Stripe, Shopify…"
            className={inputClass}
            required
            maxLength={100}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="salaryUsd" className="text-sm font-medium">
            Annual salary (USD) <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="salaryUsd"
            type="number"
            min={0}
            value={form.salaryUsd}
            onChange={set("salaryUsd")}
            placeholder="60000"
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground">Helps others benchmark. Optional.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="appliedCount" className="text-sm font-medium">
            Companies applied to <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="appliedCount"
            type="number"
            min={1}
            value={form.appliedCount}
            onChange={set("appliedCount")}
            placeholder="14"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="story" className="text-sm font-medium">
          Your story <span className="text-red-500">*</span>
        </label>
        <textarea
          id="story"
          value={form.story}
          onChange={set("story")}
          placeholder="Share your journey, what strategies worked, how you prepared, and any tips for others..."
          className={`${inputClass} min-h-[160px] resize-y`}
          required
          minLength={50}
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground">
          {form.story.length}/2000 · minimum 50 characters
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Stories are reviewed before publishing. No account required.
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit story"}
      </button>
    </form>
  );
}
