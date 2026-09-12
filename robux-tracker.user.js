// ==UserScript==
// @name         Robux Tracker — see where your Robux went
// @namespace    robuxtracker.app
// @version      6.0.1
// @description  See where your Robux actually went. Reads your own purchase history and breaks it down per game, per category and per item ("Gifting VIP x44"), with real local pricing, a spending timeline and CSV/JSON export. Unofficial; not affiliated with Roblox Corporation.
// @author       Gavin
// @match        https://www.roblox.com/*
// @match        https://web.roblox.com/*
// @icon         https://www.roblox.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @connect      economy.roblox.com
// @connect      users.roblox.com
// @connect      apis.roblox.com
// @connect      thumbnails.roblox.com
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // Every version has used this same guard, so an older copy still enabled in
  // Tampermonkey wins the race and the newer one silently does nothing. Say so
  // out loud instead of looking like the update didn't apply.
  const VERSION = '6.0.1';
  if (window.__rstProLoaded) {
    try {
      console.warn(`[Robux Tracker] v${VERSION} did not start — v${window.__rstProLoaded} ` +
        `is already running on this page. Disable or delete the older script in your userscript ` +
        `manager (look for "Roblox Spend Tracker" or "Coinsight"), then reload.`);
    } catch (e) {}
    return;
  }
  window.__rstProLoaded = VERSION;

  /* ================================================================== *
   * Storage
   * ================================================================== */
  const hasGM = typeof GM_setValue === 'function';
  const store = {
    get(k, d) {
      try {
        if (hasGM) { const v = GM_getValue(k); return v === undefined ? d : v; }
        const v = localStorage.getItem('rst_' + k);
        return v === null ? d : JSON.parse(v);
      } catch (e) { return d; }
    },
    set(k, v) {
      try {
        if (hasGM) { GM_setValue(k, v); return true; }
        localStorage.setItem('rst_' + k, JSON.stringify(v));
        return true;
      } catch (e) { return false; }
    },
    del(k) {
      try {
        if (hasGM) { GM_deleteValue(k); return; }
        localStorage.removeItem('rst_' + k);
      } catch (e) {}
    }
  };

  /* ================================================================== *
   * Config
   * ================================================================== */
  /* ------------------------------------------------------------------ *
   * Robux → USD
   *
   * There is no single exchange rate: the big packages give far more per
   * dollar than the small ones (90 R$/$ at $2.99 vs 120 R$/$ at $199.99),
   * and Premium bumps every tier. So we price an amount the way you would
   * actually buy it — biggest-value packs first, then the smallest pack
   * that covers what's left.
   * ------------------------------------------------------------------ */
  const PRICE_TIERS = {
    // [robux, usd] — Premium members (the boosted amounts)
    premium: [[270, 2.99], [500, 4.99], [1000, 9.99], [1500, 14.99], [2000, 19.99],
              [3625, 34.99], [5250, 49.99], [11000, 99.99], [24000, 199.99]],
    // standard, no Premium
    base: [[240, 2.99], [400, 4.99], [800, 9.99], [1200, 14.99], [1700, 19.99],
           [3150, 34.99], [4500, 49.99], [10000, 99.99], [22500, 199.99]]
  };

  // Prices scraped from the user's own Buy Robux page beat any table we ship:
  // they carry the right currency, the right region, and their Premium bonus.
  function tiers() {
    const d = store.get('priceTiers', null);
    if (d && d.tiers && d.tiers.length >= 3) return d.tiers.slice().sort((a, b) => a[0] - b[0]);
    return (cfg.premium ? PRICE_TIERS.premium : PRICE_TIERS.base).slice().sort((a, b) => a[0] - b[0]);
  }
  function currencySymbol() {
    if (cfg.priceMode === 'custom') return cfg.curSymbol || '$';
    if (cfg.priceMode === 'usd') return '$';
    const d = store.get('priceTiers', null);
    return (d && d.symbol) || '$';
  }
  function priceSource() { return store.get('priceTiers', null); }

  // "$1,234.56" in whatever symbol the user's store actually quotes.
  function moneyStr(v) {
    const s = currencySymbol();
    const n = v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return /^[A-Za-z]/.test(s) ? `${s} ${n}` : `${s}${n}`;
  }

  /* ------------------------------------------------------------------ *
   * Buy-Robux page scraper
   *
   * The package list is rendered client-side, so we can only read it while
   * the user is actually on that page. Whatever we find is validated (3+
   * rising tiers) before it replaces the built-in table.
   * ------------------------------------------------------------------ */
  function parseMoney(txt) {
    const m = String(txt).match(/([^\d\s]{1,3})\s*([\d][\d.,\s]*)/);
    if (!m) return null;
    const symbol = m[1].trim();
    let raw = m[2].replace(/\s/g, '');
    const lastDot = raw.lastIndexOf('.'), lastComma = raw.lastIndexOf(',');
    const dec = Math.max(lastDot, lastComma);
    let value;
    if (dec > -1 && raw.length - dec - 1 === 2) {
      value = parseFloat(raw.slice(0, dec).replace(/[.,]/g, '') + '.' + raw.slice(dec + 1));
    } else {
      value = parseFloat(raw.replace(/[.,]/g, ''));
    }
    return isFinite(value) && value > 0 ? { symbol, value } : null;
  }

  function scrapeRobuxPrices() {
    const rows = new Map();
    document.querySelectorAll('button, a').forEach(btn => {
      const price = parseMoney(btn.textContent || '');
      if (!price || price.value > 100000) return;
      // walk up until we find a container that also carries a Robux amount
      let node = btn, hops = 0, amount = 0;
      while (node && hops++ < 5) {
        node = node.parentElement;
        if (!node) break;
        // no \s in the class: "270 240" (boosted + struck-through) must stay two
        // numbers, not merge into 270240
        const nums = (node.textContent || '').replace(btn.textContent || '', '')
          .match(/\d[\d,.]*/g) || [];
        for (const raw of nums) {
          const n = parseInt(raw.replace(/[^\d]/g, ''), 10);
          if (n >= 100 && n <= 2000000) amount = Math.max(amount, n); // boosted beats struck-through
        }
        if (amount) break;
      }
      if (amount) rows.set(amount, price);
    });

    const tiers = [...rows.entries()].map(([amt, p]) => [amt, p.value]).sort((a, b) => a[0] - b[0]);
    if (tiers.length < 3) return null;
    for (let i = 1; i < tiers.length; i++) if (tiers[i][1] <= tiers[i - 1][1]) return null; // price must rise with size
    const symbol = rows.values().next().value.symbol;
    return { tiers, symbol, detectedAt: Date.now(), from: location.pathname };
  }

  function watchForPrices() {
    if (!/\/upgrades\/robux|\/robux/i.test(location.pathname)) return;
    let tries = 0;
    const iv = setInterval(() => {
      const found = scrapeRobuxPrices();
      if (found) {
        clearInterval(iv);
        const prev = store.get('priceTiers', null);
        store.set('priceTiers', found);
        if (!prev || prev.tiers.length !== found.tiers.length || prev.symbol !== found.symbol) {
          logLine(`prices detected: ${found.tiers.length} packs in "${found.symbol}"`);
          if (ui.open) { toast(`Picked up your local Robux prices (${found.symbol}) — dollar figures now match your region.`, 'warn'); render(); }
        }
      }
      if (++tries > 30) clearInterval(iv);
    }, 1000);
  }

  /* ------------------------------------------------------------------ *
   * One flat rate, taken from a single reference pack (the $9.99 one by
   * default). Pricing off the biggest pack assumed you always buy $200 at
   * a time, which flattered every total; pricing off a mid pack is what
   * people actually pay.
   * ------------------------------------------------------------------ */
  function refPack() {
    const t = tiers();
    if (!t.length) return [1000, 9.99];
    return t.reduce((best, p) =>
      Math.abs(p[0] - cfg.refRobux) < Math.abs(best[0] - cfg.refRobux) ? p : best, t[0]);
  }

  // { symbol, perRobux } — whatever currency the numbers should be shown in.
  function unitPrice() {
    if (cfg.priceMode === 'custom') {
      const per = parseFloat(cfg.curPer1000);
      return { symbol: cfg.curSymbol || '$', perRobux: (isFinite(per) && per > 0 ? per : 9.99) / 1000, label: 'your custom rate' };
    }
    if (cfg.priceMode === 'usd') {
      const t = (cfg.premium ? PRICE_TIERS.premium : PRICE_TIERS.base);
      const p = t.reduce((b, x) => Math.abs(x[0] - cfg.refRobux) < Math.abs(b[0] - cfg.refRobux) ? x : b, t[0]);
      return { symbol: '$', perRobux: p[1] / p[0], label: `the ${fmt(p[0])} R$ pack ($${p[1]})` };
    }
    const p = refPack();
    return { symbol: currencySymbol(), perRobux: p[1] / p[0], label: `the ${fmt(p[0])} R$ pack (${moneyStr(p[1])})` };
  }

  function usdCost(robux) {
    if (!robux || robux <= 0) return 0;
    return robux * unitPrice().perRobux;
  }

  // Floor on request pacing. Reading your own history is fine; doing it fast
  // enough to look like a scraper is not. Nothing in the UI can go below this.
  const MIN_DELAY_MS = 400;
  const MAX_LANES = 3;

  const DEFAULTS = {
    turbo: false,
    lanes: 2,
    delayMs: 700,
    maxBackoffMs: 60000,
    maxRetries: 6,
    pageLimit: 100,
    smartMerge: true,
    showUsd: true,
    premium: true,
    priceMode: 'auto',   // auto = prices detected from your Buy Robux page
    refRobux: 1000,      // reference pack: the $9.99 tier
    curSymbol: '€',
    curPer1000: 9.99,
    theme: 'auto',
    types: ['Purchase', 'CurrencyPurchase'],
    fabPos: null
  };
  const cfg = Object.assign({}, DEFAULTS, store.get('cfg', {}));
  // A previous version persisted its rate-limit backoff into the base delay.
  // Anything absurd gets pulled back to a sane starting point.
  if (!(cfg.delayMs >= MIN_DELAY_MS && cfg.delayMs <= 3000)) cfg.delayMs = DEFAULTS.delayMs;
  cfg.lanes = Math.max(1, Math.min(MAX_LANES, cfg.lanes || 2));
  // v6 added real-money reconciliation, which needs the currency-purchase rows.
  // Existing installs opted into 'Purchase' only, so bring them along once.
  if (!store.get('v6types', false)) {
    if (!cfg.types.includes('CurrencyPurchase')) cfg.types.push('CurrencyPurchase');
    store.set('v6types', true); store.set('cfg', cfg);
  }
  const saveCfg = () => store.set('cfg', cfg);

  // transactionType values, paired with the label the Roblox site shows.
  const TYPE_CATALOG = [
    { id: 'Purchase', label: 'Purchases', kind: 'out', hint: 'Game passes, dev products, catalog items' },
    { id: 'CurrencyPurchase', label: 'Currency purchases', kind: 'in', hint: 'Robux you bought with real money' },
    { id: 'PremiumStipend', label: 'Robux stipends', kind: 'in', hint: 'Monthly Premium payout' },
    { id: 'Sale', label: 'Sales of goods', kind: 'in', hint: 'Robux others spent on your items' },
    { id: 'TradeRobux', label: 'Trade earnings', kind: 'in', hint: 'Robux from trades' },
    { id: 'GroupPayout', label: 'Community payouts', kind: 'in', hint: 'Group payouts you received' },
    { id: 'Commission', label: 'Commissions', kind: 'out', hint: 'Affiliate / commission entries' },
    { id: 'AdSpend', label: 'Sponsored ad spend', kind: 'out', hint: 'Robux spent on ads' }
  ];
  const typeInfo = id => TYPE_CATALOG.find(t => t.id === id) || { id, label: id, kind: 'out', hint: '' };

  /* ================================================================== *
   * State
   * ================================================================== */
  const state = {
    running: false, paused: false, stopped: false,
    mode: 'full',
    me: null,
    pages: 0, reqs: 0, startedAt: 0,
    curDelay: cfg.delayMs,
    okStreak: 0,
    records: store.get('records', []),
    lastScan: store.get('lastScan', null),
    ids: new Set(),
    lastError: null,
    lastSample: null,
    log: [],
    clock: null
  };
  // Older caches stored signed amounts; normalise so totals aren't negative.
  state.records.forEach(r => { r.amount = Math.abs(r.amount || 0); state.ids.add(recKey(r)); });

  function logLine(s) {
    state.log.push(`[${new Date().toLocaleTimeString()}] ${s}`);
    if (state.log.length > 400) state.log.shift();
    const el = document.getElementById('rst-log');
    if (el) { el.textContent = state.log.join('\n'); el.scrollTop = el.scrollHeight; }
  }

  const hms = ms => {
    const s = Math.floor(ms / 1000);
    return (s >= 3600 ? String(Math.floor(s / 3600)).padStart(2, '0') + ':' : '') +
      String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };

  const ui = {
    open: false, tab: 'games', gameKey: null, q: '', sort: 'total', range: 'all',
    year: null, cat: null,
    expanded: new Set(),
    iconCache: store.get('icons', {})
  };

  // economy/v2 returns id:0 on every row — idHash is the real unique key.
  // Falling back to `id` alone collapsed an entire history into one record.
  function recKey(r) {
    const uniq = r.idHash || (r.id ? String(r.id) : '') ||
      [r.created, r.itemId, r.amount, r.sellerId].join('|');
    return (r.txType || 'Purchase') + ':' + uniq;
  }
  function StopSignal() {}

  /* ================================================================== *
   * Utilities
   * ================================================================== */
  const fmt = n => Math.round(n || 0).toLocaleString('en-US');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const usd = robux => moneyStr(usdCost(robux));
  const escapeHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dstr = t => t ? new Date(t).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const dtstr = t => t ? new Date(t).toLocaleString() : '—';
  const num = v => (typeof v === 'number' && isFinite(v)) ? v : (parseFloat(v) || 0);

  function ago(t) {
    if (!t) return '';
    const s = (Date.now() - new Date(t).getTime()) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 86400 * 30) return Math.floor(s / 86400) + 'd ago';
    if (s < 86400 * 365) return Math.floor(s / (86400 * 30)) + 'mo ago';
    return Math.floor(s / (86400 * 365)) + 'y ago';
  }

  async function interruptibleSleep(ms, label) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (state.stopped) throw new StopSignal();
      while (state.paused && !state.stopped) { setStatus('Paused — hit Continue.'); await sleep(200); }
      if (state.stopped) throw new StopSignal();

      // Background tabs clamp timers to ~1s, so polling in 200ms slices would
      // stretch every wait 5x. When hidden, wait the whole span in one timer.
      if (document.hidden) { await sleep(Math.max(1, end - Date.now())); continue; }

      if (label) setStatus(`${label} (${Math.ceil((end - Date.now()) / 1000)}s)…`);
      await sleep(Math.min(200, Math.max(1, end - Date.now())));
    }
  }

  /* ================================================================== *
   * API layer
   * ================================================================== */
  async function getAuthedUser() {
    const r = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
    if (r.status === 401) throw new Error('You are not logged in. Log into roblox.com and try again.');
    if (!r.ok) throw new Error('Could not verify login (HTTP ' + r.status + ').');
    return r.json();
  }

  // ---------------------------------------------------------------------
  // This is the v1 script's fetcher, unchanged apart from `type` being a
  // parameter instead of the hardcoded 'Purchase'. Same URL, same plain GET,
  // same res.json(). Do not add headers here — they trigger a CORS preflight.
  // ---------------------------------------------------------------------
  async function fetchTransactionPage(userId, type, cursor) {
    const url = new URL(`https://economy.roblox.com/v2/users/${userId}/transactions`);
    url.searchParams.set('transactionType', type);
    url.searchParams.set('limit', String(cfg.pageLimit));
    if (cursor) url.searchParams.set('cursor', cursor);

    let attempt = 0;
    while (true) {
      if (state.stopped) throw new StopSignal();
      while (state.paused && !state.stopped) { setStatus('Paused…'); await sleep(200); }

      let res;
      try {
        state.reqs++;
        res = await fetch(url.toString(), { credentials: 'include' });
      } catch (e) {
        attempt++;
        if (attempt > cfg.maxRetries) throw new Error('Network error after retries: ' + e.message);
        await interruptibleSleep(Math.min(cfg.maxBackoffMs, 2000 * 2 ** (attempt - 1)), 'Network retry');
        continue;
      }

      if (res.status === 429) {
        const ra = parseInt(res.headers.get('retry-after') || '', 10);
        const wait = ra > 0 ? ra * 1000 : Math.min(cfg.maxBackoffMs, 5000 * 2 ** attempt);
        attempt++;
        state.okStreak = 0;
        // Backoff for this scan only — never written back to the saved delay.
        state.curDelay = Math.min(8000, Math.round(state.curDelay * 1.25));
        if (attempt > cfg.maxRetries) throw new Error('Rate limited too many times. Increase the delay and Resume.');
        await interruptibleSleep(wait, `Rate limited, waiting (now ${state.curDelay}ms/page)`);
        continue;
      }

      if (res.status === 401 || res.status === 403) {
        throw new Error('Auth error (HTTP ' + res.status + '). Make sure you are logged in on this tab.');
      }

      if (!res.ok) {
        attempt++;
        if (attempt > cfg.maxRetries) throw new Error('HTTP ' + res.status + ' after retries.');
        await interruptibleSleep(Math.min(cfg.maxBackoffMs, 2000 * 2 ** (attempt - 1)), 'Server error retry');
        continue;
      }

      state.okStreak++;
      if (state.okStreak >= 4 && state.curDelay > cfg.delayMs) {
        state.curDelay = Math.max(cfg.delayMs, Math.round(state.curDelay * 0.8));
        state.okStreak = 0;
      }
      return res.json();
    }
  }

  /* ================================================================== *
   * Record normalisation — tolerant of API shape changes
   * ================================================================== */
  /* ------------------------------------------------------------------ *
   * Turbo paging
   *
   * Roblox's cursors are base64 JSON like {"key":100}. If we can rebuild
   * page 2's cursor byte-for-byte from page 1's, then offsets are simply
   * key = limit * n, and later pages can be fetched in parallel instead of
   * waiting for each one to hand us the next. We only ever do this after
   * that exact-match proof, and fall back to sequential otherwise.
   * ------------------------------------------------------------------ */
  function decodeCursor(c) {
    try {
      const o = JSON.parse(decodeURIComponent(escape(atob(String(c)))));
      return (o && typeof o.key === 'number') ? o : null;
    } catch (e) { return null; }
  }
  function encodeCursor(o) {
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))); } catch (e) { return null; }
  }
  function cursorFactory(firstCursor) {
    const tpl = decodeCursor(firstCursor);
    if (!tpl) return null;
    if (encodeCursor(tpl) !== String(firstCursor)) return null; // must round-trip exactly
    const step = tpl.key;
    if (!step || step % 1 !== 0 || step <= 0) return null;
    return { step, at: n => encodeCursor(Object.assign({}, tpl, { key: step * n })) };
  }

  // Same shape the v1 script produced, plus txType / itemId / pending.
  function slim(tx, txType) {
    const d = tx.details || {};
    const place = d.place || {};
    const isRobux = tx.currency && tx.currency.type === 'Robux';
    return {
      id: tx.id,
      idHash: tx.idHash || null,
      txType: txType,
      created: tx.created,
      itemId: d.id != null ? d.id : null,
      itemType: d.type || '',
      itemName: d.name || '',
      // Roblox reports outgoing amounts as negative; we always store magnitude.
      amount: isRobux ? Math.abs(tx.currency.amount || 0) : 0,
      currency: tx.currency ? tx.currency.type : '',
      sellerId: tx.agent ? tx.agent.id : null,
      sellerName: tx.agent ? tx.agent.name : '',
      placeId: place.placeId || null,
      universeId: place.universeId || null,
      placeName: place.name || '',
      pending: !!tx.isPending
    };
  }

  /* ================================================================== *
   * Scan engine
   * ================================================================== */
  let lastPersist = 0;
  function persistRecords(force) {
    if (!force && Date.now() - lastPersist < 4000) return;
    lastPersist = Date.now();
    if (!store.set('records', state.records)) setStatus('⚠ Storage full — export before reloading.');
  }

  // Cursor pagination gives no total, so an exact ETA is impossible. What we can
  // honestly report: elapsed, throughput, and what that pace means per 100 pages.
  // Plain-language progress. The page/cursor detail lives in the scan log.
  function setScanStatus(label, page, rows, added) {
    const perPage = (Date.now() - state.startedAt) / Math.max(1, state.pages);
    state.lastPace = Math.round(60000 / perPage);
    setStatus(`Reading your ${label.toLowerCase()} — ${fmt(added)} found so far` +
      (page > 1 ? ` (${fmt(rows)} records checked)` : ''));
  }

  function startClock() {
    stopClock();
    state.clock = setInterval(() => {
      const el = document.getElementById('rst-elapsed');
      if (el) el.textContent = '⏱ ' + hms(Date.now() - state.startedAt);
    }, 1000);
  }
  function stopClock() { if (state.clock) { clearInterval(state.clock); state.clock = null; } }

  // Fetch pages 2..N in parallel batches. Stops at the first short/empty page,
  // and hands control back to the sequential loop if anything looks off.
  async function turboSweep(type, label, factory, onAdded) {
    let n = 2, rows = 0, pages = 0, done = false;
    while (!done && !state.stopped) {
      const batch = [];
      for (let i = 0; i < cfg.lanes; i++) batch.push(n + i);

      let results;
      try {
        results = await Promise.all(batch.map(p =>
          fetchTransactionPage(state.me.id, type, factory.at(p - 1)).then(d => ({ p, d }))));
      } catch (e) {
        if (e instanceof StopSignal) throw e;
        logLine('turbo: ' + e.message);
        return { rows, pages, fellBack: true, resumeCursor: factory.at(n - 1) };
      }

      results.sort((a, b) => a.p - b.p);
      for (const { p, d } of results) {
        const items = (d.data || []).map(tx => slim(tx, type));
        let added = 0;
        for (const rec of items) {
          const k = recKey(rec);
          if (state.ids.has(k)) continue;
          state.ids.add(k); state.records.push(rec); added++;
        }
        onAdded(added);
        rows += items.length; pages++; state.pages++;
        logLine(`${type} p${p} (turbo): ${items.length} rows, ${added} new`);
        if (items.length < cfg.pageLimit || !d.nextPageCursor) { done = true; break; }
      }

      n += cfg.lanes;
      persistRecords(false);
      setScanStatus(label, n, rows, state.records.length);
      renderStats();
      if (!done) await interruptibleSleep(state.curDelay, 'Cooling down');
    }
    return { rows, pages, fellBack: false, resumeCursor: null };
  }

  async function runScan(mode) {
    if (state.running) return;
    state.running = true; state.paused = false; state.stopped = false; state.mode = mode;
    state.pages = 0; state.reqs = 0; state.startedAt = Date.now();
    state.curDelay = cfg.delayMs; state.okStreak = 0; state.lastError = null;
    state.log = [];
    logLine(`scan started (mode=${mode}, delay=${cfg.delayMs}ms, types=${cfg.types.join('+')})`);
    startClock();
    setButtons();

    const types = cfg.types.length ? cfg.types : ['Purchase'];
    let added = 0;

    try {
      if (!state.me) { setStatus('Checking login…'); state.me = await getAuthedUser(); }

      // Cached records belong to whichever account was scanned last. If that's a
      // different user now, start clean instead of blending two histories.
      const owner = store.get('ownerId', null);
      if (owner != null && String(owner) !== String(state.me.id) && state.records.length) {
        state.records = []; state.ids.clear();
        store.set('records', []); store.del('progress');
        setStatus(`Cache belonged to user #${owner}; you are #${state.me.id}. Cleared it and starting fresh.`);
        mode = 'full';
      }
      store.set('ownerId', state.me.id);

      if (mode === 'full') {
        state.records = []; state.ids.clear();
        store.set('records', []); store.del('progress');
      }

      const saved = mode === 'resume' ? store.get('progress', null) : null;

      for (const type of types) {
        if (state.stopped) break;
        const label = typeInfo(type).label;
        let cursor = (saved && saved.type === type) ? saved.cursor : null;
        let typeSeen = 0, typePages = 0, barren = 0;
        const seenCursors = new Set();

        do {
          const data = await fetchTransactionPage(state.me.id, type, cursor);
          const items = (data.data || []).map(tx => slim(tx, type));

          let newOnPage = 0;
          for (const rec of items) {
            const k = recKey(rec);
            if (state.ids.has(k)) continue;
            state.ids.add(k);
            state.records.push(rec);
            newOnPage++; added++;
          }
          typeSeen += items.length;
          typePages++;
          state.pages++;
          const nextCursor = data.nextPageCursor || null;

          logLine(`${type} p${typePages}: ${items.length} rows, ${newOnPage} new, cursor=${nextCursor ? String(nextCursor).slice(0, 14) + '…' : 'END'}`);

          persistRecords(false);
          store.set('progress', { type, cursor: nextCursor, pages: state.pages });
          setScanStatus(label, typePages, typeSeen, added, items.length);
          renderStats();

          // --- stall guards: never spin forever on a cursor that isn't moving ---
          if (nextCursor && seenCursors.has(nextCursor)) {
            state.lastError = `${label}: Roblox handed back a cursor it had already used (page ${typePages}). Stopped to avoid an endless loop.`;
            logLine('STALL: repeated cursor — stopping this type.');
            cursor = null; break;
          }
          if (nextCursor) seenCursors.add(nextCursor);

          barren = newOnPage === 0 ? barren + 1 : 0;
          if (barren >= 5) {
            state.lastError = `${label}: 5 pages in a row contained nothing new (${fmt(typeSeen)} rows read). Stopped — the API is repeating itself.`;
            logLine('STALL: 5 barren pages — stopping this type.');
            cursor = null; break;
          }

          cursor = nextCursor;
          if (mode === 'update' && items.length && newOnPage === 0) { cursor = null; break; }

          // Once page 1 proves the cursor is a plain offset, switch to parallel lanes.
          if (cfg.turbo && typePages === 1 && cursor && items.length === cfg.pageLimit) {
            const factory = cursorFactory(cursor);
            if (factory) {
              logLine(`turbo: cursors are offsets of ${factory.step} — fetching ${cfg.lanes} pages at a time`);
              const res = await turboSweep(type, label, factory, s => { added += s; });
              typeSeen += res.rows; typePages += res.pages;
              cursor = null;
              if (res.fellBack) { cursor = res.resumeCursor; logLine('turbo: backed off to one page at a time'); }
              if (!cursor) break;
            } else {
              logLine('turbo: cursor is not a plain offset, staying sequential');
            }
          }

          if (cursor) await interruptibleSleep(state.curDelay, 'Cooling down');
        } while (cursor && !state.stopped);

        logLine(`${type} finished: ${typePages} page(s), ${fmt(typeSeen)} rows read.`);
        if (typeSeen === 0) state.lastError = `${label} (transactionType=${type}) returned 0 rows.`;
      }

      state.records.sort((a, b) => new Date(b.created) - new Date(a.created));
      state.lastScan = new Date().toISOString();
      store.set('lastScan', state.lastScan);
      persistRecords(true);
      if (!state.stopped) store.del('progress');

      if (!state.stopped && state.records.length) {
        setStatus(`Done — ${fmt(state.records.length)} records, ${fmt(added)} new, ${state.pages} page(s) in ${hms(Date.now() - state.startedAt)}.` +
          (state.lastError ? ' ⚠ ' + state.lastError : ''));
      }
      await prefetchIcons();
      render();
    } catch (e) {
      persistRecords(true);
      if (e instanceof StopSignal) setStatus('Stopped. Partial data kept — hit Resume.');
      else setStatus('⚠ ' + e.message);
      render();
    } finally {
      state.running = false; state.paused = false;
      stopClock();
      setButtons();
    }
  }

  async function prefetchIcons() {
    const unis = buildGames(spendRecords()).map(g => g.universeId).filter(Boolean);
    if (unis.length) { await fetchIcons(unis.slice(0, 200)); paintIcons(); }
  }

  async function fetchIcons(universeIds) {
    const need = [...new Set(universeIds.filter(Boolean).map(String))].filter(id => !ui.iconCache[id]);
    if (!need.length) return;
    for (let i = 0; i < need.length; i += 50) {
      const chunk = need.slice(i, i + 50);
      try {
        const r = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${chunk.join(',')}&size=150x150&format=Png&isCircular=false`);
        if (!r.ok) continue;
        const j = await r.json();
        (j.data || []).forEach(d => { if (d.state === 'Completed' && d.imageUrl) ui.iconCache[String(d.targetId)] = d.imageUrl; });
      } catch (e) {}
    }
    store.set('icons', ui.iconCache);
  }

  async function placeToUniverse(placeId) {
    try {
      const r = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`, { credentials: 'include' });
      if (!r.ok) return null;
      const j = await r.json();
      return j.universeId || null;
    } catch (e) { return null; }
  }

  /* ================================================================== *
   * Diagnostics
   * ================================================================== */
  async function runDiagnostics() {
    if (state.running) { setStatus('Wait for the current scan to finish.'); return; }
    const out = [];
    out.push('Robux Tracker — diagnostics ' + new Date().toISOString());
    out.push('script v' + VERSION + ' · page ' + location.pathname);
    try {
      if (!state.me) state.me = await getAuthedUser();
      out.push(`logged in as ${state.me.name} (#${state.me.id})`);
    } catch (e) {
      out.push('AUTH FAILED: ' + e.message);
      showDiag(out.join('\n'));
      return;
    }
    out.push(`cache owner: #${store.get('ownerId', 'none')}`);

    // Exactly the request the scan makes, reported raw.
    for (const type of (cfg.types.length ? cfg.types : ['Purchase'])) {
      const url = `https://economy.roblox.com/v2/users/${state.me.id}/transactions?transactionType=${type}&limit=${cfg.pageLimit}`;
      out.push('', url);
      setStatus('Diagnostics: ' + type);
      let res;
      try { res = await fetch(url, { credentials: 'include' }); }
      catch (e) { out.push('  → network/CORS error: ' + e.message); continue; }
      let text = '';
      try { text = await res.text(); } catch (e) {}
      let body = null;
      try { body = JSON.parse(text); } catch (e) {}
      const items = body && Array.isArray(body.data) ? body.data : null;
      out.push(`  → HTTP ${res.status}` + (items
        ? `, ${items.length} rows, nextPageCursor=${body.nextPageCursor ? 'yes' : 'no'}`
        : `, body: ${text.slice(0, 300)}`));
      if (items && items.length) out.push('  sample: ' + JSON.stringify(items[0]).slice(0, 800));
      await sleep(900);
    }

    if (state.lastError) out.push('', 'Last scan: ' + state.lastError);
    if (state.log.length) out.push('', 'Page-by-page log from the last scan:', ...state.log);
    out.push('', `Stored records: ${state.records.length}; last scan ${state.lastScan || 'never'}`);
    setStatus('Diagnostics complete.');
    showDiag(out.join('\n'));
  }

  /* ================================================================== *
   * Aggregation
   * ================================================================== */
  function categoryOf(type) {
    const t = String(type || '').toLowerCase().replace(/[\s_-]/g, '');
    if (t.includes('gamepass') || t.includes('pass')) return 'Game Passes';
    if (t.includes('developerproduct') || t.includes('product')) return 'Dev Products';
    if (t.includes('privateserver') || t.includes('vipserver')) return 'Private Servers';
    if (t.includes('subscription')) return 'Subscriptions';
    if (t.includes('bundle')) return 'Bundles';
    if (t.includes('avatar') || t === 'asset' || t.includes('catalog')) return 'Catalog / Avatar';
    if (t.includes('commission') || t.includes('ad')) return 'Ads / Fees';
    return type ? String(type) : 'Other';
  }
  const CAT_ORDER = ['Game Passes', 'Dev Products', 'Private Servers', 'Subscriptions', 'Bundles', 'Catalog / Avatar', 'Ads / Fees', 'Other'];

  function rangeStart() {
    const now = new Date();
    switch (ui.range) {
      case '30': return Date.now() - 30 * 864e5;
      case '90': return Date.now() - 90 * 864e5;
      case '365': return Date.now() - 365 * 864e5;
      case 'ytd': return new Date(now.getFullYear(), 0, 1).getTime();
      default: return null;
    }
  }

  function inRange(r) {
    const s = rangeStart();
    if (s === null) return true;
    return r.created && new Date(r.created).getTime() >= s;
  }
  const spendRecords = () => state.records.filter(r => typeInfo(r.txType).kind === 'out' && inRange(r));
  const incomeRecords = () => state.records.filter(r => typeInfo(r.txType).kind === 'in' && inRange(r));

  function sellerUniverseMap(records) {
    const m = new Map();
    for (const r of records) {
      if (!r.universeId || r.sellerId == null) continue;
      let e = m.get(r.sellerId);
      if (!e) { e = { unis: new Map() }; m.set(r.sellerId, e); }
      const key = String(r.universeId);
      const prev = e.unis.get(key) || { count: 0, name: r.placeName, placeId: r.placeId };
      prev.count++; if (!prev.name && r.placeName) prev.name = r.placeName;
      e.unis.set(key, prev);
    }
    const out = new Map();
    for (const [sellerId, e] of m) {
      if (e.unis.size === 1) {
        const [uni, info] = [...e.unis.entries()][0];
        out.set(sellerId, { universeId: uni, name: info.name, placeId: info.placeId });
      }
    }
    return out;
  }

  function buildGames(records) {
    const rescue = cfg.smartMerge ? sellerUniverseMap(records) : new Map();
    const map = new Map();

    for (const r of records) {
      if (!r.amount) continue;
      let universeId = r.universeId ? String(r.universeId) : null;
      let placeId = r.placeId || null;
      let name = r.placeName || '';
      let inferred = false;

      if (!universeId && cfg.smartMerge && r.sellerId != null && rescue.has(r.sellerId)) {
        const g = rescue.get(r.sellerId);
        universeId = g.universeId; placeId = placeId || g.placeId; name = name || g.name;
        inferred = true;
      }

      const key = universeId ? 'u:' + universeId : 's:' + (r.sellerId || r.sellerName || 'unknown');
      const label = universeId ? (name || 'Universe ' + universeId) : (r.sellerName || 'Unknown seller');

      let g = map.get(key);
      if (!g) {
        g = { key, label, universeId, placeId, sellerId: r.sellerId, sellerName: r.sellerName,
              attributed: !!universeId, hasInferred: false, total: 0, count: 0, first: null, last: null,
              biggest: 0, cats: new Map(), items: new Map(), txs: [] };
        map.set(key, g);
      }
      if (universeId && !g.placeId && placeId) g.placeId = placeId;
      if (universeId && name && /^Universe /.test(g.label)) g.label = name;
      if (inferred) g.hasInferred = true;

      g.total += r.amount; g.count++;
      g.biggest = Math.max(g.biggest, r.amount);
      g.txs.push(r);

      const t = r.created ? new Date(r.created).getTime() : null;
      if (t) {
        if (g.first === null || t < g.first) g.first = t;
        if (g.last === null || t > g.last) g.last = t;
      }

      const cat = categoryOf(r.itemType);
      g.cats.set(cat, (g.cats.get(cat) || 0) + r.amount);

      const ikey = cat + '|' + (r.itemName || r.itemType || 'item') + '|' + (r.itemId || '');
      let it = g.items.get(ikey);
      if (!it) {
        it = { key: ikey, name: r.itemName || r.itemType || 'Item', cat, itemId: r.itemId, count: 0, total: 0, last: null, txs: [] };
        g.items.set(ikey, it);
      }
      it.count++; it.total += r.amount; it.txs.push(r);
      if (t && (it.last === null || t > it.last)) it.last = t;
    }
    return [...map.values()];
  }

  function sortGames(games) {
    const s = ui.sort;
    return games.sort((a, b) => {
      if (s === 'count') return b.count - a.count || b.total - a.total;
      if (s === 'recent') return (b.last || 0) - (a.last || 0);
      if (s === 'name') return a.label.localeCompare(b.label);
      return b.total - a.total || b.count - a.count;
    });
  }

  let resolvedFilterUniverse = null;
  function matchesQuery(g, q) {
    if (!q) return true;
    if (g.label.toLowerCase().includes(q)) return true;
    if ((g.sellerName || '').toLowerCase().includes(q)) return true;
    if (g.universeId && String(g.universeId) === q) return true;
    if (g.placeId && String(g.placeId) === q) return true;
    if (resolvedFilterUniverse && String(g.universeId) === resolvedFilterUniverse) return true;
    for (const it of g.items.values()) if (it.name.toLowerCase().includes(q)) return true;
    return false;
  }

  function allItems(records) {
    const map = new Map();
    for (const r of records) {
      if (!r.amount) continue;
      const cat = categoryOf(r.itemType);
      const key = cat + '|' + (r.itemName || r.itemType || 'item');
      let it = map.get(key);
      if (!it) {
        it = { name: r.itemName || r.itemType || 'Item', cat, count: 0, total: 0, last: null, game: r.placeName || r.sellerName || '' };
        map.set(key, it);
      }
      it.count++; it.total += r.amount;
      const t = r.created ? new Date(r.created).getTime() : null;
      if (t && (it.last === null || t > it.last)) it.last = t;
      if (!it.game && (r.placeName || r.sellerName)) it.game = r.placeName || r.sellerName;
    }
    return [...map.values()];
  }

  function monthly(records) {
    const map = new Map();
    for (const r of records) {
      if (!r.amount || !r.created) continue;
      const d = new Date(r.created);
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      const e = map.get(k) || { key: k, total: 0, count: 0, date: new Date(d.getFullYear(), d.getMonth(), 1) };
      e.total += r.amount; e.count++;
      map.set(k, e);
    }
    const arr = [...map.values()].sort((a, b) => a.date - b.date);
    if (arr.length > 1) {
      const out = [];
      let cur = new Date(arr[0].date);
      const end = arr[arr.length - 1].date;
      const byKey = new Map(arr.map(a => [a.key, a]));
      while (cur <= end) {
        const k = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0');
        out.push(byKey.get(k) || { key: k, total: 0, count: 0, date: new Date(cur) });
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      }
      return out;
    }
    return arr;
  }

  function dateRange(records) {
    let min = null, max = null;
    for (const r of records) {
      if (!r.created) continue;
      const t = new Date(r.created).getTime();
      if (min === null || t < min) min = t;
      if (max === null || t > max) max = t;
    }
    return { min, max };
  }

  /* ================================================================== *
   * Real money
   *
   * Currency-purchase rows record the exact pack you bought, and pack sizes
   * map one-to-one onto prices. So instead of valuing your spend at some
   * average rate, we can add up what you genuinely paid. Anything we can't
   * match is reported as unmatched rather than guessed at.
   * ================================================================== */
  const packOverrides = () => store.get('packOverrides', {});

  function priceForPack(amount) {
    if (!amount || amount <= 0) return null;
    const ov = packOverrides();
    if (ov[amount] != null) return { price: +ov[amount], how: 'price you set' };

    const t = tiers();
    const exact = t.find(([r]) => r === amount);
    if (exact) return { price: exact[1], how: `${fmt(exact[0])} R$ pack` };

    // one row can cover several of the same pack bought together
    for (let i = t.length - 1; i >= 0; i--) {
      const [r, p] = t[i];
      if (r > 0 && amount % r === 0) {
        const n = amount / r;
        if (n >= 2 && n <= 20) return { price: p * n, how: `${n} × ${fmt(r)} R$ pack` };
      }
    }
    return null;
  }

  function moneyStats() {
    const rows = state.records.filter(r => r.txType === 'CurrencyPurchase' && inRange(r) && r.amount > 0);
    const packs = new Map(), unknown = new Map();
    let paid = 0, matchedRows = 0, matchedRobux = 0, unmatchedRobux = 0;

    for (const r of rows) {
      const m = priceForPack(r.amount);
      if (m) {
        paid += m.price; matchedRows++; matchedRobux += r.amount;
        const e = packs.get(r.amount) || { amount: r.amount, count: 0, unit: m.price, how: m.how, last: null };
        e.count++;
        const t = r.created ? new Date(r.created).getTime() : null;
        if (t && (e.last === null || t > e.last)) e.last = t;
        packs.set(r.amount, e);
      } else {
        unmatchedRobux += r.amount;
        const e = unknown.get(r.amount) || { amount: r.amount, count: 0 };
        e.count++; unknown.set(r.amount, e);
      }
    }
    return {
      rows, paid, matchedRows, matchedRobux, unmatchedRobux,
      robux: matchedRobux + unmatchedRobux,
      packs: [...packs.values()].sort((a, b) => (b.unit * b.count) - (a.unit * a.count)),
      unknown: [...unknown.values()].sort((a, b) => b.count - a.count)
    };
  }

  const tracksCurrency = () => cfg.types.includes('CurrencyPurchase');

  /* ================================================================== *
   * Insights
   * ================================================================== */
  function biggestPurchases(n) {
    return spendRecords().filter(r => r.amount > 0)
      .sort((a, b) => b.amount - a.amount).slice(0, n || 50);
  }

  // Items you went back for. The interesting number isn't the price, it's
  // how much the repeats added up to.
  function repeatBuys() {
    const map = new Map();
    for (const r of spendRecords()) {
      if (!r.amount) continue;
      const where = r.placeName || r.sellerName || '';
      const key = (r.itemName || r.itemType || 'item') + '|' + where;
      const e = map.get(key) || { name: r.itemName || r.itemType || 'Item', where, count: 0, total: 0, last: null, unit: r.amount };
      e.count++; e.total += r.amount;
      const t = r.created ? new Date(r.created).getTime() : null;
      if (t && (e.last === null || t > e.last)) e.last = t;
      map.set(key, e);
    }
    return [...map.values()].filter(e => e.count >= 2)
      .map(e => Object.assign(e, { repeatSpend: e.total - (e.total / e.count) }))
      .sort((a, b) => b.total - a.total);
  }

  // Spending by weekday and by hour — shows when the impulse buying happens.
  function habitStats() {
    const dow = new Array(7).fill(0), dowCount = new Array(7).fill(0);
    const hour = new Array(24).fill(0);
    const byDay = new Map();
    for (const r of spendRecords()) {
      if (!r.amount || !r.created) continue;
      const d = new Date(r.created);
      dow[d.getDay()] += r.amount; dowCount[d.getDay()]++;
      hour[d.getHours()] += r.amount;
      const k = d.toISOString().slice(0, 10);
      byDay.set(k, (byDay.get(k) || 0) + r.amount);
    }
    let peakDay = null;
    for (const [k, v] of byDay) if (!peakDay || v > peakDay.total) peakDay = { date: k, total: v };
    return { dow, dowCount, hour, peakDay, activeDays: byDay.size };
  }

  /* ================================================================== *
   * Year in review
   * ================================================================== */
  function yearsCovered() {
    const set = new Set();
    for (const r of state.records) if (r.created) set.add(new Date(r.created).getFullYear());
    return [...set].sort((a, b) => b - a);
  }

  function yearReview(year) {
    const isIn = r => r.created && new Date(r.created).getFullYear() === year;
    const spend = state.records.filter(r => typeInfo(r.txType).kind === 'out' && isIn(r) && r.amount > 0);
    const bought = state.records.filter(r => r.txType === 'CurrencyPurchase' && isIn(r) && r.amount > 0);

    const total = spend.reduce((s, r) => s + r.amount, 0);
    const games = sortGames(buildGames(spend)).slice(0, 5);

    const items = new Map();
    for (const r of spend) {
      const k = r.itemName || r.itemType || 'Item';
      const e = items.get(k) || { name: k, count: 0, total: 0 };
      e.count++; e.total += r.amount; items.set(k, e);
    }
    const byCount = [...items.values()].sort((a, b) => b.count - a.count)[0] || null;
    const bySpend = [...items.values()].sort((a, b) => b.total - a.total)[0] || null;

    const days = new Map(), months = new Map();
    for (const r of spend) {
      const d = new Date(r.created);
      const dk = d.toISOString().slice(0, 10);
      days.set(dk, (days.get(dk) || 0) + r.amount);
      const mk = d.getMonth();
      months.set(mk, (months.get(mk) || 0) + r.amount);
    }
    let peakDay = null; for (const [k, v] of days) if (!peakDay || v > peakDay.total) peakDay = { date: k, total: v };
    let peakMonth = null; for (const [k, v] of months) if (!peakMonth || v > peakMonth.total) peakMonth = { month: k, total: v };

    // games seen for the first time this year
    const before = new Set();
    for (const r of state.records) {
      if (!r.created || new Date(r.created).getFullYear() >= year) continue;
      if (r.universeId) before.add(String(r.universeId));
    }
    const thisYear = new Set();
    for (const r of spend) if (r.universeId) thisYear.add(String(r.universeId));
    const newGames = [...thisYear].filter(u => !before.has(u)).length;

    let paid = 0, unmatched = 0;
    for (const r of bought) { const m = priceForPack(r.amount); if (m) paid += m.price; else unmatched += r.amount; }

    return {
      year, total, count: spend.length, games, byCount, bySpend,
      peakDay, peakMonth, newGames, activeDays: days.size,
      robuxBought: bought.reduce((s, r) => s + r.amount, 0), paid, unmatchedRobux: unmatched,
      gameCount: thisYear.size
    };
  }

  /* ================================================================== *
   * Theme
   * ================================================================== */
  function siteTheme() {
    try {
      const b = document.body;
      if (b && b.classList.contains('light-theme')) return 'light';
      if (b && b.classList.contains('dark-theme')) return 'dark';
      if (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    } catch (e) {}
    return 'dark';
  }
  function effectiveTheme() { return cfg.theme === 'auto' ? siteTheme() : cfg.theme; }
  function applyTheme() {
    if (panel) panel.setAttribute('data-theme', effectiveTheme());
  }

  /* ================================================================== *
   * Boot the UI once the DOM exists (we run at document-start)
   * ================================================================== */
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  const addStyle = css => {
    const s = document.createElement('style');
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  };

  let overlay, panel, fab, $;

  // NB: called at the very bottom of this IIFE — it touches ICONS and other
  // `const`s declared below, which are in the temporal dead zone until then.
  function main() {
    injectStyles();
    buildPanel();
    mountLauncher();
    wireEvents();
    watchForPrices();

    setButtons();
    if (state.records.length) {
      state.records.sort((a, b) => new Date(b.created) - new Date(a.created));
      setStatus(`Loaded ${fmt(state.records.length)} cached records${state.lastScan ? ' from ' + dtstr(state.lastScan) : ''}.`);
    } else {
      setStatus('Idle');
    }
  }

  /* ------------------------------------------------------------------ *
   * Styles — tuned to Roblox's own design language (Builder Sans, their
   * surface/stroke greys, 8/12/16px radii, monochrome line icons).
   * ------------------------------------------------------------------ */
  function injectStyles() {
    addStyle(`
    #rst-overlay, #rst-panel, #rst-panel *{box-sizing:border-box;}

    /* ---------- launchers ---------- */
    #rst-sidebtn .rst-glyph{width:24px;height:24px;display:block;color:currentColor;position:relative;}
    #rst-sidebtn .rst-glyph svg{width:100%;height:100%;display:block;}

    /* still-scanning indicator, visible with the panel closed */
    .rst-scanning .rst-glyph:after, #rst-pagebtn.rst-scanning:after{content:"";position:absolute;top:-1px;right:-1px;
      width:8px;height:8px;border-radius:50%;background:#00a2ff;box-shadow:0 0 0 2px rgba(0,0,0,.35);
      animation:rst-pulse 1.2s ease-in-out infinite;}
    #rst-pagebtn{position:relative;}
    #rst-fab.busy{animation:rst-pulse 1.6s ease-in-out infinite;}
    @keyframes rst-pulse{0%,100%{opacity:1}50%{opacity:.35}}

    /* Roblox's own sprite sits on a text baseline slightly differently to ours */
    .rst-rbxs{display:inline-block;vertical-align:-.15em;margin-right:2px;flex:none;}

    #rst-pagebtn{display:inline-flex;align-items:center;gap:7px;margin-left:12px;vertical-align:middle;
      background:#00a2ff;color:#fff;border:none;border-radius:8px;padding:0 14px;height:36px;
      font:600 14px/1 var(--rst-font);cursor:pointer;transition:background .12s;}
    #rst-pagebtn:hover{background:#0092e6;}
    #rst-pagebtn svg{width:18px;height:18px;}

    #rst-fab{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;
      justify-content:center;background:#00a2ff;color:#fff;border:none;border-radius:999px;height:44px;width:44px;
      padding:0;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.35);transition:width .18s ease,padding .18s ease;
      overflow:hidden;user-select:none;gap:0;}
    #rst-fab svg{width:22px;height:22px;flex:none;}
    #rst-fab .lbl{white-space:nowrap;max-width:0;opacity:0;font:600 14px var(--rst-font);
      transition:max-width .18s ease,opacity .15s ease;}
    #rst-fab:hover{width:180px;padding:0 16px;gap:9px;}
    #rst-fab:hover .lbl{max-width:140px;opacity:1;}
    #rst-fab.hide{display:none;}

    /* ---------- shell ---------- */
    #rst-overlay{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.6);
      display:none;align-items:center;justify-content:center;padding:20px;}
    #rst-overlay.open{display:flex;}

    #rst-panel{
      --rst-font:"Builder Sans","BuilderSans","Source Sans Pro","Helvetica Neue",Helvetica,Arial,sans-serif;
      --bg:#0f1114; --card:#1b1e23; --card2:#22262c; --line:rgba(255,255,255,.09);
      --tx:#f2f4f7; --tx2:#9aa3ae; --acc:#00a2ff; --money:#00b06f; --warn:#f2a93b; --bad:#ff6b6b;
      width:min(1140px,100%);height:min(820px,100%);display:flex;flex-direction:column;position:relative;
      background:var(--bg);color:var(--tx);border:1px solid var(--line);border-radius:16px;overflow:hidden;
      font:14px/1.45 var(--rst-font);box-shadow:0 24px 64px rgba(0,0,0,.55);animation:rst-in .16s ease;}
    #rst-panel[data-theme="light"]{--bg:#f5f6f7;--card:#fff;--card2:#eef0f2;--line:rgba(0,0,0,.1);
      --tx:#17181c;--tx2:#5f6772;--money:#00854f;}
    @keyframes rst-in{from{opacity:0;transform:translateY(10px) scale(.99)}to{opacity:1;transform:none}}

    /* ---------- top bar ---------- */
    .rst-top{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--line);
      background:var(--card);flex:none;}
    .rst-brand{display:flex;align-items:center;gap:11px;min-width:0;}
    .rst-logo{width:36px;height:36px;border-radius:10px;background:rgba(0,162,255,.14);color:var(--acc);
      display:grid;place-items:center;flex:none;}
    .rst-logo svg{width:21px;height:21px;}
    .rst-title{font-size:16px;font-weight:700;letter-spacing:-.2px;line-height:1.2;}
    .rst-sub{font-size:12px;color:var(--tx2);}
    .rst-top .sp{flex:1;}

    .rst-cta{height:38px;padding:0 18px;border:none;border-radius:8px;background:var(--acc);color:#fff;
      font:600 14px var(--rst-font);cursor:pointer;transition:background .12s,opacity .12s;white-space:nowrap;}
    .rst-cta:hover:not(:disabled){background:#0092e6;}
    .rst-cta:disabled{opacity:.45;cursor:not-allowed;}
    .rst-cta.sec{background:transparent;color:var(--tx);border:1px solid var(--line);}
    .rst-cta.sec:hover:not(:disabled){background:var(--card2);}
    .rst-ico{width:38px;height:38px;border-radius:8px;border:1px solid var(--line);background:transparent;
      color:var(--tx2);display:grid;place-items:center;cursor:pointer;flex:none;transition:background .12s,color .12s;}
    .rst-ico:hover{background:var(--card2);color:var(--tx);}
    .rst-ico svg{width:18px;height:18px;}

    /* ---------- scan bar ---------- */
    .rst-scan{display:none;align-items:center;gap:12px;padding:10px 18px;background:var(--card);
      border-bottom:1px solid var(--line);position:relative;flex:none;}
    .rst-scan.on{display:flex;}
    .rst-spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(0,162,255,.25);
      border-top-color:var(--acc);animation:rst-spin .7s linear infinite;flex:none;}
    @keyframes rst-spin{to{transform:rotate(360deg)}}
    .rst-scan .txt{flex:1;font-size:13px;color:var(--tx);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .rst-scan .clock{font:600 13px ui-monospace,Consolas,monospace;color:var(--tx2);flex:none;}
    .rst-scan .mini{height:30px;padding:0 12px;border-radius:7px;border:1px solid var(--line);background:transparent;
      color:var(--tx2);font:600 12px var(--rst-font);cursor:pointer;flex:none;}
    .rst-scan .mini:hover{background:var(--card2);color:var(--tx);}
    .rst-scan .bar{position:absolute;left:0;bottom:0;height:2px;width:100%;overflow:hidden;background:transparent;}
    .rst-scan .bar i{display:block;height:100%;width:30%;background:var(--acc);animation:rst-slide 1.1s infinite ease-in-out;}
    @keyframes rst-slide{0%{margin-left:-30%}100%{margin-left:100%}}

    .rst-toast{display:none;align-items:center;gap:10px;padding:10px 18px;font-size:13px;flex:none;
      border-bottom:1px solid var(--line);}
    .rst-toast.on{display:flex;}
    .rst-toast.warn{background:rgba(242,169,59,.1);color:var(--warn);}
    .rst-toast.err{background:rgba(255,107,107,.1);color:var(--bad);}
    .rst-toast .x{margin-left:auto;cursor:pointer;opacity:.7;}

    /* ---------- hero ---------- */
    .rst-hero{padding:18px;display:flex;gap:14px;align-items:stretch;flex-wrap:wrap;flex:none;}
    .rst-total{background:linear-gradient(135deg,rgba(0,162,255,.16),rgba(0,176,111,.1));
      border:1px solid var(--line);border-radius:14px;padding:16px 20px;min-width:250px;flex:1.2;}
    .rst-total .k{font-size:12px;color:var(--tx2);font-weight:600;letter-spacing:.3px;text-transform:uppercase;}
    .rst-total .v{display:flex;align-items:center;gap:8px;font-size:34px;font-weight:800;letter-spacing:-1px;
      line-height:1.15;margin-top:4px;}
    .rst-total .usd{font-size:13px;color:var(--tx2);font-weight:600;}
    .rst-total .usd b{color:var(--tx);font-weight:700;}
    .rst-split{margin-top:14px;}
    .rst-splitkey{display:flex;gap:12px;flex-wrap:wrap;font-size:11.5px;color:var(--tx2);margin-top:7px;}
    .rst-splitkey span{display:flex;align-items:center;gap:5px;white-space:nowrap;}
    .rst-splitkey i{width:8px;height:8px;border-radius:2px;display:inline-block;flex:none;}
    .rst-splitkey b{color:var(--tx);font-weight:700;}

    .rst-mini-stats{flex:2;display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));
      grid-auto-rows:1fr;gap:10px;align-content:start;}
    .rst-ms{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:11px 13px;
      display:flex;flex-direction:column;justify-content:center;min-width:0;}
    .rst-ms .k{font-size:11px;color:var(--tx2);font-weight:600;text-transform:uppercase;letter-spacing:.4px;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .rst-ms .v{font-size:19px;font-weight:700;margin-top:3px;display:flex;align-items:baseline;gap:4px;
      white-space:nowrap;line-height:1.2;}
    .rst-ms .v small{font-size:12px;color:var(--tx2);font-weight:600;}
    .rst-ms .s{font-size:11px;color:var(--tx2);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

    .rst-rbx{display:inline-block;width:1em;height:1em;vertical-align:-.1em;flex:none;}
    .rst-rbx svg{width:100%;height:100%;display:block;}

    /* ---------- tabs / tools ---------- */
    .rst-tabs{display:flex;gap:2px;padding:0 18px;border-bottom:1px solid var(--line);flex:none;}
    .rst-tab{background:none;border:none;color:var(--tx2);padding:11px 14px;font:600 14px var(--rst-font);
      cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;}
    .rst-tab:hover{color:var(--tx);}
    .rst-tab.on{color:var(--tx);border-bottom-color:var(--acc);}

    .rst-tools{display:flex;gap:10px;align-items:center;padding:14px 18px 6px;flex:none;}
    .rst-field{flex:1;position:relative;display:flex;align-items:center;}
    .rst-field svg{position:absolute;left:12px;width:17px;height:17px;color:var(--tx2);pointer-events:none;}
    .rst-search{width:100%;height:38px;background:var(--card);border:1px solid var(--line);border-radius:8px;
      color:var(--tx);padding:0 12px 0 36px;font:14px var(--rst-font);}
    .rst-search:focus{outline:none;border-color:var(--acc);}
    .rst-select{height:38px;background:var(--card);border:1px solid var(--line);border-radius:8px;color:var(--tx);
      padding:0 10px;font:600 13px var(--rst-font);cursor:pointer;}

    .rst-body{flex:1;overflow:auto;padding:10px 18px 22px;}
    .rst-body::-webkit-scrollbar{width:10px}
    .rst-body::-webkit-scrollbar-thumb{background:var(--line);border-radius:8px;border:3px solid var(--bg)}

    /* ---------- game rows ---------- */
    .rst-summary{font-size:13px;color:var(--tx2);margin:4px 0 12px;}
    .rst-game{display:flex;align-items:center;gap:14px;padding:11px 12px;border-radius:12px;margin-bottom:8px;
      cursor:pointer;background:var(--card);border:1px solid transparent;transition:background .12s,border-color .12s;}
    .rst-game:hover{border-color:var(--line);background:var(--card2);}
    .rst-game .rank{width:20px;text-align:center;font-weight:700;color:var(--tx2);font-size:13px;flex:none;}
    .rst-game img{width:52px;height:52px;border-radius:10px;background:var(--card2);flex:none;object-fit:cover;}
    .rst-game .nm{flex:1;min-width:0;}
    .rst-game .nm b{display:block;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .rst-game .meta{font-size:12px;color:var(--tx2);margin-top:1px;}
    .rst-game .amt{text-align:right;flex:none;}
    .rst-game .amt b{font-size:17px;font-weight:700;color:var(--money);display:flex;align-items:center;gap:5px;justify-content:flex-end;}
    .rst-game .amt small{display:block;font-size:11px;color:var(--tx2);margin-top:1px;}
    .rst-meter{height:3px;border-radius:2px;background:var(--card2);margin-top:7px;overflow:hidden;}
    .rst-meter i{display:block;height:100%;background:var(--acc);border-radius:2px;}

    .rst-chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;}
    .rst-chip{font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;background:var(--card2);
      color:var(--tx2);border:1px solid var(--line);}
    .rst-chip.pass{color:#66c6ff;} .rst-chip.prod{color:#b79bff;} .rst-chip.serv{color:#ffab6b;}
    .rst-chip.inf{color:var(--warn);}

    /* ---------- detail ---------- */
    .rst-back{display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:var(--tx2);
      font:600 13px var(--rst-font);cursor:pointer;padding:6px 0;margin-bottom:8px;}
    .rst-back:hover{color:var(--tx);}
    .rst-dhead{display:flex;gap:16px;align-items:center;padding:16px;background:var(--card);
      border:1px solid var(--line);border-radius:14px;margin-bottom:14px;flex-wrap:wrap;}
    .rst-dhead img{width:84px;height:84px;border-radius:14px;background:var(--card2);flex:none;object-fit:cover;}
    .rst-dhead h2{margin:0 0 3px;font-size:21px;font-weight:700;letter-spacing:-.3px;}
    .rst-dhead .meta{font-size:12.5px;color:var(--tx2);line-height:1.7;}
    .rst-dhead .big{margin-left:auto;text-align:right;}
    .rst-dhead .big b{display:flex;align-items:center;gap:7px;font-size:30px;font-weight:800;color:var(--money);letter-spacing:-1px;}
    .rst-dhead .big small{font-size:12px;color:var(--tx2);font-weight:600;}

    .rst-catbar{display:flex;height:8px;border-radius:5px;overflow:hidden;margin-bottom:8px;background:var(--card2);}
    .rst-catkey{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--tx2);margin-bottom:14px;}
    .rst-catkey span{display:flex;align-items:center;gap:6px;}
    .rst-catkey i{width:9px;height:9px;border-radius:3px;display:inline-block;}

    .rst-secttl{font-size:12px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--tx2);
      margin:18px 0 8px;display:flex;align-items:center;gap:8px;}
    .rst-secttl b{color:var(--tx);}
    .rst-secttl:after{content:"";flex:1;height:1px;background:var(--line);}

    .rst-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;margin-bottom:6px;
      background:var(--card);cursor:pointer;border:1px solid transparent;}
    .rst-item:hover{border-color:var(--line);background:var(--card2);}
    .rst-item .x{font-weight:700;font-size:13px;color:var(--acc);background:rgba(0,162,255,.12);border-radius:7px;
      padding:4px 9px;flex:none;min-width:44px;text-align:center;}
    .rst-item .nm{flex:1;min-width:0;}
    .rst-item .nm b{display:block;font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .rst-item .nm small{color:var(--tx2);font-size:12px;}
    .rst-item .tot{font-weight:700;color:var(--money);white-space:nowrap;text-align:right;display:flex;
      align-items:center;gap:5px;}
    .rst-item .tot small{color:var(--tx2);font-weight:600;font-size:11px;}
    .rst-txs{margin:-2px 0 10px 26px;border-left:2px solid var(--line);padding-left:14px;}
    .rst-tx{display:flex;justify-content:space-between;gap:10px;padding:5px 0;font-size:12.5px;color:var(--tx2);}
    .rst-tx b{color:var(--tx);font-weight:600;}

    /* ---------- chart / tables ---------- */
    .rst-chart{display:flex;align-items:flex-end;gap:4px;height:200px;padding:14px;background:var(--card);
      border:1px solid var(--line);border-radius:12px;overflow-x:auto;}
    .rst-chart .bar{flex:1;min-width:10px;background:var(--acc);border-radius:4px 4px 0 0;opacity:.85;}
    .rst-chart .bar:hover{opacity:1;}
    .rst-chart .bar.zero{background:var(--card2);}
    .rst-axis{display:flex;justify-content:space-between;font-size:11.5px;color:var(--tx2);padding:8px 4px 0;}

    .rst-table{width:100%;border-collapse:collapse;font-size:13.5px;}
    .rst-table th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--tx2);
      padding:8px 10px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--bg);font-weight:700;}
    .rst-table td{padding:9px 10px;border-bottom:1px solid var(--line);}
    .rst-table tr:hover td{background:var(--card);}
    .rst-table .r{text-align:right;white-space:nowrap;}
    .rst-table .g{color:var(--money);font-weight:700;}

    /* ---------- empty / onboarding ---------- */
    .rst-empty{text-align:center;color:var(--tx2);padding:40px 20px;}
    .rst-empty .ico{width:56px;height:56px;margin:0 auto 14px;border-radius:16px;background:rgba(0,162,255,.12);
      color:var(--acc);display:grid;place-items:center;}
    .rst-empty .ico svg{width:30px;height:30px;}
    .rst-empty h3{margin:0 0 6px;font-size:19px;font-weight:700;color:var(--tx);}
    .rst-empty p{margin:0 auto 18px;max-width:440px;font-size:13.5px;line-height:1.65;}
    .rst-steps{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;}
    .rst-step{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;width:190px;text-align:left;}
    .rst-step .n{width:22px;height:22px;border-radius:50%;background:var(--acc);color:#fff;font:700 12px var(--rst-font);
      display:grid;place-items:center;margin-bottom:8px;}
    .rst-step b{display:block;font-size:13.5px;color:var(--tx);margin-bottom:2px;}
    .rst-step span{font-size:12px;line-height:1.55;}

    .rst-note{font-size:12px;color:var(--tx2);margin-top:12px;line-height:1.6;}
    a.rst-link{color:var(--acc);text-decoration:none;}
    a.rst-link:hover{text-decoration:underline;}

    /* ---------- menu + settings sheet ---------- */
    .rst-menu{position:absolute;top:60px;right:18px;z-index:20;min-width:210px;background:var(--card);
      border:1px solid var(--line);border-radius:12px;padding:6px;display:none;box-shadow:0 12px 32px rgba(0,0,0,.45);}
    .rst-menu.on{display:block;}
    .rst-menu button{display:flex;align-items:center;gap:10px;width:100%;background:none;border:none;color:var(--tx);
      font:500 13.5px var(--rst-font);padding:9px 10px;border-radius:8px;cursor:pointer;text-align:left;}
    .rst-menu button:hover{background:var(--card2);}
    .rst-menu button.danger{color:var(--bad);}
    .rst-menu hr{border:none;border-top:1px solid var(--line);margin:5px 2px;}
    .rst-menu svg{width:16px;height:16px;opacity:.8;flex:none;}

    .rst-sheet{position:absolute;inset:0;z-index:30;background:var(--bg);display:none;flex-direction:column;}
    .rst-sheet.on{display:flex;}
    .rst-sheet .body{flex:1;overflow:auto;padding:18px;}
    .rst-set{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-bottom:12px;}
    .rst-set h4{margin:0 0 3px;font-size:14px;font-weight:700;}
    .rst-set p{margin:0 0 12px;font-size:12.5px;color:var(--tx2);line-height:1.6;}
    .rst-set .row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
    .rst-flabel{font-size:13px;color:var(--tx2);}
    .rst-num{width:88px;height:34px;background:var(--card2);border:1px solid var(--line);color:var(--tx);
      border-radius:8px;padding:0 10px;font:600 13px var(--rst-font);}
    .rst-switch{display:flex;align-items:center;gap:9px;font-size:13.5px;color:var(--tx);cursor:pointer;
      user-select:none;padding:7px 0;}
    .rst-switch input{appearance:none;width:38px;height:22px;border-radius:999px;background:var(--card2);
      border:1px solid var(--line);position:relative;cursor:pointer;transition:background .15s;flex:none;margin:0;}
    .rst-switch input:checked{background:var(--acc);border-color:var(--acc);}
    .rst-switch input:after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;
      background:#fff;transition:transform .15s;}
    .rst-switch input:checked:after{transform:translateX(16px);}
    .rst-switch .sub{font-size:12px;color:var(--tx2);display:block;}

    .rst-types{display:flex;gap:7px;flex-wrap:wrap;}
    .rst-type{font:600 12.5px var(--rst-font);padding:7px 13px;border-radius:8px;border:1px solid var(--line);
      background:var(--card2);color:var(--tx2);cursor:pointer;user-select:none;transition:all .12s;}
    .rst-type:hover{color:var(--tx);}
    .rst-type.on{background:rgba(0,162,255,.15);border-color:var(--acc);color:var(--tx);}
    .rst-type.in.on{background:rgba(0,176,111,.15);border-color:var(--money);}

    .rst-log{margin:0;padding:12px;background:rgba(0,0,0,.45);color:var(--tx2);border-radius:10px;max-height:220px;
      overflow:auto;font:11px/1.6 ui-monospace,Consolas,monospace;white-space:pre-wrap;word-break:break-all;}

    /* ---------- money / year in review / habits ---------- */
    .rst-money-top{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:6px;}
    .rst-money-top .rst-total{min-width:260px;}
    .rst-money-top .rst-total .v{font-size:32px;}

    .rst-wrap-hero{background:linear-gradient(135deg,rgba(0,162,255,.18),rgba(160,119,255,.14));
      border:1px solid var(--line);border-radius:14px;padding:20px 22px;margin-bottom:16px;}
    .rst-wrap-hero .k{font-size:12px;color:var(--tx2);font-weight:600;text-transform:uppercase;letter-spacing:.4px;}
    .rst-wrap-hero .v{display:flex;align-items:center;gap:10px;font-size:40px;font-weight:800;
      letter-spacing:-1.5px;line-height:1.1;margin:4px 0 6px;}
    .rst-wrap-hero .usd{font-size:13px;color:var(--tx2);}
    .rst-wrap-hero .usd b{color:var(--tx);}
    .rst-yearpick{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px;}

    .rst-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px;}
    .rst-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;}
    .rst-card .t{font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:var(--tx2);font-weight:700;}
    .rst-card .b{font-size:17px;font-weight:700;margin:5px 0 3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .rst-card .s{font-size:12.5px;color:var(--tx2);}

    .rst-habits{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;}
    .rst-habit .t{font-size:12.5px;color:var(--tx2);margin-bottom:8px;}
    .rst-habit b{color:var(--tx);}
    .rst-cats{display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 12px;}

    /* ---------- troubleshoot modal ---------- */
    #rst-diag{position:fixed;inset:0;z-index:2147483002;background:rgba(0,0,0,.7);display:none;
      align-items:center;justify-content:center;padding:20px;}
    #rst-diag.open{display:flex;}
    #rst-diag .box{width:min(900px,100%);height:min(640px,100%);background:#0f1114;border:1px solid rgba(255,255,255,.09);
      border-radius:16px;display:flex;flex-direction:column;overflow:hidden;color:#f2f4f7;
      --rst-font:"Builder Sans","BuilderSans","Source Sans Pro",Helvetica,Arial,sans-serif;
      --bg:#0f1114;--card:#1b1e23;--card2:#22262c;--line:rgba(255,255,255,.09);--tx:#f2f4f7;--tx2:#9aa3ae;--acc:#00a2ff;
      font:14px var(--rst-font);}
    #rst-diag textarea{flex:1;background:#000;color:#c8ced6;border:none;padding:14px;resize:none;
      font:11.5px/1.6 ui-monospace,Consolas,monospace;}
    #rst-diag textarea:focus{outline:none;}
    `);
  }

  /* ------------------------------------------------------------------ *
   * Icons — monochrome line glyphs at 24px on a 24px grid, drawn with
   * currentColor so they inherit Roblox's own sidebar colouring.
   * ------------------------------------------------------------------ */
  const SVG = (d, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  const ICONS = {
    // a spend-breakdown pie: reads as "where your Robux went"
    logo: SVG('<circle cx="12" cy="12" r="8.6"/><path d="M12 12V3.4"/><path d="M12 12l7.4 4.3"/>'),
    close: SVG('<path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6"/>'),
    gear: SVG('<circle cx="12" cy="12" r="3.1"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11a2 2 0 1 1 0 4Z"/>'),
    dots: SVG('<circle cx="12" cy="5.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="18.5" r="1.3" fill="currentColor" stroke="none"/>'),
    search: SVG('<circle cx="10.8" cy="10.8" r="6.4"/><path d="M15.5 15.5 20 20"/>'),
    refresh: SVG('<path d="M20 11.5a8 8 0 1 1-2.6-5.4"/><path d="M20 4v5h-5"/>'),
    down: SVG('<path d="M12 4v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
    copy: SVG('<rect x="9" y="9" width="11" height="11" rx="2.2"/><path d="M5.5 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v.5"/>'),
    trash: SVG('<path d="M4.5 7h15"/><path d="M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7"/><path d="M6.5 7l.8 12a1 1 0 0 0 1 .9h7.4a1 1 0 0 0 1-.9l.8-12"/>'),
    wrench: SVG('<path d="M14.8 6.2a4.5 4.5 0 0 0 5.9 5.9l-8.4 8.4a2.1 2.1 0 0 1-3-3l8.4-8.4"/><path d="M14.8 6.2 17.9 3"/>'),
    back: SVG('<path d="M15 5.5 8.5 12l6.5 6.5"/>'),
    pie: SVG('<circle cx="12" cy="12" r="8.6"/><path d="M12 12V3.4"/><path d="M12 12l7.4 4.3"/>'),
    robux: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.05 1.1 13.4 3.6 10.9 12.95 1.55 10.45 4.05 1.1Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M6.6 5.05 10 5.96 9.1 9.36 5.7 8.45 6.6 5.05Z" fill="currentColor"/></svg>`
  };

  /* Robux glyph.
   *
   * Roblox ships .icon-robux-NxN sprites in CSS that is already loaded on
   * every page we run on, so we reference their icon instead of bundling a
   * copy of their artwork. Their sprite is drawn for the site's dark theme,
   * so in our light theme (and anywhere the CSS is missing) we fall back to
   * our own currentColor glyph, which stays legible either way.
   */
  let HAS_RBX_SPRITE = null;
  function spriteAvailable() {
    if (HAS_RBX_SPRITE !== null) return HAS_RBX_SPRITE;
    try {
      const probe = document.createElement('span');
      probe.className = 'icon-robux-16x16';
      probe.style.cssText = 'position:absolute;left:-9999px';
      document.body.appendChild(probe);
      const bg = getComputedStyle(probe).backgroundImage;
      probe.remove();
      HAS_RBX_SPRITE = !!bg && bg !== 'none';
    } catch (e) { HAS_RBX_SPRITE = false; }
    return HAS_RBX_SPRITE;
  }

  // size: 16 | 28 — matches the sizes Roblox itself defines
  function robuxGlyph(size) {
    if (effectiveTheme() === 'dark' && spriteAvailable()) {
      return `<span class="icon-robux-${size || 16}x${size || 16} rst-rbxs"></span>`;
    }
    return `<span class="rst-rbx">${ICONS.robux}</span>`;
  }

  // Robux amount, rendered with the coin glyph like the rest of the site.
  const rbx = (n, cls) => `<span class="${cls || ''}">${robuxGlyph(16)}${fmt(n)}</span>`;

  /* ------------------------------------------------------------------ *
   * Launchers — sidebar entry, Transactions-page button, floating fallback
   * ------------------------------------------------------------------ */
  function mountLauncher() {
    buildFab();
    let tries = 0;
    const tick = () => {
      const a = trySidebarMount();
      const b = tryPageMount();
      fab.classList.toggle('hide', a || b);
      if (++tries > 40) clearInterval(iv);
    };
    tick();
    const iv = setInterval(tick, 500);
    try {
      new MutationObserver(() => {
        if (!document.getElementById('rst-sidebtn')) trySidebarMount();
        if (!document.getElementById('rst-pagebtn')) tryPageMount();
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  // Clones the markup + classes of a real sidebar link so it inherits
  // Roblox's hover states, spacing and icon colour exactly.
  function trySidebarMount() {
    if (document.getElementById('rst-sidebtn')) return true;
    const home = document.querySelector('.left-nav nav ul li a[href*="/home"]');
    const ul = home && home.closest('ul');
    if (!ul) return false;

    const li = document.createElement('li');
    li.innerHTML = `
      <a id="rst-sidebtn" href="#" class="${home.className}">
        <div role="presentation" class="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)]"></div>
        <span class="size-1000 grow-0 shrink-0 basis-auto flex justify-center items-center">
          <span class="rst-glyph">${ICONS.pie}</span>
        </span>
        <span class="min-width-0 text-truncate-end text-no-wrap">Robux Tracker</span>
      </a>`;
    ul.appendChild(li);
    li.querySelector('#rst-sidebtn').addEventListener('click', e => { e.preventDefault(); togglePanel(); });
    return true;
  }

  function tryPageMount() {
    if (document.getElementById('rst-pagebtn')) return true;
    const h1 = document.querySelector('.user-transactions-container .container-header h1');
    if (!h1) return false;
    const b = document.createElement('button');
    b.id = 'rst-pagebtn';
    b.type = 'button';
    b.innerHTML = ICONS.pie + 'Robux Tracker';
    b.addEventListener('click', togglePanel);
    h1.appendChild(b);
    return true;
  }

  function buildFab() {
    fab = document.createElement('button');
    fab.id = 'rst-fab';
    fab.title = 'Robux Tracker';
    fab.innerHTML = ICONS.pie + '<span class="lbl">Robux Tracker</span>';
    document.body.appendChild(fab);

    if (cfg.fabPos) { fab.style.right = 'auto'; fab.style.bottom = 'auto'; fab.style.left = cfg.fabPos.x + 'px'; fab.style.top = cfg.fabPos.y + 'px'; }

    let drag = null;
    fab.addEventListener('mousedown', e => {
      const r = fab.getBoundingClientRect();
      drag = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
      drag.moved = true;
      const x = Math.max(4, Math.min(innerWidth - 50, drag.ox + dx));
      const y = Math.max(4, Math.min(innerHeight - 50, drag.oy + dy));
      fab.style.right = 'auto'; fab.style.bottom = 'auto';
      fab.style.left = x + 'px'; fab.style.top = y + 'px';
    });
    window.addEventListener('mouseup', () => {
      if (!drag) return;
      if (drag.moved) {
        const r = fab.getBoundingClientRect();
        cfg.fabPos = { x: Math.round(r.left), y: Math.round(r.top) };
        saveCfg();
      } else togglePanel();
      drag = null;
    });
  }

  /* ------------------------------------------------------------------ *
   * Panel markup
   * ------------------------------------------------------------------ */
  function buildPanel() {
    overlay = document.createElement('div');
    overlay.id = 'rst-overlay';
    overlay.innerHTML = `
      <div id="rst-panel" data-theme="${effectiveTheme()}">

        <header class="rst-top">
          <div class="rst-brand">
            <span class="rst-logo">${ICONS.logo}</span>
            <div>
              <div class="rst-title">Robux Tracker</div>
              <div class="rst-sub" id="rst-sub">—</div>
            </div>
          </div>
          <div class="sp"></div>
          <button class="rst-cta" data-act="primary" id="rst-primary">Scan purchases</button>
          <button class="rst-ico" data-act="menu" title="More">${ICONS.dots}</button>
          <button class="rst-ico" data-act="settings" title="Settings">${ICONS.gear}</button>
          <button class="rst-ico" id="rst-close" title="Close (Esc)">${ICONS.close}</button>
        </header>

        <div class="rst-scan" id="rst-scan">
          <span class="rst-spin"></span>
          <span class="txt" id="rst-status">Idle</span>
          <span class="clock" id="rst-elapsed"></span>
          <button class="mini" data-act="pause">Pause</button>
          <button class="mini" data-act="stop">Stop</button>
          <span class="bar"><i></i></span>
        </div>

        <div class="rst-toast" id="rst-toast"><span id="rst-toast-text"></span><span class="x" data-act="dismiss">✕</span></div>

        <div class="rst-hero" id="rst-hero"></div>

        <nav class="rst-tabs">
          <button class="rst-tab on" data-tab="games">Games</button>
          <button class="rst-tab" data-tab="items">Items</button>
          <button class="rst-tab" data-tab="money">Money</button>
          <button class="rst-tab" data-tab="timeline">Timeline</button>
          <button class="rst-tab" data-tab="sellers">Creators</button>
          <button class="rst-tab" data-tab="year">Year in review</button>
        </nav>

        <div class="rst-tools">
          <label class="rst-field">${ICONS.search}
            <input class="rst-search" id="rst-search" placeholder="Search a game, item or creator…">
          </label>
          <select class="rst-select" id="rst-sort">
            <option value="total">Most spent</option>
            <option value="count">Most purchases</option>
            <option value="recent">Most recent</option>
            <option value="name">Name A–Z</option>
          </select>
          <select class="rst-select" id="rst-range">
            <option value="all">All time</option>
            <option value="ytd">This year</option>
            <option value="365">Last 12 months</option>
            <option value="90">Last 90 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>

        <div class="rst-body" id="rst-body"></div>

        <div class="rst-menu" id="rst-menu">
          <button data-act="update">${ICONS.refresh} Check for new purchases</button>
          <button data-act="scan">${ICONS.refresh} Rescan everything</button>
          <button data-act="resume" id="rst-resume-btn">${ICONS.refresh} Resume interrupted scan</button>
          <hr>
          <button data-act="csv">${ICONS.down} Export CSV</button>
          <button data-act="json">${ICONS.down} Export JSON</button>
          <button data-act="copy">${ICONS.copy} Copy summary</button>
          <hr>
          <button data-act="diag">${ICONS.wrench} Troubleshoot</button>
          <button data-act="clear" class="danger">${ICONS.trash} Delete local data</button>
        </div>

        <section class="rst-sheet" id="rst-sheet">
          <header class="rst-top">
            <button class="rst-ico" data-act="closesheet" title="Back">${ICONS.back}</button>
            <div class="rst-brand"><div><div class="rst-title">Settings</div>
              <div class="rst-sub">Everything is stored locally in your browser</div></div></div>
          </header>
          <div class="body">
            <div class="rst-set">
              <h4>What to track</h4>
              <p>“Purchases” is what you spent inside games. The green ones are Robux coming in — turn them on to compare in against out.</p>
              <div class="rst-types" id="rst-typebar"></div>
            </div>

            <div class="rst-set">
              <h4>Display</h4>
              <label class="rst-switch"><input type="checkbox" id="rst-usd" ${cfg.showUsd ? 'checked' : ''}>
                <span>Show what it would cost in dollars<span class="sub" id="rst-usd-note"></span></span></label>
              <label class="rst-switch"><input type="checkbox" id="rst-premium" ${cfg.premium ? 'checked' : ''}>
                <span>I have Roblox Premium<span class="sub">Premium gives more Robux per pack, so the money figures change</span></span></label>

              <div class="row" style="margin-top:12px">
                <span class="rst-flabel">Currency</span>
                <select class="rst-select" id="rst-curmode">
                  <option value="auto">Detected from my Buy Robux page</option>
                  <option value="usd">US dollars</option>
                  <option value="custom">Something else…</option>
                </select>
              </div>
              <div class="row" id="rst-custom-row" style="margin-top:8px">
                <span class="rst-flabel">Show as</span>
                <select class="rst-select" id="rst-cursym">
                  ${['$', '€', '£', 'R$', 'C$', 'A$', '¥', '₹', '₽', '₺', 'kr', 'zł', 'R', '₩', '₪', 'CHF'].map(s =>
                    `<option value="${s}" ${cfg.curSymbol === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
                <span class="rst-flabel">and 1,000 R$ costs</span>
                <input class="rst-num" id="rst-curper" type="number" min="0.01" step="0.01" value="${cfg.curPer1000}">
              </div>

              <div class="row" style="margin-top:10px">
                <span class="rst-flabel">Price everything using</span>
                <select class="rst-select" id="rst-refpack"></select>
              </div>
              <p style="margin:8px 0 0" id="rst-rate-note"></p>

              <div class="row" style="margin-top:10px">
                <a class="rst-cta sec" style="text-decoration:none;display:inline-flex;align-items:center;padding:0 14px;line-height:38px"
                   href="https://www.roblox.com/upgrades/robux" target="_blank" rel="noreferrer">Detect my local prices</a>
              </div>
              <label class="rst-switch"><input type="checkbox" id="rst-merge" ${cfg.smartMerge ? 'checked' : ''}>
                <span>Group loose purchases by creator<span class="sub">Attaches purchases with no game info to that creator's game when there's only one</span></span></label>
              <div class="row" style="margin-top:10px">
                <span class="rst-flabel">Theme</span>
                <select class="rst-select" id="rst-theme-sel">
                  <option value="auto">Match Roblox</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>

            <div class="rst-set">
              <h4>Scan speed</h4>
              <p id="rst-speed-note"></p>
              <label class="rst-switch"><input type="checkbox" id="rst-turbo" ${cfg.turbo ? 'checked' : ''}>
                <span>Faster scanning<span class="sub">Reads ${MAX_LANES} pages at a time instead of one. Off by default — the steady pace is
                gentler on Roblox and a first scan only happens once.</span></span></label>
              <div class="row" style="margin-top:8px">
                <span class="rst-flabel">Pause between requests</span>
                <input class="rst-num" id="rst-delay" type="number" min="${MIN_DELAY_MS}" step="50" value="${cfg.delayMs}">
                <span class="rst-flabel">ms (minimum ${MIN_DELAY_MS})</span>
              </div>
            </div>

            <div class="rst-set">
              <h4>Scan log</h4>
              <p>The last scan, page by page. Useful only if something looks wrong.</p>
              <pre class="rst-log" id="rst-log">Nothing scanned yet.</pre>
            </div>
          </div>
        </section>
      </div>`;
    document.body.appendChild(overlay);

    const diag = document.createElement('div');
    diag.id = 'rst-diag';
    diag.innerHTML = `
      <div class="box">
        <div class="rst-top">
          <div class="rst-brand"><div><div class="rst-title">Troubleshoot</div>
            <div class="rst-sub">Send this to whoever is helping you</div></div></div>
          <div class="sp"></div>
          <button class="rst-cta sec" id="rst-diag-copy">Copy</button>
          <button class="rst-ico" id="rst-diag-close">${ICONS.close}</button>
        </div>
        <textarea id="rst-diag-text" readonly></textarea>
      </div>`;
    document.body.appendChild(diag);

    panel = overlay.querySelector('#rst-panel');
    $ = sel => overlay.querySelector(sel) || diag.querySelector(sel);

    renderTypeBar();
    $('#rst-sort').value = ui.sort;
    $('#rst-range').value = ui.range;
  }

  function renderTypeBar() {
    const bar = $('#rst-typebar');
    if (!bar) return;
    bar.innerHTML = TYPE_CATALOG.map(t =>
      `<span class="rst-type ${t.kind === 'in' ? 'in' : ''} ${cfg.types.includes(t.id) ? 'on' : ''}"
        data-type="${t.id}" title="${escapeHtml(t.hint)}">${escapeHtml(t.label)}</span>`).join('');
  }

  /* ------------------------------------------------------------------ *
   * Status / chrome
   * ------------------------------------------------------------------ */
  function setStatus(t) { const el = document.getElementById('rst-status'); if (el) el.textContent = t; }

  function toast(msg, kind) {
    const t = document.getElementById('rst-toast');
    if (!t) return;
    document.getElementById('rst-toast-text').textContent = msg;
    t.className = 'rst-toast on ' + (kind || 'warn');
  }
  function clearToast() {
    const t = document.getElementById('rst-toast');
    if (t) t.className = 'rst-toast';
  }

  function setButtons() {
    if (!overlay) return;
    const primary = $('#rst-primary');
    if (primary) {
      primary.textContent = state.running ? 'Scanning…'
        : state.records.length ? 'Check for new' : 'Scan purchases';
      primary.disabled = state.running;
    }
    const scan = document.getElementById('rst-scan');
    if (scan) scan.classList.toggle('on', state.running);
    if (fab) fab.classList.toggle('busy', state.running);
    // the launchers show progress too, so a scan is visible with the panel shut
    ['rst-sidebtn', 'rst-pagebtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.toggle('rst-scanning', state.running);
        el.title = state.running ? 'Robux Tracker — scanning…' : 'Robux Tracker';
      }
    });

    const p = $('[data-act="pause"]');
    if (p) p.textContent = state.paused ? 'Continue' : 'Pause';

    const res = $('#rst-resume-btn');
    if (res) res.style.display = store.get('progress', null) ? 'flex' : 'none';

    const sub = $('#rst-sub');
    if (sub) {
      sub.textContent = state.lastScan
        ? `${fmt(state.records.length)} purchases · updated ${ago(state.lastScan)}`
        : 'Nothing scanned yet';
    }
    const elp = document.getElementById('rst-elapsed');
    if (elp && !state.running) elp.textContent = '';
    const log = document.getElementById('rst-log');
    if (log && state.log.length) log.textContent = state.log.join('\n');
    const un = document.getElementById('rst-usd-note');
    if (un) {
      const src = priceSource();
      un.textContent = src
        ? `Your own store prices (${src.tiers.length} packs in ${src.symbol}) were read from the Buy Robux page ${ago(src.detectedAt)}.`
        : 'Using built-in US prices — open the Buy Robux page once and your region and currency get picked up automatically.';
    }
    const note = document.getElementById('rst-speed-note');
    if (note) {
      note.textContent = state.lastPace
        ? `Your last scan ran at about ${state.lastPace} pages per minute.`
        : 'Roblox limits how fast this data can be pulled, so a first full scan takes a few minutes. After that, “Check for new” only reads what changed.';
    }
  }

  /* ------------------------------------------------------------------ *
   * Hero summary
   * ------------------------------------------------------------------ */
  // keeps the currency controls in sync with each other
  function refreshPricingUI() {
    if (!overlay) return;
    const mode = $('#rst-curmode');
    if (mode) mode.value = cfg.priceMode;

    const customRow = $('#rst-custom-row');
    if (customRow) customRow.style.display = cfg.priceMode === 'custom' ? 'flex' : 'none';

    const packs = $('#rst-refpack');
    if (packs) {
      const list = cfg.priceMode === 'usd'
        ? (cfg.premium ? PRICE_TIERS.premium : PRICE_TIERS.base)
        : tiers();
      packs.innerHTML = list.map(([r, p]) =>
        `<option value="${r}" ${refPack()[0] === r ? 'selected' : ''}>${fmt(r)} R$ — ${cfg.priceMode === 'usd' ? '$' + p.toFixed(2) : moneyStr(p)}</option>`).join('');
      packs.disabled = cfg.priceMode === 'custom';
    }

    const note = $('#rst-rate-note');
    if (note) {
      const u = unitPrice();
      note.innerHTML = `Everything is valued at <b>${moneyStr(u.perRobux * 1000)} per 1,000 R$</b> — ${escapeHtml(u.label)}. ` +
        `Buying bigger packs is cheaper per Robux, so treat this as a fair middle estimate, not a receipt.`;
    }

    const pm = document.getElementById('rst-premium');
    if (pm) pm.closest('.rst-switch').style.display = (cfg.priceMode === 'usd') ? 'flex' : 'none';
  }

  const RANGE_LABELS ={ all: 'all time', ytd: 'this year', 365: 'last 12 months', 90: 'last 90 days', 30: 'last 30 days' };
  const rangeLabel = () => RANGE_LABELS[ui.range] || 'all time';

  // sub goes on its own line — inlining it made narrow cards wrap mid-phrase
  const msCard = (k, v, sub) =>
    `<div class="rst-ms"><div class="k">${k}</div><div class="v">${v}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div>`;

  const monthYear = t => new Date(t).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

  function renderStats() {
    if (!overlay) return;
    const hero = $('#rst-hero');
    if (!hero) return;

    const spend = spendRecords();
    const income = incomeRecords();
    const total = spend.reduce((s, r) => s + (r.amount || 0), 0);
    const inTotal = income.reduce((s, r) => s + (r.amount || 0), 0);
    const games = buildGames(spend);
    const attributed = games.filter(g => g.attributed);
    const { min, max } = dateRange(spend);
    const days = (min && max) ? Math.max(1, Math.round((max - min) / 864e5)) : 0;
    const biggest = spend.reduce((m, r) => Math.max(m, r.amount || 0), 0);

    if (!state.records.length) { hero.innerHTML = ''; return; }

    const cards = [
      msCard('Purchases', fmt(spend.length)),
      msCard('Games', fmt(attributed.length)),
      msCard('Average', rbx(spend.length ? total / spend.length : 0), 'per purchase'),
      msCard('Biggest', rbx(biggest), 'single purchase'),
      msCard('Per month', rbx(days ? total / (days / 30.44) : 0), 'on average'),
      msCard('Tracked', `${fmt(days)} <small>days</small>`, min ? 'since ' + monthYear(min) : '')
    ];
    if (income.length) cards.unshift(msCard('Robux in', rbx(inTotal), 'bought or earned'));

    // What the Robux actually cost, reconciled from the packs you bought.
    const mon = tracksCurrency() ? moneyStats() : null;
    if (mon && mon.paid > 0) {
      cards.unshift(msCard('Really paid', moneyStr(mon.paid), 'for Robux, all in'));
    }

    // category split, biggest first — fills out the total card and is genuinely useful
    const catTotals = new Map();
    for (const r of spend) {
      if (!r.amount) continue;
      const c = categoryOf(r.itemType);
      catTotals.set(c, (catTotals.get(c) || 0) + r.amount);
    }
    const cats = [...catTotals.entries()].sort((a, b) => b[1] - a[1]);
    const split = total > 0 && cats.length ? `
      <div class="rst-split">
        <div class="rst-catbar">${cats.map(([c, v]) =>
          `<i style="width:${(v / total) * 100}%;background:${catColor(c)}" title="${escapeHtml(c)}: ${fmt(v)} R$"></i>`).join('')}</div>
        <div class="rst-splitkey">${cats.slice(0, 3).map(([c, v]) =>
          `<span><i style="background:${catColor(c)}"></i>${escapeHtml(c)} <b>${((v / total) * 100).toFixed(0)}%</b></span>`).join('')}</div>
      </div>` : '';

    hero.innerHTML = `
      <div class="rst-total">
        <div class="k">Total spent · ${rangeLabel()}</div>
        <div class="v">${robuxGlyph(28)}${fmt(total)}</div>
        ${cfg.showUsd ? `<div class="usd">${mon && mon.paid > 0
            ? `worth about <b>${moneyStr((total / Math.max(1, mon.matchedRobux)) * mon.paid)}</b> at what you actually paid per Robux`
            : `that's about <b>${usd(total)}</b> of Robux`}</div>` : ''}
        ${split}
      </div>
      <div class="rst-mini-stats">${cards.join('')}</div>`;
  }

  function paintIcons() {
    if (!overlay) return;
    overlay.querySelectorAll('img[data-uni]').forEach(img => {
      const u = img.getAttribute('data-uni');
      if (u && ui.iconCache[u] && img.src !== ui.iconCache[u]) img.src = ui.iconCache[u];
    });
  }

  function paintIcons() {
    if (!overlay) return;
    overlay.querySelectorAll('img[data-uni]').forEach(img => {
      const u = img.getAttribute('data-uni');
      if (u && ui.iconCache[u] && img.src !== ui.iconCache[u]) img.src = ui.iconCache[u];
    });
  }

  const CAT_COLORS = {
    'Game Passes': '#00a2ff', 'Dev Products': '#a077ff', 'Private Servers': '#ff9a4d',
    'Subscriptions': '#ff6fae', 'Bundles': '#4dd6c1', 'Catalog / Avatar': '#f2d24d',
    'Ads / Fees': '#8d98a8', 'Other': '#5a6472'
  };
  const catColor = c => CAT_COLORS[c] || '#5a6472';
  const catChipClass = c => c === 'Game Passes' ? 'pass' : c === 'Dev Products' ? 'prod' : c === 'Private Servers' ? 'serv' : '';

  /* ------------------------------------------------------------------ *
   * Views
   * ------------------------------------------------------------------ */
  function render() {
    if (!overlay) return;
    renderStats();
    setButtons();
    const body = $('#rst-body');

    if (!state.records.length) {
      body.innerHTML = `<div class="rst-empty">
        <div class="ico">${ICONS.logo}</div>
        <h3>See where your Robux actually went</h3>
        <p>This reads your own purchase history from Roblox and adds it up per game —
           every game pass, dev product and private server, and how many times you bought each one.</p>
        <div class="rst-steps">
          <div class="rst-step"><div class="n">1</div><b>Scan once</b>
            <span>Reads your history a page at a time. A few minutes if you've been playing a while.</span></div>
          <div class="rst-step"><div class="n">2</div><b>Browse</b>
            <span>Open any game to see what you bought there and how often.</span></div>
          <div class="rst-step"><div class="n">3</div><b>Keep it fresh</b>
            <span>“Check for new” afterwards only reads what changed — seconds, not minutes.</span></div>
        </div>
        <button class="rst-cta" data-act="primary">Scan my purchases</button>
        <div class="rst-note">Nothing leaves your browser and nothing is changed on your account — this only reads.</div>
      </div>`;
      return;
    }

    // search/sort/range only apply to the list views
    const tools = panel.querySelector('.rst-tools');
    if (tools) tools.style.display = (ui.tab === 'money' || ui.tab === 'year') && !ui.gameKey ? 'none' : 'flex';

    if (ui.gameKey) { renderGameDetail(body); return; }
    if (ui.tab === 'games') renderGames(body);
    else if (ui.tab === 'items') renderItems(body);
    else if (ui.tab === 'money') renderMoney(body);
    else if (ui.tab === 'timeline') renderTimeline(body);
    else if (ui.tab === 'year') renderYear(body);
    else renderSellers(body);
  }

  function renderGames(body) {
    const recs = ui.cat ? spendRecords().filter(r => categoryOf(r.itemType) === ui.cat) : spendRecords();
    const games = sortGames(buildGames(recs));
    const shown = games.filter(g => matchesQuery(g, ui.q));
    const grand = games.reduce((s, g) => s + g.total, 0) || 1;
    const shownTotal = shown.reduce((s, g) => s + g.total, 0);

    if (!games.length) {
      body.innerHTML = `<div class="rst-empty"><div class="ico">${ICONS.search}</div>
        <h3>Nothing here looks like game spending</h3>
        <p>${fmt(state.records.length)} records are stored, but none of them carry a Robux amount.
        Open Settings and make sure <b>Purchases</b> is switched on, then rescan.</p></div>`;
      return;
    }
    if (!shown.length) {
      body.innerHTML = `<div class="rst-empty"><div class="ico">${ICONS.search}</div>
        <h3>No matches</h3><p>Nothing matches “${escapeHtml(ui.q)}”.</p></div>`;
      return;
    }

    const allCats = new Map();
    for (const g of games) for (const [c, v] of g.cats) allCats.set(c, (allCats.get(c) || 0) + v);
    const catChips = [...allCats.entries()].sort((a, b) => b[1] - a[1]);

    let html = catChips.length > 1 ? `<div class="rst-cats">
      <span class="rst-type ${!ui.cat ? 'on' : ''}" data-cat="">Everything</span>
      ${catChips.map(([c, v]) => `<span class="rst-type ${ui.cat === c ? 'on' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)} · ${fmt(v)}</span>`).join('')}
    </div>` : '';

    html += `<div class="rst-summary">${fmt(shown.length)} ${shown.length === 1 ? 'game' : 'games'}${ui.q ? ' matching' : ''} ·
      <b style="color:var(--money)">${fmt(shownTotal)} R$</b>${cfg.showUsd ? ` (about ${usd(shownTotal)})` : ''}</div>`;

    shown.slice(0, 300).forEach((g, i) => {
      const cats = [...g.cats.entries()].sort((a, b) => b[1] - a[1]);
      const chips = cats.slice(0, 3).map(([c, v]) => `<span class="rst-chip ${catChipClass(c)}">${escapeHtml(c)} ${fmt(v)}</span>`).join('');
      const inf = g.hasInferred ? '<span class="rst-chip inf">grouped by creator</span>' : '';
      const pct = (g.total / grand) * 100;
      html += `
        <div class="rst-game" data-game="${escapeHtml(g.key)}">
          <div class="rank">${i + 1}</div>
          <img data-uni="${g.universeId || ''}" src="${g.universeId && ui.iconCache[g.universeId] ? escapeHtml(ui.iconCache[g.universeId]) : ''}" alt="">
          <div class="nm">
            <b>${escapeHtml(g.label)}</b>
            <div class="meta">${fmt(g.count)} ${g.count === 1 ? 'purchase' : 'purchases'} ·
              ${fmt(g.items.size)} ${g.items.size === 1 ? 'item' : 'different items'} · last ${ago(g.last)}</div>
            <div class="rst-chips">${chips}${inf}</div>
            <div class="rst-meter"><i style="width:${Math.max(2, pct)}%"></i></div>
          </div>
          <div class="amt">
            <b>${robuxGlyph(16)}${fmt(g.total)}</b>
            <small>${cfg.showUsd ? usd(g.total) + ' · ' : ''}${pct.toFixed(1)}%</small>
          </div>
        </div>`;
    });

    if (shown.length > 300) html += `<div class="rst-note">Showing the top 300 of ${fmt(shown.length)} groups.</div>`;
    const r = dateRange(recs);
    if (r.min) html += `<div class="rst-note">History returned by Roblox spans ${dstr(r.min)} → ${dstr(r.max)}.</div>`;

    body.innerHTML = html;
    fetchIcons(shown.slice(0, 120).map(g => g.universeId)).then(paintIcons);
  }

  function renderGameDetail(body) {
    const g = buildGames(spendRecords()).find(x => x.key === ui.gameKey);
    if (!g) { ui.gameKey = null; render(); return; }

    const cats = [...g.cats.entries()].sort((a, b) => b[1] - a[1]);
    const items = [...g.items.values()].sort((a, b) => b.total - a.total || b.count - a.count);
    const visible = ui.q ? items.filter(i => i.name.toLowerCase().includes(ui.q) || i.cat.toLowerCase().includes(ui.q)) : items;
    const gameUrl = g.placeId ? `https://www.roblox.com/games/${g.placeId}` : null;
    const mostBought = items.slice().sort((a, b) => b.count - a.count)[0];

    let html = `
      <button class="rst-back" data-act="back">${ICONS.back} All games</button>
      <div class="rst-dhead">
        <img data-uni="${g.universeId || ''}" src="${g.universeId && ui.iconCache[g.universeId] ? escapeHtml(ui.iconCache[g.universeId]) : ''}" alt="">
        <div style="min-width:0">
          <h2>${escapeHtml(g.label)}</h2>
          <div class="meta">
            ${g.sellerName ? 'by ' + escapeHtml(g.sellerName) : 'creator unknown'}
            ${gameUrl ? ` · <a class="rst-link" href="${gameUrl}" target="_blank" rel="noreferrer">open on Roblox ↗</a>` : ''}
            <br>${fmt(g.count)} purchases · ${fmt(g.items.size)} different items · first ${dstr(g.first)}, last ${dstr(g.last)}
            ${mostBought ? `<br>most bought: <b style="color:var(--tx)">${escapeHtml(mostBought.name)} ×${fmt(mostBought.count)}</b>` : ''}
          </div>
        </div>
        <div class="big">
          <b>${robuxGlyph(28)}${fmt(g.total)}</b>
          <small>${cfg.showUsd ? 'about ' + usd(g.total) : 'Robux spent here'}</small>
        </div>
      </div>

      <div class="rst-catbar">
        ${cats.map(([c, v]) => `<i style="width:${(v / g.total) * 100}%;background:${catColor(c)}" title="${escapeHtml(c)}: ${fmt(v)}"></i>`).join('')}
      </div>
      <div class="rst-catkey">
        ${cats.map(([c, v]) => `<span><i style="background:${catColor(c)}"></i>${escapeHtml(c)} — <b style="color:var(--tx)">${fmt(v)} R$</b> (${((v / g.total) * 100).toFixed(0)}%)</span>`).join('')}
      </div>

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">
        <button class="rst-cta sec" data-act="csv-game" style="height:32px;padding:0 12px;font-size:13px">Export this game</button>
        <span style="font-size:12.5px;color:var(--tx2)">Tap an item to see every purchase and when you made it.</span>
      </div>`;

    const byCat = new Map();
    visible.forEach(i => { if (!byCat.has(i.cat)) byCat.set(i.cat, []); byCat.get(i.cat).push(i); });
    const orderedCats = [...byCat.keys()].sort((a, b) => {
      const ia = CAT_ORDER.indexOf(a), ib = CAT_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });

    for (const cat of orderedCats) {
      const list = byCat.get(cat).sort((a, b) => b.total - a.total);
      const catTotal = list.reduce((s, i) => s + i.total, 0);
      const catCount = list.reduce((s, i) => s + i.count, 0);
      html += `<div class="rst-secttl"><i style="width:9px;height:9px;border-radius:3px;background:${catColor(cat)};display:inline-block"></i>
        <b>${escapeHtml(cat)}</b> — ${fmt(catTotal)} R$ over ${fmt(catCount)} ${catCount === 1 ? 'purchase' : 'purchases'}</div>`;

      for (const it of list) {
        html += `
          <div class="rst-item" data-item="${escapeHtml(it.key)}">
            <div class="x">×${fmt(it.count)}</div>
            <div class="nm"><b>${escapeHtml(it.name)}</b>
              <small>${fmt(it.total / it.count)} R$ each · last bought ${dstr(it.last)}</small></div>
            <div class="tot">${robuxGlyph(16)}${fmt(it.total)}${cfg.showUsd ? `<small>${usd(it.total)}</small>` : ''}</div>
          </div>`;
        if (ui.expanded.has(it.key)) {
          const txs = it.txs.slice().sort((a, b) => new Date(b.created) - new Date(a.created));
          html += `<div class="rst-txs">` + txs.slice(0, 300).map(t =>
            `<div class="rst-tx"><span>${dtstr(t.created)}${t.pending ? ' <span style="color:var(--warn)">(pending)</span>' : ''}</span><b>${fmt(t.amount)} R$</b></div>`
          ).join('') + (txs.length > 300 ? `<div class="rst-note">…and ${fmt(txs.length - 300)} more</div>` : '') + `</div>`;
        }
      }
    }

    if (!visible.length) html += `<div class="rst-empty">No items match “${escapeHtml(ui.q)}” in this game.</div>`;
    body.innerHTML = html;
    fetchIcons([g.universeId]).then(paintIcons);
  }

  function renderItems(body) {
    let items = allItems(spendRecords());
    if (ui.q) items = items.filter(i => i.name.toLowerCase().includes(ui.q) || (i.game || '').toLowerCase().includes(ui.q) || i.cat.toLowerCase().includes(ui.q));
    items.sort((a, b) => ui.sort === 'count' ? b.count - a.count : ui.sort === 'recent' ? (b.last || 0) - (a.last || 0)
      : ui.sort === 'name' ? a.name.localeCompare(b.name) : b.total - a.total);

    if (!items.length) { body.innerHTML = `<div class="rst-empty">Nothing matches.</div>`; return; }

    body.innerHTML = `<table class="rst-table">
      <thead><tr><th>#</th><th>Item</th><th>Category</th><th>Where</th>
        <th class="r">Bought</th><th class="r">Each</th><th class="r">Total</th><th class="r">Last</th></tr></thead>
      <tbody>${items.slice(0, 500).map((i, n) => `
        <tr><td style="color:var(--tx2)">${n + 1}</td>
          <td><b>${escapeHtml(i.name)}</b></td>
          <td><span class="rst-chip ${catChipClass(i.cat)}">${escapeHtml(i.cat)}</span></td>
          <td style="color:var(--tx2);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(i.game || '—')}</td>
          <td class="r"><b>×${fmt(i.count)}</b></td>
          <td class="r">${fmt(i.total / i.count)}</td>
          <td class="r g">${fmt(i.total)}</td>
          <td class="r" style="color:var(--tx2)">${dstr(i.last)}</td></tr>`).join('')}
      </tbody></table>
      ${items.length > 500 ? `<div class="rst-note">Showing top 500 of ${fmt(items.length)} distinct items.</div>` : ''}
      ${repeatsHtml()}${biggestHtml()}`;
  }

  // Things you bought more than once, ranked by what the repeats cost you.
  function repeatsHtml() {
    const rep = repeatBuys().slice(0, 20);
    if (!rep.length) return '';
    return `<div class="rst-secttl"><b>You went back for these</b></div>
      <table class="rst-table">
        <thead><tr><th>Item</th><th>Where</th><th class="r">Times</th><th class="r">Each</th><th class="r">Total</th></tr></thead>
        <tbody>${rep.map(r => `
          <tr><td><b>${escapeHtml(r.name)}</b></td>
            <td style="color:var(--tx2);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(r.where || '—')}</td>
            <td class="r"><b>×${fmt(r.count)}</b></td>
            <td class="r">${fmt(r.total / r.count)}</td>
            <td class="r g">${fmt(r.total)}</td></tr>`).join('')}
        </tbody></table>`;
  }

  // The single transactions that actually moved the needle.
  function biggestHtml() {
    const big = biggestPurchases(25);
    if (!big.length) return '';
    return `<div class="rst-secttl"><b>Biggest single purchases</b></div>
      <table class="rst-table">
        <thead><tr><th>#</th><th>Item</th><th>Game</th><th class="r">Robux</th><th class="r">When</th></tr></thead>
        <tbody>${big.map((r, i) => `
          <tr><td style="color:var(--tx2)">${i + 1}</td>
            <td><b>${escapeHtml(r.itemName || r.itemType || 'Item')}</b></td>
            <td style="color:var(--tx2);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(r.placeName || r.sellerName || '—')}</td>
            <td class="r g">${fmt(r.amount)}</td>
            <td class="r" style="color:var(--tx2)">${dstr(r.created)}</td></tr>`).join('')}
        </tbody></table>`;
  }

  function renderTimeline(body) {
    const months = monthly(spendRecords());
    if (!months.length) { body.innerHTML = `<div class="rst-empty">No dated purchases in this range.</div>`; return; }
    const max = Math.max(...months.map(m => m.total)) || 1;

    const years = new Map();
    months.forEach(m => {
      const y = m.date.getFullYear();
      const e = years.get(y) || { total: 0, count: 0 };
      e.total += m.total; e.count += m.count; years.set(y, e);
    });
    const peak = months.reduce((a, b) => b.total > a.total ? b : a, months[0]);

    body.innerHTML = `
      <div class="rst-secttl"><span>Monthly spend</span></div>
      <div class="rst-chart">
        ${months.map(m => `<div class="bar${m.total ? '' : ' zero'}" style="height:${Math.max(2, (m.total / max) * 100)}%"
          title="${m.date.toLocaleString(undefined, { month: 'long', year: 'numeric' })}\n${fmt(m.total)} R$ · ${fmt(m.count)} purchase(s)"></div>`).join('')}
      </div>
      <div class="rst-axis"><span>${months[0].date.toLocaleString(undefined, { month: 'short', year: 'numeric' })}</span>
        <span>peak: ${peak.date.toLocaleString(undefined, { month: 'short', year: 'numeric' })} — ${fmt(peak.total)} R$</span>
        <span>${months[months.length - 1].date.toLocaleString(undefined, { month: 'short', year: 'numeric' })}</span></div>

      <div class="rst-secttl"><span>By year</span></div>
      <table class="rst-table">
        <thead><tr><th>Year</th><th class="r">Purchases</th><th class="r">Robux</th>${cfg.showUsd ? '<th class="r">≈ USD</th>' : ''}<th class="r">Avg / month</th></tr></thead>
        <tbody>${[...years.entries()].sort((a, b) => b[0] - a[0]).map(([y, e]) => `
          <tr><td><b>${y}</b></td><td class="r">${fmt(e.count)}</td><td class="r g">${fmt(e.total)}</td>
          ${cfg.showUsd ? `<td class="r">${usd(e.total)}</td>` : ''}<td class="r">${fmt(e.total / 12)}</td></tr>`).join('')}
        </tbody></table>

      <div class="rst-secttl"><span>Month by month</span></div>
      <table class="rst-table">
        <thead><tr><th>Month</th><th class="r">Purchases</th><th class="r">Robux</th>${cfg.showUsd ? '<th class="r">≈ USD</th>' : ''}</tr></thead>
        <tbody>${months.slice().reverse().map(m => `
          <tr><td>${m.date.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</td>
          <td class="r">${fmt(m.count)}</td><td class="r g">${fmt(m.total)}</td>
          ${cfg.showUsd ? `<td class="r">${usd(m.total)}</td>` : ''}</tr>`).join('')}
        </tbody></table>
      ${habitsHtml()}`;
  }

  function renderSellers(body) {
    const map = new Map();
    for (const r of spendRecords()) {
      if (!r.amount) continue;
      const key = r.sellerId != null ? String(r.sellerId) : (r.sellerName || 'unknown');
      const e = map.get(key) || { id: r.sellerId, name: r.sellerName || 'Unknown', total: 0, count: 0, games: new Set(), last: null };
      e.total += r.amount; e.count++;
      if (r.universeId) e.games.add(String(r.universeId));
      const t = r.created ? new Date(r.created).getTime() : null;
      if (t && (e.last === null || t > e.last)) e.last = t;
      map.set(key, e);
    }
    let sellers = [...map.values()];
    if (ui.q) sellers = sellers.filter(s => s.name.toLowerCase().includes(ui.q) || String(s.id) === ui.q);
    sellers.sort((a, b) => ui.sort === 'count' ? b.count - a.count : ui.sort === 'recent' ? (b.last || 0) - (a.last || 0)
      : ui.sort === 'name' ? a.name.localeCompare(b.name) : b.total - a.total);

    if (!sellers.length) { body.innerHTML = `<div class="rst-empty">Nothing matches.</div>`; return; }

    body.innerHTML = `<div class="rst-note" style="margin-bottom:10px">Who actually received your Robux.</div>
      <table class="rst-table">
      <thead><tr><th>#</th><th>Seller</th><th class="r">Games</th><th class="r">Purchases</th><th class="r">Robux</th>${cfg.showUsd ? '<th class="r">≈ USD</th>' : ''}<th class="r">Last</th></tr></thead>
      <tbody>${sellers.slice(0, 400).map((s, i) => `
        <tr><td style="color:var(--tx2)">${i + 1}</td>
          <td><b>${escapeHtml(s.name)}</b>${s.id ? ` <small style="color:var(--tx2)">#${s.id}</small>` : ''}</td>
          <td class="r">${fmt(s.games.size)}</td><td class="r">${fmt(s.count)}</td>
          <td class="r g">${fmt(s.total)}</td>${cfg.showUsd ? `<td class="r">${usd(s.total)}</td>` : ''}
          <td class="r" style="color:var(--tx2)">${dstr(s.last)}</td></tr>`).join('')}
      </tbody></table>`;
  }

  /* ------------------------------------------------------------------ *
   * Money — what you actually paid, reconciled from your Robux purchases
   * ------------------------------------------------------------------ */
  function renderMoney(body) {
    if (!tracksCurrency()) {
      body.innerHTML = `<div class="rst-empty">
        <div class="ico">${ICONS.logo}</div>
        <h3>Find out what you really paid</h3>
        <p>Your Robux purchases record the exact pack you bought each time, and pack sizes map
           straight onto prices. Track them and this stops being an estimate — it becomes the
           actual amount of money that left your account.</p>
        <button class="rst-cta" data-act="enable-currency">Track my Robux purchases</button>
        <div class="rst-note">Adds one more pass over your history. Same read-only access as everything else.</div>
      </div>`;
      return;
    }

    const m = moneyStats();
    if (!m.rows.length) {
      body.innerHTML = `<div class="rst-empty"><div class="ico">${ICONS.search}</div>
        <h3>No Robux purchases found yet</h3>
        <p>Currency purchases are switched on, but none are stored. Run
        <b>Rescan everything</b> from the ⋯ menu to pull them in.</p></div>`;
      return;
    }

    const spendTotal = spendRecords().reduce((s, r) => s + r.amount, 0);
    const rate = m.matchedRobux ? (m.paid / m.matchedRobux) * 1000 : 0;
    const spentValue = rate ? (spendTotal / 1000) * rate : 0;

    let html = `
      <div class="rst-money-top">
        <div class="rst-total" style="flex:1">
          <div class="k">You actually paid</div>
          <div class="v">${moneyStr(m.paid)}</div>
          <div class="usd">${fmt(m.matchedRobux)} R$ bought across ${fmt(m.matchedRows)} purchases${
            m.unmatchedRobux ? ` · <b style="color:var(--warn)">${fmt(m.unmatchedRobux)} R$ unmatched</b>` : ''}</div>
        </div>
        <div class="rst-mini-stats" style="flex:1.4">
          ${msCard('Your real rate', moneyStr(rate), 'per 1,000 R$')}
          ${msCard('Spent in games', rbx(spendTotal), rate ? 'worth ' + moneyStr(spentValue) : '')}
          ${msCard('Still unspent', rbx(Math.max(0, m.robux - spendTotal)), 'bought but not spent')}
          ${msCard('Purchases', fmt(m.rows.length), 'Robux top-ups')}
        </div>
      </div>`;

    if (m.unknown.length) {
      html += `<div class="rst-secttl"><b>Unmatched packs</b> — ${fmt(m.unmatchedRobux)} R$ not counted above</div>
        <div class="rst-note" style="margin:0 0 10px">
          These amounts don't match any pack we know — usually gift cards, promos, or prices from a
          region or platform with different bundles. Type what you paid and it gets included everywhere.
        </div>
        <table class="rst-table">
          <thead><tr><th>Robux</th><th class="r">Times</th><th class="r">What you paid, each</th></tr></thead>
          <tbody>${m.unknown.slice(0, 40).map(u => `
            <tr><td><b>${fmt(u.amount)} R$</b></td><td class="r">${fmt(u.count)}</td>
              <td class="r"><input class="rst-num" type="number" min="0" step="0.01"
                data-pack="${u.amount}" placeholder="${currencySymbol()}0.00"
                value="${packOverrides()[u.amount] != null ? packOverrides()[u.amount] : ''}"></td></tr>`).join('')}
          </tbody></table>`;
    }

    html += `<div class="rst-secttl"><b>Packs you bought</b></div>
      <table class="rst-table">
        <thead><tr><th>Pack</th><th>Matched as</th><th class="r">Times</th><th class="r">Each</th>
          <th class="r">Total</th><th class="r">Last</th></tr></thead>
        <tbody>${m.packs.map(p => `
          <tr><td><b>${fmt(p.amount)} R$</b></td>
            <td style="color:var(--tx2)">${escapeHtml(p.how)}</td>
            <td class="r">${fmt(p.count)}</td>
            <td class="r">${moneyStr(p.unit)}</td>
            <td class="r g">${moneyStr(p.unit * p.count)}</td>
            <td class="r" style="color:var(--tx2)">${dstr(p.last)}</td></tr>`).join('')}
        </tbody></table>`;

    // money paid per calendar year
    const years = new Map();
    for (const r of m.rows) {
      if (!r.created) continue;
      const y = new Date(r.created).getFullYear();
      const price = priceForPack(r.amount);
      const e = years.get(y) || { paid: 0, robux: 0, count: 0 };
      if (price) e.paid += price.price;
      e.robux += r.amount; e.count++;
      years.set(y, e);
    }
    if (years.size) {
      html += `<div class="rst-secttl"><b>By year</b></div>
        <table class="rst-table">
          <thead><tr><th>Year</th><th class="r">Top-ups</th><th class="r">Robux</th><th class="r">Paid</th></tr></thead>
          <tbody>${[...years.entries()].sort((a, b) => b[0] - a[0]).map(([y, e]) => `
            <tr><td><b>${y}</b></td><td class="r">${fmt(e.count)}</td>
              <td class="r">${fmt(e.robux)}</td><td class="r g">${moneyStr(e.paid)}</td></tr>`).join('')}
          </tbody></table>`;
    }

    html += `<div class="rst-note">Gift cards and promos are counted at the pack price they match.
      Free Robux — Premium stipends, payouts, trades — is never counted as money.</div>`;
    body.innerHTML = html;
  }

  /* ------------------------------------------------------------------ *
   * Year in review
   * ------------------------------------------------------------------ */
  function renderYear(body) {
    const years = yearsCovered();
    if (!years.length) { body.innerHTML = `<div class="rst-empty">Nothing dated to summarise yet.</div>`; return; }
    if (!ui.year || !years.includes(ui.year)) ui.year = years[0];
    const y = yearReview(ui.year);

    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'];

    let html = `<div class="rst-yearpick">${years.map(v =>
      `<span class="rst-type ${v === ui.year ? 'on' : ''}" data-year="${v}">${v}</span>`).join('')}</div>`;

    if (!y.count) {
      html += `<div class="rst-empty"><h3>Nothing spent in ${y.year}</h3>
        <p>No purchases are recorded for that year.</p></div>`;
      body.innerHTML = html;
      return;
    }

    html += `
      <div class="rst-wrap-hero">
        <div class="k">In ${y.year} you spent</div>
        <div class="v">${robuxGlyph(28)}${fmt(y.total)}</div>
        <div class="usd">across ${fmt(y.count)} purchases in ${fmt(y.gameCount)} games${
          y.paid ? ` · you paid <b>${moneyStr(y.paid)}</b> for Robux that year` : ''}</div>
      </div>

      <div class="rst-mini-stats" style="margin-bottom:16px">
        ${msCard('Games', fmt(y.gameCount), y.newGames ? `${fmt(y.newGames)} new that year` : '')}
        ${msCard('Days active', fmt(y.activeDays), 'days with a purchase')}
        ${msCard('Per active day', rbx(y.activeDays ? y.total / y.activeDays : 0), 'average')}
        ${y.peakMonth ? msCard('Biggest month', rbx(y.peakMonth.total), MONTHS[y.peakMonth.month]) : ''}
        ${y.peakDay ? msCard('Biggest day', rbx(y.peakDay.total), dstr(y.peakDay.date)) : ''}
      </div>`;

    if (y.games.length) {
      html += `<div class="rst-secttl"><b>Where it went</b></div>`;
      y.games.forEach((g, i) => {
        const pct = (g.total / y.total) * 100;
        html += `
          <div class="rst-game" data-game="${escapeHtml(g.key)}">
            <div class="rank">${i + 1}</div>
            <img data-uni="${g.universeId || ''}" src="${g.universeId && ui.iconCache[g.universeId] ? escapeHtml(ui.iconCache[g.universeId]) : ''}" alt="">
            <div class="nm"><b>${escapeHtml(g.label)}</b>
              <div class="meta">${fmt(g.count)} purchases · ${pct.toFixed(1)}% of ${y.year}</div>
              <div class="rst-meter"><i style="width:${Math.max(2, pct)}%"></i></div></div>
            <div class="amt"><b>${robuxGlyph(16)}${fmt(g.total)}</b></div>
          </div>`;
      });
      fetchIcons(y.games.map(g => g.universeId)).then(paintIcons);
    }

    if (y.byCount || y.bySpend) {
      html += `<div class="rst-secttl"><b>Standouts</b></div><div class="rst-cards">`;
      if (y.byCount) html += `<div class="rst-card">
        <div class="t">Bought most often</div>
        <div class="b">${escapeHtml(y.byCount.name)}</div>
        <div class="s">${fmt(y.byCount.count)} times · ${fmt(y.byCount.total)} R$ in total</div></div>`;
      if (y.bySpend) html += `<div class="rst-card">
        <div class="t">Took the most Robux</div>
        <div class="b">${escapeHtml(y.bySpend.name)}</div>
        <div class="s">${fmt(y.bySpend.total)} R$ over ${fmt(y.bySpend.count)} purchase(s)</div></div>`;
      html += `</div>`;
    }

    body.innerHTML = html;
  }

  /* ------------------------------------------------------------------ *
   * Habits — when the spending happens
   * ------------------------------------------------------------------ */
  function habitsHtml() {
    const h = habitStats();
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxD = Math.max(...h.dow) || 1, maxH = Math.max(...h.hour) || 1;
    const topDay = h.dow.indexOf(maxD), topHour = h.hour.indexOf(maxH);

    return `
      <div class="rst-secttl"><b>When you spend</b></div>
      <div class="rst-habits">
        <div class="rst-habit">
          <div class="t">By day of week — busiest is <b>${DAYS[topDay]}</b></div>
          <div class="rst-chart" style="height:130px">
            ${h.dow.map((v, i) => `<div class="bar${v ? '' : ' zero'}" style="height:${Math.max(2, (v / maxD) * 100)}%"
              title="${DAYS[i]}: ${fmt(v)} R$ over ${fmt(h.dowCount[i])} purchases"></div>`).join('')}
          </div>
          <div class="rst-axis">${DAYS.map(d => `<span>${d}</span>`).join('')}</div>
        </div>
        <div class="rst-habit">
          <div class="t">By hour — peak around <b>${topHour}:00</b></div>
          <div class="rst-chart" style="height:130px">
            ${h.hour.map((v, i) => `<div class="bar${v ? '' : ' zero'}" style="height:${Math.max(2, (v / maxH) * 100)}%"
              title="${i}:00 — ${fmt(v)} R$"></div>`).join('')}
          </div>
          <div class="rst-axis"><span>00:00</span><span>12:00</span><span>23:00</span></div>
        </div>
      </div>
      <div class="rst-note">${fmt(h.activeDays)} separate days with a purchase${
        h.peakDay ? ` · heaviest single day was ${dstr(h.peakDay.date)} at ${fmt(h.peakDay.total)} R$` : ''}.</div>`;
  }

  /* ------------------------------------------------------------------ *
   * Export
   * ------------------------------------------------------------------ */
  function download(name, text, mime) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const csvCell = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;

  function recordsToCsv(recs) {
    const head = ['created', 'txType', 'category', 'itemType', 'itemName', 'itemId', 'amountRobux', 'sellerName', 'sellerId', 'placeName', 'placeId', 'universeId', 'pending', 'transactionId'];
    const rows = recs.map(r => [r.created, r.txType, categoryOf(r.itemType), r.itemType, r.itemName, r.itemId, r.amount,
      r.sellerName, r.sellerId, r.placeName, r.placeId, r.universeId, r.pending ? 'yes' : '', r.idHash || r.id].map(csvCell).join(','));
    return [head.join(','), ...rows].join('\n');
  }

  function exportCSV() {
    if (!state.records.length) return setStatus('Nothing to export.');
    download('roblox-purchases.csv', recordsToCsv(state.records.filter(inRange)), 'text/csv');
    setStatus('CSV exported.');
  }

  function exportGameCSV() {
    const g = buildGames(spendRecords()).find(x => x.key === ui.gameKey);
    if (!g) return;
    download(`roblox-${g.label.replace(/[^\w\d]+/g, '-').slice(0, 40)}.csv`, recordsToCsv(g.txs), 'text/csv');
    setStatus(`Exported ${g.count} purchase(s) for ${g.label}.`);
  }

  function exportJSON() {
    if (!state.records.length) return setStatus('Nothing to export.');
    const recs = spendRecords();
    const games = sortGames(buildGames(recs)).map(g => ({
      name: g.label, universeId: g.universeId, placeId: g.placeId,
      sellerName: g.sellerName, sellerId: g.sellerId,
      totalRobux: g.total, purchases: g.count,
      firstPurchase: g.first ? new Date(g.first).toISOString() : null,
      lastPurchase: g.last ? new Date(g.last).toISOString() : null,
      byCategory: Object.fromEntries(g.cats),
      items: [...g.items.values()].sort((a, b) => b.total - a.total).map(i => ({
        name: i.name, category: i.cat, itemId: i.itemId, timesBought: i.count,
        totalRobux: i.total, avgRobux: Math.round(i.total / i.count),
        lastBought: i.last ? new Date(i.last).toISOString() : null
      }))
    }));
    download('roblox-purchases.json', JSON.stringify({
      scannedAt: state.lastScan, range: ui.range,
      totalRobux: recs.reduce((s, r) => s + r.amount, 0), games, records: state.records.filter(inRange)
    }, null, 2), 'application/json');
    setStatus('JSON exported.');
  }

  function copyReport() {
    const recs = spendRecords();
    if (!recs.length) return setStatus('Nothing to copy.');
    const games = sortGames(buildGames(recs));
    const total = recs.reduce((s, r) => s + r.amount, 0);
    const lines = [
      `Roblox spend report — ${new Date().toLocaleString()}`,
      `Total: ${fmt(total)} R$${cfg.showUsd ? ` (≈ ${usd(total)})` : ''} across ${fmt(recs.length)} purchases in ${fmt(games.length)} groups`, ''
    ];
    games.slice(0, 40).forEach((g, i) => {
      lines.push(`${i + 1}. ${g.label} — ${fmt(g.total)} R$ (${fmt(g.count)} purchases)`);
      [...g.items.values()].sort((a, b) => b.total - a.total).slice(0, 8)
        .forEach(it => lines.push(`     ${it.name} ×${fmt(it.count)} — ${fmt(it.total)} R$`));
    });
    const text = lines.join('\n');
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
      .then(() => setStatus('Report copied.'))
      .catch(() => { download('roblox-spend-report.txt', text, 'text/plain'); setStatus('Clipboard blocked — downloaded as .txt.'); });
  }

  function showDiag(text) {
    $('#rst-diag-text').value = text;
    document.getElementById('rst-diag').classList.add('open');
  }

  /* ------------------------------------------------------------------ *
   * Events
   * ------------------------------------------------------------------ */
  function closeMenu() { const m = document.getElementById('rst-menu'); if (m) m.classList.remove('on'); }
  function openPanel() { overlay.classList.add('open'); ui.open = true; render(); }
  function closePanel() { overlay.classList.remove('open'); ui.open = false; }
  function togglePanel() { ui.open ? closePanel() : openPanel(); }

  function wireEvents() {
    $('#rst-close').onclick = closePanel;
    overlay.addEventListener('mousedown', e => { if (e.target === overlay) closePanel(); });

    $('#rst-theme-sel').value = cfg.theme;
    $('#rst-theme-sel').addEventListener('change', e => {
      cfg.theme = e.target.value; saveCfg(); applyTheme(); render();
    });
    // follow the site when set to match it
    try {
      new MutationObserver(() => { if (cfg.theme === 'auto') applyTheme(); })
        .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
    $('#rst-turbo').addEventListener('change', e => { cfg.turbo = e.target.checked; saveCfg(); });

    // clicking anywhere else dismisses the overflow menu
    panel.addEventListener('click', e => {
      if (!e.target.closest('#rst-menu') && !e.target.closest('[data-act="menu"]')) closeMenu();
    }, true);

    document.addEventListener('keydown', e => {
      if (!ui.open) return;
      if (e.key === 'Escape') {
        const d = document.getElementById('rst-diag');
        const sheet = document.getElementById('rst-sheet');
        if (d.classList.contains('open')) d.classList.remove('open');
        else if (document.getElementById('rst-menu').classList.contains('on')) closeMenu();
        else if (sheet.classList.contains('on')) sheet.classList.remove('on');
        else if (ui.gameKey) { ui.gameKey = null; render(); }
        else closePanel();
      }
      if (e.key === '/' && document.activeElement !== $('#rst-search')) { e.preventDefault(); $('#rst-search').focus(); }
    });

    document.getElementById('rst-diag-close').onclick = () => document.getElementById('rst-diag').classList.remove('open');
    document.getElementById('rst-diag-copy').onclick = () => {
      const t = $('#rst-diag-text');
      t.select();
      (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject())
        .then(() => { document.getElementById('rst-diag-copy').textContent = '✓ Copied'; })
        .catch(() => { try { document.execCommand('copy'); } catch (e) {} });
    };

    panel.addEventListener('click', e => {
      const actEl = e.target.closest('[data-act]');
      if (actEl) {
        const act = actEl.getAttribute('data-act');
        if (act !== 'menu') closeMenu();
        if (act === 'primary') runScan(state.records.length ? 'update' : 'full');
        else if (act === 'menu') { const m = document.getElementById('rst-menu'); m.classList.toggle('on'); }
        else if (act === 'settings') document.getElementById('rst-sheet').classList.add('on');
        else if (act === 'closesheet') document.getElementById('rst-sheet').classList.remove('on');
        else if (act === 'dismiss') clearToast();
        else if (act === 'enable-currency') {
          if (!cfg.types.includes('CurrencyPurchase')) cfg.types.push('CurrencyPurchase');
          saveCfg(); renderTypeBar(); runScan('full');
        }
        else if (act === 'scan') runScan('full');
        else if (act === 'update') runScan('update');
        else if (act === 'resume') runScan('resume');
        else if (act === 'pause') { state.paused = !state.paused; setButtons(); }
        else if (act === 'stop') { state.stopped = true; setStatus('Stopping…'); }
        else if (act === 'diag') runDiagnostics();
        else if (act === 'csv') exportCSV();
        else if (act === 'csv-game') exportGameCSV();
        else if (act === 'json') exportJSON();
        else if (act === 'copy') copyReport();
        else if (act === 'back') { ui.gameKey = null; ui.expanded.clear(); render(); }
        else if (act === 'clear') {
          if (!confirm('Clear all scanned data stored in this browser?\n\nThis only deletes the local cache — nothing on your Roblox account changes.')) return;
          state.records = []; state.ids.clear(); state.pages = 0; state.lastScan = null;
          store.del('records'); store.del('progress'); store.del('lastScan');
          ui.gameKey = null; render(); setStatus('Local data cleared.');
        }
        return;
      }

      const yearEl = e.target.closest('[data-year]');
      if (yearEl) { ui.year = parseInt(yearEl.getAttribute('data-year'), 10); render(); return; }

      const catEl = e.target.closest('[data-cat]');
      if (catEl) { ui.cat = catEl.getAttribute('data-cat') || null; render(); return; }

      const typeEl = e.target.closest('[data-type]');
      if (typeEl) {
        const id = typeEl.getAttribute('data-type');
        const i = cfg.types.indexOf(id);
        if (i < 0) cfg.types.push(id); else cfg.types.splice(i, 1);
        if (!cfg.types.length) cfg.types = ['Purchase'];
        saveCfg(); renderTypeBar(); render();
        return;
      }

      const tabEl = e.target.closest('[data-tab]');
      if (tabEl) {
        ui.tab = tabEl.getAttribute('data-tab');
        ui.gameKey = null;
        panel.querySelectorAll('.rst-tab').forEach(t => t.classList.toggle('on', t === tabEl));
        render();
        return;
      }

      const itemEl = e.target.closest('[data-item]');
      if (itemEl) {
        const k = itemEl.getAttribute('data-item');
        if (ui.expanded.has(k)) ui.expanded.delete(k); else ui.expanded.add(k);
        render();
        return;
      }

      const gameEl = e.target.closest('[data-game]');
      if (gameEl) {
        ui.gameKey = gameEl.getAttribute('data-game');
        ui.expanded.clear();
        $('#rst-body').scrollTop = 0;
        render();
      }
    });

    let searchTimer = null;
    $('#rst-search').addEventListener('input', e => {
      const raw = e.target.value.trim().toLowerCase();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(async () => {
        ui.q = raw;
        resolvedFilterUniverse = null;
        const m = raw.match(/games\/(\d+)/);
        const placeId = m ? m[1] : (/^\d{5,}$/.test(raw) ? raw : null);
        if (placeId) {
          const uni = await placeToUniverse(placeId);
          if (uni) resolvedFilterUniverse = String(uni);
        }
        render();
      }, 180);
    });

    $('#rst-sort').addEventListener('change', e => { ui.sort = e.target.value; render(); });
    $('#rst-range').addEventListener('change', e => { ui.range = e.target.value; ui.gameKey = null; render(); });
    $('#rst-delay').addEventListener('change', e => {
      // hard floor: never let anyone dial this down to a hammering pace
      cfg.delayMs = Math.max(MIN_DELAY_MS, Math.min(10000, parseInt(e.target.value, 10) || DEFAULTS.delayMs));
      e.target.value = cfg.delayMs; state.curDelay = cfg.delayMs; saveCfg();
    });
    $('#rst-merge').addEventListener('change', e => { cfg.smartMerge = e.target.checked; saveCfg(); ui.gameKey = null; render(); });
    $('#rst-usd').addEventListener('change', e => { cfg.showUsd = e.target.checked; saveCfg(); render(); });
    $('#rst-premium').addEventListener('change', e => { cfg.premium = e.target.checked; saveCfg(); refreshPricingUI(); render(); });
    $('#rst-curmode').addEventListener('change', e => { cfg.priceMode = e.target.value; saveCfg(); refreshPricingUI(); render(); });
    $('#rst-cursym').addEventListener('change', e => { cfg.curSymbol = e.target.value; saveCfg(); refreshPricingUI(); render(); });
    $('#rst-curper').addEventListener('change', e => {
      const v = parseFloat(e.target.value);
      cfg.curPer1000 = (isFinite(v) && v > 0) ? v : 9.99;
      e.target.value = cfg.curPer1000; saveCfg(); refreshPricingUI(); render();
    });
    // manual price for a pack we couldn't match
    panel.addEventListener('change', e => {
      const el = e.target.closest('[data-pack]');
      if (!el) return;
      const amount = el.getAttribute('data-pack');
      const v = parseFloat(el.value);
      const ov = store.get('packOverrides', {});
      if (isFinite(v) && v > 0) ov[amount] = v; else delete ov[amount];
      store.set('packOverrides', ov);
      render();
    });

    $('#rst-refpack').addEventListener('change', e => { cfg.refRobux = parseInt(e.target.value, 10) || 1000; saveCfg(); refreshPricingUI(); render(); });
    refreshPricingUI();
  }

  ready(main);
})();
