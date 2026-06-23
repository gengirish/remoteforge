import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export async function SiteHeader() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const { userId } = clerkEnabled ? await auth() : { userId: null };

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          RemoteForge
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/jobs" className="hover:text-primary">
            Remote Jobs
          </Link>
          <Link href="/ai-gigs" className="hover:text-primary">
            AI Gig Work
          </Link>
          {clerkEnabled &&
            (userId ? (
              <>
                <Link href="/profile" className="hover:text-primary">
                  My Profile
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button type="button" className="hover:text-primary">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground"
                  >
                    Sign up
                  </button>
                </SignUpButton>
              </>
            ))}
        </nav>
      </div>
    </header>
  );
}
