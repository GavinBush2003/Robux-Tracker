const ALARM = 'rt2-bg';

async function applyAlarm(bg) {
  await chrome.alarms.clear(ALARM);
  if (bg && bg.on) chrome.alarms.create(ALARM, { periodInMinutes: Math.max(30, (Number(bg.hours) || 6) * 60), delayInMinutes: 5 });
}

function loadAndApply() {
  chrome.storage.local.get('rt2bg', r => { applyAlarm(r && r.rt2bg); });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.rt2bg) applyAlarm(changes.rt2bg.newValue);
});

chrome.runtime.onInstalled.addListener(loadAndApply);
chrome.runtime.onStartup.addListener(loadAndApply);

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== ALARM) return;
  const tabs = await chrome.tabs.query({ url: ['https://www.roblox.com/*', 'https://web.roblox.com/*'] });
  if (!tabs.length) return;
  try { await chrome.tabs.sendMessage(tabs[0].id, { type: 'rt2-sync' }); } catch (e) {}
});
