// Regenerates extension/robux-tracker.js from the userscript.
// The userscript is the single source of truth — edit robux-tracker.user.js,
// then run `node build.js` before loading or packaging the extension.
const fs = require('fs');

const src = fs.readFileSync('robux-tracker.user.js', 'utf8');
const marker = '// ==/UserScript==';
const end = src.indexOf(marker);
if (end < 0) { console.error('No userscript header found.'); process.exit(1); }

const header =
  '// Robux Tracker — browser extension content script.\n' +
  '// Generated from robux-tracker.user.js; edit that file, then run: node build.js\n' +
  '// Storage falls back to localStorage and styles to a <style> tag when the\n' +
  '// GM_* userscript APIs are absent, which is exactly the extension case.\n\n';

const body = src.slice(end + marker.length).replace(/^\s*\n/, '');
fs.writeFileSync('extension/robux-tracker.js', header + body);

// keep the manifest version in step with the userscript
const version = (src.match(/@version\s+([\d.]+)/) || [])[1];
const mp = 'extension/manifest.json';
const m = JSON.parse(fs.readFileSync(mp, 'utf8'));
if (version && m.version !== version) {
  m.version = version;
  fs.writeFileSync(mp, JSON.stringify(m, null, 2) + '\n');
  console.log('manifest version -> ' + version);
}

// Chrome Web Store limits, enforced at upload time. Catching them here beats
// finding out after a failed upload.
const LIMITS = { name: 75, short_name: 12, description: 132 };
let bad = false;
for (const [field, max] of Object.entries(LIMITS)) {
  const v = m[field];
  if (v && v.length > max) {
    console.error(`ERROR: manifest "${field}" is ${v.length} chars, max is ${max}`);
    bad = true;
  }
}
if (bad) process.exit(1);

console.log('built extension/robux-tracker.js');
