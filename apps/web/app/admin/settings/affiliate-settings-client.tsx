"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  fetchAffiliateSettings,
  logoutAdmin,
  saveGigAffiliate,
  saveJobBoardAffiliates,
  verifyAdminAccess,
  type AffiliateSettingsData,
} from "./actions";

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await verifyAdminAccess(token);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error ?? "Invalid token");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md card-surface p-8">
      <h1 className="text-xl font-bold">Product Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your admin token to manage affiliate and referral links.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="admin-token" className="text-sm font-medium">
            Admin token
          </label>
          <input
            id="admin-token"
            type="password"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="input-field mt-1.5"
            placeholder="ADMIN_SETTINGS_TOKEN"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}

function SourceBadge({ source }: { source: "database" | "env" | "unset" }) {
  const styles = {
    database: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    env: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    unset: "bg-muted text-muted-foreground",
  };
  const labels = { database: "Saved", env: "From env", unset: "Not set" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[source]}`}>
      {labels[source]}
    </span>
  );
}

function JobBoardSection({
  jobBoards,
  onSaved,
}: {
  jobBoards: AffiliateSettingsData["jobBoards"];
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(jobBoards.map((b) => [b.key, b.value ?? ""])),
  );
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setStatus("loading");
    const result = await saveJobBoardAffiliates(
      jobBoards.map((b) => ({
        key: b.key,
        value: values[b.key]?.trim() || null,
      })),
    );
    if (result.success) {
      setStatus("done");
      setMessage("Job board affiliate tags saved.");
      onSaved();
    } else {
      setStatus("error");
      setMessage(result.error ?? "Save failed");
    }
  };

  return (
    <section className="card-surface p-6">
      <h2 className="text-lg font-semibold">Remote job board affiliates</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        These tags are appended to outbound job links on matching domains. Changes apply
        immediately on new clicks.
      </p>
      <div className="mt-6 space-y-4">
        {jobBoards.map((board) => (
          <div key={board.key} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{board.label}</p>
                <p className="text-xs text-muted-foreground">
                  {board.domain} · ?{board.param}=…
                </p>
              </div>
              <SourceBadge source={board.source} />
            </div>
            <input
              type="text"
              value={values[board.key] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [board.key]: e.target.value }))
              }
              placeholder={board.envValue ?? `Your ${board.label} affiliate ID`}
              className="input-field mt-3"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">{board.description}</p>
          </div>
        ))}
      </div>
      <Button className="mt-6" onClick={handleSave} disabled={status === "loading"}>
        {status === "loading" ? "Saving..." : "Save job board affiliates"}
      </Button>
      {message && (
        <p
          className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-emerald-600"}`}
        >
          {message}
        </p>
      )}
    </section>
  );
}

function GigPlatformRow({
  platform,
  onSaved,
}: {
  platform: AffiliateSettingsData["platforms"][number];
  onSaved: () => void;
}) {
  const [referralUrl, setReferralUrl] = useState(platform.referralUrl ?? "");
  const [affiliateUrl, setAffiliateUrl] = useState(platform.affiliateUrl ?? "");
  const [referralReward, setReferralReward] = useState(platform.referralReward ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setStatus("loading");
    const result = await saveGigAffiliate(platform.id, {
      referralUrl: referralUrl.trim() || null,
      affiliateUrl: affiliateUrl.trim() || null,
      referralReward: referralReward.trim() || null,
    });
    if (result.success) {
      setStatus("done");
      setMessage("Saved");
      onSaved();
    } else {
      setStatus("error");
      setMessage(result.error ?? "Save failed");
    }
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <tr className="border-b border-border align-top last:border-0">
      <td className="py-4 pr-4">
        <p className="font-medium">{platform.name}</p>
        <p className="text-xs text-muted-foreground">{platform.slug}</p>
        {platform.indiaAccepted && (
          <span className="mt-1 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            India
          </span>
        )}
      </td>
      <td className="py-4 pr-4">
        <label className="text-xs font-medium text-muted-foreground">Referral URL</label>
        <input
          type="url"
          value={referralUrl}
          onChange={(e) => setReferralUrl(e.target.value)}
          placeholder="https://outlier.ai/c/your-code"
          className="input-field mt-1"
        />
      </td>
      <td className="py-4 pr-4">
        <label className="text-xs font-medium text-muted-foreground">Affiliate URL</label>
        <input
          type="url"
          value={affiliateUrl}
          onChange={(e) => setAffiliateUrl(e.target.value)}
          placeholder="https://..."
          className="input-field mt-1"
        />
      </td>
      <td className="py-4 pr-4">
        <label className="text-xs font-medium text-muted-foreground">Reward note</label>
        <input
          type="text"
          value={referralReward}
          onChange={(e) => setReferralReward(e.target.value)}
          placeholder="e.g. $50 per referral"
          className="input-field mt-1"
        />
      </td>
      <td className="py-4">
        <Button size="sm" variant="outline" onClick={handleSave} disabled={status === "loading"}>
          {status === "loading" ? "..." : "Save"}
        </Button>
        {message && status !== "idle" && (
          <p
            className={`mt-1 text-xs ${status === "error" ? "text-red-600" : "text-emerald-600"}`}
          >
            {message}
          </p>
        )}
      </td>
    </tr>
  );
}

export function AffiliateSettingsClient({
  initialData,
}: {
  initialData: AffiliateSettingsData | null;
}) {
  const [authenticated, setAuthenticated] = useState(Boolean(initialData));
  const [data, setData] = useState<AffiliateSettingsData | null>(initialData);
  const [loadError, setLoadError] = useState("");

  const reload = async () => {
    const result = await fetchAffiliateSettings();
    if (result.success) {
      setData(result.data);
      setLoadError("");
    } else {
      setLoadError(result.error);
    }
  };

  const handleLoginSuccess = async () => {
    setAuthenticated(true);
    await reload();
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthenticated(false);
    setData(null);
  };

  if (!authenticated) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-muted-foreground">{loadError || "Loading settings..."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Product Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Configure affiliate tags and referral links for all supported platforms.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>

      <div className="mt-8 space-y-8">
        <JobBoardSection jobBoards={data.jobBoards} onSaved={reload} />

        <section className="card-surface overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">AI gig platform links</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Referral URLs are used for &quot;Join with referral&quot; CTAs. Affiliate URLs
              are the fallback apply link.
            </p>
          </div>
          <div className="overflow-x-auto px-6 py-2">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-normal">Platform</th>
                  <th className="pb-3 pr-4 font-normal">Referral URL</th>
                  <th className="pb-3 pr-4 font-normal">Affiliate URL</th>
                  <th className="pb-3 pr-4 font-normal">Reward</th>
                  <th className="pb-3 font-normal" />
                </tr>
              </thead>
              <tbody>
                {data.platforms.map((platform) => (
                  <GigPlatformRow key={platform.id} platform={platform} onSaved={reload} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
