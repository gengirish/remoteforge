import Script from "next/script";
import type { Metadata } from "next";
import { PremiumCheckout } from "./premium-checkout";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "RemoteForge Premium — Get hired faster",
  description:
    "Upgrade to RemoteForge Premium for AI cover letters, priority job alerts, and a verified profile badge. ₹499/month.",
};

const FEATURES = [
  { name: "AI cover letter generator", free: false, premium: true },
  { name: "First-to-know job alerts (30 min)", free: false, premium: true },
  { name: "Verified profile badge", free: false, premium: true },
  { name: "Priority in employer searches", free: false, premium: true },
  { name: "Browse remote jobs", free: true, premium: true },
  { name: "Application tracker", free: true, premium: true },
  { name: "Salary benchmarks", free: true, premium: true },
  { name: "Gig income reports", free: true, premium: true },
  { name: "Referral earnings", free: true, premium: true },
];

export default function PremiumPage() {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Premium
          </span>
          <h1 className="mt-4 text-4xl font-bold">Get hired faster</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            AI-powered tools to help India&apos;s remote workers land better jobs, faster.
          </p>
          <div className="mt-3 text-3xl font-bold">
            ₹499<span className="text-lg font-normal text-muted-foreground">/month</span>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Feature</th>
                <th className="px-5 py-3 text-center font-medium text-muted-foreground">Free</th>
                <th className="px-5 py-3 text-center font-medium text-primary">Premium</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 font-medium">{f.name}</td>
                  <td className="px-5 py-3.5 text-center">
                    {f.free ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {f.premium ? (
                      <span className="text-green-600 font-semibold">✓</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <PremiumCheckout />
          <p className="text-xs text-muted-foreground">
            Cancel anytime · Secure payment via Razorpay · Indian pricing
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          <strong className="text-foreground">How it works:</strong> After payment, your account is
          instantly upgraded. AI cover letters are generated fresh for each job using your profile
          skills. Priority alerts fire within 30 minutes of new India-eligible postings.
        </div>
      </div>
    </>
  );
}
