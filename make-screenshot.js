// Pads/scales any PNG to the exact canvas the Chrome Web Store wants.
//
//   node make-screenshot.js shot.png            -> 1280x800
//   node make-screenshot.js shot.png 640 400    -> custom size
//
// Aspect ratio is preserved; the leftover space is filled with the panel's
// background colour so the result doesn't look letterboxed on white.
// No dependencies — decodes and re-encodes PNG directly.

const fs = require('fs'), zlib = require('zlib'), path = require('path');

const BG = [15, 17, 20]; // #0f1114, the panel background

/* ---------------------------------- decode --------------------------------- */
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let pos = 8, w = 0, h = 0, depth = 0, type = 0, idat = [], palette = null, trns = null;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const name = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + len);
    if (name === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      depth = data[8]; type = data[9];
      if (data[12] !== 0) throw new Error('interlaced PNGs are not supported');
    } else if (name === 'PLTE') palette = data;
    else if (name === 'tRNS') trns = data;
    else if (name === 'IDAT') idat.push(data);
    else if (name === 'IEND') break;
    pos += 12 + len;
  }
  if (depth !== 8) throw new Error(`unsupported bit depth ${depth} (need 8)`);

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type];
  if (!channels) throw new Error(`unsupported colour type ${type}`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);

  // undo the per-scanline filters
  let ip = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[ip++];
    const line = raw.slice(ip, ip + stride); ip += stride;
    const cur = out.slice(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.slice((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      cur[x] = v & 0xff;
    }
  }

  // normalise everything to RGBA
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0, n = w * h; i < n; i++) {
    let r, g, b, a = 255;
    if (type === 6) { r = out[i * 4]; g = out[i * 4 + 1]; b = out[i * 4 + 2]; a = out[i * 4 + 3]; }
    else if (type === 2) { r = out[i * 3]; g = out[i * 3 + 1]; b = out[i * 3 + 2]; }
    else if (type === 0) { r = g = b = out[i]; }
    else if (type === 4) { r = g = b = out[i * 2]; a = out[i * 2 + 1]; }
    else { const p = out[i] * 3; r = palette[p]; g = palette[p + 1]; b = palette[p + 2]; if (trns && out[i] < trns.length) a = trns[out[i]]; }
    rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b; rgba[i * 4 + 3] = a;
  }
  return { w, h, rgba };
}

/* ---------------------------------- encode --------------------------------- */
const crcTable = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePng(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  let o = 0;
  for (let y = 0; y < h; y++) { raw[o++] = 0; rgba.copy(raw, o, y * w * 4, (y + 1) * w * 4); o += w * 4; }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ------------------------------- fit onto canvas --------------------------- */
function fit(src, W, H) {
  const scale = Math.min(W / src.w, H / src.h);
  const dw = Math.max(1, Math.round(src.w * scale)), dh = Math.max(1, Math.round(src.h * scale));
  const ox = Math.floor((W - dw) / 2), oy = Math.floor((H - dh) / 2);
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0, n = W * H; i < n; i++) { out[i * 4] = BG[0]; out[i * 4 + 1] = BG[1]; out[i * 4 + 2] = BG[2]; out[i * 4 + 3] = 255; }

  for (let y = 0; y < dh; y++) {
    // bilinear sample, so downscaling stays readable
    const sy = Math.min(src.h - 1, (y + 0.5) / scale - 0.5), y0 = Math.max(0, Math.floor(sy)), y1 = Math.min(src.h - 1, y0 + 1), fy = sy - y0;
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(src.w - 1, (x + 0.5) / scale - 0.5), x0 = Math.max(0, Math.floor(sx)), x1 = Math.min(src.w - 1, x0 + 1), fx = sx - x0;
      const di = ((y + oy) * W + (x + ox)) * 4;
      for (let c = 0; c < 4; c++) {
        const p00 = src.rgba[(y0 * src.w + x0) * 4 + c], p10 = src.rgba[(y0 * src.w + x1) * 4 + c];
        const p01 = src.rgba[(y1 * src.w + x0) * 4 + c], p11 = src.rgba[(y1 * src.w + x1) * 4 + c];
        out[di + c] = Math.round(p00 * (1 - fx) * (1 - fy) + p10 * fx * (1 - fy) + p01 * (1 - fx) * fy + p11 * fx * fy);
      }
      out[di + 3] = 255; // the store rejects transparency
    }
  }
  return out;
}

/* ------------------------------------ cli ---------------------------------- */
const [input, wArg, hArg] = process.argv.slice(2);
if (!input) { console.error('usage: node make-screenshot.js <file.png> [width height]'); process.exit(1); }
const W = parseInt(wArg, 10) || 1280, H = parseInt(hArg, 10) || 800;

const src = decodePng(fs.readFileSync(input));
const outDir = 'store-screenshots';
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, path.basename(input, path.extname(input)) + `-${W}x${H}.png`);
fs.writeFileSync(outFile, encodePng(W, H, fit(src, W, H)));
console.log(`${src.w}x${src.h}  ->  ${W}x${H}   ${outFile}`);
