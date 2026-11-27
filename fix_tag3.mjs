import fs from "fs";

const content = fs.readFileSync("client/src/pages/AdminDashboard.tsx", "utf-8");

// The file uses CRLF line endings
const oldPattern = `              )}\r\n            </section>\r\n          </>\r\n        )}\r\n\r\n        <Section\r\n          eyebrow="Identity controls"`;

const newPattern = `              )}\r\n            </Section>\r\n          </>\r\n        )}\r\n\r\n        <Section\r\n          eyebrow="Identity controls"`;

if (content.includes(oldPattern)) {
  const newContent = content.replace(oldPattern, newPattern);
  fs.writeFileSync("client/src/pages/AdminDashboard.tsx", newContent, "utf-8");
  console.log("Fixed Attempt register closing tag");
} else {
  console.log("Pattern not found");
}
