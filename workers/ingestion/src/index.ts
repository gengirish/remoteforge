import { Worker } from "bullmq";
import { prisma } from "@intelliforge/db";
import { ingestSource, type IngestSource } from "@intelliforge/ingestion";
import { scheduleIngestion } from "./cron";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const connection = { url: redisUrl, maxRetriesPerRequest: null };

const worker = new Worker(
  "job-ingestion",
  async (job) => {
    const source = (job.data.source ?? "ingest-all") as string;
    console.log(`[worker] Processing: ${job.name}`, job.data);

    if (source === "ingest-all") {
      for (const s of ["remotive", "wwr", "remoteok"] as IngestSource[]) {
        const result = await ingestSource(s);
        console.log(`[ingestion] ${result.source}: ${result.upserted} jobs`, result.error ?? "");
      }
      return;
    }

    const result = await ingestSource(source as IngestSource);
    console.log(`[ingestion] ${result.source}: ${result.upserted} jobs`, result.error ?? "");
  },
  { connection, concurrency: 1 },
);

worker.on("completed", (job) => console.log(`[worker] Completed: ${job.id}`));
worker.on("failed", (job, err) => console.error(`[worker] Failed: ${job?.id}`, err));

scheduleIngestion(connection);
console.log("[worker] RemoteForge ingestion worker started");

process.on("SIGTERM", async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
