const PACKS = [[80, 0.99], [240, 2.99], [270, 2.99], [400, 4.99], [440, 4.99], [500, 4.99], [800, 9.99], [880, 9.99], [1000, 9.99], [1200, 14.99], [1500, 14.99], [1700, 19.99], [1870, 19.99], [2000, 19.99], [3150, 34.99], [3625, 34.99], [4500, 49.99], [4950, 49.99], [5250, 49.99], [10000, 99.99], [11000, 99.99], [22500, 199.99], [24000, 199.99], [24750, 199.99]];
const PACK_MAP = new Map(PACKS);
const EXP_CATS = new Set(['Game Passes', 'Dev Products', 'Private Servers', 'Subscriptions']);
const CAT_ORDER = ['Dev Products', 'Game Passes', 'Private Servers', 'Subscriptions', 'Bundles', 'Catalog', 'Other'];
const BUCKETS = { exp: 'Experiences', cat: 'Catalog & avatar', oth: 'Unattributed' };

const delta = r => (r.d !== undefined ? r.d : (r.ty === 'Purchase' ? -r.amt : r.amt));
const isOut = r => r.ty === 'Purchase';
const isIn = r => delta(r) > 0;

function packPrice(amt) {
  const c = S.settings.packs && S.settings.packs[amt];
  if (c > 0) return c;
  return PACK_MAP.get(amt) || null;
}

function cash(v) {
  const n = v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const s = S.settings.symbol || '$';
  return /^[A-Za-z]/.test(s) ? `${s} ${n}` : `${s}${n}`;
}

function realMoney(list) {
  const rows = list.filter(r => r.ty === 'CurrencyPurchase' && r.amt && !r.pend);
  let robux = 0, paid = 0, n = 0, unknownN = 0, unknownRobux = 0;
  const unknown = new Map();
  for (const r of rows) {
    robux += r.amt;
    const price = packPrice(r.amt);
    if (price) { paid += price; n++; }
    else { unknownN++; unknownRobux += r.amt; unknown.set(r.amt, (unknown.get(r.amt) || 0) + 1); }
  }
  return { rows: rows.length, robux, paid, n, unknownN, unknownRobux, unknown: [...unknown.entries()].sort((a, b) => b[0] * b[1] - a[0] * a[1]) };
}

function rangeWindow(range, custom) {
  const now = Date.now();
  const d = new Date();
  switch (range) {
    case '7': return { from: now - 7 * 864e5, to: now };
    case '30': return { from: now - 30 * 864e5, to: now };
    case '90': return { from: now - 90 * 864e5, to: now };
    case 'ytd': return { from: new Date(d.getFullYear(), 0, 1).getTime(), to: now };
    case '365': return { from: now - 365 * 864e5, to: now };
    case 'custom': {
      const f = custom && custom.from ? new Date(custom.from + 'T00:00:00').getTime() : null;
      const t = custom && custom.to ? new Date(custom.to + 'T23:59:59.999').getTime() : null;
      return { from: f, to: t };
    }
    default: return { from: null, to: null };
  }
}

const inWindow = (r, w) => (w.from == null || r.t >= w.from) && (w.to == null || r.t <= w.to);

function inferSellers(all) {
  const by = new Map();
  for (const r of all) {
    if (!r.uni || r.sid == null || !isOut(r) || !r.amt) continue;
    let e = by.get(r.sid);
    if (!e) by.set(r.sid, e = new Map());
    const cur = e.get(String(r.uni)) || { n: 0, name: '', pid: null };
    cur.n++;
    if (r.pn) cur.name = r.pn;
    if (r.pid) cur.pid = r.pid;
    e.set(String(r.uni), cur);
  }
  const out = new Map();
  for (const [sid, e] of by) if (e.size === 1) { const [uni, info] = [...e.entries()][0]; out.set(sid, { uni, name: info.name, pid: info.pid }); }
  return out;
}

let inferCache = { rev: -1, map: null };
function inferred() {
  if (inferCache.rev !== S.rev) inferCache = { rev: S.rev, map: inferSellers(S.tx) };
  return inferCache.map;
}

function placeOf(r) {
  if (r.uni) return { b: 'exp', gk: 'u:' + r.uni, label: r.pn || 'Experience ' + r.uni, uni: String(r.uni), pid: r.pid, inf: false };
  if (r.c === 'Catalog' || r.c === 'Bundles') return { b: 'cat', gk: 'c:' + (r.sid != null ? r.sid : r.sn), label: r.sn || 'Unknown creator', uni: null, pid: null, inf: false };
  const g = r.sid != null ? inferred().get(r.sid) : null;
  if (g) return { b: 'exp', gk: 'u:' + g.uni, label: g.name || 'Experience ' + g.uni, uni: g.uni, pid: g.pid, inf: true };
  return { b: 'oth', gk: 's:' + (r.sid != null ? r.sid : r.sn || 'unknown'), label: r.sn || 'Unknown seller', uni: null, pid: null, inf: false };
}

function median(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function build(list) {
  const o = {
    total: 0, count: 0, first: null, last: null, max: null,
    buckets: { exp: { total: 0, count: 0 }, cat: { total: 0, count: 0 }, oth: { total: 0, count: 0 } },
    cats: new Map(), games: new Map(), items: new Map(), creators: new Map(), months: new Map(), days: new Map(),
    weekday: new Array(7).fill(0), hour: new Array(24).fill(0), amounts: [], inferredCount: 0, pending: 0
  };
  for (const r of list) {
    if (!r.amt) continue;
    const pl = placeOf(r);
    o.total += r.amt; o.count++;
    o.amounts.push(r.amt);
    if (r.pend) o.pending++;
    if (pl.inf) o.inferredCount++;
    if (o.first === null || r.t < o.first) o.first = r.t;
    if (o.last === null || r.t > o.last) o.last = r.t;
    if (!o.max || r.amt > o.max.amt) o.max = r;
    const b = o.buckets[pl.b];
    b.total += r.amt; b.count++;
    o.cats.set(r.c, (o.cats.get(r.c) || 0) + r.amt);

    let g = o.games.get(pl.gk);
    if (!g) o.games.set(pl.gk, g = { key: pl.gk, sid: r.sid, sk: r.sk, b: pl.b, label: pl.label, uni: pl.uni, pid: pl.pid, inf: false, total: 0, count: 0, first: null, last: null, max: 0, cats: new Map(), items: new Map(), txs: [], creators: new Set(), nameT: 0 });
    g.total += r.amt; g.count++; g.txs.push(r);
    if (pl.inf) g.inf = true;
    if (r.pn && r.t >= g.nameT) { g.label = r.pn; g.nameT = r.t; }
    if (!g.pid && pl.pid) g.pid = pl.pid;
    if (r.amt > g.max) g.max = r.amt;
    if (g.first === null || r.t < g.first) g.first = r.t;
    if (g.last === null || r.t > g.last) g.last = r.t;
    g.cats.set(r.c, (g.cats.get(r.c) || 0) + r.amt);
    if (r.sn) g.creators.add(r.sn);

    const ik = r.c + '|' + (r.iid != null ? r.iid : r.in);
    let it = g.items.get(ik);
    if (!it) g.items.set(ik, it = { key: ik, uni: pl.uni, name: r.in || r.it || 'Item', c: r.c, iid: r.iid, count: 0, total: 0, last: null, first: null, txs: [] });
    it.count++; it.total += r.amt; it.txs.push(r);
    if (it.last === null || r.t > it.last) it.last = r.t;
    if (it.first === null || r.t < it.first) it.first = r.t;

    let gi = o.items.get(ik);
    if (!gi) o.items.set(ik, gi = { key: ik, uni: pl.uni, name: r.in || r.it || 'Item', c: r.c, iid: r.iid, game: pl.label, gk: pl.gk, count: 0, total: 0, last: null });
    gi.count++; gi.total += r.amt;
    if (gi.last === null || r.t > gi.last) gi.last = r.t;

    const ck = r.sid != null ? 'id:' + r.sid : 'n:' + r.sn;
    let cr = o.creators.get(ck);
    if (!cr) o.creators.set(ck, cr = { key: ck, sk: r.sk, name: r.sn || 'Unknown', sid: r.sid, kind: r.sk, total: 0, count: 0, last: null, games: new Set() });
    cr.total += r.amt; cr.count++;
    if (cr.last === null || r.t > cr.last) cr.last = r.t;
    if (pl.b === 'exp') cr.games.add(pl.label);

    const mk = monthKey(r.t);
    let mo = o.months.get(mk);
    if (!mo) o.months.set(mk, mo = { key: mk, total: 0, count: 0, t: new Date(new Date(r.t).getFullYear(), new Date(r.t).getMonth(), 1).getTime() });
    mo.total += r.amt; mo.count++;
    const dk = dayKey(r.t);
    let dy = o.days.get(dk);
    if (!dy) o.days.set(dk, dy = { key: dk, total: 0, count: 0 });
    dy.total += r.amt; dy.count++;
    const d = new Date(r.t);
    o.weekday[d.getDay()] += r.amt;
    o.hour[d.getHours()] += r.amt;
  }
  return o;
}

function monthSeries(o, from, to) {
  const arr = [...o.months.values()].sort((a, b) => a.t - b.t);
  if (!arr.length && from == null) return [];
  const start = new Date(from != null ? from : arr[0].t);
  const end = new Date(to != null ? to : arr[arr.length - 1].t);
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const stop = new Date(end.getFullYear(), end.getMonth(), 1);
  const out = [];
  while (cur <= stop && out.length < 600) {
    const k = cur.getFullYear() + '-' + pad(cur.getMonth() + 1);
    out.push(o.months.get(k) || { key: k, total: 0, count: 0, t: cur.getTime() });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return out;
}

function longestStreak(days) {
  const keys = [...days.keys()].sort();
  let best = 0, run = 0, prev = null, bestEnd = null;
  for (const k of keys) {
    const t = new Date(k + 'T12:00:00').getTime();
    if (prev !== null && Math.round((t - prev) / 864e5) === 1) run++; else run = 1;
    if (run > best) { best = run; bestEnd = k; }
    prev = t;
  }
  return { len: best, end: bestEnd };
}

function stats(o, w) {
  const out = { total: o.total, count: o.count };
  out.avg = o.count ? o.total / o.count : 0;
  out.median = median(o.amounts);
  const fromT = w && w.from != null ? w.from : o.first;
  const toT = w && w.to != null ? Math.min(w.to, Date.now()) : (o.last || Date.now());
  if (o.count && fromT != null) {
    const a = new Date(Math.min(fromT, o.first)), b = new Date(Math.max(toT, o.last));
    out.months = Math.max(1, (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() + 1);
    out.perMonth = o.total / out.months;
    out.spanDays = Math.max(1, Math.round((Math.max(toT, o.last) - Math.min(fromT, o.first)) / 864e5) + 1);
    out.perDay = o.total / out.spanDays;
  } else { out.months = 0; out.perMonth = 0; out.spanDays = 0; out.perDay = 0; }
  out.activeDays = o.days.size;
  out.streak = longestStreak(o.days);
  let topDay = null;
  for (const d of o.days.values()) if (!topDay || d.total > topDay.total) topDay = d;
  out.topDay = topDay;
  let topMonth = null;
  for (const m of o.months.values()) if (!topMonth || m.total > topMonth.total) topMonth = m;
  out.topMonth = topMonth;
  const wd = o.weekday.indexOf(Math.max(...o.weekday));
  out.weekday = o.total ? wd : null;
  const hr = o.hour.indexOf(Math.max(...o.hour));
  out.hour = o.total ? hr : null;
  return out;
}

function income(list) {
  const by = new Map();
  let total = 0, count = 0;
  for (const r of list) {
    const d = delta(r);
    if (!r.amt || r.pend || d <= 0) continue;
    by.set(r.ty, (by.get(r.ty) || 0) + d);
    total += d; count++;
  }
  return { total, count, by };
}

function monthProgress() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = now.getDate();
  let cur = 0, prev = 0, prevSame = 0;
  for (const r of S.tx) {
    if (!r.amt || !isOut(r)) continue;
    if (r.t >= start) cur += r.amt;
    else if (r.t >= prevStart) {
      prev += r.amt;
      if (new Date(r.t).getDate() <= day) prevSame += r.amt;
    }
  }
  return { cur, prev, prevSame, days, day, projected: day ? cur / day * days : 0 };
}

function filterLedger(list, f) {
  const q = (f.q || '').trim().toLowerCase();
  return list.filter(r => {
    if (f.ty && f.ty !== 'all' && r.ty !== f.ty) return false;
    if (f.cat && f.cat !== 'all' && r.c !== f.cat) return false;
    if (f.min && r.amt < f.min) return false;
    if (f.max && r.amt > f.max) return false;
    if (q && !(`${r.in} ${r.pn} ${r.sn} ${r.c} ${r.iid} ${r.uni}`.toLowerCase().includes(q))) return false;
    return true;
  });
}

function buildInsights(o, st, inc) {
  const out = [];
  if (!o.count) return out;
  const wk = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  const topGame = [...o.games.values()].sort((a, b) => b.total - a.total)[0];
  if (topGame && o.total) out.push({ i: '◆', t: `${topGame.label} is ${Math.round(topGame.total / o.total * 100)}% of everything you spent.` });
  const topCat = [...o.cats.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topCat) out.push({ i: '▤', t: `${Math.round(topCat[1] / o.total * 100)}% went on ${topCat[0].toLowerCase()}.` });
  if (st.weekday != null) out.push({ i: '◷', t: `You spend most on ${wk[st.weekday]}, usually around ${pad(st.hour)}:00.` });
  if (st.topDay) out.push({ i: '▲', t: `Biggest single day: ${fmt(st.topDay.total)} R$ on ${new Date(st.topDay.key + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} (${st.topDay.count} purchases).` });
  if (st.streak.len >= 3) out.push({ i: '↯', t: `Longest streak: ${st.streak.len} days in a row with a purchase.` });
  const repeat = [...o.items.values()].sort((a, b) => b.count - a.count)[0];
  if (repeat && repeat.count >= 3) out.push({ i: '↻', t: `You bought “${repeat.name}” ${repeat.count} times (${fmt(repeat.total)} R$).` });
  if (st.median && st.avg > st.median * 2) out.push({ i: '≈', t: `A few big buys skew your average. The typical purchase is ${fmt(st.median)} R$, not ${fmt(st.avg)}.` });
  if (inc && inc.total) out.push({ i: '⇅', t: `You took in ${fmt(inc.total)} R$ and spent ${fmt(o.total)} R$ in this window.` });
  return out;
}

function integrity() {
  const checks = [];
  const accs = viewAccounts().filter(a => acct(a.id));
  const types = scanList();
  const gaps = [];
  for (const a of accs) for (const t of types) { const m = acct(a.id).meta[t]; if (!(m && (m.complete || m.unsupported))) gaps.push(`${an(a.id)}: ${typeDef(t).label}`); }
  checks.push({ ok: gaps.length === 0 && S.tx.length > 0, t: gaps.length ? `History not fully read yet for ${gaps.join('; ')}. Sign in to that account and Sync.` : `Every selected transaction type was read to the end of the history Roblox returns, for ${accs.length} account${accs.length === 1 ? '' : 's'}.` });
  const o = build(S.tx.filter(isOut));
  const sum = o.buckets.exp.total + o.buckets.cat.total + o.buckets.oth.total;
  const gsum = [...o.games.values()].reduce((a, g) => a + g.total, 0);
  let asum = 0;
  for (const a of accs) asum += acct(a.id).tx.filter(r => r.amt && isOut(r)).reduce((x, r) => x + r.amt, 0);
  checks.push({ ok: sum === o.total && gsum === o.total && asum === o.total, t: `Totals reconcile: experiences + catalog + unattributed = every game = every account = ${fmt(o.total)} R$.` });
  for (const a of accs) {
    const L = ledgerOf(a.id);
    if (L.status === 'exact') checks.push({ ok: true, t: `${an(a.id)}: the ledger explains the balance exactly (${fmt(L.net)} R$ net, balance ${fmt(L.bal)} R$).` });
    else if (L.status === 'older') checks.push({ ok: false, t: `${an(a.id)}: the balance is ${fmt(L.opening)} R$ higher than the ledger explains. Older history or a transaction type Roblox does not expose.` });
    else if (L.status === 'over') checks.push({ ok: false, t: `${an(a.id)}: the ledger adds up to ${fmt(-L.opening)} R$ more than the balance. Sync again so the balance is current.` });
    else checks.push({ ok: false, t: `${an(a.id)}: balance not read yet. Sign in to that account and Sync to verify the ledger.` });
  }
  const pend = S.tx.filter(r => r.pend).length;
  checks.push({ ok: pend === 0, t: pend ? `${pend} transactions are still pending and may change.` : 'No pending transactions.' });
  const dupes = accs.reduce((a, x) => a + Object.values(acct(x.id).meta).reduce((b, m) => b + (m.dupes || 0), 0), 0);
  checks.push({ ok: true, t: dupes ? `${dupes} duplicate rows from Roblox were ignored, not double counted.` : 'No duplicate rows were returned by Roblox.' });
  const zero = S.tx.filter(r => !r.amt).length;
  checks.push({ ok: true, t: zero ? `${zero} rows had no Robux amount (other currency or free) and are excluded from totals.` : 'Every stored row has a Robux amount.' });
  if (o.total) checks.push({ ok: o.buckets.oth.total / o.total < 0.1, t: `${Math.round(o.buckets.exp.total / o.total * 100)}% of spending is tied to a specific experience${o.inferredCount ? ` (${o.inferredCount} purchases matched by creator because Roblox sent no game)` : ''}.` });
  return checks;
}

function splitBy(txs) {
  const m = new Map();
  for (const r of txs) m.set(r.a, (m.get(r.a) || 0) + r.amt);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
const multi = () => S.view === 'all' && viewAccounts().length > 1;

function balanceOf(accs) {
  let sum = 0, known = 0;
  for (const a of accs) if (typeof a.bal === 'number') { sum += a.bal; known++; }
  return { sum, known, n: accs.length };
}

const ledgerMemo = new Map();
function ledgerOf(id) {
  const k = String(id);
  const a = S.accounts[k];
  const bal = a && typeof a.bal === 'number' ? a.bal : null;
  const hit = ledgerMemo.get(k);
  if (hit && hit.rev === S.rev && hit.bal === bal && hit.n === (acct(k) ? acct(k).tx.length : 0)) return hit.L;
  const L = ledgerCompute(id);
  ledgerMemo.set(k, { rev: S.rev, bal, n: acct(k) ? acct(k).tx.length : 0, L });
  return L;
}

function ledgerCompute(id) {
  const A = acct(id);
  const rows = A ? A.tx.filter(r => r.amt && !(r.pend && delta(r) > 0)).slice().sort((a, b) => a.t - b.t || (a.k < b.k ? -1 : 1)) : [];
  let net = 0;
  for (const r of rows) net += delta(r);
  const a = S.accounts[String(id)];
  const bal = a && typeof a.bal === 'number' ? a.bal : null;
  const opening = bal == null ? null : bal - net;
  const after = new Map();
  let run = opening == null ? 0 : opening;
  for (const r of rows) { run += delta(r); after.set(r.k, run); }
  const status = opening == null ? 'unknown' : opening === 0 ? 'exact' : opening > 0 ? 'older' : 'over';
  return { rows, net, bal, opening, after, status };
}

const monthMemo = { key: '', v: null };
function monthEndBalances(ids) {
  const key = S.rev + '|' + ids.join(',') + '|' + ids.map(i => (S.accounts[i] || {}).bal).join(',');
  if (monthMemo.key === key) return monthMemo.v;
  const v = monthEndCompute(ids);
  monthMemo.key = key;
  monthMemo.v = v;
  return v;
}

function monthEndCompute(ids) {
  const per = [];
  for (const id of ids) { const L = ledgerOf(id); if (L.opening == null) return null; per.push(L); }
  const withRows = per.filter(L => L.rows.length);
  if (!withRows.length) return null;
  const first = Math.min(...withRows.map(L => L.rows[0].t));
  const out = new Map();
  const st = new Date(first);
  let cur = new Date(st.getFullYear(), st.getMonth(), 1);
  const end = new Date();
  const idx = per.map(() => ({ i: 0, bal: null }));
  while (cur <= end && out.size < 600) {
    const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1).getTime();
    let sum = 0;
    per.forEach((L, k) => {
      const s = idx[k];
      while (s.i < L.rows.length && L.rows[s.i].t < next) { s.bal = L.after.get(L.rows[s.i].k); s.i++; }
      sum += s.bal == null ? L.opening : s.bal;
    });
    out.set(monthKey(cur.getTime()), sum);
    cur = new Date(next);
  }
  return out;
}

function flowByMonth(list) {
  const m = new Map();
  for (const r of list) {
    const d = delta(r);
    if (!r.amt || (r.pend && d > 0)) continue;
    const k = monthKey(r.t);
    let e = m.get(k);
    if (!e) m.set(k, e = { key: k, t: new Date(new Date(r.t).getFullYear(), new Date(r.t).getMonth(), 1).getTime(), inn: 0, out: 0, count: 0 });
    if (d > 0) e.inn += d; else e.out += -d;
    e.count++;
  }
  return [...m.values()].sort((a, b) => b.t - a.t);
}

function sourcesOf(list) {
  const m = new Map();
  for (const r of list) {
    const d = delta(r);
    if (!r.amt || (r.pend && d > 0)) continue;
    const def = typeDef(r.ty);
    let e = m.get(r.ty);
    if (!e) m.set(r.ty, e = { ty: r.ty, label: def.label, inn: 0, out: 0, nIn: 0, nOut: 0, last: 0 });
    if (d > 0) { e.inn += d; e.nIn++; } else { e.out += -d; e.nOut++; }
    if (r.t > e.last) e.last = r.t;
  }
  return [...m.values()];
}

function earningsOf(list) {
  const by = new Map();
  for (const r of list) {
    const d = delta(r);
    if (!r.amt || r.pend || d <= 0 || r.ty === 'CurrencyPurchase' || r.ty === 'PremiumStipend') continue;
    const sale = r.ty === 'Sale';
    const key = r.ty + '|' + (sale ? (r.iid != null ? r.iid : r.in) : (r.sid != null ? r.sid : r.sn));
    let e = by.get(key);
    if (!e) by.set(key, e = { key, ty: r.ty, label: sale ? (r.in || r.c || 'Sale') : (r.sn || typeDef(r.ty).label), sub: sale ? (r.pn || '') : typeDef(r.ty).label, c: r.c, iid: r.iid, uni: r.uni, sid: r.sid, sk: r.sk, sale, total: 0, count: 0, last: 0 });
    e.total += d; e.count++;
    if (r.t > e.last) e.last = r.t;
  }
  return [...by.values()].sort((a, b) => b.total - a.total);
}

function boughtOf(list) {
  const rows = list.filter(r => r.ty === 'CurrencyPurchase' && r.amt && !r.pend).sort((a, b) => b.t - a.t);
  const packs = new Map();
  for (const r of rows) {
    let e = packs.get(r.amt);
    if (!e) packs.set(r.amt, e = { amt: r.amt, price: packPrice(r.amt), n: 0 });
    e.n++;
  }
  return { rows, packs: [...packs.values()].sort((a, b) => b.n * b.amt - a.n * a.amt), money: realMoney(list) };
}

function dayTotals(o) {
  return [...o.days.values()].sort((a, b) => b.total - a.total);
}

function diagnostics() {
  const out = ['Robux Tracker diagnostics v' + VERSION, new Date().toISOString(), 'signed in: ' + (S.user ? S.user.name + ' #' + S.user.id : 'no'), 'learned types: ' + JSON.stringify(S.seen), ''];
  for (const a of Object.values(S.accounts)) {
    const A = acct(a.id);
    if (!A) continue;
    const L = ledgerOf(a.id);
    out.push(`account ${a.name} #${a.id}: ${A.tx.length} rows, ledger net ${L.net}, balance ${L.bal}, status ${L.status}, opening ${L.opening}`);
    const types = [...new Set(A.tx.map(r => r.ty))];
    for (const ty of types) {
      const rows = A.tx.filter(r => r.ty === ty);
      const ts = rows.map(r => r.t);
      const pos = rows.filter(r => delta(r) > 0).reduce((x, r) => x + delta(r), 0);
      const neg = rows.filter(r => delta(r) < 0).reduce((x, r) => x - delta(r), 0);
      out.push(`  ${ty}: ${rows.length} rows, in ${pos}, out ${neg}, ${new Date(Math.min(...ts)).toISOString().slice(0, 10)} to ${new Date(Math.max(...ts)).toISOString().slice(0, 10)}, meta ${JSON.stringify(A.meta[ty] || {})}`);
      out.push('    sample: ' + JSON.stringify(rows[0]));
    }
    out.push('  meta: ' + JSON.stringify(Object.assign({}, A.meta, { _totals: undefined })));
    const T = A.meta._totals;
    if (T) { out.push('  roblox totals raw: ' + JSON.stringify(T.frames)); const c = compareTotals(a.id); if (c) out.push('  totals compare: ' + JSON.stringify(c.rows) + ' unknown fields: ' + JSON.stringify(c.unknown)); }
  }
  return out.join('\n');
}

const sumBy = (rows, f) => rows.reduce((a, r) => a + f(r), 0);
const TOTAL_FIELDS = [
  { re: /^purchasesTotal$/i, label: 'Purchases', ours: rows => sumBy(rows.filter(r => r.ty === 'Purchase'), r => -delta(r)) },
  { re: /^salesTotal$/i, label: 'Sales', ours: rows => sumBy(rows.filter(r => r.ty === 'Sale' && delta(r) > 0), delta) },
  { re: /^currencyPurchasesTotal$/i, label: 'Robux bought', ours: rows => sumBy(rows.filter(r => r.ty === 'CurrencyPurchase' && delta(r) > 0), delta) },
  { re: /^premiumStipendsTotal$/i, label: 'Premium stipends', ours: rows => sumBy(rows.filter(r => r.ty === 'PremiumStipend' && delta(r) > 0), delta) },
  { re: /^groupPayoutsTotal$/i, label: 'Group payouts', ours: rows => sumBy(rows.filter(r => r.ty === 'GroupPayout' && delta(r) > 0), delta) },
  { re: /^affiliateSalesTotal$/i, label: 'Commissions', ours: rows => sumBy(rows.filter(r => r.ty === 'Commission' && delta(r) > 0), delta) },
  { re: /^tradeSystemEarningsTotal$/i, label: 'Trade earnings', ours: rows => sumBy(rows.filter(r => r.ty === 'TradeRobux' && delta(r) > 0), delta) },
  { re: /^tradeSystemCostsTotal$/i, label: 'Trade costs', ours: rows => sumBy(rows.filter(r => r.ty === 'TradeRobux' && delta(r) < 0), r => -delta(r)) },
  { re: /^incomingRobuxTotal$/i, label: 'Total incoming', ours: rows => sumBy(rows.filter(r => delta(r) > 0), delta) },
  { re: /^outgoingRobuxTotal$/i, label: 'Total outgoing', ours: rows => sumBy(rows.filter(r => delta(r) < 0), r => -delta(r)) }
];

function compareTotals(id) {
  const A = acct(id);
  const T = A && A.meta && A.meta._totals;
  if (!T || !T.frames) return null;
  const days = { Day: 1, Week: 7, Month: 30, Year: 365 };
  const out = [];
  const unknown = new Set();
  for (const f of ['Day', 'Week', 'Month', 'Year']) {
    const j = T.frames[f];
    if (!j || typeof j !== 'object') continue;
    const from = T.at - days[f] * 864e5;
    const rows = A.tx.filter(r => r.amt && !r.pend && r.t >= from && r.t <= T.at);
    for (const [k, v] of Object.entries(j)) {
      if (typeof v !== 'number') continue;
      const def = TOTAL_FIELDS.find(d => d.re.test(k));
      if (!def) { unknown.add(k); continue; }
      const rob = Math.abs(v);
      const ours = def.ours(rows);
      const diff = ours - rob;
      const status = diff === 0 ? 'match' : Math.abs(diff) <= Math.max(rob * 0.02, 0) ? 'close' : 'differs';
      out.push({ frame: f, field: k, label: def.label, roblox: rob, ours, diff, status });
    }
  }
  const counts = { match: 0, close: 0, differs: 0 };
  out.forEach(r => { counts[r.status]++; });
  return { at: T.at, rows: out, counts, unknown: [...unknown] };
}

function transfersOf(list) {
  const by = new Map();
  for (const r of list) {
    if (!r.amt || r.pend || !/transfer/i.test(r.ty)) continue;
    const m = String(r.in || '').match(/(?:to|from)\s+([A-Za-z0-9_.]+?)\.?\s*$/i);
    const name = m ? m[1] : (r.sn || 'Unknown');
    let e = by.get(name);
    if (!e) by.set(name, e = { name, sent: 0, got: 0, n: 0, last: 0 });
    const d = delta(r);
    if (d < 0) e.sent += -d; else e.got += d;
    e.n++;
    if (r.t > e.last) e.last = r.t;
  }
  return [...by.values()].sort((a, b) => (b.sent + b.got) - (a.sent + a.got));
}
