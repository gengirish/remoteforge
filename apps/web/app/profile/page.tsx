import type { Metadata } from "next";
import { ProfileClient } from "./profile-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Profile | RemoteForge",
  description: "Manage your profile, saved jobs, and job application tracking.",
  robots: { index: false },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
