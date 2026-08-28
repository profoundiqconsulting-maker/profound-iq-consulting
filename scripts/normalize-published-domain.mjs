import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const publishedOrigin = "https://profoundiq-vguqrhsm.manus.space";
const legacyUrl = "https://profoundiq-vguqrhsm.manus.space";
const files = execFileSync("rg", ["-l", legacyUrl, ".", "--glob", "!node_modules/**", "--glob", "!dist/**", "--glob", "!pnpm-lock.yaml", "--glob", "!docs/**", "--glob", "!ideas.md"], { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);

for (const file of files) {
  const source = await readFile(file, "utf8");
  const normalized = source.replaceAll(legacyUrl, publishedOrigin);
  if (normalized !== source) await writeFile(file, normalized);
}

const visualPath = "./shared/courseCompletionVisual.ts";
const visual = await readFile(visualPath, "utf8");
const normalizedVisual = visual.replaceAll("profoundiqconsulting.com", "profoundiq-vguqrhsm.manus.space");
if (normalizedVisual !== visual) await writeFile(visualPath, normalizedVisual);

console.log(`Normalized ${files.length} legacy URL file(s) to ${publishedOrigin}.`);
