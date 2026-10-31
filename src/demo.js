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
