const VERSION = '6.2.0';
const MIN_DELAY = 400;
const AC_COLORS = ['#8b5cf6', '#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#f472b6', '#22d3ee', '#a3e635'];

const TYPE_DEFS = [
  { id: 'Purchase', label: 'Purchases', kind: 'out', hint: 'Game passes, developer products, catalog items' },
  { id: 'CurrencyPurchase', label: 'Robux bought', kind: 'in', hint: 'Robux you bought with real money' },
  { id: 'PremiumStipend', label: 'Premium stipends', kind: 'in', hint: 'Monthly Premium Robux' },
  { id: 'Sale', label: 'Sales', kind: 'in', hint: 'Robux earned when people buy your items' },
  { id: 'GroupPayout', label: 'Group payouts', kind: 'in', hint: 'Payouts from groups you are in' },
  { id: 'TradeRobux', label: 'Trades', kind: 'in', hint: 'Robux received through trades' },
  { id: 'EngagementPayout', label: 'Engagement payouts', kind: 'in', hint: 'Premium engagement payouts to creators' },
  { id: 'GroupEngagementPayout', label: 'Group engagement payouts', kind: 'in', hint: 'Engagement payouts paid to your groups' },
  { id: 'AdSpend', label: 'Ad spend', kind: 'out', hint: 'Robux spent on sponsored ads' },
  { id: 'Commission', label: 'Commissions', kind: 'in', hint: 'Commission Robux you receive' }
];
const typeDef = id => TYPE_DEFS.find(t => t.id === id) || { id, label: String(id).replace(/([a-z])([A-Z])/g, '$1 $2'), kind: 'other', hint: 'Learned from your Roblox transactions page' };

const DEFAULTS = {
  v: 2,
  theme: 'dark',
  accent: 'nebula',
  fx: true,
  types: TYPE_DEFS.map(t => t.id),
  delay: 650,
  autoSync: true,
  budget: 0,
  symbol: '$',
  packs: {},
  fast: true,
  bg: { on: false, hours: 6 }
};

const S = {
  uid: null,
  user: null,
  sh: null,
  seen: {},
  accounts: {},
  data: new Map(),
  view: null,
  tx: [],
  settings: Object.assign({}, DEFAULTS),
  icons: {},
  rev: 0,
  demo: false,
  stash: null,
  scan: { running: false, paused: false, stop: false, label: '', pages: 0, reqs: 0, found: 0, started: 0, delay: 650, warn: [], error: null, type: '', done: false }
};

function openDb(name) {
  return new Promise((res, rej) => {
    const r = indexedDB.open(name, 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore('tx', { keyPath: 'k' });
      r.result.createObjectStore('kv');
    };
    r.onsuccess = () => {
      const db = r.result;
      const req = q => new Promise((ok, no) => { q.onsuccess = () => ok(q.result); q.onerror = () => no(q.error); });
      res({
        name,
        all: () => req(db.transaction('tx', 'readonly').objectStore('tx').getAll()),
        get: k => req(db.transaction('kv', 'readonly').objectStore('kv').get(k)),
        set: (k, v) => req(db.transaction('kv', 'readwrite').objectStore('kv').put(v, k)),
        clearTx: () => req(db.transaction('tx', 'readwrite').objectStore('tx').clear()),
        putMany: arr => new Promise((ok, no) => {
          const t = db.transaction('tx', 'readwrite');
          const s = t.objectStore('tx');
          arr.forEach(x => s.put(x));
          t.oncomplete = () => ok();
          t.onerror = () => no(t.error);
        }),
        drop: () => new Promise(ok => { db.close(); const d = indexedDB.deleteDatabase(name); d.onsuccess = d.onerror = d.onblocked = () => ok(); })
      });
    };
    r.onerror = () => rej(r.error);
  });
}

const rawFetch = window.fetch.bind(window);

const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmt = n => Math.round(n || 0).toLocaleString('en-US');
const pad = n => String(n).padStart(2, '0');
const dayKey = t => { const d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const monthKey = t => { const d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1); };

const acct = id => S.data.get(String(id));
const cur = () => S.data.get(String(S.uid));
const an = id => { const a = S.accounts[String(id)]; return a ? (a.label || a.display || a.name) : 'Unknown'; };
const acol = id => { const a = S.accounts[String(id)]; return a ? a.color : '#94a3b8'; };
const lastSyncOf = () => (S.accounts[String(S.uid)] || {}).last || 0;

function viewAccounts() {
  const all = Object.values(S.accounts);
  if (S.view === 'all') return all.filter(a => a.inc);
  return all.filter(a => a.id === String(S.view));
}

let lastRebuild = 0;
function rebuildSoon() {
  const now = Date.now();
  if (now - lastRebuild > 900) { lastRebuild = now; rebuildView(); }
}

function rebuildView() {
  const accs = viewAccounts().filter(a => S.data.has(a.id));
  S.tx = accs.length === 1 ? acct(accs[0].id).tx : accs.flatMap(a => acct(a.id).tx);
  S.rev++;
}

function categoryOf(type) {
  const t = String(type || '').toLowerCase().replace(/[\s_-]/g, '');
  if (t.includes('gamepass')) return 'Game Passes';
  if (t.includes('developerproduct') || t === 'product') return 'Dev Products';
  if (t.includes('privateserver') || t.includes('vipserver')) return 'Private Servers';
  if (t.includes('subscription')) return 'Subscriptions';
  if (t.includes('bundle')) return 'Bundles';
  if (t === 'asset' || t.includes('avatar') || t.includes('catalog')) return 'Catalog';
  return type ? String(type) : 'Other';
}

function normalize(tx, type) {
  const d = tx.details || {};
  const p = d.place || {};
  const c = tx.currency || {};
  const a = tx.agent || {};
  const t = Date.parse(tx.created);
  const raw = Number(c.amount) || 0;
  const amt = c.type === 'Robux' ? Math.abs(raw) : 0;
  const dl = type === 'Purchase' ? -amt : (raw > 0 ? amt : raw < 0 ? -amt : 0);
  const uniq = tx.idHash || (tx.id ? 'i' + tx.id : [tx.created, d.id, amt, a.id].join('|'));
  return {
    k: type + ':' + uniq,
    ty: type,
    t: isFinite(t) ? t : 0,
    amt,
    d: dl,
    cur: c.type || '',
    it: d.type || '',
    c: categoryOf(d.type),
    iid: d.id != null ? d.id : null,
    in: d.name || '',
    sid: a.id != null ? a.id : null,
    sn: a.name || '',
    sk: a.type || '',
    pid: p.placeId || null,
    uni: p.universeId || null,
    pn: p.name || '',
    pend: !!tx.isPending
  };
}

function upsert(recs, dirty, A) {
  let added = 0, changed = 0, dupes = 0;
  const seenHere = new Set();
  for (const r of recs) {
    if (seenHere.has(r.k)) { dupes++; continue; }
    seenHere.add(r.k);
    r.a = A.id;
    const ex = A.keys.get(r.k);
    if (!ex) {
      A.keys.set(r.k, r);
      A.tx.push(r);
      dirty.push(r);
      added++;
    } else if (ex.pend && !r.pend) {
      Object.assign(ex, r);
      dirty.push(ex);
      changed++;
    }
  }
  if (added || changed) S.rev++;
  return { added, changed, dupes };
}

async function saveMeta(A) { if (!S.demo && A && A.h) await A.h.set('meta', A.meta); }
async function saveSettings() {
  syncBgSettings();
  if (S.sh) await S.sh.set('settings', S.settings);
}

function hasBridge() { return !!(window.chrome && window.chrome.runtime && window.chrome.runtime.onMessage); }

function syncBgSettings() {
  try { if (hasBridge() && window.chrome.storage && window.chrome.storage.local) window.chrome.storage.local.set({ rt2bg: S.settings.bg }); } catch (e) {}
}

function installBridge() {
  if (!hasBridge()) return;
  window.chrome.runtime.onMessage.addListener((msg, sender, reply) => {
    if (!msg) return false;
    if (msg.type === 'rt2-ping') { reply({ ok: true, booted: V.booted }); return false; }
    if (msg.type === 'rt2-sync') {
      (async () => {
        try {
          if (!V.booted) await ensureBoot();
          if (S.user && !S.scan.running) await runSync('auto');
          reply({ ok: true, found: S.scan.found });
        } catch (e) { reply({ ok: false, error: String(e && e.message || e) }); }
      })();
      return true;
    }
    return false;
  });
  syncBgSettings();
}
async function saveRegistry() { if (!S.demo && S.sh) await S.sh.set('accounts', S.accounts); }
async function saveView() { if (!S.demo && S.sh) await S.sh.set('view', S.view); }

async function loadAccount(id) {
  id = String(id);
  if (S.data.has(id)) return S.data.get(id);
  const h = await openDb('rt2-' + id);
  const tx = await h.all();
  tx.forEach(r => { r.a = id; });
  const meta = (await h.get('meta')) || {};
  const A = { id, tx, keys: new Map(tx.map(r => [r.k, r])), meta, h };
  S.data.set(id, A);
  return A;
}

async function register(user) {
  const id = String(user.id);
  const prev = S.accounts[id] || {};
  S.accounts[id] = Object.assign({ color: AC_COLORS[Object.keys(S.accounts).length % AC_COLORS.length], inc: true, added: Date.now(), label: '' }, prev, { id, name: user.name, display: user.displayName || user.name });
  await loadAccount(id);
  await saveRegistry();
}

async function adoptUser(user) {
  S.user = user;
  S.uid = String(user.id);
  lsSet('rt2_last', { id: user.id, name: user.name, displayName: user.displayName });
  await register(user);
}

const ctl = {
  async gate() {
    const sc = S.scan;
    if (sc.stop) throw new StopSignal();
    while (sc.paused && !sc.stop) { sc.label = 'Paused'; tickUi(); await sleep(150); }
    if (sc.stop) throw new StopSignal();
  },
  async wait(ms, label) {
    const sc = S.scan;
    const end = Date.now() + ms;
    while (Date.now() < end) {
      await ctl.gate();
      if (label) { sc.label = `${label} (${Math.ceil((end - Date.now()) / 1000)}s)`; tickUi(); }
      await sleep(Math.min(document.hidden ? end - Date.now() : 200, Math.max(1, end - Date.now())));
    }
  }
};
function StopSignal() {}
function UnsupportedSignal() {}
let tickUi = () => {};
const setTick = fn => { tickUi = fn; };

async function apiGet(url, soft) {
  const sc = S.scan;
  let attempt = 0;
  for (;;) {
    await ctl.gate();
    let res;
    try {
      sc.reqs++;
      res = await rawFetch(url, { credentials: 'include' });
    } catch (e) {
      attempt++;
      if (attempt > 6) throw new Error('Network error: ' + e.message);
      await ctl.wait(Math.min(60000, 2000 * 2 ** (attempt - 1)), 'Connection hiccup, retrying');
      continue;
    }
    if (res.status === 429) {
      attempt++;
      if (attempt > 8) throw new Error('Roblox rate-limited the scan too many times. Wait a few minutes and sync again; progress is saved.');
      const ra = parseInt(res.headers.get('retry-after') || '', 10);
      sc.delay = Math.min(8000, Math.round(sc.delay * 1.3));
      sc.lanes = 1;
      await ctl.wait(ra > 0 ? ra * 1000 : Math.min(60000, 5000 * 2 ** (attempt - 1)), 'Roblox asked us to slow down');
      continue;
    }
    if (res.status === 401 || res.status === 403) throw new Error('Not signed in (HTTP ' + res.status + '). Log into roblox.com in this browser and try again.');
    if (res.status === 400 && soft) throw new UnsupportedSignal();
    if (!res.ok) {
      attempt++;
      if (attempt > 6) throw new Error('Roblox returned HTTP ' + res.status + ' repeatedly.');
      await ctl.wait(Math.min(60000, 2000 * 2 ** (attempt - 1)), 'Server error, retrying');
      continue;
    }
    sc.okStreak = (sc.okStreak || 0) + 1;
    if (sc.okStreak >= 5 && sc.delay > S.settings.delay) { sc.delay = Math.max(S.settings.delay, Math.round(sc.delay * 0.85)); sc.okStreak = 0; }
    return res.json();
  }
}

async function authedUser() {
  const r = await rawFetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
  if (r.status === 401) throw new Error('Not signed in. Log into roblox.com in this browser first.');
  if (!r.ok) throw new Error('Could not verify your login (HTTP ' + r.status + ').');
  return r.json();
}

async function boot() {
  S.sh = await openDb('rt2-shared');
  S.settings = Object.assign({}, DEFAULTS, (await S.sh.get('settings')) || {});
  S.icons = (await S.sh.get('icons')) || {};
  S.accounts = (await S.sh.get('accounts')) || {};
  let view = await S.sh.get('view');
  const savedSeen = (await S.sh.get('seen')) || {};
  S.seen = Object.assign({}, savedSeen, S.seen);
  await S.sh.set('seen', S.seen);
  if (!S.settings.v || S.settings.v < 2) { S.settings.types = DEFAULTS.types.slice(); S.settings.v = 2; await saveSettings(); }
  S.scan.delay = S.settings.delay;
  S.settings.bg = Object.assign({ on: false, hours: 6 }, S.settings.bg);
  let signedIn = null, authErr = null;
  try { signedIn = await authedUser(); } catch (e) { authErr = e; }
  if (signedIn) await adoptUser(signedIn);
  else {
    const last = lsGet('rt2_last', null);
    if (!Object.keys(S.accounts).length && !last) throw authErr;
    S.user = null;
    S.uid = last ? String(last.id) : null;
  }
  for (const id of Object.keys(S.accounts)) await loadAccount(id);
  if (!view || (view !== 'all' && !S.accounts[view])) view = S.uid && S.accounts[S.uid] ? S.uid : 'all';
  S.view = String(view);
  rebuildView();
}

async function fetchBalance() {
  if (!S.user || !S.uid) return;
  try {
    const j = await apiGet(`https://economy.roblox.com/v1/users/${S.uid}/currency`);
    if (typeof j.robux === 'number' && S.accounts[S.uid]) { S.accounts[S.uid].bal = j.robux; S.accounts[S.uid].balT = Date.now(); await saveRegistry(); }
  } catch (e) {}
}

const THUMB_API = {
  u: '/v1/games/icons?universeIds=',
  p: '/v1/game-passes?gamePassIds=',
  a: '/v1/assets?assetIds=',
  b: '/v1/bundles/thumbnails?bundleIds=',
  h: '/v1/users/avatar-headshot?userIds=',
  r: '/v1/groups/icons?groupIds='
};

async function fetchThumbs(pairs) {
  const by = {};
  for (const [k, id] of pairs) { if (THUMB_API[k] && /^\d+$/.test(String(id))) (by[k] = by[k] || new Set()).add(String(id)); }
  let got = false;
  for (const k of Object.keys(by)) {
    const ids = [...by[k]];
    for (let i = 0; i < ids.length; i += 50) {
      try {
        const r = await rawFetch(`https://thumbnails.roblox.com${THUMB_API[k]}${ids.slice(i, i + 50).join(',')}&size=150x150&format=Png&isCircular=false`);
        if (!r.ok) continue;
        const j = await r.json();
        (j.data || []).forEach(d => { if (d.state === 'Completed' && d.imageUrl) { S.icons[k + ':' + d.targetId] = d.imageUrl; got = true; } });
      } catch (e) {}
    }
  }
  if (got && !S.demo && S.sh) await S.sh.set('icons', S.icons);
  return got;
}

function scanList() {
  const known = TYPE_DEFS.map(t => t.id).filter(id => S.settings.types.includes(id));
  const extra = Object.keys(S.seen || {}).filter(t => !TYPE_DEFS.some(d => d.id === t) && t !== 'summary');
  return known.concat(extra);
}

function noteRequest(url) {
  try {
    const u = new URL(String(url), location.href);
    if (!/\/transactions\/?$/.test(u.pathname)) return;
    const t = u.searchParams.get('transactionType');
    if (!t || !/^[A-Za-z]+$/.test(t) || t === 'summary') return;
    if (S.seen[t]) return;
    S.seen[t] = { tpl: u.origin + u.pathname.replace(/\/users\/\d+\//, '/users/{uid}/'), at: Date.now() };
    if (S.sh) S.sh.set('seen', S.seen);
    tickUi(true);
  } catch (e) {}
}

function installHook() {
  if (window.__rt2Hook) return;
  window.__rt2Hook = true;
  const f = window.fetch;
  window.fetch = function (input) { noteRequest(typeof input === 'string' ? input : input && input.url); return f.apply(this, arguments); };
  const o = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, url) { noteRequest(url); return o.apply(this, arguments); };
}

function offsetFactory(c1, c2, step) {
  const dec = c => { try { const o = JSON.parse(atob(String(c))); return o && typeof o.key === 'number' ? o : null; } catch (e) { return null; } };
  const enc = o => { try { return btoa(JSON.stringify(o)); } catch (e) { return null; } };
  const a = dec(c1), b = dec(c2);
  if (!a || !b || a.key !== step || b.key !== step * 2) return null;
  if (enc(a) !== String(c1) || enc(b) !== String(c2)) return null;
  const tpl = Object.assign({}, a);
  return { at: n => enc(Object.assign({}, tpl, { key: step * n })) };
}

async function scanType(type, mode) {
  const sc = S.scan;
  const A = cur();
  const def = typeDef(type);
  const m = A.meta[type] || (A.meta[type] = {});
  const update = mode === 'auto' && m.complete;
  let cursor = null;
  if (mode === 'auto' && !m.complete && m.cursor) cursor = m.cursor;
  if (!update) m.complete = false;
  let floor = Infinity;
  if (update) for (const r of A.tx) if (r.ty === type && r.pend) floor = Math.min(floor, r.t);
  const seen = new Set();
  const scanSeen = new Set();
  if (!update) m.dupes = 0;
  const st = { pages: 0, rows: 0, added: 0 };
  const history = [];
  let turbo = null;
  sc.type = def.label;

  const fetchPage = async cur_ => {
    const seenDef = S.seen[type];
    const u = new URL(seenDef && seenDef.tpl ? seenDef.tpl.replace('{uid}', S.uid) : `https://economy.roblox.com/v2/users/${S.uid}/transactions`);
    u.searchParams.set('transactionType', type);
    u.searchParams.set('limit', '100');
    if (cur_) u.searchParams.set('cursor', cur_);
    return apiGet(u.toString(), true);
  };

  const ingest = async (data) => {
    const list = Array.isArray(data.data) ? data.data : [];
    const recs = list.map(x => normalize(x, type));
    const dirty = [];
    const res = upsert(recs, dirty, A);
    if (dirty.length) { await A.h.putMany(dirty); rebuildSoon(); }
    st.pages++; sc.pages++;
    st.rows += list.length; st.added += res.added; sc.found += res.added;
    for (const r of recs) { if (scanSeen.has(r.k)) m.dupes = (m.dupes || 0) + 1; else scanSeen.add(r.k); }
    const next = data.nextPageCursor || null;
    m.cursor = next;
    sc.label = `${an(S.uid)} · reading ${def.label.toLowerCase()} · ${fmt(st.added)} new so far`;
    tickUi(true);
    return { list, recs, res, next };
  };

  let first = true;
  for (;;) {
    let data;
    try { data = await fetchPage(cursor); }
    catch (e) {
      if (first && e instanceof UnsupportedSignal) { m.unsupported = true; m.complete = true; m.cursor = null; m.last = Date.now(); return; }
      throw e;
    }
    first = false;
    m.unsupported = false;
    const { list, recs, res, next } = await ingest(data);
    history.push(next);
    if (!next) { m.complete = true; m.cursor = null; break; }
    if (seen.has(next)) { sc.warn.push(`${def.label}: Roblox repeated a page cursor, so the scan of this type was cut short.`); break; }
    seen.add(next);
    cursor = next;
    if (st.pages > 20000) { sc.warn.push(`${def.label}: stopped after 20,000 pages.`); break; }
    const oldest = recs.length ? Math.min(...recs.map(r => r.t)) : 0;
    if (update && res.added === 0 && res.changed === 0 && oldest <= floor) break;
    if (!list.length) { m.complete = true; m.cursor = null; break; }
    if (!turbo && S.settings.fast && !update && st.pages === 2 && list.length === 100 && sc.lanes > 1) turbo = offsetFactory(history[0], history[1], 100);
    await saveMeta(A);
    await ctl.wait(sc.delay, 'Pacing requests');
    if (turbo && sc.lanes > 1) {
      if (turbo.at(st.pages) !== cursor) { turbo = null; continue; }
      const base = st.pages;
      const lanes = sc.lanes;
      const results = await Promise.all(Array.from({ length: lanes }, (_, i) => fetchPage(turbo.at(base + i))));
      let done = false;
      for (let i = 0; i < results.length; i++) {
        const r = await ingest(results[i]);
        history.push(r.next);
        if (!r.next) { m.complete = true; m.cursor = null; done = true; break; }
        if (r.next !== turbo.at(base + i + 1)) { turbo = null; cursor = r.next; break; }
        cursor = r.next;
        seen.add(r.next);
      }
      if (done) break;
      await saveMeta(A);
      await ctl.wait(sc.delay, 'Pacing requests');
    }
  }
  m.last = Date.now();
  m.rows = (m.rows || 0) + st.rows;
}

async function fetchTotals() {
  const A = cur();
  if (!A || !S.user) return;
  const frames = {};
  for (const f of ['Day', 'Week', 'Month', 'Year']) {
    try { frames[f] = await apiGet(`https://economy.roblox.com/v2/users/${S.uid}/transaction-totals?timeFrame=${f}&transactionType=summary`, true); }
    catch (e) { if (e instanceof StopSignal) throw e; }
    await ctl.wait(Math.min(S.scan.delay, 500));
  }
  A.meta._totals = { at: Date.now(), frames };
  await saveMeta(A);
}

async function runSync(mode) {
  const sc = S.scan;
  if (sc.running || S.demo) return;
  Object.assign(sc, { running: true, paused: false, stop: false, label: 'Checking who is signed in', pages: 0, reqs: 0, found: 0, started: Date.now(), delay: S.settings.delay, lanes: S.settings.fast ? 2 : 1, warn: [], error: null, done: false, okStreak: 0, type: '' });
  tickUi(true);
  const order = scanList();
  try {
    await adoptUser(await authedUser());
    if (S.view !== 'all' && S.view !== S.uid && !S.accounts[S.view]) S.view = S.uid;
    rebuildView();
    const A = cur();
    if (mode === 'rebuild') {
      await A.h.clearTx();
      A.tx.length = 0;
      A.keys.clear();
      A.meta = {};
      await saveMeta(A);
      rebuildView();
      mode = 'full';
    }
    for (const ty of order) { await scanType(ty, mode); await saveMeta(A); }
    sc.done = true;
    sc.label = 'Up to date';
    S.accounts[S.uid].last = Date.now();
    await saveRegistry();
    await fetchBalance();
    sc.label = 'Checking against Roblox totals';
    tickUi();
    await fetchTotals();
    sc.label = 'Up to date';
  } catch (e) {
    if (e instanceof StopSignal) { sc.label = 'Stopped. Progress saved; sync again to continue.'; }
    else { sc.error = e.message; sc.label = e.message; }
    if (cur()) await saveMeta(cur());
  } finally {
    sc.running = false; sc.paused = false;
    rebuildView();
    tickUi(true);
  }
}

async function setView(v) {
  S.view = String(v);
  rebuildView();
  await saveView();
}

async function removeAccount(id) {
  id = String(id);
  const A = acct(id);
  if (A && A.h && !S.demo) await A.h.drop();
  S.data.delete(id);
  delete S.accounts[id];
  if (S.view === id) S.view = 'all';
  await saveRegistry();
  await saveView();
  rebuildView();
}

function exportJson(ids) {
  const list = (ids || Object.keys(S.accounts)).filter(id => acct(id));
  return JSON.stringify({
    app: 'robux-tracker', version: VERSION, exported: new Date().toISOString(),
    accounts: list.map(id => ({ id, name: S.accounts[id].name, display: S.accounts[id].display, meta: acct(id).meta, tx: acct(id).tx.map(r => { const c = Object.assign({}, r); delete c.a; return c; }) }))
  });
}

async function importJson(text) {
  const o = JSON.parse(text);
  if (!o || o.app !== 'robux-tracker') throw new Error('That file is not a Robux Tracker backup.');
  const accs = Array.isArray(o.accounts) ? o.accounts : (Array.isArray(o.tx) ? [{ id: o.uid, name: o.name, display: o.name, tx: o.tx, meta: o.meta }] : null);
  if (!accs) throw new Error('That backup has no transactions in it.');
  let added = 0, n = 0;
  const names = [];
  for (const a of accs) {
    if (a.id == null) continue;
    const id = String(a.id);
    if (!S.accounts[id]) S.accounts[id] = { id, color: AC_COLORS[Object.keys(S.accounts).length % AC_COLORS.length], inc: true, added: Date.now(), label: '', name: a.name || 'User ' + id, display: a.display || a.name || 'User ' + id };
    const A = await loadAccount(id);
    const had = A.tx.length;
    const dirty = [];
    const res = upsert((a.tx || []).filter(r => r && r.k).map(r => Object.assign({}, r)), dirty, A);
    if (dirty.length) await A.h.putMany(dirty);
    if (!had && a.meta) { A.meta = a.meta; await A.h.set('meta', A.meta); }
    added += res.added; n++; names.push(an(id));
  }
  await saveRegistry();
  rebuildView();
  return { added, accounts: n, names };
}

const csvCell = v => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
function toCsv(list) {
  const head = ['date', 'account', 'type', 'category', 'item', 'itemId', 'robux_signed', 'game', 'universeId', 'placeId', 'creator', 'creatorId', 'pending', 'id'];
  const rows = list.slice().sort((a, b) => b.t - a.t).map(r => [new Date(r.t).toISOString(), an(r.a), r.ty, r.c, r.in, r.iid, delta(r), r.pn, r.uni, r.pid, r.sn, r.sid, r.pend ? 'yes' : '', r.k].map(csvCell).join(','));
  return [head.join(','), ...rows].join('\r\n');
}
