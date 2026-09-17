"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { isClerkEnabled } from "@/lib/clerk-config";

type AppStatus = "applied" | "interviewing" | "offered" | "rejected" | "ghosted";

const STATUS_LABELS: Record<AppStatus, string> = {
  applied: "Applied",
  interviewing: "Interviewing",
  offered: "Got Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
};

const STATUS_COLORS: Record<AppStatus, string> = {
  applied: "bg-blue-100 text-blue-800",
  interviewing: "bg-purple-100 text-purple-800",
  offered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  ghosted: "bg-gray-100 text-gray-600",
};

export function ApplyTrackButton({
  jobId,
  applyUrl,
  apiUrl,
}: {
  jobId: string;
  applyUrl: string;
  apiUrl: string;
}) {
  if (!isClerkEnabled) {
    return (
      <div className="flex flex-col gap-2">
        <Button asChild size="lg" className="w-fit">
          <a href={applyUrl} target="_blank" rel="noopener noreferrer">
            Apply to this job →
          </a>
        </Button>
      </div>
    );
  }

  return <ApplyTrackButtonInner jobId={jobId} applyUrl={applyUrl} apiUrl={apiUrl} />;
}

function ApplyTrackButtonInner({
  jobId,
  applyUrl,
  apiUrl,
}: {
  jobId: string;
  applyUrl: string;
  apiUrl: string;
}) {
  const { userId, getToken } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<AppStatus | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  async function trackStatus(status: AppStatus) {
    if (!userId) return;
    setLoading(true);
    try {
      const token = await getToken();
      await fetch(`${apiUrl}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({ jobId, status }),
      });
      setCurrentStatus(status);
      setShowPicker(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button asChild size="lg" className="w-fit">
        <a href={applyUrl} target="_blank" rel="noopener noreferrer">
          Apply to this job →
        </a>
      </Button>

      {userId && (
        <div className="relative">
          {currentStatus ? (
            <button
              onClick={() => setShowPicker(true)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[currentStatus]}`}
            >
              {STATUS_LABELS[currentStatus]} · Update status
            </button>
          ) : (
            <button
              onClick={() => setShowPicker(true)}
              className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              + Track this application
            </button>
          )}

          {showPicker && (
            <div className="absolute left-0 top-8 z-10 rounded-lg border border-border bg-background p-2 shadow-lg">
              <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">
                Update status
              </p>
              {(Object.keys(STATUS_LABELS) as AppStatus[]).map((s) => (
                <button
                  key={s}
                  disabled={loading}
                  onClick={() => trackStatus(s)}
                  className="block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-muted disabled:opacity-50"
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
              <button
                onClick={() => setShowPicker(false)}
                className="mt-1 block w-full px-3 py-1 text-center text-xs text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
