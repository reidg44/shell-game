export interface LevelConfig {
  cups: number
  moves: number
  /** base ms per shuffle move, before speed multiplier */
  ms: number
  tricks?: boolean
}

export const LEVELS: readonly LevelConfig[] = [
  { cups: 3, moves: 5, ms: 560 },
  { cups: 3, moves: 7, ms: 430 },
  { cups: 4, moves: 8, ms: 400 },
  { cups: 4, moves: 10, ms: 330, tricks: true },
  { cups: 5, moves: 11, ms: 300 },
  { cups: 5, moves: 13, ms: 260, tricks: true },
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

export function moveMs(level: number, speed: Speed): number {
  return LEVELS[level].ms * SPEED_MULT[speed]
}

export function levelSubLabel(level: number): string {
  const cfg = LEVELS[level]
  return `${cfg.cups} cups${cfg.tricks ? ' + tricks' : ''}`
}
