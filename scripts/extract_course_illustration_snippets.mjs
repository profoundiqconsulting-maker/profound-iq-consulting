import { readFileSync } from "node:fs";

const source = readFileSync("client/src/pages/CourseWorkspace.tsx", "utf8");
for (const needle of [
  "setBookmarks",
  "IllustrationCard",
  "illustration.explanatory",
  "illustration.applicational",
  "illustration.experiential",
]) {
  let cursor = 0;
  let count = 0;
  while ((cursor = source.indexOf(needle, cursor)) >= 0 && count < 4) {
    console.log(`--- ${needle} @ ${cursor} ---`);
    console.log(source.slice(Math.max(0, cursor - 700), cursor + 1600));
    cursor += needle.length;
    count += 1;
  }
}
