import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function scheduleIngestion(connection: ConnectionOptions): Queue {
  const queue = new Queue("job-ingestion", { connection });

  const sources = ["remotive", "wwr", "remoteok"] as const;

  for (const source of sources) {
    queue.add(
      `ingest-${source}`,
      { source },
      {
        repeat: { every: SIX_HOURS_MS },
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    );
  }

  queue.add(
    "sync-exchange-rate",
    { source: "sync-exchange-rate" },
    {
      repeat: { every: ONE_DAY_MS },
      removeOnComplete: 30,
      removeOnFail: 10,
    },
  );

  console.log("[cron] Scheduled ingestion every 6h for:", sources.join(", "));
  console.log("[cron] Scheduled USD→INR sync daily (Frankfurter)");
  return queue;
}
