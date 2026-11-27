import fs from "fs";

let content = fs.readFileSync("client/src/pages/AdminDashboard.tsx", "utf-8");

// Fix the Failed-login activity Section closing tag - with CRLF
const oldClose = `          </div>\r\n        </section>\r\n\r\n        {confirmResetRevocation`;

const newClose = `          </div>\r\n        </Section>\r\n\r\n        {confirmResetRevocation`;

if (content.includes(oldClose)) {
  content = content.replace(oldClose, newClose);
  console.log("Fixed Failed-login activity closing tag");
} else {
  console.log("Closing pattern not found");
  // Try with just </section>
  const altClose = `</section>\r\n\r\n        {confirmResetRevocation`;
  const altNewClose = `</Section>\r\n\r\n        {confirmResetRevocation`;
  if (content.includes(altClose)) {
    content = content.replace(altClose, altNewClose);
    console.log("Fixed with alt pattern");
  } else {
    console.log("Alt not found");
  }
}

fs.writeFileSync("client/src/pages/AdminDashboard.tsx", content, "utf-8");
