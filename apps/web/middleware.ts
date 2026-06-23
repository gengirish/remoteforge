import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default clerkEnabled
  ? clerkMiddleware()
  : (_req: NextRequest) => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
