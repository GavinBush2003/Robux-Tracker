# Chrome Web Store listing copy

## Name
Robux Tracker — see where your Robux went

## Short description (132 char max)
See exactly which games your Robux went to, what you bought there, and how many times. Runs locally, reads nothing but your own history.

## Detailed description

Ever wondered where all your Robux actually went?

Robux Tracker reads your own Roblox purchase history and adds it up per game, so you can
finally see the whole picture — which games took the most, what you bought in each one,
and how many times you bought it.

WHAT YOU GET
• Every game you've spent in, ranked by total, with icons and percentages
• Open any game to see the exact items — "Gifting VIP x44 — 35,200 Robux"
• Split by Game Passes, Developer Products, Private Servers, Bundles and Catalog items
• Click any item to see every single purchase with its date
• A spending timeline by month and by year
• Which developers and groups actually received your Robux
• Real money estimates in your own currency, using your region's package prices
• Export everything to CSV or JSON

PRIVATE BY DESIGN
Everything stays in your browser. No account, no server, no analytics, no tracking. The
only site it ever talks to is roblox.com, and it only ever reads — it never buys, sells,
trades or changes anything on your account.

FAST AFTER THE FIRST RUN
The first scan reads your full history. After that, "Check for new" reads only what
changed, so it takes seconds.

Not affiliated with Roblox Corporation. "Roblox" and "Robux" are trademarks of Roblox
Corporation.

## Category
Productivity

## Permission justifications

host_permissions (economy/users/apis/thumbnails.roblox.com):
Reads the signed-in user's own transaction history, username, and game thumbnails from
Roblox's own API in order to display a spending breakdown. No data leaves the browser.

Content script on roblox.com:
Adds the Robux Tracker panel and its sidebar entry to the Roblox interface, and reads
Robux package prices from the Buy Robux page so amounts can be shown in the user's
local currency.

Remote code: none. All code is bundled in the package.

## Privacy
Single purpose: show the user a breakdown of their own Roblox spending.
Data collected: none. Nothing is transmitted off the device.
Privacy policy URL: https://github.com/GavinBush2003/Robux-Tracker/blob/main/PRIVACY.md

## Screenshots to capture (1280x800)
1. Games list with totals and the summary cards
2. A game opened, showing the item breakdown with the x44 counts
3. The Timeline tab
4. Settings, showing local currency detection
