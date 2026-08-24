import fs from "node:fs";
const catalogPath = "shared/courseCatalog.ts";
const replacement = fs.readFileSync("scripts/deep-lesson-content.txt", "utf8");
const source = fs.readFileSync(catalogPath, "utf8");
const start = source.indexOf("const lessonContent =");
const end = source.indexOf("const quizQuestions =", start);
if (start < 0 || end < 0) throw new Error("Lesson generator anchors not found");
fs.writeFileSync(catalogPath, source.slice(0, start) + replacement + source.slice(end));
console.log("Deep lesson generator applied");
