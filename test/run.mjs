import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const shots = process.env.SHOTS || path.join(os.tmpdir(), 'rt2-shots');
fs.mkdirSync(shots, { recursive: true });
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const bundle = fs.readFileSync(path.join(root, 'dist', 'extension', 'content.js'), 'utf8');
const mock = fs.readFileSync(path.join(here, 'mock.js'), 'utf8');

const sidebar = `<div id="left-navigation-container" style="width:230px;padding:12px;font:600 15px Arial;color:#ddd"><ul class="left-col-list" style="list-style:none;margin:0;padding:0">${['Home', 'Profile', 'Messages', 'Friends', 'Avatar', 'Inventory', 'Trade', 'Communities'].map(n => `<li><a class="dynamic-overflow-container text-nav" href="/${n.toLowerCase()}" style="display:flex;align-items:center;gap:12px;padding:9px 6px;color:#ddd;text-decoration:none"><div><span class="icon-nav-${n.toLowerCase()}" style="display:block;width:28px;height:28px;background:#666;border-radius:6px"></span></div><span class="font-header-2 dynamic-ellipsis-item">${n}</span>${n === 'Messages' ? '<span class="notification-blue">3</span>' : ''}</a></li>`).join('')}</ul></div>`;
globalThis.__sidebar = sidebar;
const server = http.createServer((q, r) => { r.setHeader('content-type', 'text/html'); r.end(`<!doctype html><title>test</title><body style="background:#1b1e27;margin:0;display:flex">${q.url.startsWith('/bare') ? '' : sidebar}<h1 style="color:#555;font:20px sans-serif;padding:30px">roblox.com (test page)</h1></body>`); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const dbg = 9400 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rt2-edge-'));
const proc = spawn(edge, ['--headless=new', `--remote-debugging-port=${dbg}`, `--user-data-dir=${profile}`, '--window-size=1300,900', '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });

let pass = 0, fail = 0;
const ok = (c, msg, extra) => {
  if (c) { pass++; console.log('  ok   ' + msg); }
  else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
};

async function getJson(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); return await r.json(); }
    catch (e) { await new Promise(r => setTimeout(r, 250)); }
  }
  throw new Error('edge did not start');
}

const targets = await getJson(`http://127.0.0.1:${dbg}/json/list`);
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0;
const pend = new Map();
const errors = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
  else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text);
  else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error: ' + m.params.args.map(a => a.value || a.description).join(' '));
});
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('eval failed: ' + (r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text));
  return r.result.value;
};
const shot = async (name, w = 1300, h = 900) => {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 300));
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(shots, name + '.png'), Buffer.from(r.data, 'base64'));
};

await send('Page.enable');
await send('Runtime.enable');
await send('Page.addScriptToEvaluateOnNewDocument', { source: mock });
await send('Page.addScriptToEvaluateOnNewDocument', { source: `document.addEventListener('DOMContentLoaded', function () {\n${bundle}\n});` });
await send('Page.navigate', { url: `http://127.0.0.1:${port}/` });
await new Promise(r => setTimeout(r, 1500));

const R = 'window.__RT2';

const expectFor = rawList => {
  const seen = new Set();
  const rows = [];
  for (const tx of rawList) { if (seen.has(tx.idHash)) continue; seen.add(tx.idHash); rows.push(tx); }
  const robux = rows.filter(t => t.currency.type === 'Robux');
  const sellerUnis = new Map();
  for (const t of robux) if (t.details.place) { const s = t.agent.id; if (!sellerUnis.has(s)) sellerUnis.set(s, new Set()); sellerUnis.get(s).add(t.details.place.universeId); }
  const out = { total: 0, count: 0, exp: 0, cat: 0, oth: 0, byUni: {}, pending: rows.filter(t => t.isPending).length };
  for (const t of robux) {
    const a = Math.abs(t.currency.amount);
    out.total += a; out.count++;
    let uni = t.details.place ? t.details.place.universeId : null;
    if (uni) { out.exp += a; out.byUni[uni] = (out.byUni[uni] || 0) + a; continue; }
    if (t.details.type === 'Asset') { out.cat += a; continue; }
    const s = sellerUnis.get(t.agent.id);
    if (s && s.size === 1) { uni = [...s][0]; out.exp += a; out.byUni[uni] = (out.byUni[uni] || 0) + a; }
    else out.oth += a;
  }
  return out;
};

const totalsOf = listExpr => ev(`(() => { const o = ${R}.build(${listExpr}.filter(r => r.ty === 'Purchase' && r.amt)); const g = {}; for (const x of o.games.values()) if (x.uni) g[x.uni] = x.total; return { total: o.total, count: o.count, exp: o.buckets.exp.total, cat: o.buckets.cat.total, oth: o.buckets.oth.total, byUni: g }; })()`);
const acctTx = id => `${R}.acct('${id}').tx`;
const allTx = `[...${R}.acct('1001').tx, ...${R}.acct('1002').tx]`;

try {
  console.log('learning types from the page');
  await ev(`(async () => { await fetch('https://economy.roblox.com/v2/users/1001/transactions?transactionType=RobuxTransfer&limit=10', { credentials: 'include' }); await fetch('https://economy.roblox.com/v2/users/1001/transactions?transactionType=summary&limit=10'); await fetch('https://economy.roblox.com/v2/users/1001/transaction-totals?timeFrame=Month&transactionType=summary'); })()`);
  ok(await ev(`Object.keys(${R}.S.seen).join(',') === 'RobuxTransfer'`), 'the page request for a new type is noticed (summary and totals ignored)', await ev(`Object.keys(${R}.S.seen)`));
  console.log('boot + first sync (main account)');
  await ev(`${R}.ensureBoot()`);
  ok(await ev(`${R}.S.uid === '1001'`), 'signed-in user detected as GavMain');
  await ev(`${R}.S.settings.delay = 0`);
  await ev(`${R}.runSync('auto')`);
  const raw1 = JSON.parse(await ev('JSON.stringify(window.__raw[1001].Purchase)'));
  const e1 = expectFor(raw1);
  const s1 = await totalsOf(acctTx('1001'));
  ok(s1.total === e1.total, `main total matches an independent sum (${s1.total})`, { got: s1.total, want: e1.total });
  ok(s1.count === e1.count, `main purchase count matches (${s1.count})`, { got: s1.count, want: e1.count });
  ok(s1.exp === e1.exp && s1.cat === e1.cat && s1.oth === e1.oth, 'experience / catalog / unattributed buckets match', { got: [s1.exp, s1.cat, s1.oth], want: [e1.exp, e1.cat, e1.oth] });
  ok(JSON.stringify(s1.byUni) === JSON.stringify(e1.byUni), 'per-game totals match, including creator-matched rows', { got: s1.byUni, want: e1.byUni });
  ok(s1.exp + s1.cat + s1.oth === s1.total, 'buckets add up to the total');
  ok(await ev('window.__hits.rate === 1'), 'rate limit was hit once and recovered');
  ok(await ev(`${R}.S.scan.warn.length === 0 && !${R}.S.scan.error`), 'scan finished without warnings or errors', await ev(`${R}.S.scan.error`));
  ok(await ev(`!!${R}.acct('1001').meta.Purchase.complete`), 'Purchase history marked complete');
  ok(await ev(`${R}.acct('1001').meta.Purchase.dupes === 1`), 'the duplicate row from Roblox was ignored, not double counted', await ev(`${R}.acct('1001').meta.Purchase.dupes`));
  const pend1 = await ev(`${acctTx('1001')}.filter(r => r.pend).length`);
  ok(pend1 === e1.pending, `pending purchases tracked (${pend1})`);
  const rmoney = await ev(`(() => { const m = ${R}.realMoney(${R}.acct('1001').tx); return { rows: m.rows, n: m.n, robux: m.robux, paid: +m.paid.toFixed(2), unknownN: m.unknownN, unknownRobux: m.unknownRobux }; })()`);
  ok(rmoney.rows === 6 && rmoney.n === 5 && rmoney.paid === 99.95 && rmoney.unknownN === 1 && rmoney.unknownRobux === 150000, 'real money = sum of actual pack prices ($99.95); the unknown 150,000 R$ pack is flagged, not guessed', rmoney);
  await ev(`${R}.S.settings.packs[150000] = 1500`);
  const rmoney2 = await ev(`(() => { const m = ${R}.realMoney(${R}.acct('1001').tx); return { paid: +m.paid.toFixed(2), unknownN: m.unknownN }; })()`);
  ok(rmoney2.paid === 1599.95 && rmoney2.unknownN === 0, 'entering the price of the unknown pack adds it ($1,599.95 total)', rmoney2);
  await ev(`delete ${R}.S.settings.packs[150000]`);
  ok(!(await ev(`${R}.TABS.overview().includes('9.99 per 1,000')`)), 'no flat $9.99 guess anywhere');

  console.log('Robux ledger (exact balance)');
  const L1 = await ev(`(() => { const L = ${R}.ledgerOf('1001'); const last = L.rows[L.rows.length - 1]; return { net: L.net, bal: L.bal, opening: L.opening, status: L.status, n: L.rows.length, lastAfter: L.after.get(last.k) }; })()`);
  ok(L1.bal === await ev('window.__balance(1001)'), `real balance read from the API (${L1.bal})`);
  ok(L1.status === 'exact' && L1.opening === 0, 'ledger explains the balance exactly: implied opening balance is 0', L1);
  ok(L1.lastAfter === L1.bal, 'running balance after the newest row equals the real balance');
  const flow = await ev(`(() => { const list = ${R}.acct('1001').tx; const src = ${R}.sourcesOf(list); const o = {}; const out = {}; src.forEach(s => { o[s.ty] = s.inn; out[s.ty] = s.out; }); const e = ${R}.earningsOf(list); const mb = ${R}.monthEndBalances(['1001']); const keys = [...mb.keys()]; return { src: o, out, earned: e.reduce((a, x) => a + x.total, 0), earnN: e.length, lastMonthBal: mb.get(keys[keys.length - 1]) }; })()`);
  ok(flow.src.CurrencyPurchase === 158600 && flow.src.PremiumStipend === 900 && flow.src.Sale === 240 && flow.src.GroupPayout === 1000 && flow.src.Commission === 1000, 'income by source: bought, stipends, sales, payouts, commissions', flow.src);
  ok(flow.src.RobuxTransfer === 399 && flow.out.RobuxTransfer === 1500, 'Robux transfers: 1,500 sent out, 399 refunded in (signs come from Roblox)', { in: flow.src.RobuxTransfer, out: flow.out.RobuxTransfer });
  ok(flow.earned === 2639 && flow.earnN === 5, 'earnings = sales 240 + payout 1,000 + commissions 1,000 + transfer 399 across 5 sources', flow);
  ok(flow.lastMonthBal === L1.bal, 'balance at the end of the current month equals the real balance');
  ok(await ev(`${R}.acct('1001').meta.EngagementPayout.unsupported === true && ${R}.acct('1001').meta.Commission.complete === true`), 'types Roblox rejects (HTTP 400) are skipped safely, not fatal');
  ok(await ev(`${R}.acct('1001').meta.Sale.complete && ${R}.acct('1001').meta.GroupPayout.complete`), 'sales and group payouts read to the end');

  console.log('incremental update');
  const n0 = await ev(`${acctTx('1001')}.length`);
  await ev('window.__addNew(1001, 3); window.__settle(1001)');
  await ev(`${R}.runSync('auto')`);
  const n1 = await ev(`${acctTx('1001')}.length`);
  ok(n1 - n0 === 3, `update added exactly 3 new rows (${n0} -> ${n1})`);
  ok(await ev(`${acctTx('1001')}.filter(r => r.pend).length === 0`), 'pending purchases settled in place');
  const s2 = await totalsOf(acctTx('1001'));
  ok(s2.total === s1.total + 300, 'total grew by exactly the 3 new purchases');

  console.log('second account (alt)');
  await ev('window.__who = 1002');
  await ev(`${R}.runSync('auto')`);
  ok(await ev(`${R}.S.uid === '1002' && Object.keys(${R}.S.accounts).length === 2`), 'alt registered as a second account');
  const e2 = expectFor(JSON.parse(await ev('JSON.stringify(window.__raw[1002].Purchase)')));
  const vAlt = await totalsOf(acctTx('1002'));
  ok(vAlt.total === e2.total, `alt total matches an independent sum (${vAlt.total})`, { got: vAlt.total, want: e2.total });
  ok(JSON.stringify(vAlt.byUni) === JSON.stringify(e2.byUni), 'alt per-game totals match');
  const vMain = await totalsOf(acctTx('1001'));
  ok(vMain.total === s2.total, 'main data untouched by syncing the alt');
  const vAll = await totalsOf(allTx);
  ok(vAll.total === vMain.total + vAlt.total, `combined total = main + alt (${vAll.total})`);
  let sumsOk = true;
  for (const u of new Set([...Object.keys(vMain.byUni), ...Object.keys(vAlt.byUni)])) if ((vAll.byUni[u] || 0) !== (vMain.byUni[u] || 0) + (vAlt.byUni[u] || 0)) sumsOk = false;
  ok(sumsOk, 'every game total in the combined view = main + alt for that game');

  await ev(`${R}.setView('all')`);
  ok(await ev(`${R}.S.tx.length === ${R}.acct('1001').tx.length + ${R}.acct('1002').tx.length`), 'combined view holds both accounts rows');
  const viaView = await ev(`${R}.view().o.total`);
  const expectView = await ev(`${R}.build(${R}.S.tx.filter(r => r.amt && r.ty === 'Purchase')).total`);
  ok(viaView === expectView && viaView === vAll.total, 'the app view total equals the combined sum');
  const integ = await ev(`${R}.integrity().map(c => ({ ok: c.ok, t: c.t }))`);
  ok(integ.every(c => c.ok || /pending/.test(c.t)), 'accuracy checks pass in combined view (pending is flagged, not hidden)', integ.filter(c => !c.ok));

  console.log('backup, remove, restore');
  const counts = await ev(`({ a: ${R}.acct('1001').tx.length, b: ${R}.acct('1002').tx.length })`);
  await ev(`window.__exp = ${R}.exportJson()`);
  ok(await ev('window.__exp.length > 1000'), 'backup JSON produced for both accounts');
  await ev(`${R}.removeAccount('1002')`);
  ok(await ev(`!${R}.S.accounts['1002'] && !${R}.S.data.has('1002') && ${R}.S.view === 'all'`), 'alt removed from the tracker');
  ok(await ev(`${R}.S.tx.length === ${counts.a}`), 'combined view shrank back to main only');
  const imp = await ev(`${R}.importJson(window.__exp)`);
  ok(imp.accounts === 2 && imp.added === counts.b, `restore brought the alt back (${imp.added} rows)`, imp);
  ok(await ev(`${R}.S.tx.length === ${counts.a + counts.b} && ${R}.S.accounts['1002'].name === 'GavAlt'`), 'combined rows back to what they were');
  const vAll2 = await totalsOf(allTx);
  ok(vAll2.total === vAll.total, 'combined total identical after restore');
  const again = await ev(`${R}.importJson(window.__exp)`);
  ok(again.added === 0, 'importing the same backup twice adds nothing');
  await ev(`${R}.runSync('auto')`);
  ok(await ev(`${R}.S.scan.found === 0`), 'alt sync after restore finds nothing new (no duplicates)', await ev(`${R}.S.scan.found`));

  console.log('faster scanning');
  ok(await ev('window.__maxInflight >= 2'), 'two pages were read at the same time during the first scan', await ev('window.__maxInflight'));
  console.log('Roblox totals cross-check');
  const tc = await ev(`(() => { const c = ${R}.compareTotals('1001'); return c && { n: c.rows.length, counts: c.counts, unknown: c.unknown, frames: [...new Set(c.rows.map(r => r.frame))] }; })()`);
  ok(tc && tc.n >= 20 && tc.frames.length === 4, `compared ${tc && tc.n} Roblox totals across day, week, month and year`, tc);
  ok(tc && tc.counts.differs === 0, 'none of the Roblox totals differ from ours', tc && tc.counts);
  ok(tc && tc.unknown.includes('someUnknownField'), 'fields I do not recognise are listed, not guessed', tc && tc.unknown);
  await ev(`(() => { const A = ${R}.acct('1001'); const r = A.tx.find(x => x.ty === 'Purchase' && x.t > Date.now() - 20 * 864e5); r.amt += 777; r.d -= 777; ${R}.S.rev++; })()`);
  const tc2 = await ev(`${R}.compareTotals('1001').counts`);
  ok(tc2.differs > 0, 'a tampered row is caught by the cross-check', tc2);
  await ev(`(() => { const A = ${R}.acct('1001'); const r = A.tx.find(x => x.ty === 'Purchase' && x.t > Date.now() - 20 * 864e5); r.amt -= 777; r.d += 777; ${R}.S.rev++; })()`);
  console.log('transfers');
  const tr = await ev(`${R}.transfersOf(${R}.acct('1001').tx).map(t => ({ n: t.name, s: t.sent, g: t.got }))`);
  ok(tr.length === 2 && tr.find(t => t.n === 'MasterKevin_Dlaho' && t.s === 1000) && tr.find(t => t.n === 'Yoshiro' && t.s === 500 && t.g === 399), 'transfers grouped by who they went to', tr);

  console.log('sidebar item');
  const nav = await ev(`(() => { const items = [...document.querySelectorAll('[data-rt2]')]; const li = items[0]; const prev = li && li.previousElementSibling; return { n: items.length, text: li && li.textContent.trim(), after: prev && prev.textContent.trim(), svg: !!(li && li.querySelector('svg')), oldIcon: !!(li && li.querySelector('[class*="icon-nav"]')), badge: !!(li && li.querySelector('.notification-blue')), fab: document.getElementById('rt2-host').shadowRoot.querySelector('.fab').classList.contains('show') }; })()`);
  ok(nav.n === 1 && nav.text === 'Robux Tracker', 'one "Robux Tracker" item sits in the page sidebar', nav);
  ok(nav.after === 'Communities', 'it is placed right after Communities, like the other items', nav);
  ok(nav.svg && !nav.oldIcon && !nav.badge, 'it has its own icon and none of the cloned badge or sprite', nav);
  ok(!nav.fab, 'no floating button when the sidebar is found');
  await ev(`(() => { const li = document.querySelector('[data-rt2] a'); li.click(); })()`);
  ok(await ev(`${R}.V.open === true`), 'clicking the sidebar item opens the tracker');
  await ev(`${R}.ACT.close()`);
  await ev(`(() => { const ul = document.querySelector('#left-navigation-container ul'); const keep = [...ul.children].filter(l => !l.hasAttribute('data-rt2')); ul.replaceChildren(...keep); })()`);
  await new Promise(r => setTimeout(r, 900));
  ok(await ev(`document.querySelectorAll('[data-rt2]').length === 1`), 'when Roblox re-renders the sidebar the item comes back exactly once');

  console.log('rebuild with parallel pages (no rate limit)');
  await ev('window.__who = 1001; window.__maxInflight = 0');
  await ev(`${R}.runSync('rebuild')`);
  const after = await totalsOf(acctTx('1001'));
  const rawNow = JSON.parse(await ev('JSON.stringify(window.__raw[1001].Purchase)'));
  const eNow = expectFor(rawNow);
  ok(after.total === eNow.total && after.count === eNow.count && JSON.stringify(after.byUni) === JSON.stringify(eNow.byUni), 'a full re-read with two pages at a time gives exactly the same totals', { got: after.total, want: eNow.total });
  ok(await ev('window.__maxInflight >= 2'), 'it really did read pages in parallel');
  ok(await ev(`!!${R}.acct('1001').meta.Purchase.complete && ${R}.acct('1001').meta.Purchase.dupes === 1`), 'complete, with the one duplicate still ignored');
  await ev(`${R}.S.settings.fast = false; window.__maxInflight = 0`);
  await ev(`${R}.runSync('full')`);
  ok(await ev('window.__maxInflight === 1'), 'with the option off it reads one page at a time');
  const same = await totalsOf(acctTx('1001'));
  ok(same.total === eNow.total, 'same totals one page at a time');
  await ev(`${R}.S.settings.fast = true`);
  await ev('window.__who = 1002');
  await ev(`${R}.runSync('auto')`);
  await ev('window.__who = 1001');

  console.log('sidebar icon alignment');
  const geo = await ev(`(() => { const lis = [...document.querySelectorAll('#left-navigation-container li')]; const mine = lis.find(l => l.hasAttribute('data-rt2')); const ref = lis.find(l => /Communities/.test(l.textContent)); const ib = el => el.querySelector('div > span, div').getBoundingClientRect(); const a = ib(mine), b = ib(ref); const la = mine.getBoundingClientRect(), lb = ref.getBoundingClientRect(); const svg = mine.querySelector('svg').getBoundingClientRect(); const lab = el => el.querySelector('.dynamic-ellipsis-item').getBoundingClientRect().left; return { w: [a.width, b.width], h: [a.height, b.height], left: [a.left - la.left, b.left - lb.left], top: [a.top - la.top, b.top - lb.top], svgFits: Math.abs(svg.width - a.width) < 1 && Math.abs(svg.height - a.height) < 1, labelLeft: [lab(mine) - la.left, lab(ref) - lb.left] }; })()`);
  ok(geo.w[0] === geo.w[1] && geo.h[0] === geo.h[1], 'our icon is the same size as Roblox\'s icons', geo);
  ok(geo.left[0] === geo.left[1] && geo.top[0] === geo.top[1], 'and sits in exactly the same spot', geo);
  ok(geo.labelLeft[0] === geo.labelLeft[1] && geo.svgFits, 'the label lines up with the other labels and the glyph fills the box', geo);

  console.log('big account speed');
  await ev(`(() => { const A = ${R}.acct('1001'); const base = A.tx.filter(r => r.ty === 'Purchase' && r.amt).slice(0, 300); for (let i = 0; i < 60000; i++) { const b = base[i % base.length]; const c = Object.assign({}, b, { k: 'perf' + i, t: b.t - (i % 700) * 36e5 }); A.keys.set(c.k, c); A.tx.push(c); } ${R}.rebuildView(); })()`);
  const perf = await ev(`(() => { const t0 = performance.now(); ${R}.S.rev++; ${R}.view(); const t1 = performance.now(); ${R}.V.tab = 'overview'; ${R}.TABS.overview(); const t2 = performance.now(); ${R}.TABS.robux(); const t3 = performance.now(); ${R}.TABS.robux(); const t4 = performance.now(); ${R}.V.tab = 'activity'; ${R}.TABS.activity(); const t5 = performance.now(); return { view: Math.round(t1 - t0), overview: Math.round(t2 - t1), robux1: Math.round(t3 - t2), robux2: Math.round(t4 - t3), activity: Math.round(t5 - t4), rows: ${R}.S.tx.length }; })()`);
  ok(perf.rows > 60000 && perf.view < 1500 && perf.overview < 600 && perf.robux1 < 1500 && perf.robux2 < 700 && perf.activity < 1500, `with ${perf.rows} rows: view ${perf.view}ms, overview ${perf.overview}ms, robux ${perf.robux1}/${perf.robux2}ms, activity ${perf.activity}ms`, perf);
  await ev(`(() => { const A = ${R}.acct('1001'); const keep = A.tx.filter(r => !String(r.k).startsWith('perf')); A.tx.length = 0; keep.forEach(r => A.tx.push(r)); [...A.keys.keys()].forEach(k => { if (String(k).startsWith('perf')) A.keys.delete(k); }); ${R}.rebuildView(); ${R}.S.rev++; })()`);

  console.log('background sync bridge');
  const bridge = await ev(`(async () => { let handler = null; const sent = []; window.chrome = { runtime: { onMessage: { addListener(fn) { handler = fn; } } }, storage: { local: { set(o) { sent.push(o); } } } }; ${R}.installBridge(); const before = ${R}.S.accounts['1001'].last; const reply = await new Promise(res => { const keep = handler({ type: 'rt2-sync' }, {}, res); if (!keep) res({ ok: false, error: 'no async reply' }); }); return { hasHandler: !!handler, reply, advanced: ${R}.S.accounts['1001'].last >= before, stored: sent.length }; })()`);
  ok(bridge.hasHandler && bridge.reply.ok === true && bridge.advanced, 'the extension sync message runs a sync and replies', bridge);
  ok(bridge.stored >= 1, 'background-sync settings are handed to the extension');

  console.log('icons');
  await ev(`${R}.setView('all'); ${R}.V.tab = 'overview'; ${R}.openPanel()`);
  await new Promise(r => setTimeout(r, 1500));
  const icons = await ev(`Object.keys(${R}.S.icons).reduce((o, k) => { o[k[0]] = (o[k[0]] || 0) + 1; return o; }, {})`);
  ok(icons.u > 0 && icons.p > 0 && icons.a > 0 && icons.h > 0, 'fetched thumbnails for games, game passes, catalog items and creators', icons);
  const imgs = await ev(`window.__rt2imgs = document.getElementById('rt2-host').shadowRoot.querySelectorAll('.content img').length`);
  ok(imgs > 8, `${imgs} icons are on screen in the overview`);
  ok(!(await ev(`${R}.TABS.overview().includes('<canvas') || ${R}.TABS.overview().includes('<polyline')`)), 'no charts in the overview');

  console.log('UI renders every tab');
  for (const t of ['overview', 'games', 'robux', 'activity', 'accounts', 'settings']) {
    const r = await ev(`(() => { try { ${R}.V.tab = '${t}'; ${R}.V.gk = null; return ${R}.TABS['${t}']().length; } catch (e) { return 'ERR ' + e.message; } })()`);
    ok(typeof r === 'number' && r > 200, `tab "${t}" renders (${r})`);
  }
  const gk = await ev(`[...${R}.view().o.games.keys()][0]`);
  const gd = await ev(`(() => { try { ${R}.V.tab = 'games'; ${R}.V.gk = ${JSON.stringify(gk)}; return ${R}.TABS.games().length; } catch (e) { return 'ERR ' + e.message; } })()`);
  ok(typeof gd === 'number' && gd > 500, 'game detail renders');
  await ev(`${R}.V.gk = null`);

  await shot('00-sidebar');
  await ev(`${R}.V.tab = 'overview'; ${R}.openPanel()`);
  await shot('01-overview');
  await ev(`${R}.ACT.tab({ v: 'games' })`); await shot('02-games');
  await ev(`${R}.ACT.game({ k: ${JSON.stringify(gk)} })`); await new Promise(r => setTimeout(r, 200)); await shot('03-game-detail');
  await ev(`${R}.ACT.tab({ v: 'robux' })`); await shot('04-robux');
  await ev(`${R}.ACT.tab({ v: 'activity' })`); await shot('05-activity');
  await ev(`${R}.ACT.tab({ v: 'accounts' })`); await shot('06-accounts');
  await ev(`${R}.ACT.tab({ v: 'settings' })`); await shot('07-settings');
  await ev(`${R}.ACT.tab({ v: 'overview' })`); await shot('08-overview-mobile', 420, 860);

  console.log('demo mode');
  await ev(`${R}.startDemo()`);
  ok(await ev(`Object.keys(${R}.S.accounts).length === 3 && ${R}.S.tx.length > 1000`), 'demo loads 3 accounts');
  await ev(`${R}.ACT.tab({ v: 'overview' })`); await shot('09-demo-overview');
  await ev(`${R}.ACT.tab({ v: 'games' })`); await shot('10-demo-games');
  await ev(`${R}.ACT.tab({ v: 'robux' })`); await shot('11-demo-robux');
  await ev(`${R}.ACT.tab({ v: 'accounts' })`); await shot('12-demo-accounts');
  await ev(`${R}.ACT.exitDemo({})`);
  ok(await ev(`Object.keys(${R}.S.accounts).length === 2 && !${R}.S.demo`), 'exiting demo restores the real accounts');

  console.log('fallback when there is no sidebar');
  await send('Emulation.clearDeviceMetricsOverride');
  await send('Page.navigate', { url: `http://127.0.0.1:${port}/bare` });
  await new Promise(r => setTimeout(r, 4600));
  const bareState = await ev(`({ item: !!document.querySelector('[data-rt2]'), fab: document.getElementById('rt2-host').shadowRoot.querySelector('.fab').classList.contains('show') })`);
  ok(!bareState.item && bareState.fab, 'with no sidebar a small quiet icon appears instead', bareState);
} catch (e) {
  fail++;
  console.log('  FAIL harness error: ' + e.message);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (errors.length) console.log('page errors:\n' + errors.slice(0, 8).join('\n'));
ws.close(); proc.kill(); server.close();
try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
process.exit(fail || errors.length ? 1 : 0);
