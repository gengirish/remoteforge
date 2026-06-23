export function generateSlug(title: string, company: string): string {
  const base = `${title}-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
