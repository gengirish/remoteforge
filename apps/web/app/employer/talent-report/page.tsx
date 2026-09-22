import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchEmployerProfile, fetchTalentReport } from "@/lib/data";
import TalentReportClient from "./talent-report-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Talent Intelligence Report | RemoteForge Employers",
  robots: { index: false },
};

export default async function TalentReportPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/employer/onboard");

  const token = await getToken();
  const [employer, report] = await Promise.all([
    fetchEmployerProfile(token),
    fetchTalentReport(token),
  ]);

  if (!employer) redirect("/employer/onboard");

  return (
    <main className="min-h-screen bg-muted/50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Talent Intelligence Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            India remote talent landscape — updated daily from 50,000+ job listings.
          </p>
        </div>
        <TalentReportClient
          report={report}
          isSubscriber={employer.subscriptionTier === "starter"}
          employerId={employer.id}
        />
      </div>
    </main>
  );
}
