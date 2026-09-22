"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { getApiUrl } from "@/lib/api-url";
import { isClerkEnabled } from "@/lib/clerk-config";

export default function OnboardClient() {
  if (!isClerkEnabled) return null;
  return <OnboardClientInner />;
}

function OnboardClientInner() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    companyName: "",
    website: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/employer/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Onboarding failed");
      router.push("/employer/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-muted-foreground">
          Company email *
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-muted-foreground">
          Company name *
        </label>
        <input
          type="text"
          required
          minLength={2}
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Acme Inc."
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-muted-foreground">Website</label>
        <input
          type="url"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="https://company.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-muted-foreground">
          Company description
        </label>
        <textarea
          rows={3}
          maxLength={500}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="What does your company do? (max 500 chars)"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-brand rounded-full py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {loading ? "Setting up…" : "Create Employer Profile →"}
      </button>
    </form>
  );
}
