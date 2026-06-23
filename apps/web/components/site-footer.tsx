import Link from "next/link";
import { Briefcase, Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link href="/" className="font-display text-lg font-bold">
              Remote<span className="text-primary">Forge</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              India&apos;s curated directory for remote jobs and AI gig platforms.
              Compare pay, eligibility, and onboarding — then apply with working
              referral links.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Browse</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  Remote Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-gigs"
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Gig Platforms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Categories</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {["engineering", "design", "marketing", "product"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/jobs/category/${cat}`}
                    className="capitalize transition-colors hover:text-primary"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-8 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} IntelliForge Digital Services</p>
          <p>Built for remote workers in India</p>
        </div>
      </div>
    </footer>
  );
}
