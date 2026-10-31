# Robux Tracker

See where your Robux went. It reads your own Roblox transaction history and adds it up: what you spent in each game, what you bought, what you earned, and your balance.

Everything stays in your browser. Nothing is uploaded.

## What it shows

- Spending per game and per item, with icons
- Your Robux balance, what came in and what went out
- Robux you bought, with the real price of each pack
- Earnings from sales, commissions and payouts
- Every transaction, with a running balance
- A check that the numbers add up to your real balance, and a check against Roblox's own totals
- More than one account, with your main and alts added together
- Export to CSV or JSON

It adds a "Robux Tracker" item to the Roblox sidebar. Alt+R also opens it.

## Install

Extension (Chrome, Edge, Brave):
1. Open `chrome://extensions` and turn on Developer mode.
2. Click Load unpacked and pick the `dist/extension` folder.
3. Open roblox.com and press Robux Tracker in the left sidebar.

Userscript: install Tampermonkey and paste in `dist/robux-tracker.user.js`.

## First run

Press Sync. Then open roblox.com/transactions, click each type in the dropdown once, and Sync again so it learns every category.

## Adding other accounts

Sign into the other account on roblox.com and press Sync. It is added automatically. Using a different browser? Press Backup there and Restore backup here.

## Build and test

```
node build.js
node test/run.mjs
```

`build.js` joins the files in `src/` into `dist/`. The tests run in a hidden Edge window against a fake Roblox server.

Unofficial. Not affiliated with Roblox Corporation. Roblox and Robux are trademarks of Roblox Corporation.

MIT licence.
