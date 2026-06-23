import { SignJWT, jwtVerify } from "jose";
import type { HandoffPayload } from "./types";

function getSecret(): Uint8Array {
  const secret = process.env.INTELLIFORGE_CROSS_AUTH_SECRET;
  if (!secret) {
    throw new Error("INTELLIFORGE_CROSS_AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function issueHandoffToken(
  userId: string,
  email: string,
  source: string,
): Promise<string> {
  return new SignJWT({ userId, email, source })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("5m")
    .sign(getSecret());
}

export async function verifyHandoffToken(
  token: string,
): Promise<HandoffPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as HandoffPayload;
}

export type { HandoffPayload } from "./types";
