// Renders the app icon to PNG at 16/32/48/128. No dependencies.
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
function render(size) {
  const S = 4, N = size * S, px = Buffer.alloc(size * size * 4);
  const r = N * 0.23, cx = N / 2, cy = N / 2, rad = N * 0.31, ring = Math.max(N * 0.075, S);
  const inRounded = (x, y) => { const dx = Math.max(r - x, 0, x - (N - r)), dy = Math.max(r - y, 0, y - (N - r)); return dx * dx + dy * dy <= r * r; };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let R = 0, G = 0, B = 0, A = 0;
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
      const X = x * S + sx + .5, Y = y * S + sy + .5;
      if (!inRounded(X, Y)) continue;
      let cr = 0, cg = 162, cb = 255;
      const dx = X - cx, dy = Y - cy, d = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
      const onRing = Math.abs(d - rad) <= ring / 2;
      const spokes = d <= rad + ring / 2 && ((Math.abs(dx) <= ring / 2 && dy <= 0) || (Math.abs(dy) <= ring / 2 && dx >= 0));
      if (onRing || spokes || (d < rad && ang > -Math.PI / 2 && ang < 0)) { cr = cg = cb = 255; }
      R += cr; G += cg; B += cb; A += 255;
    }
    const n = S * S, i = (y * size + x) * 4;
    px[i] = Math.round(R / n); px[i+1] = Math.round(G / n); px[i+2] = Math.round(B / n); px[i+3] = Math.round(A / n);
  }
  return png(size, px);
}
for (const s of [16, 32, 48, 128]) { fs.writeFileSync(`icons/icon${s}.png`, render(s)); }
console.log('icons written');
