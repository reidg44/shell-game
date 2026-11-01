export interface LevelConfig {
  cups: number
  moves: number
  /** base ms per shuffle move, before speed multiplier */
  ms: number
  tricks?: boolean
}

export const LEVELS: readonly LevelConfig[] = [
  // Levels alternate (counting from 1): odd levels add tricks and keep the
  // previous level's speed (no win-streak ramp either); even levels are the
  // faster ones. The handoff had tricks on L4/L6 only.
  { cups: 3, moves: 5, ms: 560, tricks: true },
  { cups: 3, moves: 7, ms: 430 },
  { cups: 4, moves: 8, ms: 430, tricks: true },
  { cups: 4, moves: 10, ms: 330 },
  { cups: 5, moves: 11, ms: 330, tricks: true },
  { cups: 5, moves: 13, ms: 260 },
  // Beyond the original handoff (which stops at 6): same curve, up to 7 cups.
  { cups: 5, moves: 15, ms: 260, tricks: true },
  { cups: 6, moves: 12, ms: 240 },
  { cups: 6, moves: 15, ms: 240, tricks: true },
  { cups: 6, moves: 18, ms: 210 },
  { cups: 7, moves: 16, ms: 210, tricks: true },
  { cups: 7, moves: 20, ms: 180 },
]

export const LEVEL_COUNT = LEVELS.length

export type Speed = 0 | 1 | 2
export const SPEED_LABELS = ['Chill', 'Zippy', 'Chaos'] as const
export const SPEED_MULT: Record<Speed, number> = { 0: 1.35, 1: 1, 2: 0.68 }

/** Chance per move that a trick level fires a distraction line. */
export const DISTRACT_CHANCE = 0.22

/** Timings (ms) */
export const PEEK_MS = 1300
export const COVER_MS = 450
export const REVEAL_MS = 950
/** Extra gap after each move's transition before the next move. */
export const MOVE_GAP_MS = 60

export const WIN_STARS = 5

/** Each consecutive win on a level multiplies move time by this… */
export const WIN_SPEEDUP = 0.92
/** …for up to this many wins (0.92^4 ≈ 28% faster), then it holds. */
export const WIN_SPEEDUP_MAX_WINS = 4
/** No move is ever shorter than this, so the slide stays trackable. */
export const MIN_MOVE_MS = 100

/**
 * ms per shuffle move. `levelWins` (consecutive wins on this level, reset by
 * a miss or a level change) speeds the shuffle up as the run goes on — except
 * on trick levels, which hold a steady speed.
 */
export function moveMs(level: number, speed: Speed, levelWins = 0): number {
  const cfg = LEVELS[level]
  const ramp = cfg.tricks ? 1 : WIN_SPEEDUP ** Math.min(levelWins, WIN_SPEEDUP_MAX_WINS)
  return Math.max(MIN_MOVE_MS, cfg.ms * SPEED_MULT[speed] * ramp)
}

export function levelSubLabel(level: number): string {
  const cfg = LEVELS[level]
  return `${cfg.cups} cups${cfg.tricks ? ' + tricks' : ''}`
}
