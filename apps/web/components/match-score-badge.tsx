export function MatchScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300 border-green-200 dark:border-green-500/30"
      : score >= 50
        ? "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/30"
        : "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}
    >
      <span className="text-[10px]">●</span>
      {score}% match
    </span>
  );
}
