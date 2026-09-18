import type { Metadata } from "next";
import { SubmitClient } from "./submit-client";
import { getPublicApiUrl } from "@/lib/api-url";

export const metadata: Metadata = {
  title: "Share Your Remote Job Win | RemoteForge",
  description:
    "Inspire thousands of Indian professionals by sharing how you landed your remote job.",
};

export default function SubmitWinPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Share Your Win</h1>
      <p className="mt-2 text-muted-foreground">
        Inspire thousands of Indian professionals by sharing your remote job story.
        All submissions are reviewed before publishing.
      </p>
      <SubmitClient apiUrl={getPublicApiUrl()} />
    </div>
  );
}
