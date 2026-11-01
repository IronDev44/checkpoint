/* Conventional pixel flood-fill only: no generated or reconstructed product pixels.
 * NODE_PATH must include sharp. Run: node scripts/prepare-tritton-photos.cjs
 * Originals are downloaded into the ignored .account-backups directory.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const sources = require('../docs/tritton-photo-sources.json');

async function prepare(row) {
  const input = path.join('.account-backups/tritton-originals', `${row.slug}-source`);
  fs.mkdirSync(path.dirname(input), { recursive: true });
  if (!fs.existsSync(input)) {
    const response = await fetch(row.imageUrl, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`${row.slug}: HTTP ${response.status}`);
    fs.writeFileSync(input, Buffer.from(await response.arrayBuffer()));
  }
  const { data, info } = await sharp(input).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  if (!row.nativeAlpha) {
    const visited = new Uint8Array(w * h), queue = new Int32Array(w * h);
    let head = 0, tail = 0;
    const visit = (x, y) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const p = y * w + x, i = p * 4;
      if (visited[p] || Math.min(data[i], data[i + 1], data[i + 2]) < (row.threshold || 242)) return;
      visited[p] = 1; queue[tail++] = p;
    };
    for (let x = 0; x < w; x++) { visit(x, 0); visit(x, h - 1); }
    for (let y = 0; y < h; y++) { visit(0, y); visit(w - 1, y); }
    for (const [x, y] of row.backgroundSeeds || []) visit(Math.round(x * (w - 1)), Math.round(y * (h - 1)));
    while (head < tail) {
      const p = queue[head++], x = p % w, y = Math.floor(p / w);
      data[p * 4 + 3] = 0;
      visit(x - 1, y); visit(x + 1, y); visit(x, y - 1); visit(x, y + 1);
    }
    // Explicit masks remove detached shop labels, never parts of the product.
    for (const [left, top, right, bottom] of row.excludeRects || []) {
      for (let y = Math.floor(top * h); y < Math.ceil(bottom * h); y++)
        for (let x = Math.floor(left * w); x < Math.ceil(right * w); x++) data[(y * w + x) * 4 + 3] = 0;
    }
    // One-pixel antialias fringe, with white matte decontamination.
    const alpha = Buffer.from(data);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      if (!alpha[i + 3]) continue;
      const near = !alpha[i - 4 + 3] || !alpha[i + 4 + 3] || !alpha[i - w * 4 + 3] || !alpha[i + w * 4 + 3];
      if (near) {
        const a = Math.min(1, (255 - Math.min(data[i], data[i + 1], data[i + 2])) / 65);
        data[i + 3] = Math.round(255 * a);
        if (a > 0 && a < 1) for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.round((data[i + c] - 255 * (1 - a)) / a));
      }
    }
  }
  let left = w, top = h, right = 0, bottom = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 32) {
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  const product = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .resize(440, 440, { fit: 'inside' }).png().toBuffer();
  const meta = await sharp(product).metadata();
  await sharp({ create: { width: 500, height: 500, channels: 4, background: '#00000000' } })
    .composite([{ input: product, left: Math.floor((500 - meta.width) / 2), top: Math.floor((500 - meta.height) / 2) }])
    .png().toFile(`public/images/hardware/audio/tritton-${row.slug}.png`);
  console.log(row.slug);
}
(async () => { for (const row of sources) await prepare(row); })().catch(error => { console.error(error); process.exitCode = 1; });
