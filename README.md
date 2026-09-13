# Robux Tracker

See where your Robux actually went.

Robux Tracker reads **your own** Roblox purchase history and adds it up per game — every
game pass, developer product and private server, and how many times you bought each one.
It runs entirely in your browser. Nothing is uploaded anywhere.

> Unofficial. Not affiliated with, endorsed by, or sponsored by Roblox Corporation.
> "Roblox" and "Robux" are trademarks of Roblox Corporation.

## What it does

- **Per-game totals** — every game you've spent in, ranked, with icons and share-of-total.
- **Per-item breakdown** — open a game to see `Gifting VIP ×44 — 35,200 R$`, split into
  Game Passes / Developer Products / Private Servers / Bundles / Catalog. Click any item
  for every individual purchase and its date.
- **Real money values** — reads the package prices off your own Buy Robux page, so totals
  show in your currency at your region's prices. Falls back to built-in US pricing, and
  you can override the currency and rate by hand.
- **Timeline** — monthly spend chart plus per-year and per-month tables.
- **Creators** — which developers and groups actually received your Robux.
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
- Money values are an **estimate**. Robux is priced in packs, not per unit, so the app
  values your spend at a single reference pack (the 1,000 R$ / $9.99 tier by default).
  You can change which pack in Settings.
- Some purchases come back without game information. With "group by creator" on, those
  are attached to that creator's game when they only have one; such groups are labelled.

## Licence

MIT — see [LICENSE](LICENSE).
