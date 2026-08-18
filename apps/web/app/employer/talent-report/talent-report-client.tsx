"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getApiUrl } from "@/lib/api-url";
import { isClerkEnabled } from "@/lib/clerk-config";

type Report = {
  topSkills: { skill: string; count: number }[];
  salaryByRole: { roleSlug: string; role: string; _avg: { salaryUsd: number }; _count: { id: number } }[];
  companyComparison: { name: string; indiaAcceptRate: number; totalJobsPosted: number; avgResponseDays: number }[];
  isSubscriber: boolean;
  generatedAt: string;
} | null;

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

export default function TalentReportClient({
  report,
  isSubscriber,
  employerId: _employerId,
}: {
  report: Report;
  isSubscriber: boolean;
  employerId: string;
}) {
  if (!isClerkEnabled) return null;
  return (
    <TalentReportClientInner
      report={report}
      isSubscriber={isSubscriber}
      employerId={_employerId}
    />
  );
}

function TalentReportClientInner({
  report,
  isSubscriber,
  employerId: _employerId,
}: {
  report: Report;
  isSubscriber: boolean;
  employerId: string;
}) {
  const { user } = useUser();
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  async function handleUpgrade() {
    if (!user?.id) return;
    setUpgrading(true);
    setUpgradeError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/employer/subscription`, {
        method: "POST",
        headers: { "X-Clerk-User-Id": user.id },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create order");
      const { orderId, amount, currency, keyId } = json.data as {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      };

      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(script);
      });

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "RemoteForge",
        description: "Employer Starter Plan — ₹2,999/month",
        handler: () => {
          window.location.href = "/employer/dashboard";
        },
        prefill: {
          email: user.primaryEmailAddress?.emailAddress,
        },
      });
      rzp.open();
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUpgrading(false);
    }
  }

  if (!report) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
        Report unavailable — please try again later.
      </div>
    );
  }

  const maxSkillCount = report.topSkills[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      {/* Top Skills */}
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Top skills in demand (India remote)</h2>
        <div className="space-y-2">
          {report.topSkills.slice(0, isSubscriber ? 20 : 5).map((s) => (
            <div key={s.skill} className="flex items-center gap-3">
              <div className="w-24 text-sm font-medium text-gray-700">{s.skill}</div>
              <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: `${(s.count / maxSkillCount) * 100}%` }}
                />
              </div>
              <div className="w-12 text-right text-xs text-gray-500">{s.count}</div>
            </div>
          ))}
        </div>
        {!isSubscriber && report.topSkills.length > 5 && (
          <p className="mt-3 text-sm text-gray-400">
            + {report.topSkills.length - 5} more skills — upgrade to unlock
          </p>
        )}
      </section>

      {/* Salary by Role (gated) */}
      <section className={`rounded-2xl p-6 shadow-sm ${isSubscriber ? "bg-white" : "bg-gray-50"}`}>
        <h2 className="mb-4 font-semibold text-gray-900">Salary benchmarks by role</h2>
        {isSubscriber ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium">Avg salary (USD)</th>
                  <th className="pb-3 font-medium">Reports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.salaryByRole.map((r) => (
                  <tr key={r.roleSlug}>
                    <td className="py-3 pr-4 font-medium text-gray-900">{r.role}</td>
                    <td className="py-3 pr-4 text-gray-700">
                      ${Math.round(r._avg.salaryUsd ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-gray-500">{r._count.id}</td>
                  </tr>
                ))}
                {report.salaryByRole.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-400">
                      No salary data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50 p-6 text-center">
            <p className="mb-1 font-medium text-gray-800">Upgrade to see salary benchmarks</p>
            <p className="mb-4 text-sm text-gray-500">
              Know exactly what India-based engineers, designers, and PMs expect.
            </p>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {upgrading ? "Opening payment…" : "Upgrade — ₹2,999/month"}
            </button>
            {upgradeError && <p className="mt-2 text-sm text-red-600">{upgradeError}</p>}
          </div>
        )}
      </section>

      {/* Company Comparison (gated) */}
      {isSubscriber && report.companyComparison.length > 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Companies hiring from India</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="pb-3 pr-4 font-medium">Company</th>
                  <th className="pb-3 pr-4 font-medium">India accept rate</th>
                  <th className="pb-3 pr-4 font-medium">Jobs posted</th>
                  <th className="pb-3 font-medium">Avg response (days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.companyComparison.map((c) => (
                  <tr key={c.name}>
                    <td className="py-3 pr-4 font-medium text-gray-900">{c.name}</td>
                    <td className="py-3 pr-4 text-gray-700">
                      {Math.round(c.indiaAcceptRate * 100)}%
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{c.totalJobsPosted}</td>
                    <td className="py-3 text-gray-700">{c.avgResponseDays ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="text-xs text-gray-400">
        Report generated {new Date(report.generatedAt).toLocaleString("en-IN")}
      </p>
    </div>
  );
}
