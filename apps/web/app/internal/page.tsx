import { fetchInternalStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "RemoteForge — Internal Stats",
  robots: { index: false, follow: false },
};

export default async function InternalStatsPage() {
  const stats = await fetchInternalStats();

  if (!stats) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold">Internal Stats</h1>
        <p className="mt-4 text-muted-foreground">
          Unable to load stats. Check that <code>REMOTEFORGE_INTERNAL_KEY</code> is set and the API is reachable.
        </p>
      </div>
    );
  }

  const totalClicks = stats.clicks.totalJobClicks + stats.clicks.totalGigClicks;
  const weeklyClicks = stats.clicks.jobClicksLast7 + stats.clicks.gigClicksLast7;
  const featuredRevenue = stats.featuredSlots.reduce((sum, s) => sum + s.amountPaise, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">Internal Stats</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} />
        <StatCard label="Clicks (7d)" value={weeklyClicks.toLocaleString()} />
        <StatCard label="Subscribers" value={stats.subscribers.toLocaleString()} />
        <StatCard
          label="Featured Revenue"
          value={`₹${(featuredRevenue / 100).toLocaleString("en-IN")}`}
          sub={`${stats.featuredSlots.length} active slot${stats.featuredSlots.length !== 1 ? "s" : ""}`}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Prep Waitlist" value={stats.intents.prepWaitlist.toLocaleString()} />
        <StatCard label="Approval Alerts" value={stats.intents.approvalAlerts.toLocaleString()} />
        <StatCard label="New Subscribers (7d)" value={stats.signups.last7.toLocaleString()} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Signups by Week</h2>
          {stats.signups.byWeek.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-normal">Week of</th>
                  <th className="pb-2 text-right font-normal">Signups</th>
                </tr>
              </thead>
              <tbody>
                {stats.signups.byWeek.map(({ week, count }) => (
                  <tr key={week} className="border-b border-border last:border-0">
                    <td className="py-2">
                      {new Date(`${week}T00:00:00Z`).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="py-2 text-right font-medium">{count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">No signups in the last 12 weeks.</p>
          )}
        </section>

        {stats.signups.bySource.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Signups by Source</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-normal">Source</th>
                  <th className="pb-2 text-right font-normal">Subscribers</th>
                </tr>
              </thead>
              <tbody>
                {stats.signups.bySource.map(({ source, count }) => (
                  <tr key={source} className="border-b border-border last:border-0">
                    <td className="py-2 font-medium">{source}</td>
                    <td className="py-2 text-right font-medium">{count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted-foreground">
              First signup page, except that joining a prep waitlist later changes it to prep-waitlist.
            </p>
          </section>
        )}
      </div>

      {stats.intents.bySignal.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Interest by Platform</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-normal">Platform</th>
                <th className="pb-2 font-normal">Intent</th>
                <th className="pb-2 text-right font-normal">Subscribers</th>
              </tr>
            </thead>
            <tbody>
              {stats.intents.bySignal.map(({ signal, count }) => {
                const [intent, slug] = signal.split(":");
                return (
                  <tr key={signal} className="border-b border-border last:border-0">
                    <td className="py-2 font-medium">{slug}</td>
                    <td className="py-2 text-muted-foreground">{intent}</td>
                    <td className="py-2 text-right font-medium">{count.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Click Breakdown</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 text-muted-foreground">Job clicks (all time)</td>
                <td className="py-2 text-right font-medium">{stats.clicks.totalJobClicks.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 text-muted-foreground">Gig clicks (all time)</td>
                <td className="py-2 text-right font-medium">{stats.clicks.totalGigClicks.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 text-muted-foreground">Job clicks (7d)</td>
                <td className="py-2 text-right font-medium">{stats.clicks.jobClicksLast7.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 text-muted-foreground">Gig clicks (7d)</td>
                <td className="py-2 text-right font-medium">{stats.clicks.gigClicksLast7.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {stats.featuredSlots.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Active Featured Slots</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-normal">Job</th>
                  <th className="pb-2 text-right font-normal">Expires</th>
                </tr>
              </thead>
              <tbody>
                {stats.featuredSlots.map((slot, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2">
                      <p className="font-medium">{slot.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">{slot.company}</p>
                    </td>
                    <td className="py-2 text-right text-xs text-muted-foreground">
                      {new Date(slot.expiresAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>

      {stats.topJobs.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Top Jobs by Clicks</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-normal">Job ID</th>
                <th className="pb-2 text-right font-normal">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {stats.topJobs.map((row) => (
                <tr key={row.jobId} className="border-b border-border last:border-0">
                  <td className="py-2 font-mono text-xs">{row.jobId}</td>
                  <td className="py-2 text-right font-medium">{row._count.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
