const fs = require('fs');
const path = require('path');
const read = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const parts = ['core.js', 'analyze.js', 'demo.js', 'ui.js'].map(read).join('\n');
const css = read('style.css');
const version = (parts.match(/const VERSION = '([\d.]+)'/) || [])[1];
const body = `(function () {
'use strict';
if (window.__rt2Loaded) return;
window.__rt2Loaded = true;
const CSS = ${JSON.stringify(css)};
${parts}
mount();
if (window.__RT2_TEST) window.__RT2 = { S, V, ACT, runSync, build, view, openPanel, boot, realMoney, packPrice, cash, scanList, diagnostics, integrity, normalize, renderAll, startDemo, toCsv, makeDemo, stats, income, monthProgress, filterLedger, PACK_MAP, ensureBoot, exportJson, importJson, removeAccount, setView, acct, cur, viewAccounts, rebuildView, tAccounts, TABS, balanceOf, ledgerOf, monthEndBalances, earningsOf, boughtOf, sourcesOf, flowByMonth, fetchThumbs, ensureNavItem, installBridge, compareTotals, transfersOf, rebuildView, delta, typeDef, TYPE_DEFS };
})();
`;
const header = `// ==UserScript==
// @name         Robux Tracker 6
// @namespace    robuxtracker.app
// @version      ${version}
// @description  See exactly where your Robux went: per game, item, creator and month, with accuracy checks.
// @author       Gavin
// @match        https://www.roblox.com/*
// @match        https://web.roblox.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
`;
fs.mkdirSync(path.join(__dirname, 'dist', 'extension'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'extension', 'content.js'), body);
fs.writeFileSync(path.join(__dirname, 'dist', 'robux-tracker.user.js'), header + '\n' + body);
fs.copyFileSync(path.join(__dirname, 'src', 'background.js'), path.join(__dirname, 'dist', 'extension', 'background.js'));
fs.writeFileSync(path.join(__dirname, 'dist', 'extension', 'manifest.json'), JSON.stringify({
  manifest_version: 3,
  name: 'Robux Tracker',
  short_name: 'RobuxTracker',
  version,
  description: 'See exactly where your Robux went, from your own transaction history. Unofficial.',
  icons: { 16: 'icons/icon16.png', 32: 'icons/icon32.png', 48: 'icons/icon48.png', 128: 'icons/icon128.png' },
  permissions: ['alarms', 'storage'],
  background: { service_worker: 'background.js' },
  content_scripts: [{ matches: ['https://www.roblox.com/*', 'https://web.roblox.com/*'], js: ['content.js'], run_at: 'document_idle' }],
  host_permissions: ['https://economy.roblox.com/*', 'https://users.roblox.com/*', 'https://thumbnails.roblox.com/*']
}, null, 2));
console.log('built v' + version, (body.length / 1024).toFixed(0) + ' KB');
