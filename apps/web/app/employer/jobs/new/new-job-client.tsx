"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { getApiUrl } from "@/lib/api-url";
import { isClerkEnabled } from "@/lib/clerk-config";

const TAG_SUGGESTIONS = [
  "React", "TypeScript", "Node.js", "Python", "Go", "Rust",
  "AWS", "Docker", "Kubernetes", "PostgreSQL", "Next.js", "Figma",
];

export default function NewJobClient() {
  if (!isClerkEnabled) return null;
  return <NewJobClientInner />;
}

function NewJobClientInner() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    indiaFriendly: true,
    applyUrl: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTag(tag: string) {
    const t = tag.trim();
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] });
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/employer/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to post job");
      router.push("/employer/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Job title *</label>
        <input
          type="text"
          required
          minLength={3}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Senior Frontend Engineer"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Job description *</label>
        <textarea
          required
          minLength={50}
          rows={8}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Describe the role, responsibilities, and requirements…"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Skills / Tags</label>
        <div className="mb-2 flex flex-wrap gap-2">
          {form.tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="ml-1 text-indigo-400 hover:text-indigo-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Add a skill and press Enter"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {TAG_SUGGESTIONS.filter((s) => !form.tags.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Min salary (USD)</label>
          <input
            type="number"
            min="0"
            value={form.salaryMin}
            onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="80000"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Max salary (USD)</label>
          <input
            type="number"
            min="0"
            value={form.salaryMax}
            onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="120000"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Apply URL</label>
        <input
          type="url"
          value={form.applyUrl}
          onChange={(e) => setForm({ ...form, applyUrl: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="https://jobs.company.com/apply/123"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="indiaFriendly"
          checked={form.indiaFriendly}
          onChange={(e) => setForm({ ...form, indiaFriendly: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
        />
        <label htmlFor="indiaFriendly" className="text-sm text-gray-700">
          This role is open to candidates based in India
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Posting…" : "Post Job →"}
      </button>
    </form>
  );
}
