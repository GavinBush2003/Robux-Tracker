const RS = '<svg class="rs" viewBox="0 0 24 24"><path d="M12 1.8 21.6 7v10L12 22.2 2.4 17V7z" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="8.4" y="8.4" width="7.2" height="7.2" rx="1.2" fill="currentColor"/></svg>';
const NAV_SVG = '<svg viewBox="0.8 0.8 22.4 22.4" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" style="display:block"><path d="M12 2.4 20.6 7.2v9.6L12 21.6 3.4 16.8V7.2z"/><rect x="8.6" y="8.6" width="6.8" height="6.8" rx="1.1" fill="currentColor" stroke="none"/></svg>';
const THEMES = { nebula: ['#8b5cf6', '#6366f1'], ocean: ['#06b6d4', '#3b82f6'], sunset: ['#f97316', '#ec4899'], mint: ['#10b981', '#22d3ee'], gold: ['#f59e0b', '#ef4444'] };
const TABS_META = [['overview', 'Overview'], ['games', 'Games'], ['robux', 'Robux'], ['activity', 'Activity'], ['accounts', 'Accounts'], ['settings', 'Settings']];
const RANGES = [['all', 'All time'], ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['ytd', 'This year'], ['365', 'Last 12 months'], ['custom', 'Custom…']];
const SEARCH_TABS = { games: 'Search games or items', activity: 'Search activity' };
const RANGE_TABS = ['overview', 'games', 'robux', 'activity'];

const V = { open: false, tab: 'overview', range: 'all', custom: { from: '', to: '' }, q: '', gk: null, win: { from: '', to: '', fromT: null }, openItems: new Set(), page: 0, lty: 'all', confirm: null, err: null, booted: false, booting: false, boughtAll: false };

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dstr = t => t ? new Date(t).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const tstr = t => t ? new Date(t).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
const hms = ms => { const s = Math.floor(ms / 1000); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
function ago(t) {
  if (!t) return 'never';
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 86400 * 30) return Math.floor(s / 86400) + 'd ago';
  if (s < 86400 * 365) return Math.floor(s / (86400 * 30)) + 'mo ago';
  return Math.floor(s / (86400 * 365)) + 'y ago';
}
const rb = n => `${RS}${fmt(n)}`;
const sg = n => (n > 0 ? '+' : n < 0 ? '−' : '') + RS + fmt(Math.abs(n));
const pct = (a, b) => b ? (a / b * 100 < 10 && a ? (a / b * 100).toFixed(1) : Math.round(a / b * 100)) + '%' : '0%';
const initialOf = s => (String(s || '?').replace(/[^\p{L}\p{N}]/gu, '').charAt(0) || '?').toUpperCase();
const monthLong = t => new Date(t).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

let host, shadow, rootEl, topEl, barEl, progEl, contentEl, scrimEl, fabEl, toastTimer;

const wantSet = new Set();
const badSet = new Set();
let flushT = null;
function want(k, id) {
  const key = k + ':' + id;
  if (S.demo || S.icons[key] || badSet.has(key) || wantSet.has(key) || !/^\d+$/.test(String(id))) return;
  wantSet.add(key);
  clearTimeout(flushT);
  flushT = setTimeout(flushIcons, 300);
}
async function flushIcons() {
  const pairs = [...wantSet].map(x => x.split(':'));
  wantSet.clear();
  if (!pairs.length) return;
  const got = await fetchThumbs(pairs);
  pairs.forEach(([k, id]) => { if (!S.icons[k + ':' + id]) badSet.add(k + ':' + id); });
  if (got && V.open) renderContent();
}
function demoIcon(label) {
  let h = 0;
  const s = String(label || '?');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},60%,55%)"/><stop offset="1" stop-color="hsl(${(h + 40) % 360},60%,38%)"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><text x="32" y="43" font-size="30" font-family="Segoe UI,Arial" font-weight="700" text-anchor="middle" fill="white">${esc(initialOf(label))}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
function ico(key, label, cls) {
  let url = null;
  if (key) {
    url = S.icons[key[0] + ':' + key[1]];
    if (!url) { if (S.demo) url = demoIcon(label); else want(key[0], key[1]); }
  }
  return `<div class="ico ${cls || ''}">${url ? `<img src="${esc(url)}" loading="lazy" referrerpolicy="no-referrer" alt="">` : esc(initialOf(label))}</div>`;
}
const rbxIco = (cls, tone) => `<div class="ico ${cls || ''} rbx ${tone || ''}">${RS}</div>`;
function itemKey(c, iid, uni) {
  if (c === 'Game Passes' && iid != null) return ['p', iid];
  if (c === 'Catalog' && iid != null) return ['a', iid];
  if (c === 'Bundles' && iid != null) return ['b', iid];
  if (uni) return ['u', uni];
  return null;
}
const gameKey = g => g.uni ? ['u', g.uni] : (g.sid != null ? [g.sk === 'Group' ? 'r' : 'h', g.sid] : null);

function row(o) {
  return `<div class="row${o.a ? ' lnk' : ''}"${o.a ? ' ' + o.a : ''}>${o.ico || ''}<div class="rb"><div class="rt">${o.t}${o.badges || ''}</div>${o.m ? `<div class="rm">${o.m}</div>` : ''}${o.x ? `<div class="chiprow">${o.x}</div>` : ''}</div><div class="rv"><b>${o.v}</b>${o.s ? `<span>${o.s}</span>` : ''}</div></div>`;
}

let dm = { key: '', v: null };
function view() {
  const key = [S.rev, V.range, V.custom.from, V.custom.to].join('|');
  if (dm.key === key) return dm.v;
  const w = rangeWindow(V.range, V.custom);
  const outs = S.tx.filter(r => r.amt && isOut(r) && inWindow(r, w));
  const o = build(outs);
  const st = stats(o, w);
  const inc = income(S.tx.filter(r => inWindow(r, w)));
  dm = { key, v: { w, outs, o, st, inc, prev: null } };
  return dm.v;
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  const old = rootEl.querySelector('.toast');
  if (old) old.remove();
  rootEl.querySelector('.app').appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 3500);
}

function download(name, text, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: mime || 'text/plain' }));
  a.download = name;
  shadow.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

function acctChips(txs) {
  return splitBy(txs).map(([id, v]) => `<span class="pill"><em class="dot" style="background:${acol(id)}"></em>${esc(an(id))} ${fmt(v)}</span>`).join('');
}

function gameRow(g, total) {
  const badges = (g.b === 'cat' ? '<span class="tag">catalog</span>' : '') + (g.b === 'oth' ? '<span class="tag w">no game info</span>' : '') + (g.inf ? '<span class="tag w" title="Roblox sent no game for some of these; matched by creator">matched by creator</span>' : '');
  return row({ ico: ico(gameKey(g), g.label), t: esc(g.label), badges, m: `${fmt(g.count)} purchases · ${fmt(g.items.size)} items`, x: multi() ? acctChips(g.txs) : '', v: rb(g.total), s: pct(g.total, total), a: `data-a="game" data-k="${esc(g.key)}"` });
}

function recentRow(r) {
  return row({ ico: ico(itemKey(r.c, r.iid, r.uni), r.in || r.c, 'sm'), t: esc(r.in || r.c), m: `${esc(r.pn || r.sn)} · ${ago(r.t)}${multi() ? ' · ' + esc(an(r.a)) : ''}`, v: '−' + rb(r.amt) });
}

function welcome() {
  const a = S.view !== 'all' ? S.accounts[S.view] : null;
  if (a && String(a.id) !== String(S.uid) && !S.demo) return `<div class="empty"><h2>No data for ${esc(an(a.id))} yet</h2><p>Sign into <b>${esc(a.name)}</b> on roblox.com, reopen this, and press Sync.<br>Or restore a backup made in another browser.</p><button class="btn" data-a="importPick">Restore backup…</button></div>`;
  return `<div class="empty"><h2>See where your Robux went</h2><p>This reads your own transaction history from Roblox and adds it up.<br>Everything stays in this browser.</p><div style="margin-top:16px"><button class="btn pri" data-a="sync">Sync my history</button><button class="btn" data-a="demo">Try demo data</button></div><p class="dim" style="margin-top:16px;font-size:12px">The first sync can take a few minutes for big accounts.</p></div>`;
}

function outsEmpty() {
  return `<div class="empty"><h2>Nothing in this period</h2><button class="btn" data-a="range" data-v="all">Show all time</button></div>`;
}

function tOverview() {
  if (!S.tx.length) return welcome();
  const v = view();
  const { o, inc } = v;
  if (!o.count) return outsEmpty();
  const rm = realMoney(S.tx.filter(r => inWindow(r, v.w)));
  const bal = balanceOf(viewAccounts());
  const mp = monthProgress();
  const games = [...o.games.values()].sort((a, b) => b.total - a.total).slice(0, 6);
  const recent = v.outs.slice().sort((a, b) => b.t - a.t).slice(0, 7);
  return `<div class="stats"><div class="stat"><div class="l">Spent${V.range === 'all' ? ' · all time' : ''}</div><div class="v">${rb(o.total)}</div><div class="s">${fmt(o.count)} purchases</div></div>
<div class="stat"><div class="l">Robux balance</div><div class="v">${bal.known ? rb(bal.sum) : '—'}</div><div class="s">${rb(inc.total)} came in${bal.known && bal.known < bal.n ? ` · ${bal.known} of ${bal.n} accounts known` : ''}</div></div>
<div class="stat"><div class="l">Real money paid for Robux</div><div class="v">${rm.rows ? cash(rm.paid) : '—'}</div><div class="s">${rm.rows ? `${fmt(rm.robux)} R$ bought${rm.unknownN ? ` · ${rm.unknownN} unpriced` : ''}` : 'sync to see'}</div></div></div>
<div class="line">This month ${rb(mp.cur)} · last month ${rb(mp.prev)}${S.settings.budget > 0 ? ` · <span class="pill ${mp.cur > S.settings.budget * 0.8 ? 'warn' : 'good'}">${pct(mp.cur, S.settings.budget)} of ${fmt(S.settings.budget)} budget</span>` : ''}</div>
<div class="cols"><div class="sec"><h3>Top games<a data-a="tab" data-v="games">See all</a></h3>${games.map(g => gameRow(g, o.total)).join('')}</div><div class="sec"><h3>Latest purchases<a data-a="tab" data-v="activity">See all</a></h3>${recent.map(recentRow).join('')}</div></div>`;
}

function tGames() {
  if (!S.tx.length) return welcome();
  const v = view();
  if (V.gk) return gameDetail(v);
  const q = V.q.trim().toLowerCase();
  let gs = [...v.o.games.values()];
  if (q) gs = gs.filter(g => g.label.toLowerCase().includes(q) || [...g.creators].some(c => c.toLowerCase().includes(q)) || [...g.items.values()].some(i => i.name.toLowerCase().includes(q)) || String(g.uni) === q || String(g.pid) === q);
  gs.sort((a, b) => b.total - a.total);
  return `<div class="line">${fmt(gs.length)} places · ${rb(gs.reduce((a, g) => a + g.total, 0))}</div>${gs.map(g => gameRow(g, v.o.total)).join('') || '<div class="empty">Nothing matches.</div>'}`;
}

function winFilter(list) {
  const w = V.win;
  const from = w.fromT != null ? w.fromT : (w.from ? new Date(w.from + 'T00:00:00').getTime() : null);
  const to = w.to ? new Date(w.to + 'T23:59:59.999').getTime() : null;
  return list.filter(r => (from == null || r.t >= from) && (to == null || r.t <= to));
}

function gameDetail(v) {
  const g0 = v.o.games.get(V.gk);
  if (!g0) { V.gk = null; return tGames(); }
  const sub = winFilter(g0.txs);
  const go = build(sub);
  const g = [...go.games.values()][0] || { total: 0, count: 0, items: new Map(), txs: [] };
  const its = [...g.items.values()].sort((a, b) => b.total - a.total);
  const w = V.win;
  const filtered = w.from || w.to || w.fromT != null;
  const rows = its.map(it => {
    const open = V.openItems.has(it.key);
    let more = '';
    if (open) {
      const asc = it.txs.slice().sort((a, b) => a.t - b.t);
      more = `<tr><td colspan="4" style="padding:0 0 4px"><div class="exp"><table><tr><th>#</th><th>Date</th><th class="r">Robux</th><th class="r">Bought after</th><th></th></tr>${asc.slice().reverse().map(r => { const i = asc.indexOf(r); return `<tr class="h"><td>${i + 1}</td><td>${tstr(r.t)}${multi() ? ` <span class="tag">${esc(an(r.a))}</span>` : ''}${r.pend ? ' <span class="tag w">pending</span>' : ''}</td><td class="r">${fmt(r.amt)}</td><td class="r">${asc.length - i - 1}</td><td class="r"><button class="btn sm" data-a="from" data-t="${r.t}">count from here</button></td></tr>`; }).join('')}</table></div></td></tr>`;
    }
    return `<tr class="h" data-a="item" data-k="${esc(it.key)}" style="cursor:pointer"><td><div class="cell">${ico(itemKey(it.c, it.iid, it.uni), it.name, 'sm')}<div><div>${open ? '▾' : '▸'} ${esc(it.name)}</div><div class="dim" style="font-size:12px">${esc(it.c)}</div></div></div></td><td class="r">×${fmt(it.count)}</td><td class="r">${fmt(it.total)}</td><td class="r dim">${ago(it.last)}</td></tr>${more}`;
  }).join('');
  return `<button class="btn back" data-a="back">← Back</button>
<div style="display:flex;gap:14px;align-items:center;margin-bottom:14px;flex-wrap:wrap">${ico(gameKey(g0), g0.label, 'lg')}<div style="flex:1;min-width:180px"><div style="font-size:20px;font-weight:700">${esc(g0.label)}</div><div class="dim" style="font-size:12.5px">${[...g0.creators].slice(0, 2).map(esc).join(', ')} · ${fmt(g.count)} purchases · ${pct(g.total, v.o.total)} of all spending</div>${multi() && g.txs.length ? `<div class="chiprow">${acctChips(g.txs)}</div>` : ''}</div><div style="text-align:right;font-size:28px;font-weight:700">${rb(g.total)}</div></div>
<details${filtered ? ' open' : ''}><summary>Count from a date</summary><div class="fld"><label>From</label><input type="date" data-i="winFrom" value="${esc(w.from)}"><label>to</label><input type="date" data-i="winTo" value="${esc(w.to)}">${w.fromT != null ? `<span class="pill">from ${esc(tstr(w.fromT))}</span>` : ''}${filtered ? '<button class="btn sm" data-a="clearwin">Clear</button>' : ''}<button class="btn sm" data-a="exportGame">Export CSV</button></div></details>
<table><tr><th>Item</th><th class="r">Bought</th><th class="r">Robux</th><th class="r">Last</th></tr>${rows || '<tr><td colspan="4" class="dim">No purchases in this window.</td></tr>'}</table>`;
}

function tRobux() {
  if (!S.tx.length) return welcome();
  const v = view();
  const list = S.tx.filter(r => inWindow(r, v.w));
  const accs = viewAccounts().filter(a => acct(a.id));
  const src = sourcesOf(list);
  const recv = src.reduce((a, s) => a + s.inn, 0);
  const sent = src.reduce((a, s) => a + s.out, 0);
  const net = recv - sent;
  const bought = boughtOf(list);
  const rm = bought.money;
  const earn = earningsOf(list);
  const earned = earn.reduce((a, e) => a + e.total, 0);
  const flows = flowByMonth(list);
  const balMap = monthEndBalances(accs.map(a => a.id));
  const checks = accs.map(a => ledgerOf(a.id));
  const allExact = checks.length && checks.every(L => L.status === 'exact');
  const anyOff = checks.find(L => L.status === 'older' || L.status === 'over');
  const tcmp = cur() ? compareTotals(S.uid) : null;
  const tpill = tcmp && tcmp.rows.length ? (tcmp.counts.differs ? `<span class="pill warn">${tcmp.counts.differs} of ${tcmp.rows.length} Roblox totals differ</span>` : `<span class="pill good">Matches Roblox's own totals</span>`) : '';
  const transfers = transfersOf(list);
  const status = allExact ? '<span class="pill good">Adds up exactly</span>' : anyOff ? `<span class="pill warn">${fmt(Math.abs(anyOff.opening))} R$ unexplained</span>` : '<span class="pill">Balance not read yet</span>';
  const inRows = src.filter(s => s.inn > 0).sort((a, b) => b.inn - a.inn).map(s => row({ ico: rbxIco('sm', 'good'), t: esc(s.label), m: `${fmt(s.nIn)} transaction${s.nIn === 1 ? '' : 's'}`, v: `<span class="good">+${rb(s.inn)}</span>`, s: pct(s.inn, recv) })).join('') || '<div class="dim">Nothing came in.</div>';
  const outCats = [...v.o.cats.entries()].sort((a, b) => b[1] - a[1]).map(([c, t]) => ({ label: c, total: t }));
  src.filter(s => s.ty !== 'Purchase' && s.out > 0).forEach(s => outCats.push({ label: s.label, total: s.out }));
  outCats.sort((a, b) => b.total - a.total);
  const outTotal = outCats.reduce((a, c) => a + c.total, 0);
  const outRows = outCats.map(c => row({ ico: rbxIco('sm', 'bad'), t: esc(c.label), v: '−' + rb(c.total), s: pct(c.total, outTotal) })).join('') || '<div class="dim">Nothing went out.</div>';
  const monthRows = flows.map(f => { const n = f.inn - f.out; const b = balMap ? balMap.get(f.key) : null; return `<tr class="h"><td>${monthLong(f.t)}</td><td class="r good">+${fmt(f.inn)}</td><td class="r">−${fmt(f.out)}</td><td class="r ${n >= 0 ? 'good' : 'bad'}">${n >= 0 ? '+' : '−'}${fmt(Math.abs(n))}</td>${balMap ? `<td class="r">${b != null ? fmt(b) : '—'}</td>` : ''}</tr>`; }).join('');
  const shown = V.boughtAll ? bought.rows : bought.rows.slice(0, 5);
  const boughtRows = shown.map(r => { const pr = packPrice(r.amt); return row({ ico: rbxIco('sm', 'good'), t: `+${rb(r.amt)}`, m: `${tstr(r.t)}${multi() ? ' · ' + esc(an(r.a)) : ''}`, v: pr ? cash(pr) : '<span class="warn">price unknown</span>' }); }).join('');
  const earnRows = earn.slice(0, 6).map(e => row({ ico: e.sale ? ico(itemKey(e.c, e.iid, e.uni), e.label, 'sm') : ico(e.sid != null ? [e.sk === 'Group' ? 'r' : 'h', e.sid] : null, e.label, 'sm'), t: esc(e.label), m: `${esc(e.sub)} · ${fmt(e.count)}×`, v: `<span class="good">+${rb(e.total)}</span>` })).join('');
  return `<div class="stats"><div class="stat"><div class="l">Came in</div><div class="v good">+${rb(recv)}</div></div><div class="stat"><div class="l">Went out</div><div class="v">−${rb(sent)}</div></div><div class="stat"><div class="l">Net</div><div class="v ${net >= 0 ? 'good' : 'bad'}">${sg(net)}</div><div class="s">${status} ${tpill}</div></div></div>
<div class="cols"><div class="sec"><h3>Where it came from</h3>${inRows}</div><div class="sec"><h3>Where it went</h3>${outRows}</div></div>
${transfers.length ? `<div class="sec"><h3>Robux transfers<span class="r">${fmt(transfers.length)} people</span></h3>${transfers.slice(0, 8).map(t => row({ ico: `<div class="ico sm round">${esc(initialOf(t.name))}</div>`, t: esc(t.name), m: `${fmt(t.n)} transfer${t.n === 1 ? '' : 's'} · last ${ago(t.last)}`, v: [t.sent ? `<span>−${rb(t.sent)}</span>` : '', t.got ? `<span class="good">+${rb(t.got)}</span>` : ''].join(' ') })).join('')}</div>` : ''}<div class="sec"><h3>Robux you bought<span class="r">${rm.rows ? `${fmt(rm.robux)} R$ for ${cash(rm.paid)}` : ''}</span></h3>${rm.unknownN ? `<div class="banner">${rm.unknownN} purchase${rm.unknownN > 1 ? 's are' : ' is'} a pack I do not know the price of, so ${rm.unknownN > 1 ? 'they are' : 'it is'} not in the total. <button class="btn sm" data-a="tab" data-v="settings">Enter price</button></div>` : ''}${boughtRows || '<div class="dim">No Robux purchases found yet.</div>'}${bought.rows.length > 5 ? `<div style="margin-top:8px"><button class="btn sm" data-a="boughtAll">${V.boughtAll ? 'Show fewer' : 'Show all ' + bought.rows.length}</button></div>` : ''}</div>
<div class="sec"><h3>What you earned<span class="r">${rb(earned)}</span></h3>${earnRows || '<div class="dim">No earnings found.</div>'}</div>
<details><summary>Month by month</summary><table><tr><th>Month</th><th class="r">In</th><th class="r">Out</th><th class="r">Net</th>${balMap ? '<th class="r">Balance at end</th>' : ''}</tr>${monthRows}</table></details>`;
}

const llMemo = { key: '', v: null };
function ledgerList() {
  const key = [S.rev, S.view, V.range, V.custom.from, V.custom.to, V.q, V.lty].join('|');
  if (llMemo.key === key) return llMemo.v;
  const w = rangeWindow(V.range, V.custom);
  const v = filterLedger(S.tx.filter(r => inWindow(r, w)), { q: V.q, ty: V.lty }).sort((a, b) => b.t - a.t);
  llMemo.key = key;
  llMemo.v = v;
  return v;
}

function ledgerIcon(r) {
  if (r.ty === 'Purchase' || r.ty === 'Sale' || r.ty === 'AdSpend') {
    const key = itemKey(r.c, r.iid, r.uni);
    if (key) return ico(key, r.in || r.c, 'sm');
    return ico(r.sid != null ? [r.sk === 'Group' ? 'r' : 'h', r.sid] : null, r.sn || r.in, 'sm');
  }
  return rbxIco('sm', delta(r) > 0 ? 'good' : 'bad');
}

function tActivity() {
  if (!S.tx.length) return welcome();
  const list = ledgerList();
  const per = 40;
  const pages = Math.max(1, Math.ceil(list.length / per));
  if (V.page >= pages) V.page = pages - 1;
  const slice = list.slice(V.page * per, V.page * per + per);
  const types = [...new Set(S.tx.map(r => r.ty))];
  const va = viewAccounts();
  const L = va.length === 1 ? ledgerOf(va[0].id) : null;
  const showBal = !!(L && L.opening != null);
  return `<div class="tabs"><select data-i="lty"><option value="all">Everything</option>${types.map(t => `<option value="${esc(t)}"${V.lty === t ? ' selected' : ''}>${esc(typeDef(t).label)}</option>`).join('')}</select><span class="dim">${fmt(list.length)} rows</span><span class="grow"></span><button class="btn sm" data-a="exportLedger">Export CSV</button></div>
<table><tr><th>Date</th><th>What</th><th class="r">Robux</th>${showBal ? '<th class="r">Balance</th>' : ''}</tr>${slice.map(r => { const d = delta(r); return `<tr class="h"><td class="dim" style="white-space:nowrap">${tstr(r.t)}</td><td><div class="cell">${ledgerIcon(r)}<div style="min-width:0"><div>${esc(r.in || typeDef(r.ty).label)}${multi() ? `<span class="tag">${esc(an(r.a))}</span>` : ''}${r.pend ? '<span class="tag w">pending</span>' : ''}</div><div class="dim" style="font-size:12px">${esc(r.pn || r.sn || typeDef(r.ty).label)}</div></div></div></td><td class="r ${d > 0 ? 'good' : ''}">${d > 0 ? '+' : '−'}${fmt(Math.abs(d))}</td>${showBal ? `<td class="r dim">${L.after.has(r.k) ? fmt(L.after.get(r.k)) : '—'}</td>` : ''}</tr>`; }).join('') || '<tr><td colspan="4" class="dim">Nothing matches.</td></tr>'}</table>
<div class="pg"><button class="btn sm" data-a="pg" data-v="-1"${V.page === 0 ? ' disabled' : ''}>←</button>Page ${V.page + 1} of ${pages}<button class="btn sm" data-a="pg" data-v="1"${V.page >= pages - 1 ? ' disabled' : ''}>→</button></div>`;
}

function tAccounts() {
  const w = rangeWindow(V.range, V.custom);
  const rows = Object.values(S.accounts).map(a => {
    const A = acct(a.id);
    const outs = A ? A.tx.filter(r => r.amt && isOut(r) && inWindow(r, w)) : [];
    return { a, A, outs, tot: outs.reduce((x, r) => x + r.amt, 0) };
  });
  const inc = rows.filter(r => r.a.inc);
  const comb = inc.reduce((x, r) => x + r.tot, 0);
  const o = build(inc.flatMap(r => r.outs));
  const shared = [...o.games.values()].map(g => ({ g, sp: splitBy(g.txs) })).filter(x => x.sp.length > 1).sort((a, b) => b.g.total - a.g.total).slice(0, 10);
  const bal = balanceOf(inc.map(r => r.a));
  const rmAll = realMoney(inc.flatMap(r => (r.A ? r.A.tx : [])));
  const cards = rows.map(({ a, tot }) => {
    const here = String(a.id) === String(S.uid) && S.user;
    return `<div class="acc"><div style="display:flex;gap:12px;align-items:center">${ico(['h', a.id], a.display, 'round')}<div class="rb"><div class="rt">${esc(a.label || a.display)}${here ? '<span class="tag">signed in</span>' : ''}</div><div class="rm">@${esc(a.name)} · ${a.last ? 'synced ' + ago(a.last) : 'never synced'}</div></div><div class="rv"><b>${rb(tot)}</b><span>${typeof a.bal === 'number' ? 'balance ' + fmt(a.bal) : 'balance unknown'}</span></div></div>
<div class="fld" style="margin-bottom:0"><label><input type="checkbox" data-i="inc" data-v="${esc(a.id)}"${a.inc ? ' checked' : ''}> Include in totals</label><input type="text" data-i="alabel" data-v="${esc(a.id)}" placeholder="Nickname" value="${esc(a.label || '')}" style="width:130px"><span class="grow"></span><button class="btn sm" data-a="acctView" data-id="${esc(a.id)}">View</button>${here ? '<button class="btn sm" data-a="sync"' + (S.scan.running ? ' disabled' : '') + '>Sync</button>' : ''}<button class="btn sm" data-a="acctExport" data-id="${esc(a.id)}">Backup</button><button class="btn sm dng" data-a="acctRemove" data-id="${esc(a.id)}">${V.confirm === 'rm' + a.id ? 'Confirm' : 'Remove'}</button></div>${!here && !S.demo ? `<div class="dim" style="font-size:12px;margin-top:6px">To refresh, sign into @${esc(a.name)} on roblox.com and press Sync.</div>` : ''}</div>`;
  }).join('');
  return `${S.demo ? '<div class="banner">Demo accounts, nothing here is real. <button class="btn sm" data-a="exitDemo">Exit demo</button></div>' : ''}
<div class="stats"><div class="stat"><div class="l">All accounts spent</div><div class="v">${rb(comb)}</div><div class="s">${inc.length} of ${rows.length} counted</div></div><div class="stat"><div class="l">Balances together</div><div class="v">${bal.known ? rb(bal.sum) : '—'}</div><div class="s">${bal.known && bal.known < bal.n ? bal.known + ' of ' + bal.n + ' known' : ' '}</div></div><div class="stat"><div class="l">Real money paid</div><div class="v">${rmAll.rows ? cash(rmAll.paid) : '—'}</div><div class="s">${rmAll.rows ? fmt(rmAll.robux) + ' R$ bought' : ' '}</div></div></div>
${cards || '<div class="empty">No accounts yet.</div>'}
<div class="dim" style="font-size:12.5px;margin:12px 0 18px">To add an alt: sign into it on roblox.com and press Sync. Using another browser? Press Backup there and restore it here. <button class="btn sm" data-a="importPick">Restore backup…</button>${S.demo ? '' : ' <button class="btn sm" data-a="demo">Demo</button>'}</div>
<div class="sec"><h3>Games across more than one account</h3>${shared.length ? shared.map(x => row({ ico: ico(gameKey(x.g), x.g.label), t: esc(x.g.label), x: acctChips(x.g.txs), v: rb(x.g.total), s: `${x.sp.length} accounts`, a: `data-a="game" data-k="${esc(x.g.key)}"` })).join('') : '<div class="dim">None yet.</div>'}</div>`;
}

function totalsSection() {
  const c = cur() ? compareTotals(S.uid) : null;
  if (!c || !c.rows.length) return `<div class="sec"><h3>Matches Roblox's own totals</h3><div class="dim" style="font-size:12.5px">Roblox publishes its own totals for the last day, week, month and year. After a sync, this compares them with ours. ${c ? 'Roblox returned no totals I recognise yet. Save diagnostics and send them to me.' : 'Sync to run the check.'}</div></div>`;
  const pill = c.counts.differs ? `<span class="pill warn">${c.counts.differs} differ</span>` : '<span class="pill good">all match</span>';
  const rows = c.rows.map(r => `<tr><td>${esc(r.frame)}</td><td>${esc(r.label)}</td><td class="r">${fmt(r.roblox)}</td><td class="r">${fmt(r.ours)}</td><td class="r ${r.status === 'differs' ? 'warn' : r.status === 'match' ? 'good' : 'dim'}">${r.status === 'match' ? '✓ match' : r.status === 'close' ? '≈ ' + (r.diff > 0 ? '+' : '') + fmt(r.diff) : (r.diff > 0 ? '+' : '') + fmt(r.diff)}</td></tr>`).join('');
  return `<div class="sec"><h3>Matches Roblox's own totals<span class="r">${c.counts.match + c.counts.close} of ${c.rows.length} · checked ${ago(c.at)}</span></h3><div style="margin-bottom:6px">${pill}${c.counts.close ? ` <span class="pill">${c.counts.close} within 2% (window edges)</span>` : ''}</div><details><summary>Show the comparison</summary><table><tr><th>Window</th><th>Total</th><th class="r">Roblox</th><th class="r">Ours</th><th class="r">Difference</th></tr>${rows}</table><div class="dim" style="font-size:12px;margin-top:6px">Roblox counts a rolling window ending when it was asked, so a row near the edge can land on either side. A real gap means a transaction type is missing.</div></details></div>`;
}

function tSettings() {
  const sc = S.scan;
  const checks = integrity();
  const A = cur();
  const typeRow = (t, learned) => {
    const mt = (A ? A.meta[t.id] : null) || {};
    const rows = (A ? A.tx : []).filter(r => r.ty === t.id);
    const on = learned || S.settings.types.includes(t.id);
    const status = mt.unsupported ? '<span class="dim">not offered</span>' : mt.complete ? '<span class="good">complete</span>' : (on ? '<span class="warn">not finished</span>' : '<span class="dim">off</span>');
    return `<tr><td>${learned ? `${esc(t.label)}<span class="tag">learned</span>` : `<label style="cursor:pointer"><input type="checkbox" data-i="type" data-v="${t.id}"${on ? ' checked' : ''}> ${esc(t.label)}</label>`}</td><td class="r">${fmt(rows.length)}</td><td class="r">${status}</td></tr>`;
  };
  const tr = TYPE_DEFS.map(t => typeRow(t, false)).join('') + Object.keys(S.seen || {}).filter(t => !TYPE_DEFS.some(d => d.id === t)).map(t => typeRow(typeDef(t), true)).join('');
  const rmAll = realMoney(A ? A.tx : []);
  const packAmts = [...new Set((A ? A.tx : []).filter(r => r.ty === 'CurrencyPurchase' && r.amt).map(r => r.amt))].sort((a, b) => a - b);
  const packRows = packAmts.map(a => { const n = (A ? A.tx : []).filter(r => r.ty === 'CurrencyPurchase' && r.amt === a).length; const pr = packPrice(a); return `<tr><td>${rb(a)}</td><td class="r dim">×${n}</td><td class="r"><input type="number" data-i="pack" data-v="${a}" min="0" step="0.01" value="${pr || ''}" placeholder="price" style="width:100px"></td></tr>`; }).join('');
  return `${S.demo ? '<div class="banner">Demo data, nothing here is yours. <button class="btn sm" data-a="exitDemo">Exit demo</button></div>' : ''}
<div class="sec"><h3>Sync</h3><div class="mut" style="margin-bottom:8px">${S.user ? `Signed in as <b style="color:var(--tx)">${esc(S.user.displayName || S.user.name)}</b> · ` : '<span class="warn">Not signed in to Roblox · </span>'}${fmt(A ? A.tx.length : 0)} transactions stored · synced ${ago(lastSyncOf())}</div><div class="fld"><button class="btn pri" data-a="sync"${sc.running || S.demo ? ' disabled' : ''}>${sc.running ? 'Syncing…' : 'Sync now'}</button><button class="btn" data-a="full"${sc.running || S.demo ? ' disabled' : ''}>Re-read everything</button><label style="cursor:pointer"><input type="checkbox" data-i="autoSync"${S.settings.autoSync ? ' checked' : ''}> Sync when I open this</label></div>${sc.warn.map(w => `<div class="banner">${esc(w)}</div>`).join('')}</div>
<div class="sec"><h3>Look</h3><div class="fld"><div class="sw">${Object.entries(THEMES).map(([k, c]) => `<i data-a="theme" data-v="${k}" title="${k}" class="${S.settings.accent === k ? 'on' : ''}" style="background:linear-gradient(135deg,${c[0]},${c[1]});color:${c[0]}"></i>`).join('')}</div><label style="cursor:pointer;margin-left:10px"><input type="checkbox" data-i="fx"${S.settings.fx !== false ? ' checked' : ''}> Animations</label></div></div>
<div class="sec"><h3>Does it add up?</h3>${checks.map(c => `<div class="ck"><b class="${c.ok ? 'ok' : 'no'}">${c.ok ? '✓' : '!'}</b><span>${esc(c.t)}</span></div>`).join('')}</div>
${totalsSection()}<div class="sec"><h3>Robux pack prices<span class="r">paid so far ${rmAll.rows ? cash(rmAll.paid) : '—'}</span></h3><div class="dim" style="font-size:12.5px;margin-bottom:6px">Roblox only lists how many Robux each purchase gave you. The price comes from the pack size. If a pack is unknown or you paid differently, type what you paid.</div>${packRows ? `<table><tr><th>Pack</th><th class="r">Bought</th><th class="r">You paid</th></tr>${packRows}</table>` : '<div class="dim">No Robux purchases synced yet.</div>'}<div class="fld"><label>Currency symbol</label><input type="text" data-i="symbol" value="${esc(S.settings.symbol)}" style="width:60px"></div></div>
<details><summary>What gets read</summary><table><tr><th>Type</th><th class="r">Stored</th><th class="r">History</th></tr>${tr}</table><div class="dim" style="font-size:12.5px;margin-top:8px">Missing something you see on roblox.com/transactions (Creator Rewards, Robux Transfers, Roblox Adjustments)? Open that page and click each type once. This notices its real name and reads it on the next Sync.</div></details>
<details><summary>Advanced</summary><div class="fld"><label style="cursor:pointer"><input type="checkbox" data-i="fast"${S.settings.fast ? ' checked' : ''}> Read two pages at a time when it is safe</label></div><div class="fld"><label>Monthly budget</label><input type="number" data-i="budget" min="0" step="100" value="${S.settings.budget || ''}" placeholder="off" style="width:110px"><span class="dim">Robux, shows on the Overview</span></div>${hasBridge() ? `<div class="fld"><label style="cursor:pointer"><input type="checkbox" data-i="bgOn"${S.settings.bg.on ? ' checked' : ''}> Sync in the background every</label><input type="number" data-i="bgHours" min="1" max="48" value="${S.settings.bg.hours}" style="width:70px"><span class="dim">hours, while a roblox.com tab is open</span></div>` : ''}<div class="fld"><label>Pause between requests</label><input type="number" data-i="delay" min="${MIN_DELAY}" max="5000" step="50" value="${S.settings.delay}" style="width:90px"><span class="dim">ms, minimum ${MIN_DELAY}</span></div><div class="fld"><button class="btn dng" data-a="rebuild"${sc.running || S.demo ? ' disabled' : ''}>${V.confirm === 'rebuild' ? 'Click again to confirm' : 'Wipe and re-read'}</button><button class="btn" data-a="diag">Save diagnostics file</button></div></details>
<details><summary>Backup</summary><div class="fld"><button class="btn" data-a="exportJson">Backup (JSON)</button><button class="btn" data-a="exportAll">Export all (CSV)</button><button class="btn" data-a="importPick">Restore backup…</button><button class="btn dng" data-a="wipe">${V.confirm === 'wipe' ? 'Click again to confirm' : 'Delete stored data'}</button></div><div class="dim" style="font-size:12px">Everything is stored in this browser. Nothing leaves your computer. v${VERSION}.</div></details>`;
}

const TABS = { overview: tOverview, games: tGames, robux: tRobux, activity: tActivity, accounts: tAccounts, settings: tSettings };

function pageIsLight() {
  try {
    const m = (getComputedStyle(document.body).backgroundColor || '').match(/[\d.]+/g);
    if (!m || m.length < 3) return false;
    if (m.length > 3 && Number(m[3]) === 0) return false;
    return (Number(m[0]) * 299 + Number(m[1]) * 587 + Number(m[2]) * 114) / 1000 > 150;
  } catch (e) { return false; }
}

function renderTop() {
  const sc = S.scan;
  topEl.innerHTML = `<div class="ttl">${RS} Robux Tracker</div>${TABS_META.map(([k, l]) => `<button class="tb${V.tab === k ? ' on' : ''}" data-a="tab" data-v="${k}">${l}</button>`).join('')}<span class="grow"></span><span class="sync">${sc.running ? 'Syncing…' : S.demo ? 'Demo' : 'Synced ' + ago(lastSyncOf())}</span><button class="btn" data-a="sync"${sc.running || S.demo ? ' disabled' : ''}>Sync</button><button class="btn x" data-a="close" title="Close (Esc)">✕</button>`;
  const showRange = RANGE_TABS.includes(V.tab);
  const showSearch = !!SEARCH_TABS[V.tab] && !(V.tab === 'games' && V.gk);
  const accs = Object.values(S.accounts);
  const show = showRange || showSearch;
  barEl.style.display = show ? 'flex' : 'none';
  barEl.innerHTML = show ? `${showSearch ? `<div class="search"><input data-i="q" placeholder="${esc(SEARCH_TABS[V.tab])}" value="${esc(V.q)}"></div>` : ''}<span class="grow"></span>${showRange && accs.length > 1 ? `<select data-i="view"><option value="all"${S.view === 'all' ? ' selected' : ''}>All accounts</option>${accs.map(a => `<option value="${esc(a.id)}"${S.view === a.id ? ' selected' : ''}>${esc(an(a.id))}</option>`).join('')}</select>` : ''}${showRange ? `<select data-i="range">${RANGES.map(([k, l]) => `<option value="${k}"${V.range === k ? ' selected' : ''}>${l}</option>`).join('')}</select>${V.range === 'custom' ? `<input type="date" data-i="cfrom" value="${esc(V.custom.from)}"><input type="date" data-i="cto" value="${esc(V.custom.to)}">` : ''}` : ''}` : '';
}

function renderProg() {
  const sc = S.scan;
  const show = sc.running || sc.error;
  progEl.classList.toggle('on', !!show);
  if (!show) return;
  progEl.innerHTML = `${sc.running ? '<div class="spin"></div>' : '<b class="bad">!</b>'}<div class="t">${esc(sc.label)}</div><span class="tm">${sc.running ? `${fmt(sc.found)} new · ${hms(Date.now() - sc.started)}` : ''}</span>${sc.running ? `<button class="btn sm" data-a="pause">${sc.paused ? 'Continue' : 'Pause'}</button><button class="btn sm" data-a="stop">Stop</button>` : '<button class="btn sm" data-a="dismiss">Dismiss</button>'}`;
}

function liveProg() {
  const sc = S.scan;
  if (!progEl) return;
  const t = progEl.querySelector('.t');
  if (!t || !sc.running) { renderProg(); return; }
  t.textContent = sc.label;
  const tm = progEl.querySelector('.tm');
  if (tm) tm.textContent = `${fmt(sc.found)} new · ${hms(Date.now() - sc.started)}`;
  const pb = progEl.querySelector('[data-a=pause]');
  if (pb) pb.textContent = sc.paused ? 'Continue' : 'Pause';
}

function renderContent() {
  if (!contentEl) return;
  const st = contentEl.scrollTop;
  let html;
  if (V.err) html = `<div class="empty"><h2>Could not start</h2><p>${esc(V.err)}</p><button class="btn pri" data-a="retry">Try again</button> <button class="btn" data-a="demo">Try demo data</button></div>`;
  else if (V.booting) html = '<div class="empty"><div class="spin" style="margin:0 auto 14px;width:24px;height:24px"></div>Loading your saved data…</div>';
  else html = TABS[V.tab]();
  contentEl.innerHTML = html;
  contentEl.scrollTop = st;
}

function renderAll() { applyTheme(); renderTop(); renderProg(); renderContent(); }

function applyTheme() {
  if (!rootEl) return;
  const t = THEMES[S.settings.accent] || THEMES.nebula;
  rootEl.style.setProperty('--ac', t[0]);
  rootEl.style.setProperty('--ac2', t[1]);
  rootEl.style.setProperty('--glow', t[0] + '33');
  rootEl.style.setProperty('--glow2', t[1] + '22');
  rootEl.classList.toggle('light', pageIsLight());
  rootEl.classList.toggle('nofx', S.settings.fx === false);
}

let freshT = null;
function freshContent() {
  if (!contentEl || S.settings.fx === false) return;
  contentEl.classList.remove('fresh');
  void contentEl.offsetWidth;
  contentEl.classList.add('fresh');
  clearTimeout(freshT);
  freshT = setTimeout(() => contentEl.classList.remove('fresh'), 700);
}

let lastRun = false, lastPaint = 0;
setTick(force => {
  if (!V.open) return;
  const sc = S.scan;
  if (sc.running !== lastRun) {
    lastRun = sc.running;
    renderTop(); renderProg(); renderContent();
    if (!sc.running) toast(sc.done ? `Synced. ${fmt(sc.found)} new transactions.` : sc.label);
    return;
  }
  liveProg();
  if (force && Date.now() - lastPaint > 1500) { lastPaint = Date.now(); renderContent(); }
});

async function ensureBoot() {
  if (V.booted || V.booting) return;
  V.booting = true; V.err = null;
  renderContent();
  try {
    await boot();
    V.booted = true;
  } catch (e) { V.err = e.message; }
  V.booting = false;
  renderAll();
  if (V.booted) {
    if (S.settings.autoSync && S.user && cur() && cur().tx.length && !S.demo && Date.now() - lastSyncOf() > 30 * 60000) runSync('auto');
    fetchBalance().then(() => { S.rev++; renderContent(); });
  }
}

function openPanel() {
  V.open = true;
  scrimEl.classList.add('on');
  if (V.booted) checkUser(); else ensureBoot();
  renderAll();
  freshContent();
}
function closePanel() { V.open = false; scrimEl.classList.remove('on'); }

function startDemo() {
  if (S.demo) return;
  S.stash = { accounts: S.accounts, data: S.data, view: S.view, uid: S.uid, user: S.user };
  S.demo = true;
  const names = [['d1', 'Main', 0], ['d2', 'Alt one', 1], ['d3', 'Alt two', 2]];
  S.accounts = {};
  S.data = new Map();
  names.forEach(([id, nm, i]) => {
    S.accounts[id] = { id, name: nm, display: nm, color: AC_COLORS[i], inc: true, label: '', last: Date.now() };
    const A = { id, tx: [], keys: new Map(), meta: {}, h: null };
    TYPE_DEFS.forEach(t => { A.meta[t.id] = { complete: true, last: Date.now() }; });
    S.data.set(id, A);
  });
  makeDemo().forEach((r, i) => {
    const h = (i * 2654435761 >>> 0) % 100;
    const id = h < 62 ? 'd1' : h < 90 ? 'd2' : 'd3';
    r.a = id; r.k = id + r.k;
    if (r.d === undefined) r.d = r.ty === 'Purchase' ? -r.amt : r.amt;
    const A = S.data.get(id);
    A.tx.push(r); A.keys.set(r.k, r);
  });
  Object.values(S.accounts).forEach(a => {
    const A = S.data.get(a.id);
    const rows = A.tx.filter(r => r.amt).sort((x, y) => x.t - y.t);
    let run = 0, low = 0;
    rows.forEach(r => { run += delta(r); low = Math.min(low, run); });
    if (low < 0 && rows.length) {
      const amt = Math.ceil(-low / 500) * 500;
      const dep = { k: a.id + 'dep', ty: 'CurrencyPurchase', t: rows[0].t - 864e5, amt, d: amt, cur: 'Robux', it: '', c: 'Other', iid: null, in: '', sid: 1, sn: 'Roblox', sk: 'User', pid: null, uni: null, pn: '', pend: false, a: a.id };
      A.tx.push(dep); A.keys.set(dep.k, dep);
    }
    const L = ledgerOf(a.id);
    a.bal = L.net; a.balT = Date.now();
  });
  S.uid = 'd1';
  S.user = null;
  S.view = 'all';
  rebuildView();
  V.err = null; V.gk = null;
  renderAll();
}
function exitDemo() {
  if (!S.demo) return;
  S.demo = false;
  Object.assign(S, S.stash);
  S.stash = null;
  V.gk = null;
  rebuildView();
  renderAll();
}

async function checkUser() {
  if (S.demo || S.scan.running) return;
  try {
    const u = await authedUser();
    if (String(u.id) !== String(S.uid) || !S.user) {
      const prev = S.uid;
      await adoptUser(u);
      if (S.view !== 'all' && S.view === String(prev)) await setView(S.uid);
      rebuildView();
      renderAll();
      toast(`Signed in as ${u.displayName || u.name}. Sync to read this account.`);
    }
  } catch (e) {}
}

const ACT = {
  open: openPanel,
  close: closePanel,
  tab(d) { V.tab = d.v; V.gk = null; V.q = ''; V.page = 0; V.confirm = null; renderTop(); renderContent(); contentEl.scrollTop = 0; freshContent(); },
  theme(d) { S.settings.accent = d.v; saveSettings(); applyTheme(); renderContent(); },
  range(d) { V.range = d.v; V.page = 0; renderTop(); renderContent(); },
  sync() { if (!V.booted) { ensureBoot(); return; } runSync('auto'); },
  full() { runSync('full'); },
  rebuild() { if (V.confirm !== 'rebuild') { V.confirm = 'rebuild'; renderContent(); return; } V.confirm = null; runSync('rebuild'); },
  pause() { S.scan.paused = !S.scan.paused; liveProg(); },
  stop() { S.scan.stop = true; S.scan.paused = false; },
  dismiss() { S.scan.error = null; renderProg(); },
  retry() { V.err = null; ensureBoot(); },
  async game(d) { if (V.tab === 'accounts' && S.view !== 'all') await setView('all'); V.gk = d.k; V.win = { from: '', to: '', fromT: null }; V.openItems = new Set(); V.tab = 'games'; V.q = ''; renderTop(); renderContent(); contentEl.scrollTop = 0; },
  back() { V.gk = null; renderTop(); renderContent(); },
  item(d) { if (V.openItems.has(d.k)) V.openItems.delete(d.k); else V.openItems.add(d.k); renderContent(); },
  from(d) { V.win.fromT = +d.t; V.win.from = ''; renderContent(); },
  clearwin() { V.win = { from: '', to: '', fromT: null }; renderContent(); },
  boughtAll() { V.boughtAll = !V.boughtAll; renderContent(); },
  pg(d) { V.page = Math.max(0, V.page + (+d.v)); renderContent(); contentEl.scrollTop = 0; },
  demo() { if (!V.booted) V.err = null; startDemo(); },
  exitDemo,
  diag() { download('robux-tracker-diagnostics.txt', diagnostics(), 'text/plain'); },
  exportJson() { download(`robux-tracker-backup-${dayKey(Date.now())}.json`, exportJson(), 'application/json'); },
  exportAll() { download(`robux-tracker-${dayKey(Date.now())}.csv`, toCsv(S.tx), 'text/csv'); },
  exportLedger() { download(`robux-activity-${dayKey(Date.now())}.csv`, toCsv(ledgerList()), 'text/csv'); },
  exportGame() { const v = view(); const g = v.o.games.get(V.gk); if (g) download(`robux-${(g.label || 'game').replace(/[^\w]+/g, '-')}.csv`, toCsv(winFilter(g.txs)), 'text/csv'); },
  importPick() { const f = document.createElement('input'); f.type = 'file'; f.accept = '.json'; f.onchange = async () => { try { const r = await importJson(await f.files[0].text()); toast(`Restored ${fmt(r.added)} transactions.`); renderAll(); } catch (e) { toast(e.message); } }; f.click(); },
  async wipe() {
    if (V.confirm !== 'wipe') { V.confirm = 'wipe'; renderContent(); return; }
    V.confirm = null;
    const A = cur();
    if (A && !S.demo) { await A.h.clearTx(); A.tx.length = 0; A.keys.clear(); A.meta = {}; await saveMeta(A); }
    rebuildView(); renderAll(); toast('Stored data for the signed-in account deleted.');
  },
  acctView(d) { setView(d.id).then(() => { V.gk = null; V.tab = 'overview'; renderAll(); }); },
  acctRemove(d) { if (V.confirm !== 'rm' + d.id) { V.confirm = 'rm' + d.id; renderContent(); return; } V.confirm = null; removeAccount(d.id).then(() => { renderAll(); toast('Account removed from the tracker.'); }); },
  acctExport(d) { download('robux-tracker-' + (S.accounts[d.id].name || d.id).replace(/\W+/g, '-') + '.json', exportJson([d.id]), 'application/json'); }
};

function onInput(el) {
  const k = el.dataset.i, v = el.type === 'checkbox' ? el.checked : el.value;
  switch (k) {
    case 'q': V.q = v; V.page = 0; renderContent(); return;
    case 'range': V.range = v; V.page = 0; renderTop(); renderContent(); return;
    case 'view': setView(v).then(() => { V.gk = null; renderAll(); }); return;
    case 'inc': { const a = S.accounts[el.dataset.v]; a.inc = v; saveRegistry(); if (S.view === 'all') rebuildView(); else S.rev++; renderTop(); renderContent(); return; }
    case 'alabel': { const a = S.accounts[el.dataset.v]; a.label = v.slice(0, 24); saveRegistry(); S.rev++; return; }
    case 'lty': V.lty = v; V.page = 0; renderContent(); return;
    case 'cfrom': V.custom.from = v; renderContent(); return;
    case 'cto': V.custom.to = v; renderContent(); return;
    case 'winFrom': V.win.from = v; V.win.fromT = null; renderContent(); return;
    case 'winTo': V.win.to = v; renderContent(); return;
    case 'type': { const s = new Set(S.settings.types); if (v) s.add(el.dataset.v); else s.delete(el.dataset.v); S.settings.types = [...s]; break; }
    case 'pack': { const n = parseFloat(v); if (n > 0) S.settings.packs[el.dataset.v] = n; else delete S.settings.packs[el.dataset.v]; break; }
    case 'delay': S.settings.delay = Math.max(MIN_DELAY, Math.min(5000, parseInt(v, 10) || DEFAULTS.delay)); break;
    case 'autoSync': S.settings.autoSync = v; break;
    case 'symbol': S.settings.symbol = v.slice(0, 4); break;
    case 'fast': S.settings.fast = v; break;
    case 'fx': S.settings.fx = v; applyTheme(); break;
    case 'budget': S.settings.budget = Math.max(0, parseFloat(v) || 0); break;
    case 'bgOn': S.settings.bg.on = v; break;
    case 'bgHours': S.settings.bg.hours = Math.max(1, Math.min(48, parseInt(v, 10) || 6)); break;
  }
  saveSettings();
  S.rev++;
  if (k !== 'symbol' && k !== 'delay' && k !== 'budget' && k !== 'bgHours') renderContent();
}

const NAV_WORDS = new Set(['home', 'profile', 'messages', 'friends', 'avatar', 'inventory', 'trade', 'communities', 'groups', 'premium', 'blog', 'shop', 'gift cards', 'events', 'creations', 'create']);
const NAV_AFTER = ['trade', 'communities', 'groups', 'inventory'];

function findSidebar() {
  let best = null, bestN = 0;
  document.querySelectorAll('ul').forEach(ul => {
    if (host && host.contains(ul)) return;
    let n = 0;
    ul.querySelectorAll(':scope > li').forEach(li => {
      const a = li.querySelector('a');
      if (a && NAV_WORDS.has((a.textContent || '').trim().toLowerCase())) n++;
    });
    if (n > bestN) { bestN = n; best = ul; }
  });
  return bestN >= 4 ? best : null;
}

function makeNavItem(src) {
  const li = src.cloneNode(true);
  li.removeAttribute('id');
  li.setAttribute('data-rt2', '1');
  li.classList.remove('active', 'selected');
  li.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
  li.querySelectorAll('[class*="badge"],[class*="notification"],[class*="count"]').forEach(e => e.remove());
  const a = li.querySelector('a');
  a.setAttribute('href', '#');
  a.removeAttribute('target');
  a.removeAttribute('aria-current');
  a.classList.remove('active', 'selected');
  const leaves = [...li.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim());
  const label = leaves[leaves.length - 1];
  if (label) label.textContent = 'Robux Tracker';
  const icon = [...li.querySelectorAll('[class*="icon"]')][0];
  const iconSrc = [...src.querySelectorAll('[class*="icon"]')][0];
  let w = 28, h = 28;
  if (iconSrc) {
    const cs = getComputedStyle(iconSrc);
    if (parseFloat(cs.width) > 0) w = parseFloat(cs.width);
    if (parseFloat(cs.height) > 0) h = parseFloat(cs.height);
  }
  const fit = `display:inline-block;width:${w}px;height:${h}px;min-width:${w}px;background:none;background-image:none;vertical-align:middle;line-height:0`;
  if (icon) {
    icon.className = [...icon.classList].filter(c => !/^icon/.test(c)).join(' ');
    icon.style.cssText = fit;
    icon.innerHTML = NAV_SVG;
  } else {
    const box = document.createElement('span');
    box.style.cssText = fit;
    box.innerHTML = NAV_SVG;
    a.insertBefore(box, a.firstChild);
  }
  a.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openPanel(); }, true);
  return li;
}

let navTimer = null, navLooks = 0;
function ensureNavItem() {
  const placed = document.querySelector('[data-rt2]');
  if (placed && placed.isConnected) { fabEl.classList.remove('show'); return true; }
  const ul = findSidebar();
  if (!ul) return false;
  const items = [...ul.querySelectorAll(':scope > li')];
  let after = null;
  items.forEach(li => { const a = li.querySelector('a'); if (a && NAV_AFTER.includes((a.textContent || '').trim().toLowerCase())) after = li; });
  if (!after) after = items[items.length - 1];
  const tmpl = items.find(li => { const a = li.querySelector('a'); return a && NAV_AFTER.includes((a.textContent || '').trim().toLowerCase()); }) || items[0];
  const li = makeNavItem(tmpl);
  after.parentNode.insertBefore(li, after.nextSibling);
  fabEl.classList.remove('show');
  return true;
}

function watchNav() {
  const tick = () => {
    clearTimeout(navTimer);
    navTimer = setTimeout(() => { try { ensureNavItem(); } catch (e) {} }, 250);
  };
  new MutationObserver(tick).observe(document.documentElement, { childList: true, subtree: true });
  tick();
  setTimeout(() => { if (!document.querySelector('[data-rt2]')) fabEl.classList.add('show'); }, 3500);
}

function mount() {
  if (document.getElementById('rt2-host')) return;
  host = document.createElement('div');
  host.id = 'rt2-host';
  shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>${CSS}</style><div class="root"><button class="fab" data-a="open" title="Robux Tracker (Alt+R)">${NAV_SVG}</button><div class="scrim"><div class="app"><div class="top"></div><div class="bar2"></div><div class="prog"></div><main class="content"></main></div></div></div>`;
  document.documentElement.appendChild(host);
  installHook();
  installBridge();
  rootEl = shadow.querySelector('.root');
  topEl = shadow.querySelector('.top');
  barEl = shadow.querySelector('.bar2');
  progEl = shadow.querySelector('.prog');
  contentEl = shadow.querySelector('.content');
  scrimEl = shadow.querySelector('.scrim');
  fabEl = shadow.querySelector('.fab');
  rootEl.addEventListener('click', e => {
    if (e.target === scrimEl) { closePanel(); return; }
    const el = e.target.closest('[data-a]');
    if (!el) return;
    const fn = ACT[el.dataset.a];
    if (fn) { e.stopPropagation(); fn(el.dataset, e); }
  });
  rootEl.addEventListener('input', e => { const el = e.target.closest('[data-i]'); if (el && (el.dataset.i === 'q' || el.dataset.i === 'symbol' || el.dataset.i === 'alabel')) onInput(el); });
  rootEl.addEventListener('change', e => { const el = e.target.closest('[data-i]'); if (el && !(el.dataset.i === 'q')) onInput(el); });
  document.addEventListener('keydown', e => {
    if (e.altKey && (e.key === 'r' || e.key === 'R')) { e.preventDefault(); V.open ? closePanel() : openPanel(); }
    else if (e.key === 'Escape' && V.open) closePanel();
  }, true);
  applyTheme();
  watchNav();
}
