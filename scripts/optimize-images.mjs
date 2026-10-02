import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const root = process.cwd();
const targets = [
  {
    src: path.join(root, "client/public/ProfoundIQLogo.png"),
    dst: path.join(root, "client/public/ProfoundIQLogo.png"),
    opts: { resize: { width: 512 }, png: { compressionLevel: 9, quality: 90 } },
  },
  {
    src: path.join(root, "client/public/ProfoundIQSocialSharingImage.png"),
    dst: path.join(root, "client/public/ProfoundIQSocialSharingImage.png"),
    opts: { resize: { width: 1200 }, png: { compressionLevel: 9, quality: 88 } },
  },
];

for (const t of targets) {
  const srcStat = fs.statSync(t.src);
  console.log(`\nOptimizing ${path.basename(t.src)} (${(srcStat.size / 1024).toFixed(1)} KB)`);

  const pipeline = sharp(t.src);
  if (t.opts.resize) pipeline.resize(t.opts.resize);
  const optimized = await pipeline.png(t.opts.png).toBuffer();

  fs.writeFileSync(t.dst, optimized);
  const dstStat = fs.statSync(t.dst);
  const saved = ((srcStat.size - dstStat.size) / 1024).toFixed(1);
  const pct = (((srcStat.size - dstStat.size) / srcStat.size) * 100).toFixed(1);
  console.log(`  -> ${(dstStat.size / 1024).toFixed(1)} KB (saved ${saved} KB, ${pct}%)`);
}

console.log("\nDone.");
