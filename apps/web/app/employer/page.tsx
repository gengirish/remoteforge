import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire Remote Talent from India | RemoteForge for Employers",
  description:
    "Post remote jobs to India-based developers, designers and PMs. Get the India-Friendly badge and access talent analytics.",
};

const FEATURES = [
  {
    icon: "🇮🇳",
    title: "India-Friendly Badge",
    desc: "Stand out to candidates who specifically filter for India-accepting companies.",
  },
  {
    icon: "📊",
    title: "Talent Intelligence",
    desc: "See top skills, salary benchmarks, and company comparisons — all India-specific.",
  },
  {
    icon: "🎯",
    title: "Direct Job Postings",
    desc: "Your jobs appear natively alongside aggregated listings, not buried in a separate section.",
  },
  {
    icon: "🔗",
    title: "Profile + Branding",
    desc: "Company profile page with your description, website, and openings in one place.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["1 active job posting", "Basic company profile", "India-Friendly badge"],
    cta: "Get Started Free",
    href: "/employer/onboard",
    highlight: false,
  },
  {
    name: "Starter",
    price: "₹2,999",
    period: "/ month",
    features: [
      "Unlimited job postings",
      "Talent Intelligence report",
      "Salary benchmarks",
      "Priority listing",
      "India-Friendly badge",
    ],
    cta: "Start Hiring",
    href: "/employer/onboard",
    highlight: true,
  },
];

export default function EmployerMarketingPage() {
  return (
    <main className="min-h-screen bg-card">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            For Employers
          </span>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Hire remote talent from India — the right way
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Post where candidates already filter for India-friendly roles. Get the
            India-Friendly badge and show up when it matters.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/employer/onboard"
              className="btn-brand rounded-full px-6 py-3 text-base font-semibold text-primary-foreground"
            >
              Post a Job Free →
            </Link>
            <Link
              href="#pricing"
              className="rounded-lg border border-border px-6 py-3 text-base font-semibold text-muted-foreground hover:bg-muted/50"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-12 text-center text-2xl font-bold text-foreground">
          Everything you need to hire from India
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-muted/50 p-6">
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-muted/50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-foreground">Simple pricing</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 ${
                  plan.highlight
                    ? "border-primary bg-card shadow-lg"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlight && (
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    Most popular
                  </span>
                )}
                <div className="mb-1 text-xl font-bold text-foreground">{plan.name}</div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="ml-1 text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full rounded-lg py-3 text-center text-sm font-semibold ${
                    plan.highlight
                      ? "btn-brand text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
