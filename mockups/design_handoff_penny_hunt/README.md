# Handoff: Penny Hunt — Browser Shell Game

## Overview
"Penny Hunt!" is a playful cartoon shell game played in the browser: a fox host hides a penny under one of 3–5 cups, shuffles them with animated moves (including distraction tricks at higher levels), and the player taps the cup they think hides the penny. Progression is stars + levels with unlocks, streaks, and persistent save state.

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these designs in the target codebase's existing environment** (React, Vue, SwiftUI, native, etc.) using its established patterns and libraries — or, if no environment exists yet, choose the most appropriate framework for the project and implement the designs there.

## Fidelity
**High-fidelity (hifi).** `Penny Hunt Prototype.dc.html` is a fully working prototype with final colors, typography, spacing, copy, animations, and game logic. Recreate the UI pixel-perfectly using the codebase's existing libraries. `Shell Game Options.dc.html` contains the earlier static explorations (turn 2 = the chosen direction's screen set) and is reference-only.

## Screens / Views

### 1. Title screen
- **Purpose**: Entry point; start the game, open settings, toggle sound.
- **Layout**: Full-viewport column, centered. Background: `linear-gradient(#8fd2f7 62%, #f7d98b 62%)` (sky over sand).
- **Components**:
  - Sound + settings buttons, absolute top-right (18px inset): 44px white circles, `box-shadow: 0 3px 0 rgba(58,143,196,.5)`, 18px emoji glyphs (🔊/🔇, ⚙️). Hover: `translateY(-2px)`.
  - Wordmark "Penny / Hunt!" (2 lines): Nunito 900, `min(56px, 13vw)`, white, `text-shadow: 0 4px 0 #3a8fc4`, rotated -3°, 40px top margin.
  - Bouncing penny: 60px circle, `radial-gradient(circle at 35% 30%, #ffd98a, #e09b3d)`, 4px white border, `box-shadow: 0 4px 0 rgba(160,100,20,.35)`, text "1¢" Nunito 900 20px `#8a5a14`, rotated 12°, animation `ph-bounce 2.4s ease infinite` (translateY 0 → -8px → 0).
  - Sitting fox (`fox-sitting.svg`) directly below the penny, height `min(300px, 38vh)`, idle bob animation (`ph-idle` 3s: translateY ±4px + rotate ±2°, transform-origin 50% 90%). Speech bubble to its right: white, radius `14px 14px 14px 3px`, padding 10px 14px, Nunito 700 14px `#3a6a8c`, `box-shadow: 0 3px 0 rgba(58,143,196,.35)`, max-width 140px, copy: "Think you can keep up with these paws?"
  - Primary CTA "Play!": Nunito 900 21px white on `linear-gradient(#5ecf70, #38a84e)`, padding 16px 64px, pill (100px radius), `box-shadow: 0 6px 0 #237a35`. Active: translateY(3px) + shadow 0 2px.
  - Footer stat line: Nunito 700 14px `#a3641c`: "Best streak: {n} · ⭑ {stars}".

### 2. Level select
- **Purpose**: Pick one of 6 levels; locked levels show 🔒.
- **Layout**: Column, max-width 560px centered, padding 22px 24px 28px. Same background (gradient stop at 70%).
- **Components**:
  - Header row: back button (42px white circle, "←" `#3a8fc4`), title "Pick a level" (Nunito 900 22px white, shadow `0 3px 0 #3a8fc4`), star pill (Nunito 900 13px `#a3641c` on `#ffe9b8`, 3px white border, pill, shadow `0 3px 0 rgba(58,143,196,.5)`).
  - Level grid: 3 columns, 14px gap. Unlocked card: white, radius 18px, padding 14px 8px 10px, `box-shadow: 0 4px 0 rgba(58,143,196,.4)`, hover translateY(-3px). Contents: level number (Nunito 900 26px `#3a8fc4`), earned stars row ("⭑" repeated, `#ffb01e`, 13px; "·" when none), sub-label (Nunito 700 11px `#8fa8ba`), e.g. "3 cups", "4 cups + tricks". Locked card: `rgba(255,255,255,.55)`, no shadow, 🔒 glyph, not clickable (plays low buzz).
  - Fox row at bottom: 60px circle avatar (white bg, 4px `#ffb35c` border) containing `fox.svg` head at 160% scale, idle bob; bubble copy: "Level 4 is where I start playing dirty…".

### 3. Game table
- **Purpose**: Core loop — peek, shuffle, guess, reveal.
- **Layout**: Column, max-width 760px centered, padding 18px 22px 24px.
- **Components**:
  - Header: back button + "Level {n}" (Nunito 900 18px white, shadow `0 2px 0 #3a8fc4`); right cluster: star pill (as above), streak pill (white bg, `#3a8fc4` text), 40px sound toggle circle.
  - Cup arena: relative container, height `min(300px, 42vh)`. Cups are absolutely positioned trapezoids: width `min(104px, (66/cupCount)vw)`, aspect-ratio 0.94, `clip-path: polygon(14% 0, 86% 0, 100% 100%, 0 100%)`, radius 8px, fill `linear-gradient(#ff8a5c, #f4602e)` (orange theme). Horizontal slot positions: `left = (slot+1)/(n+1) * 100%`, translateX(-50%), bottom 22px. Lift (peek/reveal): translateY(-78px), `transform .3s ease`. Slide between slots: `left` transition with `cubic-bezier(.45,0,.25,1)`, duration = level ms × speed multiplier. Wrong pick recolors to `linear-gradient(#c9d4dc, #9fb0bc)` (gray).
  - Penny in arena: 46px coin (same style as title), positioned by the penny's slot, visible only during peek/reveal (opacity transition .25s), z-index below cups.
  - Status line: Nunito 900 18px white, `text-shadow: 0 2px 0 #d68a2e`, centered. Copy by phase: "Watch the penny…" / "Here we go!" / "Follow that cup!" / "Tap the cup with the penny!" / "You found it!" or "It was over here!"
  - Fox row: 62px avatar circle + bubble (max-width 250px). Fox head animation by phase: idle bob; shuffle = `ph-wiggle` .35s (rotate ±7°); player wins = `ph-shake` .6s (startled); player loses = `ph-excite` .9s (gloat bounce).

### 4. Win overlay
- Fixed full-viewport scrim `rgba(143,210,247,.55)` + `backdrop-filter: blur(3px)`, centered white card (radius 26px, `box-shadow: 0 8px 0 rgba(58,143,196,.4)`, padding 30px 38px, pop-in `ph-pop` .35s: scale .6→1.08→1).
- Contents: falling confetti emoji (🎉 ✨ 🎊, `ph-fall` loop, toggleable), "You found it!" (Nunito 900 28px `#f4a422`), 1–3 stars (32px, `#ffd23e`, shadow `0 3px 0 #d68a2e`) based on consecutive wins in the level, "+5 stars · streak {n}" (Nunito 900 14px `#a3641c`), green "Next round →" pill CTA, secondary "Level select" (Nunito 900 13px `#3a8fc4` on `#eef6fb`, pill).

### 5. Miss overlay
- Same scrim/card. "So close!" (Nunito 900 28px `#3a8fc4`), fox line (e.g. "Watch my paws this time!"), green "Try again" CTA, "Level select" secondary. **No penalty** — streak resets, retry is free.

### 6. Settings modal
- Fixed scrim `rgba(30,60,80,.4)` + blur, card `linear-gradient(#8fd2f7, #aadcf7)`, radius 26px, width `min(340px, 86vw)`, padding 24px.
- Rows (white, radius 18px, padding 14px 16px, shadow `0 4px 0 rgba(58,143,196,.4)`, labels Nunito 900 15px `#3a6a8c`, no-wrap):
  - "🔊 Sound" — toggle: 58×32px pill track (`#5ecf70` on / `#c9d4dc` off), 26px white knob, .2s slide.
  - "🌀 Shuffle speed" — 3 segmented pills: Chill / Zippy / Chaos. Selected: `linear-gradient(#ffb35c, #f4602e)` white text; unselected: `#eef6fb` `#8fa8ba`.
  - "🗑️ Reset progress" — outlined "Reset" pill (`#c0402a` 2px border); hover fills red with white text.

## Interactions & Behavior
- **Game loop**: startLevel → peek (penny shown 1300ms, cups lifted over it) → cover (450ms) → N shuffle moves (random pair swap per move; positions animate via `left`) → guess (cups clickable) → reveal (picked + penny cups lift, 950ms) → win/miss overlay.
- **Levels** (cups / moves / base ms per move): L1 3/5/560, L2 3/7/430, L3 4/8/400, L4 4/10/330 +tricks, L5 5/11/300, L6 5/13/260 +tricks.
- **Speed setting** multiplies move duration: Chill ×1.35, Zippy ×1, Chaos ×0.68.
- **Distraction tricks** (trick levels only): ~22% chance per move the fox says a distraction line ("Whoa, is that a seagull with your sandwich?! 👀", "Look! A dog on a skateboard!", …) and that move counts only half — effectively extra shuffling while the player's eye is pulled away.
- **Win**: +5 stars, streak +1, best streak updated, next level unlocked (up to 6). Level star rating = min(3, consecutive wins on that level).
- **Miss**: streak and per-level win-run reset to 0; no other penalty.
- **Sound**: WebAudio oscillator bleeps (peek chirp, shuffle ticks ~200–320Hz triangle 50ms, win arpeggio C5-E5-G5, lose sawtooth slide, locked-level buzz). Toggle everywhere; default on.
- **Fox blink**: SVG-native `<animate>` on eyelid ellipses inside `fox-sitting.svg` (every 4.2s) — survives being loaded via `<img>`.
- **Responsive**: single fluid layout; cup width and arena height use vw/vh clamps; wordmark scales with vw. Hit targets ≥ 40px.

## State Management
- `screen`: 'title' | 'levels' | 'game'; `showSettings` boolean.
- Game: `level`, `phase` ('idle'|'peek'|'cover'|'shuffle'|'guess'|'reveal'), `positions[]` (cup→slot map), `penny` (cup index), `picked`, `result`, `showResult`, `hostLine`, `streak`, `levelWins`.
- Persisted (localStorage key `pennyhunt-save`): `stars`, `best`, `unlocked`, `levelStars[6]`, `sound`, `speed`.
- Timers must be cleared on unmount/navigation to avoid orphaned shuffle callbacks.

## Design Tokens
- **Colors**: sky `#8fd2f7`, sand `#f7d98b`; blue accents `#3a8fc4` (shadows/links) and `#3a6a8c` (body text); cup orange `#ff8a5c`→`#f4602e`; alt cup themes teal `#5ad0c8`→`#1f9e94`, purple `#b58cf0`→`#7e4fd0`; wrong-cup gray `#c9d4dc`→`#9fb0bc`; penny `#ffd98a`→`#e09b3d`, text `#8a5a14`; gold `#ffd23e` / `#ffb01e`, amber shadow `#d68a2e`, amber text `#a3641c`, cream `#ffe9b8`; CTA green `#5ecf70`→`#38a84e`, shadow `#237a35`; fox border `#ffb35c`; muted `#8fa8ba`; light bg `#eef6fb`; danger `#c0402a`.
- **Typography**: Nunito (Google Fonts), weights 400/700/900. Wordmark min(56px,13vw)/900; screen titles 20–22px/900; buttons 13–21px/900; body/bubbles 13–14px/700; sub-labels 10–11px/700.
- **Radius**: pills 100px; cards 18px; overlay cards 26px; cups 8px; bubbles 14px with 3px anchor corner.
- **Shadows** (hard cartoon offsets, no blur): controls `0 3px 0 rgba(58,143,196,.5)`; cards `0 4px 0 rgba(58,143,196,.4)`; CTA `0 6px 0 #237a35` (rest) / `0 2px 0` (pressed); overlay card `0 8px 0 rgba(58,143,196,.4)`.
- **Motion**: pop-in .35s; cup lift .3s ease; shuffle move `cubic-bezier(.45,0,.25,1)`; idle bob 2.6–3s; blink 4.2s.

## Assets
- `fox.svg` — fox head (user-provided art, cleaned): used in circular avatar badges on level select and game table.
- `fox-sitting.svg` — full-body sitting fox derived from the head art (big head, no neck, four legs, tail, blink animation): title screen mascot.
- All other graphics are pure CSS (cups via clip-path, penny via radial-gradient). Emoji used for confetti and settings glyphs — replace with the codebase's icon system if emoji are off-brand.

## Files
- `Penny Hunt Prototype.dc.html` — the playable hifi prototype (all screens, logic, tweakable cup theme + confetti). Primary reference.
- `Shell Game Options.dc.html` — exploration board: turn 1 = 5 art directions, turn 2 = chosen direction's full static screen set.
- `fox.svg`, `fox-sitting.svg` — mascot art.
