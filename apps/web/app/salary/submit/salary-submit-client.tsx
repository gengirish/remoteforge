"use client";

import { useState } from "react";
import Link from "next/link";

type FormState = {
  role: string;
  company: string;
  yearsExp: string;
  salaryUsd: string;
  city: string;
};

const inputClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full";

export function SalarySubmitClient({ apiUrl }: { apiUrl: string }) {
  const [form, setForm] = useState<FormState>({
    role: "",
    company: "",
    yearsExp: "",
    salaryUsd: "",
    city: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ roleSlug: string } | null>(null);
  const [error, setError] = useState("");

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.role || !form.yearsExp || !form.salaryUsd) {
      setError("Role, years of experience, and salary are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/salary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role,
          company: form.company || undefined,
          yearsExp: Number(form.yearsExp),
          salaryUsd: Number(form.salaryUsd),
          city: form.city || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "Submission failed");
      }
      const json = (await res.json()) as { data: { roleSlug: string } };
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-8 text-center">
        <p className="text-lg font-semibold">Thanks for contributing!</p>
        <p className="mt-2 text-muted-foreground">
          Your salary has been added anonymously.
        </p>
        <Link
          href={`/salary/${result.roleSlug}`}
          className="mt-6 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          View benchmarks for your role →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-sm font-medium">
            Role <span className="text-red-500">*</span>
          </label>
          <input
            id="role"
            type="text"
            value={form.role}
            onChange={set("role")}
            placeholder="Senior Software Engineer"
            className={inputClass}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="company" className="text-sm font-medium">
            Company{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="company"
            type="text"
            value={form.company}
            onChange={set("company")}
            placeholder="Acme Corp"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="yearsExp" className="text-sm font-medium">
            Years of experience <span className="text-red-500">*</span>
          </label>
          <input
            id="yearsExp"
            type="number"
            min={0}
            max={50}
            value={form.yearsExp}
            onChange={set("yearsExp")}
            placeholder="5"
            className={inputClass}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="salaryUsd" className="text-sm font-medium">
            Annual salary (USD) <span className="text-red-500">*</span>
          </label>
          <input
            id="salaryUsd"
            type="number"
            min={1000}
            value={form.salaryUsd}
            onChange={set("salaryUsd")}
            placeholder="60000"
            className={inputClass}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-sm font-medium">
            City{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="city"
            type="text"
            value={form.city}
            onChange={set("city")}
            placeholder="Bangalore"
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <p className="text-xs text-muted-foreground">
        All submissions are anonymous. No account required.
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit salary"}
      </button>
    </form>
  );
}
