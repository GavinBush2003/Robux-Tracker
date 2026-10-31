import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const out = process.env.OUT || path.join(os.homedir(), 'Downloads', 'RobuxTracker-store');
fs.mkdirSync(out, { recursive: true });
const iconDir = path.join(root, 'dist', 'extension', 'icons');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const bundle = fs.readFileSync(path.join(root, 'dist', 'extension', 'content.js'), 'utf8');

const server = http.createServer((q, r) => {
  r.setHeader('content-type', 'text/html');
  r.end('<!doctype html><title>x</title><body style="margin:0;height:100vh;background:radial-gradient(900px 500px at 15% 10%,#2a2150,transparent 60%),radial-gradient(800px 500px at 90% 95%,#17284f,transparent 60%),#0d0e14"></body>');
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const dbg = 9800 + Math.floor(Math.random() * 150);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rt2-assets-'));
const proc = spawn(edge, ['--headless=new', `--remote-debugging-port=${dbg}`, `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });

async function getJson(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try { return await (await fetch(url)).json(); }
    catch (e) { await new Promise(r => setTimeout(r, 250)); }
  }
  throw new Error('edge did not start');
}
const targets = await getJson(`http://127.0.0.1:${dbg}/json/list`);
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0;
const pend = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
});
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('eval failed: ' + (r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text));
  return r.result.value;
};
const wait = ms => new Promise(r => setTimeout(r, ms));

const logo = (size, padded, strokeW) => {
  const body = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9b6cff"/><stop offset="1" stop-color="#4f46e5"/></linearGradient></defs>`;
  const a = padded ? 16 : 0, w = padded ? 96 : 128;
  const sc = w / 128, c = a + w / 2;
  const hex = `M${c} ${c - 44 * sc} L${c + 40 * sc} ${c - 21 * sc} V${c + 21 * sc} L${c} ${c + 44 * sc} L${c - 40 * sc} ${c + 21 * sc} V${c - 21 * sc} Z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">${body}<rect x="${a}" y="${a}" width="${w}" height="${w}" rx="${w * 0.235}" fill="url(#g)"/><path d="${hex}" fill="none" stroke="#fff" stroke-width="${strokeW * sc}" stroke-linejoin="round"/><rect x="${c - 16 * sc}" y="${c - 16 * sc}" width="${32 * sc}" height="${32 * sc}" rx="${6 * sc}" fill="#fff"/></svg>`;
};

async function shootHtml(html, w, h, file, opts = {}) {
  const url = 'data:text/html;charset=utf-8;base64,' + Buffer.from(html).toString('base64');
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  if (opts.transparent) await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  else await send('Emulation.setDefaultBackgroundColorOverride');
  await send('Page.navigate', { url });
  await wait(450);
  const r = await send('Page.captureScreenshot', opts.transparent ? { format: 'png' } : { format: 'jpeg', quality: 96 });
  fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
}

await send('Page.enable');
await send('Runtime.enable');

console.log('icons');
const small = { 16: 13, 32: 11, 48: 10 };
for (const s of [16, 32, 48]) {
  await shootHtml(`<body style="margin:0;background:transparent">${logo(s, false, small[s])}</body>`, s, s, path.join(iconDir, `icon${s}.png`), { transparent: true });
}
const big = `<body style="margin:0;background:transparent">${logo(128, true, 9)}</body>`;
await shootHtml(big, 128, 128, path.join(iconDir, 'icon128.png'), { transparent: true });
await shootHtml(big, 128, 128, path.join(iconDir, 'store-icon128.png'), { transparent: true });
fs.copyFileSync(path.join(iconDir, 'store-icon128.png'), path.join(out, 'store-icon-128.png'));

console.log('screenshots');
await send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__RT2_TEST = true; window.fetch = () => Promise.reject(new Error("offline"));' });
await send('Page.addScriptToEvaluateOnNewDocument', { source: `document.addEventListener('DOMContentLoaded', function () {\n${bundle}\n});` });
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setDefaultBackgroundColorOverride');
await send('Page.navigate', { url: `http://127.0.0.1:${port}/` });
await wait(1500);
await ev('window.__RT2.openPanel()');
await wait(700);
await ev('window.__RT2.ACT.demo()');
await wait(600);

const tidy = () => ev(`(() => { const root = document.getElementById('rt2-host').shadowRoot; const s = root.querySelector('.sync'); if (s) s.textContent = 'Synced 4m ago'; root.querySelectorAll('.top .btn[disabled]').forEach(b => b.removeAttribute('disabled')); const f = root.querySelector('.fab'); if (f) f.style.display = 'none'; const t = root.querySelector('.toast'); if (t) t.remove(); })()`);
const shots = [];
const grab = async (name, step) => {
  await ev(step);
  await wait(650);
  await tidy();
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 96 });
  const file = path.join(out, name);
  fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
  shots.push(file);
};
await grab('screenshot-1-overview.jpg', `window.__RT2.ACT.tab({ v: 'overview' })`);
await grab('screenshot-2-game.jpg', `(() => { const g = [...window.__RT2.view().o.games.values()].sort((a, b) => b.total - a.total)[0]; window.__RT2.ACT.game({ k: g.key }); })()`);
await grab('screenshot-3-robux.jpg', `window.__RT2.ACT.tab({ v: 'robux' })`);
await grab('screenshot-4-activity.jpg', `window.__RT2.ACT.tab({ v: 'activity' })`);
await grab('screenshot-5-accounts.jpg', `window.__RT2.ACT.tab({ v: 'accounts' })`);

console.log('promo tiles');
const shotUri = 'data:image/jpeg;base64,' + fs.readFileSync(shots[0]).toString('base64');
const fontCss = "font-family:'Segoe UI',system-ui,sans-serif;color:#f4f4f8";
const smallTile = `<body style="margin:0;width:440px;height:280px;overflow:hidden;${fontCss};background:radial-gradient(360px 220px at 12% 0%,#3a2a78,transparent 65%),radial-gradient(320px 220px at 100% 100%,#1b3a7a,transparent 65%),#0e0f17;position:relative">
<div style="position:absolute;left:34px;top:40px">${logo(76, false, 9)}</div>
<div style="position:absolute;left:34px;top:140px;font-size:38px;font-weight:700;letter-spacing:-.5px">Robux Tracker</div>
<div style="position:absolute;left:34px;top:192px;font-size:19px;color:#c9c9d6">See where your Robux went.</div>
<div style="position:absolute;left:34px;bottom:26px;width:150px;height:5px;border-radius:3px;background:linear-gradient(90deg,#9b6cff,#4f46e5)"></div></body>`;
await shootHtml(smallTile, 440, 280, path.join(out, 'promo-small-440x280.jpg'));
const marquee = `<body style="margin:0;width:1400px;height:560px;overflow:hidden;${fontCss};background:radial-gradient(760px 420px at 8% 0%,#3a2a78,transparent 65%),radial-gradient(700px 420px at 100% 100%,#1b3a7a,transparent 65%),#0e0f17;position:relative">
<div style="position:absolute;left:80px;top:96px">${logo(96, false, 9)}</div>
<div style="position:absolute;left:80px;top:218px;font-size:68px;font-weight:700;letter-spacing:-1.5px">Robux Tracker</div>
<div style="position:absolute;left:80px;top:310px;font-size:30px;color:#c9c9d6">See where your Robux went.</div>
<div style="position:absolute;left:80px;top:384px;font-size:21px;color:#a9a9bb;line-height:1.9">Spending per game and item<br>Robux you bought and earned<br>Works with your main and alts</div>
<div style="position:absolute;left:640px;top:84px;width:830px;height:518px;border-radius:18px;overflow:hidden;border:1px solid #3d3f55;box-shadow:0 30px 70px rgba(0,0,0,.6),0 0 60px rgba(139,92,246,.25)"><img src="${shotUri}" style="width:830px;display:block"></div></body>`;
await shootHtml(marquee, 1400, 560, path.join(out, 'promo-marquee-1400x560.jpg'));

ws.close();
proc.kill();
server.close();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
console.log('done', out);
process.exit(0);
