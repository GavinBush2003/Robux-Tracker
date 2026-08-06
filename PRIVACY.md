# Privacy Policy — Robux Tracker

_Last updated: 6 August 2026_

## The short version

Robux Tracker does not collect, transmit, sell, or share any of your data. Everything it
reads stays on your own computer. There is no server, no account, and no analytics.

## What it accesses

While you are signed in to roblox.com, Robux Tracker reads:

- **Your transaction history**, from Roblox's own endpoint
  (`economy.roblox.com/v2/users/{id}/transactions`) — the same data shown on your
  My Transactions page.
- **Your user id and username**, to confirm which account the data belongs to
  (`users.roblox.com/v1/users/authenticated`).
- **Game icons and universe ids**, so games can be shown with their thumbnail
  (`thumbnails.roblox.com`, `apis.roblox.com`).
- **Robux package prices**, read from the Buy Robux page you are viewing, so amounts can
  be shown in your local currency.

## Where it goes

Nowhere. All of it is stored in your browser's local storage on your own device, and is
only read back to render the interface. The extension makes no requests to any server
operated by the developer or any third party — the only hosts it contacts are Roblox's.

## What is stored locally

- Your scanned purchase records
- Your settings (theme, currency, scan pacing)
- Cached game icon URLs and detected package prices
- The id of the account the cache belongs to, so data from two accounts is never mixed

## Deleting your data

Settings → ⋯ menu → **Delete local data** removes everything immediately. Uninstalling the
extension also removes it. Nothing is retained anywhere else, because it was never sent
anywhere else.

## Changes to your account

Robux Tracker only ever reads. It does not purchase, sell, trade, modify settings, or take
any action on your Roblox account.

## Contact

Open an issue at https://github.com/GavinBush2003/Robux-Tracker/issues
