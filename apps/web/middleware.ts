import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isClerkEnabled } from "@/lib/clerk-config";

const isProtected = createRouteMatcher([
  "/profile(.*)",
  "/dashboard(.*)",
  "/employer/dashboard(.*)",
  "/employer/jobs(.*)",
  "/employer/talent-report(.*)",
]);

/**
 * /internal renders owner stats with the server's REMOTEFORGE_INTERNAL_KEY, so
 * without a gate anyone could read them. Basic auth with that same key as the
 * password works whether or not Clerk is enabled. No key configured = locked.
 */
function internalGate(req: NextRequest): NextResponse | undefined {
  if (!req.nextUrl.pathname.startsWith("/internal")) return undefined;

  const key = process.env.REMOTEFORGE_INTERNAL_KEY;
  const [scheme, encoded] = req.headers.get("authorization")?.split(" ") ?? [];
  if (key && scheme === "Basic" && encoded) {
    try {
      const password = atob(encoded).split(":").slice(1).join(":");
      if (password === key) return undefined;
    } catch {
      // malformed base64 falls through to the challenge
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="RemoteForge internal", charset="UTF-8"' },
  });
}

export default isClerkEnabled
  ? clerkMiddleware(async (auth, req) => {
      const denied = internalGate(req);
      if (denied) return denied;
      if (isProtected(req)) await auth.protect();
    })
  : (req: NextRequest) => internalGate(req) ?? NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
