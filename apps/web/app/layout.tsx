import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "RemoteForge — India's home for remote jobs and AI gig work",
  description:
    "Discover remote jobs and AI gig work platforms open to India. Compare pay, onboarding time, and apply with referral links.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const body = (
    <>
      <SiteHeader />
      <main>{children}</main>
      <footer className="mt-16 border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>RemoteForge · India&apos;s home for remote jobs and AI gig work</p>
        <p className="mt-1">IntelliForge Digital Services</p>
      </footer>
    </>
  );

  return (
    <html lang="en">
      <body>
        <Script
          defer
          data-domain="remoteforge.in"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        {clerkEnabled ? (
          <ClerkProvider>{body}</ClerkProvider>
        ) : (
          body
        )}
      </body>
    </html>
  );
}
