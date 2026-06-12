// Erzeugt die App-Icons (PNG + ICO) ohne externe Abhängigkeiten.
// Aufruf: npm run icons
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src-tauri", "icons");
mkdirSync(outDir, { recursive: true });

// ---------- PNG-Encoder ----------
const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function crc32(buf) {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(size, pixels /* RGBA Uint8Array */) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // Filter: none
    pixels
      .subarray(y * size * 4, (y + 1) * size * 4)
      .forEach((v, i) => (raw[y * (size * 4 + 1) + 1 + i] = v));
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- Icon zeichnen: dunkle abgerundete Kachel mit neonfarbenem Δ ----------
function drawIcon(size) {
  const px = new Uint8Array(size * size * 4);
  const radius = size * 0.22;

  const inRoundedRect = (x, y) => {
    const pad = size * 0.02;
    const min = pad;
    const max = size - 1 - pad;
    if (x < min || x > max || y < min || y > max) return false;
    const cx = Math.max(min + radius, Math.min(x, max - radius));
    const cy = Math.max(min + radius, Math.min(y, max - radius));
    return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2 || (x >= min + radius && x <= max - radius) || (y >= min + radius && y <= max - radius);
  };

  // Dreieck (Δ) mit Aussparung in der Mitte
  const triangle = (x, y, top, bottom, halfW) => {
    if (y < top || y > bottom) return false;
    const t = (y - top) / (bottom - top);
    return Math.abs(x - size / 2) <= t * halfW;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (!inRoundedRect(x, y)) continue;
      // Hintergrund: dunkles Slate
      let [r, g, b, a] = [15, 23, 42, 255];

      const outer = triangle(x, y, size * 0.18, size * 0.82, size * 0.36);
      const inner = triangle(x, y, size * 0.42, size * 0.7, size * 0.17);
      if (outer && !inner) {
        // Verlauf von Violett (oben) nach Cyan (unten)
        const t = (y - size * 0.18) / (size * 0.64);
        r = Math.round(167 + (34 - 167) * t);
        g = Math.round(85 + (211 - 85) * t);
        b = Math.round(247 + (238 - 247) * t);
      }
      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = a;
    }
  }
  return px;
}

function pngOf(size) {
  return encodePng(size, drawIcon(size));
}

// ---------- ICO (mit eingebettetem 256er-PNG) ----------
function encodeIco(png256) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // 1 Bild
  const entry = Buffer.alloc(16);
  entry[0] = 0; // 256 px
  entry[1] = 0; // 256 px
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png256.length, 8);
  entry.writeUInt32LE(6 + 16, 12); // Offset der Bilddaten
  return Buffer.concat([header, entry, png256]);
}

writeFileSync(join(outDir, "32x32.png"), pngOf(32));
writeFileSync(join(outDir, "128x128.png"), pngOf(128));
writeFileSync(join(outDir, "128x128@2x.png"), pngOf(256));
writeFileSync(join(outDir, "icon.png"), pngOf(512));
writeFileSync(join(outDir, "icon.ico"), encodeIco(pngOf(256)));
console.log("Icons erzeugt in", outDir);
