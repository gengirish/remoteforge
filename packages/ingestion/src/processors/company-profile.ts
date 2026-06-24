import { prisma } from "@intelliforge/db";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function syncCompanyProfiles(): Promise<void> {
  const [allGroups, indiaGroups] = await Promise.all([
    prisma.job.groupBy({
      by: ["company"],
      where: { isActive: true },
      _count: { id: true },
    }),
    prisma.job.groupBy({
      by: ["company"],
      where: { isActive: true, indiaFriendly: true },
      _count: { id: true },
    }),
  ]);

  const indiaMap = new Map(indiaGroups.map((g) => [g.company, g._count.id]));

  for (const group of allGroups) {
    const total = group._count.id;
    const indiaCount = indiaMap.get(group.company) ?? 0;
    const acceptRate = total > 0 ? indiaCount / total : 0;
    const slug = toSlug(group.company);

    await prisma.companyProfile.upsert({
      where: { name: group.company },
      create: {
        name: group.company,
        slug,
        totalJobsPosted: total,
        indiaFriendlyCount: indiaCount,
        indiaAcceptRate: acceptRate,
      },
      update: {
        totalJobsPosted: total,
        indiaFriendlyCount: indiaCount,
        indiaAcceptRate: acceptRate,
      },
    });
  }
}
