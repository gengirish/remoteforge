import { auth } from "@clerk/nextjs/server";
import { isClerkEnabled } from "@/lib/clerk-config";
import { SiteHeaderInner } from "./site-header-inner";

export async function SiteHeader() {
  const { userId } = isClerkEnabled ? await auth() : { userId: null };

  return <SiteHeaderInner userId={userId} clerkEnabled={isClerkEnabled} />;
}
