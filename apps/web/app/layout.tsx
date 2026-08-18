import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { Sora, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { clerkPublishableKey, isClerkEnabled } from "@/lib/clerk-config";
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
  title: "AI Gig Work India 2026 — Compare Pay & Eligibility | RemoteForge",
  description:
    "Compare Outlier, Appen, TELUS and more — pay, India eligibility, onboarding time. Plus remote jobs that hire from India.",
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
          data-domain="remoteforge.in"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        {/* Always mount ClerkProvider so client hooks never run outside context. */}
        <ClerkProvider
          publishableKey={isClerkEnabled ? clerkPublishableKey : undefined}
        >
          {body}
        </ClerkProvider>
      </body>
    </html>
  );
}
