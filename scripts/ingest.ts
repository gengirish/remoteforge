import { runIngestion } from "@intelliforge/ingestion";

async function main() {
  console.log("Starting job ingestion...");
  const results = await runIngestion();
  for (const r of results) {
    console.log(
      `  ${r.source}: ${r.upserted} jobs${r.error ? ` (error: ${r.error})` : ""}`,
    );
  }
  const total = results.reduce((s, r) => s + r.upserted, 0);
  console.log(`Done. ${total} jobs upserted.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
