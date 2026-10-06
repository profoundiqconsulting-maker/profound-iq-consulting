// Analyze coverImage usage in courseCatalog
const fs = require('fs');
const s = fs.readFileSync('shared/courseCatalog.ts', 'utf8');
const matches = [...s.matchAll(/coverImage\s*[:=]\s*['"`]([^'"`]+)['"`]/g)];
console.log('coverImage count:', matches.length);
const fallbacks = matches.filter(m => m[1].includes('cover-people-practice')).length;
console.log('fallback to cover-people-practice:', fallbacks);
console.log('sample:', matches.slice(0, 6).map(m => m[1]));