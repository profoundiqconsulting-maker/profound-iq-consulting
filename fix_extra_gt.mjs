import fs from "fs";

let content = fs.readFileSync("client/src/pages/AdminDashboard.tsx", "utf-8");

// Fix the extra > in </Section>>
const oldClose = `    </Section>>
  );
}`;

const newClose = `    </Section>
  );
}`;

if (content.includes(oldClose)) {
  content = content.replace(oldClose, newClose);
  console.log("Fixed extra > in closing tag");
} else {
  console.log("Pattern not found");
  // Try with CRLF
  const altClose = `    </Section>>\r\n  );\r\n}`;
  const altNewClose = `    </Section>\r\n  );\r\n}`;
  if (content.includes(altClose)) {
    content = content.replace(altClose, altNewClose);
    console.log("Fixed with alt pattern");
  } else {
    console.log("Alt not found");
    const idx = content.indexOf("</Section>>");
    if (idx > 0) {
      console.log(
        "Context:",
        JSON.stringify(content.substring(idx - 20, idx + 20))
      );
    }
  }
}

fs.writeFileSync("client/src/pages/AdminDashboard.tsx", content, "utf-8");
