// Removes the white studio background from vial renders so they can sit on a dark stage
// (the hero and closing CTA) as transparent cutouts with drop shadows.
//
// Usage:  node scripts/cutouts.mjs [file1.png file2.png ...]
// With no arguments it processes the default set used by the dark sections.
// Output goes to public/products/cut/<name>.png (trimmed, transparent).
//
// How it works: a flood fill from the image border clears every near-white pixel that is
// connected to the edge. White *inside* the vial (the label) is enclosed by the glass outline,
// so it is never reached and stays intact.

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const SRC = "public/products";
const OUT = "public/products/cut";
const TOL = 22; // 0-255: how close to pure white still counts as background

const DEFAULTS = [
  "tb-500-10mg.png",
  "lyfe-ghk-cu-100mg.png",
  "bpc-157-10mg.png",
  "lyfe-nad-500mg.png",
  "tb-500-bpc-157.png",
  "semax-10mg.png",
  "lyfe-tesamorelin-10mg.png",
];

const files = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULTS;

fs.mkdirSync(OUT, { recursive: true });

for (const f of files) {
  const base = path.basename(f);
  const src = path.join(SRC, base);
  if (!fs.existsSync(src)) {
    console.log("skip (missing):", base);
    continue;
  }
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const near = (i) => data[i] >= 255 - TOL && data[i + 1] >= 255 - TOL && data[i + 2] >= 255 - TOL;
  const seen = new Uint8Array(W * H);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const p = y * W + x;
    if (!seen[p]) {
      seen[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < W; x++) {
    push(x, 0);
    push(x, H - 1);
  }
  for (let y = 0; y < H; y++) {
    push(0, y);
    push(W - 1, y);
  }
  while (stack.length) {
    const p = stack.pop();
    const i = p * 4;
    if (!near(i)) continue;
    data[i + 3] = 0;
    const x = p % W;
    const y = (p / W) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  const buf = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  await sharp(buf).trim({ threshold: 1 }).png().toFile(path.join(OUT, base));
  console.log("cut:", base);
}
