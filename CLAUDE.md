# Penny Hunt — notes for Claude

## What this is
Browser shell game ("Penny Hunt!") built from a Claude Design handoff. The handoff bundle in `mockups/design_handoff_penny_hunt/` is the source of truth for look, copy, timings and game rules: `README.md` there is the spec, `Penny Hunt Prototype.dc.html` is the reference implementation. `PLAN.md` documents the build plan and a few places the spec and prototype disagree.

## Commands
Package manager is **bun** (`bun install`, `bun run <script>`, `bunx <tool>`); `bun.lock` is the lockfile — don't create a `package-lock.json`.
`just dev` · `just test` (vitest) · `just e2e` (playwright, needs dev server or starts one) · `just lint` · `just build` · `just check` (everything).

## Architecture
- `src/game/engine.ts` — pure functions, injectable `rng`. All scoring/unlock rules live here.
- `src/game/reducer.ts` — phase machine `idle→peek→cover→shuffle→guess→reveal`. Random values arrive in action payloads so it's pure.
- `src/game/useGame.ts` — the only place with timers. One `useEffect` keyed on `(phase, step)` schedules the next transition; its cleanup cancels it, so leaving mid-shuffle never leaks a callback.
- Cups: `positions[cup] = slot`. The DOM keeps one `<button>` per *cup* (stable `data-testid="cup-N"`), and CSS `transition: left` animates it between slots. `data-slot` exposes where it currently is.
- Save: `src/save/useSave.ts`, localStorage key `pennyhunt-save`, validated by `parseSave`.
- Cup color theme: set `data-cup-theme="teal|purple"` on an ancestor (tokens in `tokens.css`). Not exposed in UI.

## Testing rules
- e2e stubs `Math.random = () => 0` via `addInitScript` → penny always under cup 0, so tests can win/lose deterministically.
- Playwright refuses to click `aria-disabled` buttons (reports "not stable"); use `{ force: true }` for locked-level taps.
- Never `waitForLoadState('networkidle')` with Vite.

## Gotchas
- Playwright 1.62 on Node 26: `npx playwright install` hangs (bunx may not). `bunx playwright install --dry-run chromium` prints the real URL (CfT builds live at `https://cdn.playwright.dev/builds/cft/<ver>/mac-arm64/chrome-headless-shell-mac-arm64.zip` — no `/dbazure/download/playwright` prefix). Unzip into `~/Library/Caches/ms-playwright/chromium_headless_shell-<rev>/` and `touch INSTALLATION_COMPLETE DEPENDENCIES_VALIDATED`.
- `fox-sitting.svg` blinks via SMIL `<animate>`; keep loading it through `<img>`, don't inline it as JSX.
- React StrictMode double-invokes effects in dev, so phase-entry sounds can play twice in `just dev`. Production is unaffected.
- The headless screenshot browser renders emoji monochrome; that's the browser, not the CSS.

## Deploy
GitHub Pages via `.github/workflows/deploy.yml`. Vite `base` comes from `BASE_PATH` (CI sets `/shell-game/`; dev is `/`). Any new static asset in `public/` must be referenced with `import.meta.env.BASE_URL` in JSX, never a bare `/path` — Vite rewrites `index.html` but not JSX string literals.
