export function MatchScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "bg-green-100 text-green-800 border-green-200"
      : score >= 50
        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
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
