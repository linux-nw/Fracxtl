// Erzeugt icon.png (512x512): Schluesselloch, in dem ein Mandelbrot-Ausschnitt sichtbar wird; schreibt auch icon.svg.
// Aufruf: node tools/make-icon.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 512, GRID = Number(process.env.GRID || 96), CELL = SIZE / GRID, MAX_ITER = 400;
const K = GRID / 64; // Geometrie ist in 64er-Einheiten entworfen
const BG = [7, 11, 20];
const STOPS = [[10, 30, 90], [30, 100, 210], [76, 201, 255], [92, 255, 196], [235, 255, 248], [76, 201, 255]];

function palette(t) {
  const s = (t % 1) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(s)), f = s - i;
  return STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f));
}

function mandel(x0, y0) {
  let x = 0, y = 0, x2 = 0, y2 = 0, i = 0;
  while (x2 + y2 <= 256 && i < MAX_ITER) { y = 2 * x * y + y0; x = x2 - y2 + x0; x2 = x * x; y2 = y * y; i++; }
  return i >= MAX_ITER ? -1 : i + 1 - Math.log2(Math.log2(x2 + y2) / 2);
}

// Schluesselloch als Maske: Kreis oben, nach unten breiter werdender Schlitz
function inKeyhole(gx, gy) {
  const x = gx / K, y = gy / K;
  if (Math.hypot(x - 32, y - 25) <= 14.5) return true;
  return y >= 34 && y <= 55 && Math.abs(x - 32) <= 4.5 + (y - 34) * 0.32;
}
function distToKeyhole(c, r) {
  let d = Infinity;
  const R = Math.ceil(4 * K);
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++)
    if (inKeyhole(c + dx + 0.5, r + dy + 0.5)) d = Math.min(d, Math.hypot(dx, dy) / K);
  return d;
}
const hash = (c, r) => { let h = Math.imul(c * 374761393 + r * 668265263, 1274126177); h ^= h >>> 13; return ((Math.imul(h, 1103515245) >>> 0) % 1000) / 1000; };

// Zelle -> Farbe (oder null = Hintergrund). Raender loesen sich in Pixel auf.
function cellColor(c, r) {
  if (inKeyhole(c + 0.5, r + 0.5)) {
    const [vx, vy, span] = (process.env.VIEW || '-0.74364,0.13182,0.02').split(',').map(Number);
    const it = mandel(vx + ((c + 0.5) / GRID - 0.5) * span, vy + ((r + 0.5) / GRID - 0.5) * span);
    return it < 0 ? [22, 44, 92] : palette(it / 22);
  }
  const d = distToKeyhole(c, r);
  if (d <= 4 && hash(c, r) < 0.62 - d * 0.16) {
    const t = hash(r, c);
    return t < 0.4 ? [92, 255, 196].map(v => Math.round(v * (1 - d * 0.16))) : [76, 201, 255].map(v => Math.round(v * (1 - d * 0.16)));
  }
  return null;
}

function inRoundedSquare(px, py) {
  const R = 112, dx = Math.max(R - px, px - (SIZE - R), 0), dy = Math.max(R - py, py - (SIZE - R), 0);
  return dx * dx + dy * dy <= R * R;
}

const cells = [];
for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) cells.push(cellColor(c, r));

const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
for (let py = 0; py < SIZE; py++) {
  raw[py * (SIZE * 4 + 1)] = 0;
  for (let px = 0; px < SIZE; px++) {
    const c = Math.floor(px / CELL), r = Math.floor(py / CELL);
    const edge = CELL >= 6 && (px % CELL < 1 || py % CELL < 1);
    let col = cells[r * GRID + c] || BG, a = inRoundedSquare(px + 0.5, py + 0.5) ? 255 : 0;
    if (edge) col = col.map(v => Math.round(v * 0.85));
    const o = py * (SIZE * 4 + 1) + 1 + px * 4;
    raw[o] = col[0]; raw[o + 1] = col[1]; raw[o + 2] = col[2]; raw[o + 3] = a;
  }
}

// SVG-Fassung (ein Rechteck pro Zelle, Hintergrund als abgerundetes Quadrat)
const hex = col => '#' + col.map(v => v.toString(16).padStart(2, '0')).join('');
const rects = cells.map((col, i) => col ? `<rect x="${+((i % GRID) * CELL).toFixed(3)}" y="${+(Math.floor(i / GRID) * CELL).toFixed(3)}" width="${+CELL.toFixed(3)}" height="${+CELL.toFixed(3)}" fill="${hex(col)}"/>` : '').join('');
fs.writeFileSync(path.join(__dirname, '..', 'icon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges"><rect width="${SIZE}" height="${SIZE}" rx="112" fill="${hex(BG)}"/>${rects}</svg>
`);

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = buf => { let c = 0xFFFFFFFF; for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0); ihdr.writeUInt32BE(SIZE, 4); ihdr[8] = 8; ihdr[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))
]);
fs.writeFileSync(path.join(__dirname, '..', 'icon.png'), png);
console.log('icon.png geschrieben', png.length, 'Bytes');
