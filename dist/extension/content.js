(function () {
'use strict';
if (window.__rt2Loaded) return;
window.__rt2Loaded = true;
const CSS = ":host{all:initial}\n*{box-sizing:border-box}\n.root{--bg:#232527;--card:#2b2d31;--card2:#35383d;--line:#3d4046;--tx:#f2f4f5;--mut:#bdbebe;--dim:#8c8f95;--good:#3fc78b;--bad:#f26b6b;--warn:#f2b441;--ink:#232527;font:14px/1.45 \"Builder Sans\",\"Gotham SSm\",\"Segoe UI\",system-ui,sans-serif;color:var(--tx)}\n.root.light{--bg:#ffffff;--card:#f2f4f5;--card2:#e3e5e8;--line:#dfe1e5;--tx:#232527;--mut:#4b4f56;--dim:#7c8089;--ink:#ffffff}\n.fab{position:fixed;left:14px;bottom:14px;z-index:2147483000;display:none;width:38px;height:38px;border-radius:10px;background:var(--card);color:var(--tx);border:1px solid var(--line);cursor:pointer;align-items:center;justify-content:center;opacity:.75}\n.fab.show{display:flex}\n.fab:hover{opacity:1}\n.fab svg{width:20px;height:20px}\n.scrim{position:fixed;inset:0;z-index:2147483001;display:none;background:rgba(0,0,0,.6);align-items:center;justify-content:center;padding:18px}\n.scrim.on{display:flex}\n.app{position:relative;width:min(1040px,100%);height:min(780px,100%);display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.5)}\n.top{display:flex;align-items:center;gap:6px;padding:0 18px;border-bottom:1px solid var(--line);flex-wrap:wrap}\n.ttl{font-weight:700;font-size:16px;margin-right:18px;padding:14px 0;display:flex;align-items:center;gap:8px}\n.ttl svg{width:20px;height:20px}\n.tb{border:0;background:none;color:var(--mut);font:inherit;font-weight:600;padding:15px 12px;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}\n.tb:hover{color:var(--tx)}\n.tb.on{color:var(--tx);border-bottom-color:var(--tx)}\n.grow{flex:1;min-width:6px}\n.sync{color:var(--dim);font-size:12px;margin-right:6px}\n.bar2{display:flex;align-items:center;gap:10px;padding:10px 18px;flex-wrap:wrap;border-bottom:1px solid var(--line)}\n.search input{width:260px;padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--tx);font:inherit;outline:0}\n.search input:focus{border-color:var(--dim)}\n.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;border:0;background:var(--card2);color:var(--tx);font:inherit;font-weight:600;font-size:13px;cursor:pointer}\n.btn:hover{filter:brightness(1.15)}\n.btn.pri{background:var(--tx);color:var(--ink)}\n.btn.dng{color:var(--bad)}\n.btn.sm{padding:5px 10px;font-size:12px}\n.btn[disabled]{opacity:.45;pointer-events:none}\n.x{width:34px;height:34px;padding:0;justify-content:center}\n.prog{padding:8px 18px;border-bottom:1px solid var(--line);background:var(--card);display:none;align-items:center;gap:12px}\n.prog.on{display:flex}\n.prog .t{flex:1;min-width:0;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.prog .tm{color:var(--dim);font-variant-numeric:tabular-nums;font-size:12px}\n.spin{width:14px;height:14px;border-radius:50%;border:2px solid var(--line);border-top-color:var(--tx);animation:sp .8s linear infinite;flex:none}\n@keyframes sp{to{transform:rotate(360deg)}}\n.content{flex:1;overflow:auto;padding:18px;scrollbar-width:thin;scrollbar-color:var(--line) transparent}\n.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}\n.stat{background:var(--card);border-radius:12px;padding:16px 18px}\n.stat .l{font-size:12px;color:var(--dim);margin-bottom:4px}\n.stat .v{font-size:28px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.15}\n.stat .s{font-size:12px;color:var(--dim);margin-top:4px}\n.line{color:var(--mut);margin:-4px 0 18px;font-size:13px}\n.cols{display:grid;grid-template-columns:1fr 1fr;gap:22px}\n.sec h3{margin:0 0 6px;font-size:15px;font-weight:700;display:flex;align-items:center}\n.sec h3 .r{margin-left:auto;font-weight:400;font-size:12px;color:var(--dim)}\n.sec h3 a{color:var(--mut);cursor:pointer;font-weight:400;font-size:12px;margin-left:auto}\n.sec{margin-bottom:22px}\n.rs{display:inline-block;width:.8em;height:.8em;vertical-align:-.08em;margin-right:.25em;opacity:.9}\n.mut{color:var(--mut)}.dim{color:var(--dim)}.good{color:var(--good)}.bad{color:var(--bad)}.warn{color:var(--warn)}\n.row{display:flex;align-items:center;gap:12px;padding:9px 8px;border-bottom:1px solid var(--line);border-radius:8px}\n.row:last-child{border-bottom:0}\n.row.lnk{cursor:pointer}\n.row.lnk:hover{background:var(--card)}\n.ico{width:40px;height:40px;border-radius:8px;background:var(--card2);display:grid;place-items:center;font-weight:700;color:var(--mut);flex:none;overflow:hidden;font-size:15px}\n.ico img{width:100%;height:100%;object-fit:cover;display:block}\n.ico.sm{width:32px;height:32px;font-size:12px}\n.ico.lg{width:64px;height:64px;border-radius:12px;font-size:24px}\n.ico.round{border-radius:50%}\n.ico.rbx svg{width:55%;height:55%}\n.ico.good{color:var(--good)}\n.ico.bad{color:var(--bad)}\n.rb{flex:1;min-width:0}\n.rt{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.rm{color:var(--dim);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.rv{text-align:right;flex:none}\n.rv b{display:block;font-size:15px;font-variant-numeric:tabular-nums}\n.rv span{font-size:12px;color:var(--dim)}\n.rv b span{font-size:inherit;color:inherit}\n.tag{display:inline-flex;align-items:center;padding:0 7px;border-radius:99px;font-size:11px;background:var(--card2);color:var(--mut);margin-left:6px;white-space:nowrap;font-weight:500}\n.tag.w{color:var(--warn)}\n.pill{display:inline-block;padding:2px 9px;border-radius:99px;font-size:12px;font-weight:600;background:var(--card2);color:var(--mut)}\n.pill.good{background:rgba(63,199,139,.16);color:var(--good)}\n.pill.bad{background:rgba(242,107,107,.16);color:var(--bad)}\n.pill.warn{background:rgba(242,180,65,.16);color:var(--warn)}\n.tabs{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;align-items:center}\nselect,input[type=number],input[type=date],input[type=text]{background:var(--card);border:1px solid var(--line);color:var(--tx);border-radius:8px;padding:7px 10px;font:inherit;outline:0}\nselect option{background:var(--bg);color:var(--tx)}\ninput:focus,select:focus{border-color:var(--dim)}\ntable{width:100%;border-collapse:collapse}\nth{font-size:12px;color:var(--dim);text-align:left;padding:8px 8px;font-weight:600;border-bottom:1px solid var(--line);white-space:nowrap}\ntd{padding:9px 8px;border-bottom:1px solid var(--line);font-variant-numeric:tabular-nums;vertical-align:middle}\ntr:last-child td{border-bottom:0}\ntr.h:hover td{background:var(--card)}\ntd .cell{display:flex;align-items:center;gap:10px;min-width:0}\n.r{text-align:right}\n.empty{text-align:center;padding:70px 20px;color:var(--mut)}\n.empty h2{color:var(--tx);margin:0 0 8px;font-size:22px}\n.empty .btn{margin:6px}\n.ck{display:flex;gap:9px;align-items:flex-start;padding:6px 0;color:var(--mut);font-size:13px}\n.ck b{flex:none;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font-size:11px;color:#fff;margin-top:1px}\n.ck b.ok{background:var(--good)}.ck b.no{background:var(--warn)}\n.fld{display:flex;align-items:center;gap:10px;margin:8px 0;flex-wrap:wrap}\n.fld label{color:var(--mut)}\n.exp{background:var(--card);border-radius:10px;margin:2px 0 8px;padding:4px 10px}\n.back{margin-bottom:12px}\ndetails{margin-bottom:14px}\ndetails>summary{cursor:pointer;color:var(--mut);font-weight:600;padding:8px 0;list-style:none}\ndetails>summary::before{content:\"▸ \";color:var(--dim)}\ndetails[open]>summary::before{content:\"▾ \"}\n.toast{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);background:var(--card2);padding:10px 16px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.4);z-index:5;max-width:80%}\n.banner{background:rgba(242,180,65,.12);color:var(--warn);padding:9px 14px;border-radius:10px;margin-bottom:14px;display:flex;align-items:center;gap:10px}\n.banner .btn{margin-left:auto}\n.pg{display:flex;gap:10px;align-items:center;justify-content:center;margin-top:12px;color:var(--mut)}\n.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;vertical-align:1px}\n.dot.big{width:14px;height:14px;margin:0;flex:none}\n.acc{background:var(--card);border-radius:12px;padding:14px 16px;margin-bottom:10px}\n.chiprow{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}\n@media(max-width:820px){.stats{grid-template-columns:1fr}.cols{grid-template-columns:1fr}.search input{width:180px}.ttl{display:none}}\n@media(max-width:600px){.scrim{padding:0}.app{border-radius:0}}\n.root{--ac:#8b5cf6;--ac2:#6366f1;--glow:rgba(139,92,246,.20);--glow2:rgba(99,102,241,.13)}\n.app{background:radial-gradient(760px 380px at 0% -12%,var(--glow),transparent 62%),radial-gradient(640px 340px at 100% 112%,var(--glow2),transparent 62%),var(--bg);border-color:color-mix(in srgb,var(--ac) 28%,var(--line));box-shadow:0 28px 80px rgba(0,0,0,.55),0 0 0 1px color-mix(in srgb,var(--ac) 10%,transparent)}\n.scrim{backdrop-filter:blur(7px)}\n.top{background:linear-gradient(180deg,color-mix(in srgb,var(--ac) 7%,transparent),transparent)}\n.ttl svg{color:var(--ac);filter:drop-shadow(0 0 6px var(--ac))}\n.tb{transition:color .15s,box-shadow .2s}\n.tb.on{border-bottom-color:var(--ac);box-shadow:0 10px 14px -12px var(--ac)}\n.btn{transition:filter .15s,transform .1s,box-shadow .2s}\n.btn:active{transform:scale(.97)}\n.btn.pri{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;box-shadow:0 6px 16px -8px var(--ac)}\n.btn.pri:hover{box-shadow:0 8px 20px -6px var(--ac)}\n.stats .stat:nth-child(1){--c:var(--ac)}\n.stats .stat:nth-child(2){--c:var(--good)}\n.stats .stat:nth-child(3){--c:var(--warn)}\n.stat{--c:var(--ac);position:relative;overflow:hidden;border:1px solid color-mix(in srgb,var(--c) 22%,var(--line));background:linear-gradient(155deg,color-mix(in srgb,var(--c) 15%,var(--card)),var(--card) 68%);transition:transform .18s,box-shadow .2s,border-color .2s}\n.stat::after{content:\"\";position:absolute;right:-30px;top:-30px;width:90px;height:90px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--c) 30%,transparent),transparent 70%);pointer-events:none}\n.stat:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--c) 50%,var(--line));box-shadow:0 12px 26px -16px var(--c)}\n.stat .v{background:linear-gradient(90deg,var(--tx) 25%,color-mix(in srgb,var(--c) 75%,var(--tx)));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}\n.stat .v .rs{color:var(--c)}\n.stat .v.good,.stat .v.bad{-webkit-text-fill-color:currentColor;background:none}\n.sec h3::before{content:\"\";width:3px;height:14px;border-radius:2px;background:var(--ac);margin-right:8px;box-shadow:0 0 8px var(--ac)}\n.row{transition:background .15s,box-shadow .15s}\n.row.lnk:hover{background:linear-gradient(90deg,color-mix(in srgb,var(--ac) 14%,transparent),transparent 80%);box-shadow:inset 3px 0 0 var(--ac)}\n.ico{box-shadow:0 0 0 1px var(--line)}\n.ico.rbx{background:linear-gradient(135deg,color-mix(in srgb,var(--ac) 28%,var(--card2)),var(--card2));color:var(--ac)}\n.ico.rbx.good{background:linear-gradient(135deg,rgba(63,199,139,.30),var(--card2));color:var(--good)}\n.ico.rbx.bad{background:linear-gradient(135deg,rgba(242,107,107,.30),var(--card2));color:var(--bad)}\n.ico.lg{box-shadow:0 8px 22px -10px var(--ac),0 0 0 1px var(--line)}\n.pill{transition:background .15s}\n.line{padding:8px 12px;border-radius:10px;background:linear-gradient(90deg,color-mix(in srgb,var(--ac) 10%,transparent),transparent);margin:-6px 0 18px}\n.prog{position:relative;overflow:hidden}\n.prog.on::after{content:\"\";position:absolute;left:0;bottom:0;height:2px;width:35%;background:linear-gradient(90deg,transparent,var(--ac),var(--ac2),transparent);animation:slide 1.3s linear infinite}\n@keyframes slide{from{transform:translateX(-100%)}to{transform:translateX(300%)}}\n.spin{border-top-color:var(--ac)}\n.content.fresh>*{animation:rise .26s ease both}\n.content.fresh>*:nth-child(2){animation-delay:.04s}\n.content.fresh>*:nth-child(3){animation-delay:.08s}\n.content.fresh>*:nth-child(4){animation-delay:.12s}\n.content.fresh>*:nth-child(5){animation-delay:.16s}\n@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}\n.root.nofx *,.root.nofx *::after{animation:none!important;transition:none!important}\n.sw{display:flex;gap:10px}\n.sw i{width:26px;height:26px;border-radius:50%;cursor:pointer;border:2px solid transparent;display:inline-block;transition:transform .15s}\n.sw i:hover{transform:scale(1.12)}\n.sw i.on{border-color:var(--tx);box-shadow:0 0 12px -2px currentColor}\n.back{transition:transform .15s}\n.back:hover{transform:translateX(-2px)}\n.acc{border:1px solid color-mix(in srgb,var(--ac) 14%,var(--line))}\n.fab{box-shadow:0 0 0 1px var(--line),0 6px 16px -8px var(--ac)}\n";
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

function makeDemo() {
  let seed = 7;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const games = [
    { uni: 9001, pid: 91, name: 'Dungeon Rush', sid: 501, sn: 'Rush Studio', w: 10, items: [['DeveloperProduct', 'Gem Pack', 100, 40], ['DeveloperProduct', 'Mega Gems', 1000, 12], ['DeveloperProduct', 'Revive', 49, 30], ['GamePass', 'VIP', 799, 1], ['GamePass', '2x Luck', 399, 1]] },
    { uni: 9002, pid: 92, name: 'Sword Duel', sid: 502, sn: 'Duel Studio', w: 4, items: [['DeveloperProduct', 'Skip Round', 75, 25], ['GamePass', 'Golden Blade', 1200, 1], ['DeveloperProduct', 'Coin Bundle', 250, 10]] },
    { uni: 9003, pid: 93, name: 'Backlot Explorer', sid: 503, sn: 'Backlot Co', w: 2, items: [['GamePass', 'Flashlight', 149, 1], ['GamePass', 'Radio', 99, 1], ['DeveloperProduct', 'Almond Water', 25, 20]] },
    { uni: 9004, pid: 94, name: 'Idle Tycoon', sid: 504, sn: 'Idle Games', w: 5, items: [['DeveloperProduct', 'Cash Boost', 199, 18], ['GamePass', 'Auto Collect', 599, 1], ['DeveloperProduct', 'Lucky Spin', 49, 40]] },
    { uni: 9005, pid: 95, name: 'Gift Simulator', sid: 505, sn: 'Gift Group', sk: 'Group', w: 3, items: [['GamePass', 'Gifting VIP', 800, 1], ['DeveloperProduct', 'Gift Box', 80, 30]] },
    { uni: 9006, pid: 96, name: 'Tower Guard', sid: 506, sn: 'Guard Team', w: 3, items: [['DeveloperProduct', 'Starter Pack', 299, 5], ['GamePass', 'Double Speed', 450, 1]] }
  ];
  const catalog = [['Asset', 'Cool Shades', 75, 'UGC Maker'], ['Asset', 'Void Wings', 300, 'WingCo'], ['Bundle', 'Dragon Bundle', 1200, 'Avatar Guild'], ['Asset', 'Neon Sneakers', 150, 'UGC Maker']];
  const out = [];
  const now = Date.now();
  const start = now - 520 * 864e5;
  let n = 0;
  const push = (r) => { r.k = r.ty + ':demo' + (n++); out.push(r); };
  const own = {};
  const wsum = games.reduce((a, g) => a + g.w, 0);
  for (let i = 0; i < 1900; i++) {
    const age = Math.pow(rnd(), 0.8);
    const t = start + age * (now - start) - rnd() * 864e5 * 0.5 + (rnd() < 0.3 ? 0 : 0);
    let hour = Math.floor(14 + rnd() * 10) % 24;
    const dt = new Date(t); dt.setHours(hour, Math.floor(rnd() * 60), Math.floor(rnd() * 60));
    const tt = Math.min(now - 1000, dt.getTime());
    if (rnd() < 0.08) {
      const c = pick(catalog);
      push({ ty: 'Purchase', t: tt, amt: c[2], cur: 'Robux', it: c[0], c: c[0] === 'Bundle' ? 'Bundles' : 'Catalog', iid: 7000 + c[1].length, in: c[1], sid: 700 + c[3].length, sn: c[3], sk: 'User', pid: null, uni: null, pn: '', pend: false });
      continue;
    }
    let r = rnd() * wsum, g = games[0];
    for (const x of games) { r -= x.w; if (r <= 0) { g = x; break; } }
    const it = pick(g.items);
    const isPass = it[0] === 'GamePass';
    const ok = g.uni + it[1];
    if (isPass && own[ok]) continue;
    if (isPass) own[ok] = true;
    push({ ty: 'Purchase', t: tt, amt: it[2], cur: 'Robux', it: it[0], c: isPass ? 'Game Passes' : 'Dev Products', iid: g.uni * 10 + it[1].length, in: it[1], sid: g.sid, sn: g.sn, sk: g.sk || 'User', pid: g.pid, uni: g.uni, pn: g.name, pend: false });
  }
  const packs = [[800, 1], [800, 1], [1700, 2], [4500, 1], [10000, 1], [400, 1]];
  for (let i = 0; i < 38; i++) {
    const p = pick(packs);
    push({ ty: 'CurrencyPurchase', t: start + rnd() * (now - start), amt: p[0], cur: 'Robux', it: '', c: 'Other', iid: null, in: '', sid: 1, sn: 'Roblox', sk: 'User', pid: null, uni: null, pn: '', pend: false });
  }
  for (let m = 0; m < 17; m++) {
    const d = new Date(now - m * 30.4 * 864e5);
    push({ ty: 'PremiumStipend', t: d.getTime(), amt: 450, cur: 'Robux', it: '', c: 'Other', iid: null, in: 'Premium', sid: 1, sn: 'Roblox', sk: 'User', pid: null, uni: null, pn: '', pend: false });
  }
  const sells = [['Neon Cape', 9101, 'Asset', 180], ['Dragon Hat', 9102, 'Asset', 320], ['Speed Boost', 9103, 'GamePass', 95]];
  for (let i = 0; i < 46; i++) {
    const sl = pick(sells);
    push({ ty: 'Sale', t: start + rnd() * (now - start), amt: Math.round(sl[3] * 0.7), cur: 'Robux', it: sl[2], c: sl[2] === 'GamePass' ? 'Game Passes' : 'Catalog', iid: sl[1], in: sl[0], sid: 8000 + i % 9, sn: 'Buyer' + (i % 9), sk: 'User', pid: null, uni: null, pn: sl[2] === 'GamePass' ? 'Dungeon Rush' : '', pend: false });
  }
  for (let i = 0; i < 7; i++) {
    push({ ty: 'GroupPayout', t: start + rnd() * (now - start), amt: 500 + Math.floor(rnd() * 8) * 250, cur: 'Robux', it: '', c: 'Other', iid: null, in: 'Group payout', sid: 4242, sn: 'Rush Studio', sk: 'Group', pid: null, uni: null, pn: '', pend: false });
  }
  return out.sort((a, b) => b.t - a.t);
}

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

mount();
if (window.__RT2_TEST) window.__RT2 = { S, V, ACT, runSync, build, view, openPanel, boot, realMoney, packPrice, cash, scanList, diagnostics, integrity, normalize, renderAll, startDemo, toCsv, makeDemo, stats, income, monthProgress, filterLedger, PACK_MAP, ensureBoot, exportJson, importJson, removeAccount, setView, acct, cur, viewAccounts, rebuildView, tAccounts, TABS, balanceOf, ledgerOf, monthEndBalances, earningsOf, boughtOf, sourcesOf, flowByMonth, fetchThumbs, ensureNavItem, installBridge, compareTotals, transfersOf, rebuildView, delta, typeDef, TYPE_DEFS };
})();
