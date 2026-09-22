"use client";

import { useState } from "react";

export function DataApiClient({ apiUrl }: { apiUrl: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v2/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Failed");
      }
      const json = (await res.json()) as { data: { key: string } };
      setApiKey(json.data.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (apiKey) {
    return (
      <div className="mt-6 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/15 p-6">
        <p className="font-semibold text-green-900 dark:text-green-300">Your API key is ready!</p>
        <p className="mt-1 text-sm text-green-800 dark:text-green-300">
          Save this key — it will not be shown again.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-md border border-green-200 dark:border-green-500/30 bg-card px-3 py-2 text-sm font-mono">
            {apiKey}
          </code>
          <button
            onClick={copy}
            className="shrink-0 rounded-md border border-green-300 bg-card px-3 py-2 text-sm hover:bg-green-50"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="mt-4 text-sm text-green-800 dark:text-green-300">
          Test it:{" "}
          <code className="rounded bg-green-100 dark:bg-green-500/15 px-1 text-xs">
            curl {apiUrl}/api/v2/skills -H &quot;Authorization: Bearer {apiKey}&quot;
          </code>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Your name / use case</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="HR tool, salary comparison site…"
          className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Work email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="h-fit rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Get free API key →"}
      </button>
    </form>
  );
}
