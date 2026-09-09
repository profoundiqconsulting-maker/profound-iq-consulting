const fs = require('fs');
const path = 'client/src/pages/UserDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace text-[#7d5e1e] with text-accent dark:text-accent-on-dark
// This preserves light mode (accent = gold) and adds dark mode variant (accent-on-dark = light gold)
const before1 = content;
content = content.replace(/text-\[#7d5e1e\]/g, 'text-accent dark:text-accent-on-dark');
const count1 = (content.match(/text-accent dark:text-accent-on-dark/g) || []).length - (before1.match(/text-accent dark:text-accent-on-dark/g) || []).length;
console.log(`Replaced text-[#7d5e1e] → text-accent dark:text-accent-on-dark: ${content.split('text-accent dark:text-accent-on-dark').length - 1} total`);

// Replace text-[#16243d] with text-foreground dark:text-foreground
// This preserves light mode (foreground = navy) and adds dark mode variant (foreground = ivory in dark)
const before2 = content;
content = content.replace(/text-\[#16243d\]/g, 'text-foreground dark:text-foreground');
console.log(`Replaced text-[#16243d] → text-foreground dark:text-foreground: ${content.split('text-foreground dark:text-foreground').length - 1} total`);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated UserDashboard.tsx');
