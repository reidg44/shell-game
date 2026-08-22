# Penny Hunt — Build Plan

Source of truth: `mockups/design_handoff_penny_hunt/` (README.md = spec, `Penny Hunt Prototype.dc.html` = reference implementation, `fox.svg` / `fox-sitting.svg` = art).

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Vite + React 19 + TypeScript** | Prototype is already a React-style class component (`setState`, `componentWillUnmount`); the port is nearly mechanical. No routing/SSR needed — it's a single-page game. |
| Styling | **Plain CSS + CSS custom properties** (one `tokens.css`, one file per component) | The design is ~25 hard-coded tokens and 7 keyframes. Tailwind/CSS-in-JS adds nothing; hand-written CSS lets us match the spec pixel-for-pixel. |
| State | `useReducer` for the game machine + a tiny `useSave()` hook for localStorage | Phase transitions (`peek → cover → shuffle → guess → reveal`) are a state machine; a reducer makes them explicit and testable. No external store. |
| Audio | Hand-rolled WebAudio module (`sound.ts`) | Prototype already does it in ~15 lines; no library. |
| Fonts | Google Fonts Nunito 400/700/900 via `<link>` (self-host later if offline play matters) | Per spec. |
| Unit tests | **Vitest** | Game engine is pure functions — swap, scoring, unlock, star rating. |
| E2E | **Playwright** (see `playwright-e2e-setup` skill) | Required: play a full round in a real browser before calling it done. |
| Tooling | `justfile`, `prek` + `betterleaks` hooks, `.gitignore` (`.env`, keys, certs) | Standard project setup (`bootstrap-project` skill, minus Python). |
| Deploy | Static build → GitHub Pages / Cloudflare Pages (decide later) | Pure static app, no backend. |

## 2. Project layout

```
shell-game/
├── justfile                  # dev / build / test / e2e / lint
├── index.html                # Nunito link, viewport meta
├── public/
│   ├── fox.svg
│   └── fox-sitting.svg       # keep SVG-native blink <animate> → must load via <img>, not inline
├── src/
│   ├── main.tsx
│   ├── App.tsx               # screen router: title | levels | game  (+ settings modal)
│   ├── styles/
│   │   ├── tokens.css        # colors, radii, shadows, font sizes from README "Design Tokens"
│   │   └── keyframes.css     # ph-pop, ph-fall, ph-bounce, ph-idle, ph-wiggle, ph-excite, ph-shake
│   ├── game/
│   │   ├── levels.ts         # LEVELS table (cups/moves/ms/tricks), SPEED_MULT [1.35, 1, .68]
│   │   ├── lines.ts          # DISTRACT / WINL / LOSEL copy
│   │   ├── engine.ts         # pure fns: swapRandomPair(positions, rng), moveMs(level, speed), applyWin(save, level), applyMiss
│   │   ├── reducer.ts        # GameState + actions: START_LEVEL, COVER, SHUFFLE_STEP, GUESS_READY, PICK, SHOW_RESULT, LEAVE
│   │   └── useGame.ts        # reducer + timer scheduling (owns all setTimeouts; clears on unmount/leave)
│   ├── save/
│   │   └── useSave.ts        # localStorage 'pennyhunt-save': stars, best, unlocked, levelStars[6], sound, speed
│   ├── audio/
│   │   └── sound.ts          # beep(freq, dur, type); peek/shuffle/win/lose/locked helpers; respects sound flag
│   ├── components/
│   │   ├── common/   RoundButton, Pill, CtaButton, SpeechBubble, FoxAvatar, Penny, Scrim
│   │   ├── TitleScreen.tsx
│   │   ├── LevelSelect.tsx   + LevelCard.tsx
│   │   ├── GameTable.tsx     + CupArena.tsx + Cup.tsx + StatusLine.tsx
│   │   ├── WinOverlay.tsx / MissOverlay.tsx
│   │   └── SettingsModal.tsx
│   └── test/                 # vitest unit tests for engine/reducer
├── e2e/                      # playwright specs
└── mockups/                  # design handoff (keep in repo as reference)
```

## 3. Build phases

### Phase 0 — Scaffold (½ hr)
- `npm create vite@latest` (react-ts), install Vitest + Playwright, `justfile`, `prek`/`betterleaks`, `.gitignore`.
- Copy SVGs to `public/`, write `tokens.css` + `keyframes.css` straight from the README.
- Verify Nunito renders and the two-tone gradient background (`#8fd2f7 62% / #f7d98b 62%`) shows.

### Phase 1 — Game engine, no UI (1 hr)
- `levels.ts`, `engine.ts`, `reducer.ts` as pure TS; inject `rng` so tests are deterministic.
- Unit tests: pair swap always swaps exactly 2 distinct slots; trick moves count 0.5; `moveMs` for all 6×3 combos; win → +5 stars, streak+1, best, unlock `min(6, level+2)`, levelStars = `max(prev, min(3, levelWins))`; miss → streak/levelWins reset, nothing else touched; `levelWins` persists when replaying same level, resets on a different one.
- `useGame.ts`: timers array, `wait()`, `startLevel`, `runShuffle`, `pick`. Every timeout registered; `LEAVE`/unmount clears all (README calls this out explicitly).

### Phase 2 — Screens, static first (2 hr)
Build each screen against the prototype side-by-side in the browser:
1. **Title** — wordmark (-3°, `min(56px,13vw)`), bouncing penny, sitting fox + bubble, Play CTA, footer stats, sound/settings buttons.
2. **Level select** — 3-col grid, locked cards (🔒, 55% white, no shadow, buzz on click), star rows, fox row.
3. **Game table** — header cluster, cup arena, status line, fox row.
4. **Settings modal** — sound toggle, speed segmented control, reset.
5. **Win / Miss overlays** — scrim + blur, pop-in, confetti loop.

Shared pieces (`RoundButton`, `Pill`, `CtaButton`, `SpeechBubble`, `FoxAvatar`) are extracted first since they repeat across screens.

### Phase 3 — Wire up the loop (1 hr)
- Cup positioning: `left = (slot+1)/(n+1)*100%`, `translateX(-50%)`; lift `translateY(-78px)`; `transition: left {moveMs}s cubic-bezier(.45,0,.25,1), transform .3s, background .3s`.
- Penny tracks `positions[penny]`, opacity only during peek/reveal, z-index below cups.
- Fox head animation keyed off phase/result (idle / wiggle / shake / excite).
- Host lines: distraction line replaces "Follow that cup!" on trick moves; win/lose lines random; `{n}` substitution on lose.
- Sound hooks at each phase (peek chirp, per-move triangle tick 200–320 Hz, C5-E5-G5 arpeggio, sawtooth slide, square buzz for locked).

### Phase 4 — Persistence + settings (½ hr)
- `useSave` reads once on boot (try/catch on parse), writes after every win/miss/setting change, reset wipes progress but keeps sound/speed.

### Phase 5 — Polish & a11y (1 hr)
- Cups are `<button>`s with `aria-label="Cup 1"`, disabled outside `guess` phase; overlays trap focus; `prefers-reduced-motion` disables idle/confetti loops (not the shuffle — it's gameplay).
- Hit targets ≥ 40px; test at 360px width (5 cups) and desktop.
- Keep the prototype's `cupTheme` (orange/teal/purple) as a CSS variable set so it's a one-line swap later; don't expose in Settings yet.

### Phase 6 — E2E + ship (1 hr)
- Playwright: title → levels → L1 → wait for guess phase → click the cup whose `data-slot` matches the penny (expose penny slot via `data-testid` only in test builds, or stub `Math.random`) → win overlay → next round; miss path; locked level buzz; settings persist across reload; reset clears.
- `just build`, preview, deploy.

## 4. Things the README understates (found in prototype source)
- Shuffle delay is `moveMs() + 60` per step, not `moveMs()`.
- Host line during shuffle only changes on the *first* move or a distraction; otherwise it's carried forward.
- `levelWins` is preserved only if you replay the **same** level (`Next round`); picking any other level resets it.
- Win stars shown = `min(3, max(1, levelWins))` — always at least one.
- The active level number on the level grid turns orange (`#f4602e`) while `screen==='game'` — effectively dead code since the grid isn't visible then. Skip it.
- `cupTheme` / `confetti` are design-time props on the prototype, not user settings.
- Fox blink lives inside `fox-sitting.svg` as SMIL `<animate>`; React inlining as JSX would need `animate` elements preserved — simplest to keep loading via `<img>`.

## 5. Open decisions (defaults chosen; flag if you disagree)
- **React** over vanilla/Svelte — the prototype is already React-shaped.
- **No router** — three screens in one reducer; URL state isn't worth it for a game.
- **Emoji for glyphs/confetti** kept as-is (spec allows swapping for an icon set if off-brand).
- **Deploy target** — undecided; the build is static so it can go anywhere.

Estimated total: ~7 focused hours to a shippable, tested v1.
