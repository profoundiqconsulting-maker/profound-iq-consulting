import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dashboardFiles = [
  'client/src/pages/DashboardAssessment.tsx',
  'client/src/pages/DashboardPsychometrics.tsx',
  'client/src/pages/DashboardCareerPath.tsx',
  'client/src/pages/DashboardEnrolledCourses.tsx',
  'client/src/pages/UserDashboard.tsx',
  'client/src/components/dashboard/Section.tsx',
  'client/src/components/dashboard/StatCard.tsx',
  'client/src/components/dashboard/DashboardHero.tsx',
  'client/src/components/dashboard/FilterBar.tsx',
  'client/src/components/DashboardLayout.tsx',
  'client/src/pages/MyIllustrations.tsx',
];

const colorMap = {
  '#16243d': 'navy',
  '#101d35': 'navyDark',
  '#f7f3e8': 'ivory',
  '#c9a34e': 'gold',
  '#a27e2e': 'darkGold',
  '#657084': 'muted',
  '#4a566a': 'secondary',
  '#7d5e1e': 'accent',
  '#8b6914': 'goldDark',
  '#8a681e': 'goldDarkAlt',
  '#2f6f78': 'teal',
  '#8b4f63': 'rose',
  '#059669': 'emerald',
  '#047857': 'emeraldDark',
  '#dc2626': 'red',
  '#b91c1c': 'redDark',
  '#ffffff': 'white',
  '#000000': 'black',
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrast(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 0;
  const l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

for (const file of dashboardFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`\nSKIP: ${file}`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const textColorMatches = content.match(/text-\[#([a-f0-9]{6})\]|text-(?:emerald|red|blue|green|yellow|purple|pink|orange|teal|rose|slate|zinc|neutral|stone|sky|indigo|violet|fuchsia|cyan|lime|amber|emerald)-(?:50|100|200|300|400|500|600|700|800|900)/g) || [];
  const bgMatches = content.match(/bg-\[#([a-f0-9]{6})\]|bg-(?:white|black|transparent|ivory|navy|slate|zinc|neutral|stone|sky|indigo|violet|fuchsia|cyan|lime|amber|emerald|rose|teal|orange)-(?:50|100|200|300|400|500|600|700|800|900|950)/g) || [];
  
  const textColors = new Set();
  const bgs = new Set();
  
  textColorMatches.forEach(match => {
    const hex = match.match(/#([a-f0-9]{6})/);
    if (hex) textColors.add('#' + hex[1]);
  });
  
  bgMatches.forEach(match => {
    const hex = match.match(/#([a-f0-9]{6})/);
    if (hex) bgs.add('#' + hex[1]);
  });

  if (textColors.size === 0 && bgs.size === 0) continue;

  console.log(`\n${file}`);
  console.log('  Text colors:', [...textColors].map(c => c + ' (' + colorMap[c] + ')').join(', ') || 'none');
  console.log('  Backgrounds:', [...bgs].map(c => c + ' (' + colorMap[c] + ')').join(', ') || 'none');
  
  const failures = [];
  for (const fg of textColors) {
    for (const bg of bgs) {
      const ratio = contrast(fg, bg);
      if (ratio < 4.5) {
        failures.push({ fg, bg, ratio });
      }
    }
  }
  
  if (failures.length > 0) {
    console.log('  FAILURES:');
    failures.forEach(f => {
      console.log(`    ${f.fg} on ${f.bg}: ${f.ratio.toFixed(2)}:1`);
    });
  } else {
    console.log('  All combinations pass WCAG AA (4.5:1)');
  }
}
