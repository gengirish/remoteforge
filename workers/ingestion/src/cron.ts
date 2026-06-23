import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

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

  console.log("[cron] Scheduled ingestion every 6h for:", sources.join(", "));
  return queue;
}
