"use client";

import Link from "next/link";
import type { GigPlatform, Job } from "@intelliforge/db";
import { ArrowRight } from "lucide-react";
import { GigPlatformCard } from "@/components/gig-platform-card";
import { JobCard } from "@/components/job-card";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useState } from "react";

interface LandingTabsProps {
  jobs: Job[];
  gigs: GigPlatform[];
}

export function LandingTabs({ jobs, gigs }: LandingTabsProps) {
  const [jobQuery, setJobQuery] = useState("");
  const onJobSearch = useCallback((q: string) => setJobQuery(q), []);

  const filteredJobs = jobs.filter(
    (j) =>
      !jobQuery ||
      j.title.toLowerCase().includes(jobQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(jobQuery.toLowerCase()),
  );

  return (
    <Tabs defaultValue="jobs" className="mt-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Explore listings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Preview the latest opportunities below
          </p>
        </div>
        <TabsList className="grid w-full max-w-sm grid-cols-2 sm:w-auto">
          <TabsTrigger value="jobs">Remote Jobs</TabsTrigger>
          <TabsTrigger value="gigs">AI Gig Work</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="jobs" className="mt-6">
        <SearchBar
          placeholder="Search by title or company..."
          onSearch={onJobSearch}
          className="max-w-xl"
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        {filteredJobs.length === 0 && (
          <div className="mt-12 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
            <p className="font-medium text-foreground">No jobs match your search</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different keyword or browse all listings.
            </p>
          </div>
        )}
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/jobs">
              View all jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="gigs" className="mt-6">
        <div className="rounded-xl border border-border bg-card px-6 py-5 text-center shadow-sm">
          <h3 className="text-xl font-semibold">
            Earn $20–$40/hr training AI from India
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare RLHF, annotation, and evaluation platforms side by side.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.map((platform) => (
            <GigPlatformCard key={platform.id} platform={platform} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/ai-gigs">
              Compare all platforms
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
