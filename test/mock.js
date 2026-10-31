(function () {
  window.__RT2_TEST = true;
  let seed = 11;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const users = { 1001: { id: 1001, name: 'GavMain', displayName: 'Gav' }, 1002: { id: 1002, name: 'GavAlt', displayName: 'Alt Account' } };
  window.__who = 1001;
  const games = [
    { uni: 11, pid: 111, name: 'Dungeons', sid: 501, sn: 'DungeonLabs' },
    { uni: 12, pid: 112, name: 'Sword Fight', sid: 502, sn: 'TimeStudio' },
    { uni: 13, pid: 113, name: 'Backrooms', sid: 503, sn: 'LevelZero' }
  ];
  const cat = [{ id: 9001, name: 'Cool Shades', sid: 700, sn: 'UGC Maker', p: 75 }, { id: 9002, name: 'Void Wings', sid: 701, sn: 'WingCo', p: 300 }];
  const raw = { 1001: {}, 1002: {} };
  const now = Date.now();
  const iso = t => new Date(t).toISOString();

  function build(uid, n) {
    const list = [];
    for (let i = 0; i < n; i++) {
      const t = now - (i + 1) * 3600e3 * 7 - Math.floor(rnd() * 3600e3);
      const r = rnd();
      let tx;
      if (r < 0.1) {
        const c = cat[i % 2];
        tx = { idHash: `p${uid}-${i}`, created: iso(t), isPending: false, agent: { id: c.sid, type: 'User', name: c.sn }, details: { id: c.id, name: c.name, type: 'Asset' }, currency: { amount: -c.p, type: 'Robux' } };
      } else {
        const g = games[Math.floor(rnd() * games.length)];
        const isPass = rnd() < 0.3;
        const amt = isPass ? 400 + Math.floor(rnd() * 5) * 100 : 25 + Math.floor(rnd() * 8) * 25;
        tx = { idHash: `p${uid}-${i}`, created: iso(t), isPending: false, agent: { id: g.sid, type: 'User', name: g.sn }, details: { id: g.uni * 100 + (isPass ? 1 : 2) + (isPass ? i % 3 : 0), name: isPass ? 'Pass ' + (i % 3) : 'Gems', type: isPass ? 'GamePass' : 'DeveloperProduct', place: rnd() < 0.85 ? { placeId: g.pid, universeId: g.uni, name: g.name } : undefined }, currency: { amount: -amt, type: 'Robux' } };
        if (!tx.details.place) delete tx.details.place;
      }
      list.push(tx);
    }
    list[40].currency = { amount: -9, type: 'Tix' };
    list[7].isPending = true;
    list.splice(100, 0, JSON.parse(JSON.stringify(list[99])));
    return list;
  }

  function buildIn(uid) {
    const cp = [800, 1700, 800, 4500, 800].map((a, i) => ({ idHash: `c${uid}-${i}`, created: iso(now - (i + 1) * 40 * 864e5), isPending: false, agent: { id: 1, type: 'User', name: 'Roblox' }, details: { name: 'Robux', type: 'Currency' }, currency: { amount: a, type: 'Robux' } }));
    const ps = [450, 450].map((a, i) => ({ idHash: `s${uid}-${i}`, created: iso(now - (i + 1) * 30 * 864e5), isPending: false, agent: { id: 1, type: 'User', name: 'Roblox' }, details: { name: 'Premium', type: 'Premium' }, currency: { amount: a, type: 'Robux' } }));
    return { CurrencyPurchase: cp, PremiumStipend: ps };
  }

  [1001, 1002].forEach((uid, k) => {
    raw[uid].Purchase = build(uid, k ? 130 : 330);
    Object.assign(raw[uid], buildIn(uid));
    raw[uid].Sale = [0, 1, 2].map(i => ({ idHash: `sale${uid}-${i}`, created: iso(now - (i + 2) * 9 * 864e5), isPending: false, agent: { id: 7000 + i, type: 'User', name: 'Buyer' + i }, details: { id: 9100 + (i % 2), name: i % 2 ? 'Dragon Hat' : 'Neon Cape', type: 'Asset' }, currency: { amount: 70 + i * 10, type: 'Robux' } }));
    raw[uid].GroupPayout = [{ idHash: `gp${uid}-0`, created: iso(now - 20 * 864e5), isPending: false, agent: { id: 4242, type: 'Group', name: 'Dungeon Labs' }, details: { name: 'Payout', type: 'Payout' }, currency: { amount: 1000, type: 'Robux' } }];
    raw[uid].Commission = [0, 1].map(i => ({ idHash: `cm${uid}-${i}`, created: iso(now - (i + 3) * 11 * 864e5), isPending: false, agent: { id: 6000, type: 'User', name: 'Kohl' }, details: { name: 'Commission Robux From', type: 'Commission' }, currency: { amount: 300 + i * 400, type: 'Robux' } }));
    raw[uid].RobuxTransfer = [-1000, -500, 399].map((a, i) => ({ idHash: `rt${uid}-${i}`, created: iso(now - (i + 1) * 5 * 864e5), isPending: false, agent: { id: 7777, type: 'User', name: 'Friend' }, details: { name: i === 2 ? 'Unable to send Robux to Yoshiro.' : 'Sent Robux to ' + (i === 0 ? 'MasterKevin_Dlaho' : 'Yoshiro') + '.', type: 'Transfer' }, currency: { amount: a, type: 'Robux' } }));
    raw[uid].CurrencyPurchase.push({ idHash: `big${uid}`, created: iso(now - 500 * 864e5), isPending: false, agent: { id: 1, type: 'User', name: 'Roblox' }, details: { name: 'Robux', type: 'Currency' }, currency: { amount: k ? 40000 : 150000, type: 'Robux' } });
  });
  window.__raw = raw;
  window.__hits = { rate: 0, total: 0 };
  window.__inflight = 0;
  window.__maxInflight = 0;
  function balanceOf(uid) {
    let b = 0;
    for (const type of Object.keys(raw[uid])) {
      const seen = new Set();
      for (const tx of raw[uid][type]) {
        if (seen.has(tx.idHash)) continue;
        seen.add(tx.idHash);
        if (tx.currency.type !== 'Robux') continue;
        const a = Math.abs(tx.currency.amount);
        b += type === 'Purchase' ? -a : tx.currency.amount;
      }
    }
    return b;
  }
  window.__balance = balanceOf;
  function totalsFor(uid, frame) {
    const days = { Day: 1, Week: 7, Month: 30, Year: 365 }[frame] || 30;
    const from = Date.now() - days * 864e5;
    const sum = (type, pos) => {
      const seen = new Set();
      let t = 0;
      for (const tx of raw[uid][type] || []) {
        if (seen.has(tx.idHash)) continue;
        seen.add(tx.idHash);
        if (tx.currency.type !== 'Robux' || Date.parse(tx.created) < from) continue;
        const a = tx.currency.amount;
        if (pos === undefined || (pos ? a > 0 : a < 0)) t += Math.abs(a);
      }
      return t;
    };
    let incoming = 0, outgoing = 0;
    for (const type of Object.keys(raw[uid])) {
      incoming += type === 'Purchase' ? 0 : sum(type, true);
      outgoing += type === 'Purchase' ? sum(type) : sum(type, false);
    }
    return { purchasesTotal: -sum('Purchase'), salesTotal: sum('Sale', true), currencyPurchasesTotal: sum('CurrencyPurchase', true), premiumStipendsTotal: sum('PremiumStipend', true), groupPayoutsTotal: sum('GroupPayout', true), incomingRobuxTotal: incoming, outgoingRobuxTotal: outgoing, pendingRobuxTotal: 0, someUnknownField: 5 };
  }

  window.__addNew = (uid, n) => {
    for (let i = 0; i < n; i++) raw[uid].Purchase.unshift({ idHash: `new${uid}-${Date.now()}-${i}`, created: iso(Date.now() - i * 1000), isPending: false, agent: { id: 501, type: 'User', name: 'DungeonLabs' }, details: { id: 1102, name: 'Gems', type: 'DeveloperProduct', place: { placeId: 111, universeId: 11, name: 'Dungeons' } }, currency: { amount: -100, type: 'Robux' } });
  };
  window.__settle = uid => { raw[uid].Purchase.forEach(x => { x.isPending = false; }); };

  const json = (o, status, headers) => new Response(JSON.stringify(o), { status: status || 200, headers: Object.assign({ 'content-type': 'application/json' }, headers || {}) });
  let rateDone = false;
  const realFetch = window.fetch.bind(window);
  window.fetch = async (url, opt) => {
    const u = new URL(String(url), location.href);
    window.__hits.total++;
    if (u.hostname === 'users.roblox.com') {
      const me = users[window.__who];
      return me ? json(me) : json({}, 401);
    }
    if (u.hostname === 'thumbnails.roblox.com') {
      const ids = (u.searchParams.get('universeIds') || u.searchParams.get('gamePassIds') || u.searchParams.get('assetIds') || u.searchParams.get('bundleIds') || u.searchParams.get('userIds') || u.searchParams.get('groupIds') || '').split(',').filter(Boolean);
      const svg = id => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="hsl(${(Number(id) * 47) % 360},65%,48%)"/><text x="32" y="42" font-size="26" text-anchor="middle" fill="white" font-family="Arial">${String(id).slice(-2)}</text></svg>`);
      window.__thumbReq = (window.__thumbReq || []).concat(u.pathname);
      return json({ data: ids.map(id => ({ targetId: Number(id), state: 'Completed', imageUrl: svg(id) })) });
    }
    if (u.hostname === 'economy.roblox.com') {
      let m = u.pathname.match(/\/v1\/users\/(\d+)\/currency/);
      if (m) return json({ robux: balanceOf(Number(m[1])) });
      m = u.pathname.match(/\/v2\/users\/(\d+)\/transaction-totals/);
      if (m) return json(totalsFor(Number(m[1]), u.searchParams.get('timeFrame')));
      m = u.pathname.match(/\/v2\/users\/(\d+)\/transactions/);
      if (m) {
        const uid = Number(m[1]);
        if (uid !== window.__who) return json({}, 403);
        window.__inflight++;
        window.__maxInflight = Math.max(window.__maxInflight, window.__inflight);
        await new Promise(r => setTimeout(r, 40));
        window.__inflight--;
        const type = u.searchParams.get('transactionType');
        if (['EngagementPayout', 'GroupEngagementPayout'].includes(type)) return json({ errors: [{ code: 1, message: 'bad type' }] }, 400);
        const limit = Number(u.searchParams.get('limit'));
        const cur = u.searchParams.get('cursor');
        const off = cur ? JSON.parse(atob(cur)).key : 0;
        if (uid === 1001 && type === 'Purchase' && off === 200 && !rateDone) { rateDone = true; window.__hits.rate++; return json({}, 429, { 'retry-after': '1' }); }
        const all = raw[uid][type] || [];
        const page = all.slice(off, off + limit);
        const next = off + limit < all.length ? btoa(JSON.stringify({ key: off + limit })) : null;
        return json({ previousPageCursor: null, nextPageCursor: next, data: page });
      }
      return json({ data: [] });
    }
    return realFetch(url, opt);
  };
})();
