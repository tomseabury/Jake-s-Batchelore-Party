# Jake's Bachelor Party — The Tournament

A retro/nostalgic stats site for the games played over Jake's bachelor party weekend
(Halo MCC, Age of Empires II, Slay the Spire 2, and Doom co-op). Browse, filter, and
sort every stat — and crown the **Ultimate Gamer** with a tunable weighting system.

Built with **React + Vite**, **Tailwind CSS**, **Framer Motion**, and **Recharts**.
Fully static — deploys to **GitHub Pages**.

## Features

- **Ultimate Gamer leaderboard** — weighted rating across all four games with live,
  draggable weight sliders. Tiered into a *Main Event* (core players) and *Guest
  Appearances* (drop-ins who only played Halo).
- **Per-game breakdowns** — sortable tables + charts. Halo filters by title / mode /
  map; AoE II shows score composition and resources gathered; StS 2 tracks clears,
  random runs and mends; Doom tracks keys found.
- **Player profiles** — per-game stat cards, a skill radar, rating breakdown, and a
  full performance timeline.
- **Retro aesthetic** — CRT scanlines, neon glow, pixel fonts, and custom game-themed
  artwork per section.

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # convert the CSV + build for production into /dist
npm run preview  # preview the production build locally
```

## Updating the data

The site reads from the Google Sheets CSV export in the project root
(`Untitled spreadsheet - Stats.csv`). To refresh stats:

1. Re-export the sheet as CSV and replace that file (keep the `.csv` extension).
2. Run `npm run convert` (or just `npm run build`, which runs it automatically).

The converter (`scripts/convert-csv.mjs`) parses the generic
`Metric/Value` column layout into clean records at `src/data/stats.json`.

### Adjusting the scoring

The Ultimate Gamer formula lives in `src/lib/scoring.js`. Default game weights and the
core-vs-guest player split are in `src/data/games.js` (`DEFAULT_WEIGHTS`,
`CORE_PLAYERS`, `GUEST_PLAYERS`). Visitors can also retune weights live on the
leaderboard page.

## Deploying to GitHub Pages

### Option A — GitHub Actions (recommended, auto-deploys on push)

1. Push this repo to GitHub.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The included workflow (`.github/workflows/deploy.yml`) builds and
   publishes automatically. Your site lands at
   `https://<username>.github.io/<repo-name>/`.

### Option B — manual one-liner

```bash
npm run deploy   # builds and pushes /dist to the gh-pages branch
```

Then set **Settings → Pages → Source: Deploy from a branch → `gh-pages`**.

> The Vite `base` is set to `'./'` (relative) and the app uses hash-based routing, so
> it works on any GitHub Pages path without extra config.

## Project structure

```
scripts/convert-csv.mjs     CSV → JSON converter
src/
  data/
    games.js                Game theming, player tiers, default weights
    stats.json              Generated data (do not edit by hand)
  lib/
    data.js                 Data access + match grouping
    aggregate.js            Per-game stat aggregation
    scoring.js              Ultimate Gamer scoring engine
    format.js               Formatting helpers
  components/
    Layout.jsx, ui.jsx, GameArt.jsx, DataTable.jsx
    games/                  HaloView, AoeView, SpireView, DoomView, MatchLog
  pages/
    Home, Leaderboard, Games, GameDetail, Players, PlayerDetail
```
