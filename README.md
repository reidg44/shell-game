# Penny Hunt! 🦊

A cartoon shell game for the browser. A fox hides a penny under 3–5 cups, shuffles them (and tries to distract you at higher levels), and you tap the cup you think hides the penny. Six levels, stars, streaks, and progress saved in the browser.

Built from the Claude Design handoff in [`mockups/design_handoff_penny_hunt/`](mockups/design_handoff_penny_hunt/) — see [`PLAN.md`](PLAN.md) for the build plan.

## Stack

Vite · React 19 · TypeScript · plain CSS (design tokens in `src/styles/tokens.css`) · Vitest · Playwright. No backend — it's a static site.

## Setup (fresh Mac)

```bash
brew install node just prek          # Node 20+ (tested on 26)
git clone <this repo> && cd shell-game
just setup                           # npm install + Playwright Chromium
prek install -f                      # git hooks (secret scanning etc.)
just dev                             # http://localhost:5173
```

> If `npx playwright install` hangs on Node 26, run `npx playwright install --dry-run chromium` to get the download URL and unzip it manually into `~/Library/Caches/ms-playwright/` (see CLAUDE.md).

## Commands

| Command | What |
|---|---|
| `just dev` | Dev server with HMR |
| `just build` | Typecheck + production build → `dist/` |
| `just preview` | Serve `dist/` |
| `just test` | Unit tests (game engine + reducer) |
| `just e2e` | Playwright browser tests (desktop + mobile) |
| `just lint` | oxlint + `tsc` |
| `just check` | All of the above, what CI would run |

## Project layout

```
src/
  game/        levels, copy, pure engine, reducer (state machine), useGame (timers)
  save/        localStorage persistence ('pennyhunt-save')
  audio/       WebAudio bleeps
  components/  TitleScreen, LevelSelect, GameTable (+ overlays), SettingsModal, common/
  styles/      tokens.css, keyframes.css, base.css
  test/        vitest specs
e2e/           playwright specs
public/        fox.svg, fox-sitting.svg
```

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` lints, tests, builds with `BASE_PATH=/shell-game/`, and publishes `dist/` on every push to `main`. Site: https://reidg44.github.io/shell-game/

One-time setup: the repo must be **public** (or on a paid plan) for Pages, then enable Actions as the source:

```bash
gh repo edit reidg44/shell-game --visibility public --accept-visibility-change-consequences
gh api -X POST repos/reidg44/shell-game/pages -f build_type=workflow
```

`just build-pages` reproduces the CI build locally; `npx vite preview` then serves it at `http://localhost:4173/shell-game/`.
