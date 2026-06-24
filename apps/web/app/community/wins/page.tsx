import Link from "next/link";
import type { Metadata } from "next";
import { fetchSuccessStories } from "@/lib/data";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Remote Job Success Stories from India | RemoteForge",
  description:
    "Real stories from Indian professionals who landed remote jobs. Read how they did it and what they earn.",
};

export default async function WinsPage() {
  const stories = await fetchSuccessStories();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Success Stories</h1>
          <p className="mt-2 text-muted-foreground">
            Real wins from Indian professionals who landed remote jobs.
          </p>
        </div>
        <Link
          href="/community/wins/submit"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Share yours →
        </Link>
      </div>

      {!stories || stories.length === 0 ? (
        <div className="mt-12 rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">No approved stories yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Stories appear once reviewed (usually within 24 hours).
          </p>
          <Link
            href="/community/wins/submit"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Be the first to share →
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {stories.map((story) => (
            <article key={story.id} className="rounded-xl border border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{story.displayName}</p>
                  <p className="text-sm text-muted-foreground">
                    {story.role} at{" "}
                    <span className="font-medium text-foreground">{story.company}</span>
                    {story.city && ` · ${story.city}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {story.salaryUsd && (
                    <p className="font-bold text-green-600">
                      ${story.salaryUsd.toLocaleString()}/yr
                    </p>
                  )}
                  {story.appliedCount && (
                    <p className="text-xs text-muted-foreground">
                      {story.appliedCount} applications
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{story.story}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(story.submittedAt).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/community/income-report" className="text-sm text-primary hover:underline">
          View India Remote Income Report →
        </Link>
      </div>
    </div>
  );
}
