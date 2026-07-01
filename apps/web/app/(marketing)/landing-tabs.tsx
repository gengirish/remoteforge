"use client";

import Link from "next/link";
import type { GigPlatform, Job } from "@intelliforge/db";
import { GigPlatformCard } from "@/components/gig-platform-card";
import { JobCard } from "@/components/job-card";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RecommendedJob } from "@/lib/data";
import { useCallback, useState } from "react";

interface LandingTabsProps {
  jobs: Job[];
  gigs: GigPlatform[];
  recommendedJobs?: RecommendedJob[];
  inrRate?: number;
}

export function LandingTabs({ jobs, gigs, recommendedJobs, inrRate }: LandingTabsProps) {
  const [jobQuery, setJobQuery] = useState("");
  const onJobSearch = useCallback((q: string) => setJobQuery(q), []);

  const filteredJobs = jobs.filter(
    (j) =>
      !jobQuery ||
      j.title.toLowerCase().includes(jobQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(jobQuery.toLowerCase()),
  );

  const hasRecommended = recommendedJobs && recommendedJobs.length > 0;
  const defaultTab = hasRecommended ? "recommended" : "gigs";
  const tabCols = hasRecommended ? "grid-cols-3" : "grid-cols-2";

  return (
    <Tabs defaultValue={defaultTab} className="mt-12">
      <TabsList className={`mx-auto grid w-full max-w-lg ${tabCols}`}>
        {hasRecommended && (
          <TabsTrigger value="recommended">✦ For You</TabsTrigger>
        )}
        <TabsTrigger value="gigs">AI Gig Work</TabsTrigger>
        <TabsTrigger value="jobs">Remote Jobs</TabsTrigger>
      </TabsList>

      {hasRecommended && (
        <TabsContent value="recommended">
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Matched to your skills and salary target
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                matchScore={job.matchScore ?? undefined}
                inrRate={inrRate}
              />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/jobs">View all jobs →</Link>
            </Button>
          </div>
        </TabsContent>
      )}

      <TabsContent value="jobs">
        <SearchBar
          placeholder="Search remote jobs..."
          onSearch={onJobSearch}
          className="mx-auto max-w-xl"
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} inrRate={inrRate} />
          ))}
        </div>
        {filteredJobs.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground">
            No jobs yet — ingestion worker will populate listings.
          </p>
        )}
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/jobs">View all jobs →</Link>
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="gigs">
        <h2 className="text-center text-2xl font-semibold">
          Earn $20–$40/hr training AI from India
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Compare RLHF, annotation, and evaluation platforms side by side.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.map((platform) => (
            <GigPlatformCard key={platform.id} platform={platform} inrRate={inrRate} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/ai-gigs">Compare all platforms →</Link>
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
