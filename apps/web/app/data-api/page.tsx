import type { Metadata } from "next";
import { DataApiClient } from "./data-api-client";
import { getPublicApiUrl } from "@/lib/api-url";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "India Remote Talent Data API | RemoteForge",
  description:
    "API access to India remote salary benchmarks, company hiring rates, and skills demand. Used by HR tools, ATS vendors, and salary comparison sites.",
};

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v2/salary",
    desc: "Median, p25, p75 salary by role. Based on anonymous community reports from India.",
  },
  {
    method: "GET",
    path: "/api/v2/companies",
    desc: "India accept rate, avg response time, and total remote jobs per company.",
  },
  {
    method: "GET",
    path: "/api/v2/skills",
    desc: "Top 100 skills in India-eligible remote jobs, ranked by demand.",
  },
  {
    method: "GET",
    path: "/api/v2/usage",
    desc: "Check your monthly call usage and remaining quota.",
  },
] as const;

const TIERS = [
  {
    tier: "Free",
    price: "₹0",
    calls: "1,000 calls/month",
    features: ["All 4 endpoints", "JSON responses", "Email support"],
    highlight: false,
  },
  {
    tier: "Pro",
    price: "₹2L/month",
    calls: "100,000 calls/month",
    features: ["All endpoints", "SLA 99.9%", "Dedicated support", "Webhooks on new data"],
    highlight: true,
  },
  {
    tier: "Enterprise",
    price: "Custom",
    calls: "Unlimited",
    features: ["Full data dump", "Custom fields", "White-label", "Slack support"],
    highlight: false,
  },
] as const;

export default function DataApiPage() {
  const apiUrl = getPublicApiUrl();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold">India Remote Talent Data API</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          The only API with ground-truth data on which companies hire from India,
          what they pay, and how fast they respond. Used by HR platforms, ATS vendors,
          and salary benchmarking tools.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ENDPOINTS.map(({ method, path, desc }) => (
          <div key={path} className="rounded-xl border border-border p-5">
            <p className="text-xs font-mono text-muted-foreground">{method}</p>
            <code className="text-sm font-mono text-primary">{path}</code>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {TIERS.map(({ tier, price, calls, features, highlight }) => (
          <div
            key={tier}
            className={`rounded-xl border p-6 ${highlight ? "border-primary/30 bg-primary/5" : "border-border"}`}
          >
            <p className="font-semibold">{tier}</p>
            <p className="mt-1 text-2xl font-bold">{price}</p>
            <p className="text-sm text-muted-foreground">{calls}</p>
            <ul className="mt-4 space-y-1.5">
              {features.map((f) => (
                <li key={f} className="text-sm text-muted-foreground">
                  ✓ {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold">Get your free API key</h2>
        <p className="mt-2 text-muted-foreground">
          No credit card required. 1,000 calls/month free forever.
        </p>
        <DataApiClient apiUrl={apiUrl} />
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold">Quick start</h2>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-muted/30 p-5 text-sm leading-relaxed">
          {`# Get India salary data for Software Engineers
curl ${apiUrl}/api/v2/salary?role=software-engineer \\
  -H "Authorization: Bearer rf_your_api_key"

# Get companies with highest India accept rate
curl ${apiUrl}/api/v2/companies \\
  -H "Authorization: Bearer rf_your_api_key"

# Get top skills in India-eligible remote jobs
curl ${apiUrl}/api/v2/skills \\
  -H "Authorization: Bearer rf_your_api_key"

# Check your usage
curl ${apiUrl}/api/v2/usage \\
  -H "Authorization: Bearer rf_your_api_key"`}
        </pre>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
        <strong className="text-foreground">Data sources:</strong> Salary data is
        anonymous community-sourced. Company intelligence is derived from live job
        listings across Remotive, WWR, and RemoteOK. Skills data is computed from
        India-eligible job tags in real time.
      </div>
    </div>
  );
}
