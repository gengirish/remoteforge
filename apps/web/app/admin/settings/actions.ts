"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

const ADMIN_COOKIE = "rf_admin_token";

function internalHeaders() {
  const key = process.env.REMOTEFORGE_INTERNAL_KEY;
  if (!key) throw new Error("REMOTEFORGE_INTERNAL_KEY is not configured on the web server");
  return { "X-Internal-Key": key, "Content-Type": "application/json" };
}

async function isAdminAuthenticated() {
  const token = process.env.ADMIN_SETTINGS_TOKEN;
  if (!token) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === token;
}

export async function verifyAdminAccess(formToken: string) {
  const token = process.env.ADMIN_SETTINGS_TOKEN;
  if (!token || formToken !== token) {
    return { success: false as const, error: "Invalid admin token" };
  }
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { success: true as const };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export type AffiliateSettingsData = {
  jobBoards: {
    key: string;
    label: string;
    description: string;
    domain: string;
    param: string;
    value: string | null;
    dbValue: string | null;
    envValue: string | null;
    source: "database" | "env" | "unset";
  }[];
  platforms: {
    id: string;
    slug: string;
    name: string;
    referralUrl: string | null;
    affiliateUrl: string | null;
    referralReward: string | null;
    indiaAccepted: boolean;
  }[];
};

export async function fetchAffiliateSettings(): Promise<
  { success: true; data: AffiliateSettingsData } | { success: false; error: string }
> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const res = await fetch(`${getApiUrl()}/api/internal/affiliate-settings`, {
      headers: internalHeaders(),
      cache: "no-store",
    });
    const json = await res.json();
    if (!json.success) return { success: false, error: json.error ?? "Failed to load settings" };
    return { success: true, data: json.data as AffiliateSettingsData };
  } catch {
    return { success: false, error: "API unreachable. Check API_URL and REMOTEFORGE_INTERNAL_KEY." };
  }
}

export async function saveJobBoardAffiliates(
  settings: { key: string; value: string | null }[],
) {
  if (!(await isAdminAuthenticated())) {
    return { success: false as const, error: "Unauthorized" };
  }

  const res = await fetch(`${getApiUrl()}/api/internal/affiliate-settings`, {
    method: "PUT",
    headers: internalHeaders(),
    body: JSON.stringify({ settings }),
  });
  const json = await res.json();
  if (!json.success) return { success: false as const, error: json.error ?? "Save failed" };
  return { success: true as const };
}

export async function saveGigAffiliate(
  id: string,
  data: {
    referralUrl?: string | null;
    affiliateUrl?: string | null;
    referralReward?: string | null;
  },
) {
  if (!(await isAdminAuthenticated())) {
    return { success: false as const, error: "Unauthorized" };
  }

  const res = await fetch(`${getApiUrl()}/api/internal/gig-platforms/${id}/affiliate`, {
    method: "PATCH",
    headers: internalHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) return { success: false as const, error: json.error ?? "Save failed" };
  return { success: true as const };
}

export async function checkAdminConfigured() {
  return {
    hasAdminToken: Boolean(process.env.ADMIN_SETTINGS_TOKEN),
    hasInternalKey: Boolean(process.env.REMOTEFORGE_INTERNAL_KEY),
    authenticated: await isAdminAuthenticated(),
  };
}
