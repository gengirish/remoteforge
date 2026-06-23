import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Sora, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
  title: "RemoteForge — India's home for remote jobs and AI gig work",
  description:
    "Discover remote jobs and AI gig work platforms open to India. Compare pay, onboarding time, and apply with referral links.",
};

const themeInitScript = `(function(){try{var k='remoteforge-theme';var s=localStorage.getItem(k);var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

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
        {clerkEnabled ? (
          <ClerkProvider>{body}</ClerkProvider>
        ) : (
          body
        )}
      </body>
    </html>
  );
}
