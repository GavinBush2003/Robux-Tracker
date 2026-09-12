# Robux Tracker

See where your Robux actually went.

Robux Tracker reads **your own** Roblox purchase history and adds it up per game — every
game pass, developer product and private server, and how many times you bought each one.
It runs entirely in your browser. Nothing is uploaded anywhere.

> Unofficial. Not affiliated with, endorsed by, or sponsored by Roblox Corporation.
> "Roblox" and "Robux" are trademarks of Roblox Corporation.

## What it does

- **What you actually paid.** Your Robux purchases record the exact pack you bought, and pack
  sizes map one-to-one onto prices — so the money figure is reconciled from real purchases
  rather than estimated at some average rate. Anything that can't be matched (gift cards,
  regional promos) is shown as unmatched and you can price it yourself.
- **Per-game totals** — every game you've spent in, ranked, with icons and share-of-total,
  filterable by category.
- **Per-item breakdown** — open a game to see `Gifting VIP x44 - 35,200 R$`, split into
  Game Passes / Developer Products / Private Servers / Bundles / Catalog. Click any item
  for every individual purchase and its date.
- **Year in review** — pick any year and get the total, your top five games, the item you
  bought most, your biggest single day, and how many games were new to you that year.
- **Insights** — the items you kept going back for and what the repeats cost, your biggest
  single purchases, and when you spend: by weekday and by hour.
- **Records** — longest buying streak and longest quiet spell, your biggest week and
  biggest day, milestones dated (first ever purchase, 100th, first 100k spent), and
  "gone quiet": games you sank Robux into and then stopped.
- **Balance check** — Robux in minus Robux out should land on your current balance. When it
  doesn't, the gap is named, along with which transaction types you aren't tracking.
- **Timeline** — monthly spend chart, a running-total curve, then-and-now comparisons
  (this month vs last, this year vs last, last 30 days vs the 30 before) and per-year tables.
- **Exclude a game** from every total — handy for catalog buys or a mis-grouped creator.
  Excluded groups are listed in Settings and can be put back.
- **Summary card** — save a shareable PNG of your totals and top games.
- **Creators** — which developers and groups actually received your Robux.
- **Local currency** — reads the package prices off your own Buy Robux page, so everything
  shows in your currency at your region's prices. Or set a rate by hand.
- **Incremental updates** — the first scan reads your whole history; after that
  "Check for new" only reads what changed.
- **Export** — CSV or JSON, all of it or one game at a time.

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
