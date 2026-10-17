/* Render the real CheckpointMark, so app icons cannot drift from the UI emblem.
   Run with Node and sharp installed, or set CHECKPOINT_SHARP_MODULE to its path. */
const fs = require('node:fs/promises');
const path = require('node:path');
const Module = require('node:module');
const { transformSync } = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const sharp = require(process.env.CHECKPOINT_SHARP_MODULE || 'sharp');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

async function main() {
  const filename = path.join(root, 'src/components/CheckpointEffects.jsx');
  const { code } = transformSync(await fs.readFile(filename, 'utf8'), {
    filename, babelrc: false, configFile: false,
    presets: [[require.resolve('@babel/preset-react'), { runtime: 'automatic' }]],
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
  });
  const previousCssLoader = require.extensions['.css'];
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(path.dirname(filename));
  try {
    require.extensions['.css'] = () => {};
    compiled._compile(code, filename);
  } finally {
    if (previousCssLoader) require.extensions['.css'] = previousCssLoader;
    else delete require.extensions['.css'];
  }
  const mark = renderToStaticMarkup(React.createElement(compiled.exports.CheckpointMark))
    .replace('<svg ', '<svg width="120" height="128" ');
  // All visible gold geometry fits inside Android's central 80% safe circle.
  // Square opaque artwork lets each OS apply its own rounded/circular mask.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <title>Checkpoint — Noir et Or</title>
  <defs><linearGradient id="icon-bg" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse"><stop stop-color="#17181c"/><stop offset=".6" stop-color="#090a0c"/><stop offset="1" stop-color="#0e0e10"/></linearGradient><radialGradient id="icon-light"><stop stop-color="#d6b66f" stop-opacity=".055"/><stop offset="1" stop-color="#d6b66f" stop-opacity="0"/></radialGradient></defs>
  <path fill="url(#icon-bg)" d="M0 0h1024v1024H0z"/>
  <circle cx="512" cy="448" r="450" fill="url(#icon-light)"/>
  <g transform="translate(136.9 115.2) scale(6.2)">${mark}</g>
</svg>\n`;
  await fs.writeFile(path.join(publicDir, 'checkpoint-icon.svg'), svg);
  const source = Buffer.from(svg);
  const pngs = new Map();
  for (const size of [16, 32, 48, 64, 128, 180, 192, 256, 512, 1024]) {
    pngs.set(size, await sharp(source).resize(size, size).png().toBuffer());
  }
  for (const size of [64, 180, 192, 512]) {
    await fs.writeFile(path.join(publicDir, `checkpoint-icon-${size}.png`), pngs.get(size));
  }
  await fs.writeFile(path.join(publicDir, 'checkpoint-icon-maskable-512.png'), pngs.get(512));
  // Legacy URLs remain valid for browsers or installations using the old manifest.
  for (const [name, size] of [['favicon.png',64],['logo192.png',192],['logo512.png',512],['logo-cp-transparent.png',512]]) {
    await fs.writeFile(path.join(publicDir, name), pngs.get(size));
  }
  const sizes = [16,32,48,64,128,256];
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1,2); header.writeUInt16LE(sizes.length,4);
  let offset = header.length;
  sizes.forEach((size,i) => {
    const entry = 6+i*16, bytes = pngs.get(size);
    header[entry] = size % 256; header[entry+1] = size % 256;
    header.writeUInt16LE(1,entry+4); header.writeUInt16LE(32,entry+6);
    header.writeUInt32LE(bytes.length,entry+8); header.writeUInt32LE(offset,entry+12);
    offset += bytes.length;
  });
  await fs.writeFile(path.join(publicDir,'favicon.ico'),Buffer.concat([header,...sizes.map(size=>pngs.get(size))]));
  console.log('Generated Checkpoint SVG, PNG, maskable, Apple and ICO assets.');
}
main().catch(error=>{ console.error(error); process.exitCode=1; });
