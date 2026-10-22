# Penny Hunt! 🦊

A cartoon shell game for the browser. A fox hides a penny under 3–5 cups, shuffles them (and tries to distract you at higher levels), and you tap the cup you think hides the penny. Six levels, stars, streaks, and progress saved in the browser.

Built from the Claude Design handoff in [`mockups/design_handoff_penny_hunt/`](mockups/design_handoff_penny_hunt/) — see [`PLAN.md`](PLAN.md) for the build plan.

## Stack

Bun · Vite · React 19 · TypeScript · plain CSS (design tokens in `src/styles/tokens.css`) · Vitest · Playwright. No backend — it's a static site.

## Setup (fresh Mac)

```bash
brew install oven-sh/bun/bun just prek
git clone <this repo> && cd shell-game
just setup                           # bun install + Playwright Chromium
prek install -f                      # git hooks (secret scanning etc.)
just dev                             # http://localhost:5173
```

> If `bunx playwright install` hangs, run `bunx playwright install --dry-run chromium` to get the download URL and unzip it manually into `~/Library/Caches/ms-playwright/` (see CLAUDE.md).

## Commands

| Command | What |
|---|---|
| `just dev` | Dev server with HMR |
| `just build` | Typecheck + production build → `dist/` |
| `just preview` | Serve `dist/` |
| `just test` | Unit tests (game engine + reducer) |
| `just e2e` | Playwright browser tests (desktop + mobile) |
| `just lint` | oxlint + `tsc` |
| `just check` | lint, `tsc`, unit tests, then `terraform fmt -check` and `validate` (what CI's `check` job runs; e2e is separate) |
| `just deploy` / `just smoke` | The Platform deploy and its URL check (CI runs these; from a Mac, with `AWS_PROFILE=household`) |

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

## Deploy

The game is live at **https://pennyhunt.apps.geyers.net** on the household Platform ([all-apps](https://github.com/reidg44/all-apps)): `.github/workflows/deploy.yml` runs `just check`, then `just build`, `just deploy` and `just smoke` on every push to `main`. The Platform's rules for this repo are in [`docs/platform.md`](docs/platform.md).

### GitHub Pages (side by side, for now)

`.github/workflows/pages.yml` lints, tests, builds with `BASE_PATH=/shell-game/`, and publishes `dist/` on every push to `main`. Site: https://reidg44.github.io/shell-game/

One-time setup: the repo must be **public** (or on a paid plan) for Pages, then enable Actions as the source:

```bash
gh repo edit reidg44/shell-game --visibility public --accept-visibility-change-consequences
gh api -X POST repos/reidg44/shell-game/pages -f build_type=workflow
```

`just build-pages` reproduces the CI build locally; `bunx vite preview` then serves it at `http://localhost:4173/shell-game/`.
