import Link from "next/link";
import { GigPlatformCard } from "@/components/gig-platform-card";
import { fetchGigPlatforms } from "@/lib/data";
import { gigsListingMetadata } from "@/lib/seo";

export const metadata = gigsListingMetadata();
export const revalidate = 3600;

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">AI Gig Platforms</h1>
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href={filterHref()} className="rounded-full bg-muted px-3 py-1 hover:bg-primary/10">All</Link>
        {["rlhf", "annotation", "evaluator", "microtask"].map((t) => (
          <Link key={t} href={filterHref(t, searchParams.indiaOnly === "true")} className={`rounded-full px-3 py-1 capitalize ${searchParams.type === t ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t}</Link>
        ))}
        <Link href={filterHref(searchParams.type, true)} className={`rounded-full px-3 py-1 ${searchParams.indiaOnly === "true" ? "bg-emerald-600 text-white" : "bg-muted"}`}>India only</Link>
      </div>
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-emerald-800">India-accepted platforms</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {indiaPlatforms.map((p) => (
            <GigPlatformCard key={p.id} platform={p} />
          ))}
        </div>
      </section>
      {internationalPlatforms.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-muted-foreground">International platforms</h2>
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
