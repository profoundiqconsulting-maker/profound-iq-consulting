import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  "client/src/pages/DashboardAssessment.tsx",
  "client/src/pages/DashboardPsychometrics.tsx",
  "client/src/pages/DashboardCareerPath.tsx",
  "client/src/pages/DashboardEnrolledCourses.tsx",
  "client/src/pages/UserDashboard.tsx",
  "client/src/components/dashboard/Section.tsx",
  "client/src/components/dashboard/StatCard.tsx",
  "client/src/components/dashboard/DashboardHero.tsx",
  "client/src/components/dashboard/FilterBar.tsx",
  "client/src/components/DashboardLayout.tsx",
  "client/src/pages/Assessment.tsx",
  "client/src/pages/Psychometrics.tsx",
  "client/src/pages/Auth.tsx",
  "client/src/pages/CertificateVerification.tsx",
  "client/src/pages/Blog.tsx",
  "client/src/pages/Home.tsx",
  "client/src/components/SiteNavigation.tsx",
  "client/src/components/AdminSurveysPanel.tsx",
  "client/src/pages/admin/AdminSystem.tsx",
];

const replacements = [
  { from: /text-\[#657084\]/g, to: "text-muted-foreground" },
  { from: /text-\[#4a566a\]/g, to: "text-muted-foreground" },
  { from: /text-\[#a27e2e\]/g, to: "text-[#7d5e1e]" },
  { from: /text-emerald-600/g, to: "text-emerald-700" },
];

let totalChanges = 0;

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${file} (not found)`);
    continue;
  }

  let content = fs.readFileSync(filePath, "utf8");
  let fileChanges = 0;

  for (const { from, to } of replacements) {
    const matches = content.match(from);
    if (matches) {
      fileChanges += matches.length;
      content = content.replace(from, to);
    }
  }

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`FIXED: ${file} (${fileChanges} changes)`);
    totalChanges += fileChanges;
  } else {
    console.log(`OK: ${file} (no changes needed)`);
  }
}

console.log(`\nTotal changes: ${totalChanges}`);
