# Robux Tracker

See where your Robux actually went.

Robux Tracker reads **your own** Roblox purchase history and adds it up per game — every
game pass, developer product and private server, and how many times you bought each one.
It runs entirely in your browser. Nothing is uploaded anywhere.

> Unofficial. Not affiliated with, endorsed by, or sponsored by Roblox Corporation.
> "Roblox" and "Robux" are trademarks of Roblox Corporation.

## What it does

Opens as a full app over roblox.com: a sidebar of pages, a dashboard, and a command
palette (Ctrl+K) for jumping to any page or game.

**Dashboard** — the short version at a glance: total spent with a spending sparkline,
what you really paid, this month against last, your top games, a breakdown donut,
balance check, current streak and your latest purchases.

**Real money** — your Robux purchases record the exact pack you bought, and pack sizes map
one-to-one onto prices, so this is reconciled from real purchases rather than estimated.
Shows what you paid, your true rate per 1,000 R$, every pack you bought and a per-year
breakdown. Amounts matching no known pack (gift cards, regional promos) are listed as
unmatched and can be priced by hand — never guessed.

**Balance check** — Robux in minus Robux out should equal your current balance. When it
doesn't, the gap is named along with the transaction types you aren't tracking yet.

**Games / Items / Creators** — every game ranked with icons and share-of-total, filterable
by category; open one for the item-by-item breakdown (`Gifting VIP x44 - 35,200 R$`) and
every individual purchase with its date. Items adds what you went back for and your
biggest single purchases. Creators shows who actually received your Robux.

**Timeline** — monthly chart, a running-total curve, then-and-now comparisons, and when you
spend by weekday and by hour.

**Records** — longest streak and longest quiet spell, biggest week and day, dated milestones
worked out from the running total, and the games you spent in and then stopped.

**Year in review** — pick a year: total, top five games, standout items, biggest day and
month, and how many games were new to you.

**All transactions** — every ledger Roblox exposes. "Find every transaction type" probes each
one and keeps whatever your account actually has, so nothing is assumed.

**Customize** — accent colour, theme (including matching Roblox's own), density, which page
it opens on, currency and pricing basis, scan pacing, and games excluded from totals.

Plus CSV/JSON export, a shareable PNG summary card, and incremental updates so only the
first scan is slow.

## Install

### As a browser extension (Chrome, Edge, Brave)

1. Download or clone this repo.
2. Open `chrome://extensions`, turn on **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.
4. Open [roblox.com](https://www.roblox.com), find **Robux Tracker** in the left sidebar.

### As a userscript (Tampermonkey / Violentmonkey)

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Create a new script, paste in `robux-tracker.user.js`, save.

Both builds are the same code. `robux-tracker.user.js` is the source of truth;
`node build.js` regenerates the extension copy.

## How it works

It calls the same endpoint the Roblox website itself uses to render your Transactions
page — `economy.roblox.com/v2/users/{id}/transactions` — reading one page of 100 at a
time with your existing session, and pages through with the cursor Roblox returns.

Being deliberate about pacing:

- A **400 ms floor** between requests that the UI cannot go below.
- `retry-after` is honoured; HTTP 429 triggers exponential backoff, and that backoff is
  never written back into your saved settings.
- Parallel paging is **off by default**, capped at 3 pages at once when enabled.
- It stops itself if a cursor repeats or several pages arrive with nothing new, rather
  than looping forever.

Nothing is written to your account. Every request is a read.

## Privacy

All data stays in your browser's local storage. There is no server, no analytics, no
telemetry, and no network request to anywhere other than roblox.com. See [PRIVACY.md](PRIVACY.md).

## Notes on accuracy

- Roblox only exposes a limited window of transaction history through this API. If your
  oldest purchases are missing, they aren't available to read.
- The **Money** tab is reconciled from real purchases and is as accurate as the pack data
  allows. Elsewhere, Robux amounts are valued at a single reference pack (the 1,000 R$ tier
  by default, changeable in Settings) because Robux is priced in packs, not per unit.
- Some purchases come back without game information. With "group by creator" on, those
  are attached to that creator's game when they only have one; such groups are labelled.

## Licence

MIT — see [LICENSE](LICENSE).
