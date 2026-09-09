import fs from 'fs';

const filePath = 'client/src/pages/UserDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix accent on navy backgrounds: bg-[#16243d] text-[#7d5e1e] → bg-[#16243d] text-accent-on-dark
content = content.replace(/bg-\[#16243d\]\s+text-\[#7d5e1e\]/g, 'bg-[#16243d] text-accent-on-dark');

// 2. Fix eyebrow text-[#7d5e1e] in dark sections
content = content.replace(
  /className="eyebrow text-\[#7d5e1e\]"/g,
  'className="eyebrow text-accent dark:text-accent-on-dark"'
);

// 3. Fix specific instances of text-[#7d5e1e] near dark backgrounds
content = content.replace(
  /className="mt-0\.5 shrink-0 text-\[#7d5e1e\]"/g,
  'className="mt-0.5 shrink-0 text-accent dark:text-accent-on-dark"'
);

// 4. Fix achievement badge text on dark icon bg
content = content.replace(
  /(<span className="text-\[10px\] font-black uppercase tracking-\[\.1em\] text-\[#7d5e1e\]">)/g,
  '<span className="text-[10px] font-black uppercase tracking-[.1em] text-accent dark:text-accent-on-dark">'
);
content = content.replace(
  /(<p className="mt-4 text-\[10px\] font-black uppercase tracking-\[\.12em\] text-\[#7d5e1e\]">)/g,
  '<p className="mt-4 text-[10px] font-black uppercase tracking-[.12em] text-accent dark:text-accent-on-dark">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated UserDashboard.tsx with targeted fixes');
