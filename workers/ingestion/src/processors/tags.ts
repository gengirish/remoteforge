const TECH_TAGS = [
  "react",
  "vue",
  "angular",
  "node",
  "python",
  "java",
  "go",
  "rust",
  "typescript",
  "javascript",
  "aws",
  "docker",
  "kubernetes",
  "postgres",
  "mongodb",
  "ai",
  "ml",
  "llm",
  "rlhf",
];

export function extractTags(description: string): string[] {
  const lower = description.toLowerCase();
  const found = TECH_TAGS.filter((tag) => lower.includes(tag));
  return [...new Set(found)];
}
