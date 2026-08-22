/**
 * Pure game logic. No React, no timers, no DOM — everything takes an
 * injectable `rng: () => number` (0 ≤ x < 1) so tests are deterministic.
 */
import { DISTRACT_CHANCE, LEVELS, LEVEL_COUNT, WIN_STARS } from './levels'
import type { Speed } from './levels'

export type Rng = () => number

export function pickIndex<T>(arr: readonly T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)]
}

/** Choose two distinct slots and swap whichever cups currently occupy them. */
export function swapRandomPair(positions: readonly number[], rng: Rng): number[] {
  const n = positions.length
  const a = Math.floor(rng() * n)
  let b = Math.floor(rng() * (n - 1))
  if (b >= a) b++
  const next = positions.slice()
  const ca = next.indexOf(a)
  const cb = next.indexOf(b)
  next[ca] = b
  next[cb] = a
  return next
}

export function rollDistraction(level: number, rng: Rng): boolean {
  return Boolean(LEVELS[level].tricks) && rng() < DISTRACT_CHANCE
}

/** A distraction move only counts as half a move: the fox sneaks in extra shuffles. */
export function moveCost(distract: boolean): number {
  return distract ? 0.5 : 1
}

export interface SaveData {
  stars: number
  best: number
  unlocked: number
  levelStars: number[]
  sound: boolean
  speed: Speed
}

export const DEFAULT_SAVE: SaveData = {
  stars: 0,
  best: 0,
  unlocked: 1,
  levelStars: Array(LEVEL_COUNT).fill(0),
  sound: true,
  speed: 1,
}

export interface RunState {
  streak: number
  /** consecutive wins on the current level */
  levelWins: number
}

export function applyWin(
  save: SaveData,
  run: RunState,
  level: number,
): { save: SaveData; run: RunState } {
  const streak = run.streak + 1
  const levelWins = run.levelWins + 1
  const levelStars = save.levelStars.slice()
  levelStars[level] = Math.max(levelStars[level], Math.min(3, levelWins))
  return {
    save: {
      ...save,
      stars: save.stars + WIN_STARS,
      best: Math.max(save.best, streak),
      unlocked: Math.max(save.unlocked, Math.min(LEVEL_COUNT, level + 2)),
      levelStars,
    },
    run: { streak, levelWins },
  }
}

export function applyMiss(run: RunState): RunState {
  void run
  return { streak: 0, levelWins: 0 }
}

/** Stars shown on the win card: at least one, capped at three. */
export function winStarCount(levelWins: number): number {
  return Math.min(3, Math.max(1, levelWins))
}

/** Parse whatever is in localStorage into a well-formed SaveData. */
export function parseSave(raw: string | null): SaveData {
  if (!raw) return { ...DEFAULT_SAVE, levelStars: DEFAULT_SAVE.levelStars.slice() }
  let s: Partial<SaveData> = {}
  try {
    s = JSON.parse(raw) ?? {}
  } catch {
    s = {}
  }
  const levelStars = Array.isArray(s.levelStars)
    ? Array.from({ length: LEVEL_COUNT }, (_, i) => clampInt(s.levelStars?.[i], 0, 3))
    : DEFAULT_SAVE.levelStars.slice()
  const speed = clampInt(s.speed, 0, 2) as Speed
  return {
    stars: clampInt(s.stars, 0, Number.MAX_SAFE_INTEGER),
    best: clampInt(s.best, 0, Number.MAX_SAFE_INTEGER),
    unlocked: clampInt(s.unlocked, 1, LEVEL_COUNT) || 1,
    levelStars,
    sound: s.sound !== false,
    speed: s.speed == null ? 1 : speed,
  }
}

function clampInt(v: unknown, lo: number, hi: number): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.floor(v) : lo
  return Math.min(hi, Math.max(lo, n))
}
