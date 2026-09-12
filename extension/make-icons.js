// Renders the app icon to PNG at 16/32/48/128, plus a padded 128 store icon.
// No dependencies. Run from the extension/ directory: node make-icons.js
//
// The mark is a share-of-spending ring in the two colours the popup already
// uses for its category bar: Game Passes blue with a Dev Products violet cap.
// No plate, so it stays readable on light and dark toolbars alike.
const zlib = require('zlib'), fs = require('fs');

const crcTable = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
function png(size, px) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  let o = 0;
  for (let y = 0; y < size; y++) { raw[o++] = 0; for (let x = 0; x < size; x++) { const i = (y * size + x) * 4; raw[o++] = px[i]; raw[o++] = px[i+1]; raw[o++] = px[i+2]; raw[o++] = px[i+3]; } }
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const BLUE = [0x00, 0xA2, 0xFF];    // Game Passes
const VIOLET = [0xA0, 0x77, 0xFF];  // Dev Products
const OUTER = .470, INNER = .268, CAP = .74;  // cap: fraction of the turn that stays blue

const TAU = Math.PI * 2;
function shade(u, v) {
  const d = Math.hypot(u - .5, v - .5);
  if (d > OUTER || d < INNER) return null;
  const a = Math.atan2(v - .5, u - .5) + Math.PI / 2;
  const t = ((a / TAU) % 1 + 1) % 1;   // clockwise from 12 o'clock
  return t < CAP ? BLUE : VIOLET;
}

function render(size, pad) {
  const S = 4, px = Buffer.alloc(size * size * 4), k = 1 - 2 * pad;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let R = 0, G = 0, B = 0, A = 0;
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
      const u = ((x * S + sx + .5) / (size * S) - pad) / k;
      const v = ((y * S + sy + .5) / (size * S) - pad) / k;
      if (u < 0 || u > 1 || v < 0 || v > 1) continue;
      const c = shade(u, v);
      if (!c) continue;
      R += c[0]; G += c[1]; B += c[2]; A += 255;
    }
    const n = S * S, i = (y * size + x) * 4;
    px[i]   = A ? Math.round(R / (A / 255)) : 0;
    px[i+1] = A ? Math.round(G / (A / 255)) : 0;
    px[i+2] = A ? Math.round(B / (A / 255)) : 0;
    px[i+3] = Math.round(A / n);
  }
  return png(size, px);
}

for (const s of [16, 32, 48, 128]) fs.writeFileSync(`icons/icon${s}.png`, render(s, 0));
// Store listings render the 128 on their own background; a little padding keeps
// the ring from touching the edge of the tile.
fs.writeFileSync('icons/store-icon128.png', render(128, 0.08));
console.log('icons written');
