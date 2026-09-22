"use client";

import { useState } from "react";

interface Props {
  jobTitle: string;
  company: string;
  jobDescription: string;
  userSkills: string[];
  userExperience: number;
  isPremium: boolean;
}

export function CoverLetterGenerator({
  jobTitle,
  company,
  jobDescription,
  userSkills,
  userExperience,
  isPremium,
}: Props) {
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, company, jobDescription, userSkills, userExperience }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { coverLetter: string };
      setCoverLetter(data.coverLetter);
    } catch {
      setError("Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(coverLetter).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!isPremium) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">✨ AI Cover Letter</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Premium
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate a personalized cover letter for this role in seconds.
        </p>
        <a
          href="/premium"
          className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Upgrade to Premium →
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">✨ AI Cover Letter</span>
        <span className="rounded-full bg-green-100 dark:bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
          Premium
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Personalized for {company} · {jobTitle}
      </p>

      {!coverLetter ? (
        <div className="mt-4">
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate cover letter"}
          </button>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="mt-4">
          <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 font-sans text-sm leading-relaxed">
            {coverLetter}
          </pre>
          <div className="mt-3 flex gap-2">
            <button
              onClick={copy}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
