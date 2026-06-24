"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/jobs", label: "Remote Jobs" },
  { href: "/ai-gigs", label: "AI Gig Work" },
  { href: "/companies/hiring-from-india", label: "Companies" },
  { href: "/data-api", label: "Data API" },
] as const;

interface SiteHeaderInnerProps {
  userId: string | null;
  clerkEnabled: boolean;
}

export function SiteHeaderInner({ userId, clerkEnabled }: SiteHeaderInnerProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-xl font-bold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            RF
          </span>
          <span>
            Remote<span className="text-primary">Forge</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
          <ThemeToggle className="ml-1" />
          {clerkEnabled &&
            (userId ? (
              <div className="ml-2 pl-2 border-l border-border">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="ml-3 flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Sign up</Button>
                </SignUpButton>
              </div>
            ))}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2.5 md:hidden">
              <span className="text-sm font-medium text-muted-foreground">
                Appearance
              </span>
              <ThemeToggle />
            </div>
            {clerkEnabled && !userId && (
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="w-full">Sign up</Button>
                </SignUpButton>
              </div>
            )}
            {clerkEnabled && userId && (
              <div className="mt-3 border-t border-border pt-3">
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
