import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  'client/src/pages/DashboardEnrolledCourses.tsx',
  'client/src/pages/MyIllustrations.tsx',
  'client/src/components/dashboard/Section.tsx',
  'client/src/components/dashboard/StatCard.tsx',
  'client/src/components/dashboard/DashboardHero.tsx',
];

const replacements = [
  // Gold/amber on light backgrounds - use darker variant
  { from: /text-\[#c9a34e\]/g, to: 'text-[#8b6914]' },
  // Dark gold on light backgrounds - already darker but still failing on some
  { from: /text-\[#a27e2e\]/g, to: 'text-[#7d5e1e]' },
  // Light gold variants on dark backgrounds
  { from: /text-\[#8a681e\]/g, to: 'text-[#7d5e1e]' },
  // Teal on dark backgrounds
  { from: /text-\[#2f6f78\]/g, to: 'text-[#1d5a6e]' },
  // Rose on dark backgrounds  
  { from: /text-\[#8b4f63\]/g, to: 'text-[#6b3a4d]' },
  // Very light grays on light backgrounds - use muted-foreground
  { from: /text-\[#c1cad7\]/g, to: 'text-muted-foreground' },
  { from: /text-\[#9aa2ad\]/g, to: 'text-muted-foreground' },
  { from: /text-\[#8d96a3\]/g, to: 'text-muted-foreground' },
  { from: /text-\[#aeb8c8\]/g, to: 'text-muted-foreground' },
  { from: /text-\[#d7dbe2\]/g, to: 'text-muted-foreground' },
  { from: /text-\[#d8dfeb\]/g, to: 'text-muted-foreground' },
];

let totalChanges = 0;

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${file} (not found)`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;

  for (const { from, to } of replacements) {
    const matches = content.match(from);
    if (matches) {
      fileChanges += matches.length;
      content = content.replace(from, to);
    }
  }

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`FIXED: ${file} (${fileChanges} changes)`);
    totalChanges += fileChanges;
  } else {
    console.log(`OK: ${file} (no changes needed)`);
  }
}

console.log(`\nTotal changes: ${totalChanges}`);
