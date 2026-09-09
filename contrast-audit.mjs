const colors = {
  navy: '#16243d',
  navyDark: '#101d35',
  ivory: '#f7f3e8',
  gold: '#c9a34e',
  darkGold: '#a27e2e',
  muted: '#657084',
  secondary: '#4a566a',
  accent: '#7d5e1e',
  emerald: '#059669',
  emeraldDark: '#047857',
  red: '#dc2626',
  redDark: '#b91c1c',
  white: '#ffffff',
  black: '#000000',
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

const pairs = [
  ['Body text', colors.navy, colors.ivory],
  ['Body text dark', colors.ivory, colors.navyDark],
  ['Muted text', colors.muted, colors.ivory],
  ['Muted text dark', colors.muted, colors.navyDark],
  ['Secondary text', colors.secondary, colors.ivory],
  ['Gold accent', colors.gold, colors.navy],
  ['Dark gold', colors.darkGold, colors.ivory],
  ['Accent text', colors.accent, colors.ivory],
  ['Gold on white', colors.gold, colors.white],
  ['Muted on white', colors.muted, colors.white],
  ['Muted on navy', colors.muted, colors.navy],
  ['Secondary on ivory', colors.secondary, colors.ivory],
  ['Secondary on navy', colors.secondary, colors.navyDark],
  ['Navy on ivory', colors.navy, colors.ivory],
  ['Ivory on navy', colors.ivory, colors.navyDark],
  ['Gold on navy dark', colors.gold, colors.navyDark],
  ['Dark gold on ivory', colors.darkGold, colors.ivory],
  ['Emerald on white', colors.emerald, colors.white],
  ['Red on white', colors.red, colors.white],
];

console.log('WCAG AA Contrast Audit');
console.log('='.repeat(80));
console.log('Normal text: 4.5:1 | Large text: 3:1');
console.log('='.repeat(80));

const failures = [];
pairs.forEach(([name, fg, bg]) => {
  const ratio = contrast(fg, bg);
  const normalPass = ratio >= 4.5 ? 'PASS' : 'FAIL';
  const largePass = ratio >= 3 ? 'PASS' : 'FAIL';
  const status = ratio >= 4.5 ? 'OK' : 'NEEDS FIX';
  console.log(`${name.padEnd(25)} ${fg} on ${bg}: ${ratio.toFixed(2)}:1 [${normalPass}/${largePass}] ${status}`);
  if (ratio < 4.5) failures.push({ name, fg, bg, ratio });
});

console.log('='.repeat(80));
console.log(`FAILURES: ${failures.length}`);
failures.forEach(f => {
  console.log(`  - ${f.name}: ${f.ratio.toFixed(2)}:1 (${f.fg} on ${f.bg})`);
});
