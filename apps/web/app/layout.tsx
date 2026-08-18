import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { Sora, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { clerkPublishableKey, isClerkEnabled } from "@/lib/clerk-config";
import { siteDomain, siteUrl } from "@/lib/site";
import "./globals.css";

const fontDisplay = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fontBody = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves every relative metadata URL (og:image, per-page canonicals) against
  // the real origin. Without it Next falls back to localhost at build time.
  metadataBase: new URL(siteUrl),
  title: "AI Gig Work India 2026 — Compare Pay & Eligibility | RemoteForge",
  description:
    "Compare Outlier, Appen, TELUS and more — pay, India eligibility, onboarding time. Plus remote jobs that hire from India.",
  // No `url` or `alternates.canonical` here on purpose: child pages inherit root
  // metadata, so a value set here would canonicalize every page to the homepage.
  openGraph: {
    siteName: "RemoteForge",
    type: "website",
    locale: "en_IN",
  },
};

const themeInitScript = `(function(){try{var k='remoteforge-theme';var s=localStorage.getItem(k);var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const body = (
    <div className={`${fontDisplay.variable} ${fontBody.variable} font-sans`}>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Script
          defer
          data-domain={siteDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        {/* Mount ClerkProvider only when a key exists: it throws on a missing
            publishableKey, which would fail the prerender of every static page.
            Safe to omit because each client component that calls a Clerk hook
            returns early on !isClerkEnabled before reaching the hook. */}
        {isClerkEnabled ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            {body}
          </ClerkProvider>
        ) : (
          body
        )}
      </body>
    </html>
  );
}
