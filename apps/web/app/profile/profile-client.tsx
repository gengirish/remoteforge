"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getPublicApiUrl } from "@/lib/api-url";

type Job = {
  id: string;
  slug: string;
  title: string;
  company: string;
  salaryMin: number | null;
  salaryMax: number | null;
};

type ProfileForm = {
  displayName: string;
  city: string;
  skills: string;
  targetSalaryMin: string;
  targetSalaryMax: string;
  yearsExperience: string;
};

export function ProfileClient() {
  const { user, isLoaded } = useUser();
  const { getToken, userId } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    displayName: "",
    city: "",
    skills: "",
    targetSalaryMin: "",
    targetSalaryMax: "",
    yearsExperience: "",
  });
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const apiBase = getPublicApiUrl();

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    const res = await fetch(`${apiBase}/api/user/profile`, {
      headers: { "X-Clerk-User-Id": userId },
    });
    if (res.ok) {
      const json = await res.json();
      const p = json.data;
      setForm({
        displayName: p.displayName ?? "",
        city: p.city ?? "",
        skills: (p.skills ?? []).join(", "),
        targetSalaryMin: p.targetSalaryMin?.toString() ?? "",
        targetSalaryMax: p.targetSalaryMax?.toString() ?? "",
        yearsExperience: p.yearsExperience?.toString() ?? "",
      });
    }
  }, [userId, apiBase]);

  const fetchSavedJobs = useCallback(async () => {
    if (!userId) return;
    const res = await fetch(`${apiBase}/api/user/saved-jobs`, {
      headers: { "X-Clerk-User-Id": userId },
    });
    if (res.ok) {
      const json = await res.json();
      setSavedJobs(json.data?.jobs ?? []);
    }
  }, [userId, apiBase]);

  useEffect(() => {
    if (isLoaded && userId) {
      void fetchProfile();
      void fetchSavedJobs();
    }
  }, [isLoaded, userId, fetchProfile, fetchSavedJobs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !user) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/user/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Clerk-User-Id": userId },
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress ?? "",
          displayName: form.displayName || undefined,
          city: form.city || undefined,
          skills: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          targetSalaryMin: form.targetSalaryMin ? Number(form.targetSalaryMin) : undefined,
          targetSalaryMax: form.targetSalaryMax ? Number(form.targetSalaryMax) : undefined,
          yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnsave(jobId: string) {
    if (!userId) return;
    await fetch(`${apiBase}/api/user/saved-jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Clerk-User-Id": userId },
      body: JSON.stringify({ jobId }),
    });
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
  }

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Signed in as {user?.primaryEmailAddress?.emailAddress}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Display name" htmlFor="displayName">
            <input
              id="displayName"
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              placeholder="Your name"
              className={inputClass}
            />
          </Field>
          <Field label="City / Location" htmlFor="city">
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Bangalore, Mumbai…"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Skills (comma-separated)" htmlFor="skills">
          <input
            id="skills"
            type="text"
            value={form.skills}
            onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
            placeholder="Python, React, Data Analysis…"
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Min target salary (USD/yr)" htmlFor="salaryMin">
            <input
              id="salaryMin"
              type="number"
              value={form.targetSalaryMin}
              onChange={(e) => setForm((f) => ({ ...f, targetSalaryMin: e.target.value }))}
              placeholder="30000"
              className={inputClass}
            />
          </Field>
          <Field label="Max target salary (USD/yr)" htmlFor="salaryMax">
            <input
              id="salaryMax"
              type="number"
              value={form.targetSalaryMax}
              onChange={(e) => setForm((f) => ({ ...f, targetSalaryMax: e.target.value }))}
              placeholder="80000"
              className={inputClass}
            />
          </Field>
          <Field label="Years of experience" htmlFor="yoe">
            <input
              id="yoe"
              type="number"
              value={form.yearsExperience}
              onChange={(e) => setForm((f) => ({ ...f, yearsExperience: e.target.value }))}
              placeholder="3"
              min={0}
              max={50}
              className={inputClass}
            />
          </Field>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved!" : "Save profile"}
        </button>
      </form>

      {savedJobs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Saved Jobs</h2>
          <ul className="mt-4 divide-y divide-border">
            {savedJobs.map((job) => (
              <li key={job.id} className="flex items-center justify-between py-3">
                <div>
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleUnsave(job.id)}
                  className="ml-4 text-xs text-muted-foreground hover:text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {savedJobs.length === 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Saved Jobs</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No saved jobs yet.{" "}
            <Link href="/jobs" className="text-primary hover:underline">
              Browse remote jobs →
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
