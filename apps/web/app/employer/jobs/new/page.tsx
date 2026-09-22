import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NewJobClient from "./new-job-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Remote Job | RemoteForge Employers",
  robots: { index: false },
};

export default async function NewJobPage() {
  const { userId } = await auth();
  if (!userId) redirect("/employer/onboard");

  return (
    <main className="min-h-screen bg-muted/50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Post a new job</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jobs are listed for 30 days and appear to India-based remote workers.
          </p>
        </div>
        <div className="rounded-2xl bg-card p-8 shadow-sm">
          <NewJobClient />
        </div>
      </div>
    </main>
  );
}
