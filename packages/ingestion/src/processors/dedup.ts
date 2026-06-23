import { createHash } from "crypto";

export function dedupHash(title: string, company: string): string {
  return createHash("sha256")
    .update(`${title.toLowerCase().trim()}|${company.toLowerCase().trim()}`)
    .digest("hex");
}

export function dedupPlatformHash(name: string): string {
  return createHash("sha256")
    .update(name.toLowerCase().trim())
    .digest("hex");
}
