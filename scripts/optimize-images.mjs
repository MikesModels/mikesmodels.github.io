// Turns the source images in assets-src/ into the right-sized WebP/PNG files the site ships.
// Run with `npm run images` whenever a source image changes.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = new URL('../assets-src/', import.meta.url);
const OUT = new URL('../src/assets/img/', import.meta.url);
const PUB = new URL('../public/', import.meta.url);
await mkdir(OUT, { recursive: true });
await mkdir(PUB, { recursive: true });

const src = f => new URL(f, SRC).pathname.replace(/^\/(\w:)/, '$1');
const out = (f, dir = OUT) => new URL(f, dir).pathname.replace(/^\/(\w:)/, '$1');

const jobs = [];
const webp = (from, to, width, opts = {}) =>
  jobs.push(sharp(src(from)).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 6, ...opts }).toFile(out(to)));

// Home banner logo (white background) — shown 184–368 css px wide.
webp('logo.png', 'logo-400.webp', 400);
webp('logo.png', 'logo-800.webp', 800);
// Transparent logo — the gallery end wall.
webp('logo-transparent.png', 'logo-tr-480.webp', 480, { alphaQuality: 90 });
// Gallery textures.
webp('floor-marble.jpg', 'floor-marble.webp', undefined, { quality: 78 });
webp('marble-white.jpg', 'marble-white.webp', undefined, { quality: 78 });
webp('marble-dark.jpg', 'marble-dark.webp', undefined, { quality: 78 });
webp('carpet-pile.png', 'carpet-pile.webp', undefined, { quality: 80 });

// Favicons: the print head + nozzle from the logo.
const head = { left: 851, top: 25, width: 332, height: 332 };
const icon = (size, file, bg) => {
  let img = sharp(src('logo-transparent.png')).extract(head).resize(size, size);
  if (bg) img = img.flatten({ background: bg });
  jobs.push(img.png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(out(file, PUB)));
};
icon(32, 'favicon-32.png');
icon(192, 'icon-192.png');
icon(180, 'apple-touch-icon.png', '#FFFFFF');

// Link-preview card (Open Graph): the logo centred on its own off-white background, 1200×630.
jobs.push(sharp(src('logo.png')).resize({ width: 1000 }).toBuffer().then(logo =>
  sharp({ create: { width: 1200, height: 630, channels: 3, background: '#FCFCFC' } }) // the logo's own background
    .composite([{ input: logo, gravity: 'centre' }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(out('og-image.jpg', PUB))));

await Promise.all(jobs);
console.log(`Wrote ${jobs.length} images.`);
