import Link from "next/link";
import { GigPlatformCard } from "@/components/gig-platform-card";
import { PageHeader } from "@/components/page-header";
import { fetchGigPlatforms } from "@/lib/data";
import { gigsListingMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = gigsListingMetadata();
export const revalidate = 3600;

const TYPE_FILTERS = ["rlhf", "annotation", "evaluator", "microtask"] as const;

export default async function AiGigsPage({
  searchParams,
}: {
  searchParams: { type?: string; indiaOnly?: string };
}) {
  const params: Record<string, string> = { limit: "50" };
  if (searchParams.type) params.type = searchParams.type;
  if (searchParams.indiaOnly === "true") params.indiaOnly = "true";

  const data = await fetchGigPlatforms(params);
  const platforms = data?.platforms ?? [];
  const indiaPlatforms = platforms.filter((p) => p.indiaAccepted);
  const internationalPlatforms = platforms.filter((p) => !p.indiaAccepted);

  const filterHref = (type?: string, indiaOnly?: boolean) => {
    const p = new URLSearchParams();
    if (type) p.set("type", type);
    if (indiaOnly) p.set("indiaOnly", "true");
    const q = p.toString();
    return q ? `/ai-gigs?${q}` : "/ai-gigs";
  };

  const indiaOnly = searchParams.indiaOnly === "true";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="AI Gig Platforms"
        description="Compare RLHF, annotation, and evaluation platforms — pay, onboarding time, and India eligibility."
      >
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={filterHref(undefined, indiaOnly)}
            className={cn(
              "filter-pill",
              !searchParams.type && "filter-pill-active",
            )}
          >
            All
          </Link>
          {TYPE_FILTERS.map((t) => (
            <Link
              key={t}
              href={filterHref(t, indiaOnly)}
              className={cn(
                "filter-pill capitalize",
                searchParams.type === t && "filter-pill-active",
              )}
            >
              {t}
            </Link>
          ))}
          <Link
            href={filterHref(searchParams.type, !indiaOnly)}
            className={cn(
              "filter-pill",
              indiaOnly && "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700",
            )}
          >
            🇮🇳 India only
          </Link>
        </div>
      </PageHeader>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          India-accepted platforms
          <span className="text-sm font-normal text-muted-foreground">
            ({indiaPlatforms.length})
          </span>
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {indiaPlatforms.map((p) => (
            <GigPlatformCard key={p.id} platform={p} />
          ))}
        </div>
        {indiaPlatforms.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            No India-accepted platforms match these filters.
          </p>
        )}
      </section>

      {internationalPlatforms.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
            International platforms
            <span className="text-sm font-normal">
              ({internationalPlatforms.length})
            </span>
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {internationalPlatforms.map((p) => (
              <GigPlatformCard key={p.id} platform={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
