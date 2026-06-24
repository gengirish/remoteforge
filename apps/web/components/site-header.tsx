import { auth } from "@clerk/nextjs/server";
import { SiteHeaderInner } from "./site-header-inner";

export async function SiteHeader() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const { userId } = clerkEnabled ? await auth() : { userId: null };

  return <SiteHeaderInner userId={userId} clerkEnabled={clerkEnabled} />;
}
