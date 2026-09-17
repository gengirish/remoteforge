import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchReferralCode } from "@/lib/data";
import { ReferClient } from "./refer-client";

export const metadata: Metadata = {
  title: "Refer & Earn | RemoteForge",
  description:
    "Refer friends to RemoteForge and earn ₹500 for every friend who applies to their first remote job.",
};

export const dynamic = "force-dynamic";

export default async function ReferPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");
  const data = await fetchReferralCode(await getToken());
  return <ReferClient data={data} />;
}
