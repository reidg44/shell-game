import { describe, expect, it } from 'vitest'
import {
  applyMiss,
  applyWin,
  DEFAULT_SAVE,
  moveCost,
  parseSave,
  rollDistraction,
  swapRandomPair,
  winStarCount,
} from '../game/engine'
import { LEVEL_COUNT, LEVELS, MIN_MOVE_MS, moveMs, SPEED_MULT, WIN_SPEEDUP, WIN_SPEEDUP_MAX_WINS } from '../game/levels'
import type { Speed } from '../game/levels'

/** n zeros padded to the level count, with the given leading values. */
const stars = (...lead: number[]) => [...lead, ...Array(LEVEL_COUNT - lead.length).fill(0)]

/** Deterministic rng that yields the given sequence, then repeats the last value. */
const seq = (...vals: number[]) => {
  let i = 0
  return () => vals[Math.min(i++, vals.length - 1)]
}

describe('swapRandomPair', () => {
  it('swaps exactly two distinct cups', () => {
    for (let n = 3; n <= 5; n++) {
      const start = Array.from({ length: n }, (_, i) => i)
      for (let trial = 0; trial < 200; trial++) {
        const next = swapRandomPair(start, Math.random)
        const changed = next.filter((v, i) => v !== start[i])
        expect(changed).toHaveLength(2)
        expect([...next].sort()).toEqual(start)
      }
    }
  })
  it('never picks the same slot twice (b >= a is bumped)', () => {
    // a = floor(0.5*3)=1, b = floor(0.5*2)=1 → bumped to 2
    expect(swapRandomPair([0, 1, 2], seq(0.5, 0.5))).toEqual([0, 2, 1])
  })
  it('swaps cups by the slot they occupy, not by cup index', () => {
    // cup0→slot2, cup1→slot0, cup2→slot1. Swap slots 0 and 1 → cup1 gets 1, cup2 gets 0.
    expect(swapRandomPair([2, 0, 1], seq(0, 0))).toEqual([2, 1, 0])
  })
})

describe('moveMs', () => {
  it('applies the speed multiplier to every level', () => {
    LEVELS.forEach((cfg, i) => {
      ;([0, 1, 2] as Speed[]).forEach((sp) => {
        expect(moveMs(i, sp)).toBeCloseTo(Math.max(MIN_MOVE_MS, cfg.ms * SPEED_MULT[sp]))
      })
    })
  })
  it('first round on a level is the base speed', () => {
    expect(moveMs(0, 1, 0)).toBe(LEVELS[0].ms)
  })
  it('trick levels run at the same base speed as the level before them', () => {
    LEVELS.forEach((cfg, i) => {
      if (cfg.tricks && i > 0) expect(cfg.ms).toBe(LEVELS[i - 1].ms)
    })
  })
  it('even levels (as players count them: 2, 4, 6…) are faster than the level before', () => {
    LEVELS.forEach((cfg, i) => {
      if ((i + 1) % 2 === 0) expect(cfg.ms).toBeLessThan(LEVELS[i - 1].ms)
    })
  })
  it('trick levels do not speed up on a win streak', () => {
    const trick = LEVELS.findIndex((c) => c.tricks)
    expect(moveMs(trick, 1, 3)).toBe(moveMs(trick, 1, 0))
  })
  it('each consecutive win on the level makes the shuffle faster', () => {
    const times = [0, 1, 2, 3].map((w) => moveMs(1, 1, w))
    for (let i = 1; i < times.length; i++) expect(times[i]).toBeLessThan(times[i - 1])
    expect(moveMs(1, 1, 1)).toBeCloseTo(LEVELS[1].ms * WIN_SPEEDUP)
  })
  it('stops speeding up after a few wins', () => {
    expect(moveMs(1, 1, WIN_SPEEDUP_MAX_WINS + 10)).toBe(moveMs(1, 1, WIN_SPEEDUP_MAX_WINS))
  })
  it('never goes below the floor, at any level, speed or win streak', () => {
    LEVELS.forEach((_, i) => {
      ;([0, 1, 2] as Speed[]).forEach((sp) => {
        expect(moveMs(i, sp, 99)).toBeGreaterThanOrEqual(MIN_MOVE_MS)
      })
    })
  })
})

describe('distraction tricks', () => {
  it('only fires on trick levels', () => {
    expect(rollDistraction(1, () => 0)).toBe(false)
    expect(rollDistraction(2, () => 0)).toBe(true)
    expect(rollDistraction(2, () => 0.5)).toBe(false)
    expect(rollDistraction(4, () => 0.21)).toBe(true)
  })
  it('odd levels (as players count them: 1, 3, 5…) are the trick levels', () => {
    LEVELS.forEach((cfg, i) => expect(Boolean(cfg.tricks)).toBe((i + 1) % 2 === 1))
  })
  it('a distraction counts as half a move', () => {
    expect(moveCost(true)).toBe(0.5)
    expect(moveCost(false)).toBe(1)
  })
})

describe('applyWin', () => {
  it('awards 5 stars, bumps streak/best, unlocks the next level', () => {
    const { save, run } = applyWin(DEFAULT_SAVE, { streak: 0, levelWins: 0 }, 0)
    expect(save.stars).toBe(5)
    expect(save.best).toBe(1)
    expect(save.unlocked).toBe(2)
    expect(save.levelStars[0]).toBe(1)
    expect(run).toEqual({ streak: 1, levelWins: 1 })
  })
  it('caps level stars at 3 and never lowers them', () => {
    let s = { ...DEFAULT_SAVE, levelStars: stars(3) }
    s = applyWin(s, { streak: 0, levelWins: 0 }, 0).save
    expect(s.levelStars[0]).toBe(3)
    s = applyWin(s, { streak: 4, levelWins: 4 }, 1).save
    expect(s.levelStars[1]).toBe(3)
  })
  it('never unlocks past the last level', () => {
    const last = LEVEL_COUNT - 1
    const s = applyWin({ ...DEFAULT_SAVE, unlocked: LEVEL_COUNT }, { streak: 0, levelWins: 0 }, last).save
    expect(s.unlocked).toBe(LEVEL_COUNT)
  })
  it('does not regress an existing unlock', () => {
    const s = applyWin({ ...DEFAULT_SAVE, unlocked: 5 }, { streak: 0, levelWins: 0 }, 0).save
    expect(s.unlocked).toBe(5)
  })
  it('best only grows', () => {
    const s = applyWin({ ...DEFAULT_SAVE, best: 9 }, { streak: 2, levelWins: 0 }, 0).save
    expect(s.best).toBe(9)
  })
})

describe('applyMiss', () => {
  it('resets the run and nothing else', () => {
    expect(applyMiss({ streak: 7, levelWins: 3 })).toEqual({ streak: 0, levelWins: 0 })
  })
})

describe('winStarCount', () => {
  it('always shows at least one star, at most three', () => {
    expect(winStarCount(0)).toBe(1)
    expect(winStarCount(1)).toBe(1)
    expect(winStarCount(3)).toBe(3)
    expect(winStarCount(10)).toBe(3)
  })
})

describe('parseSave', () => {
  it('returns defaults for missing or corrupt data', () => {
    expect(parseSave(null)).toEqual(DEFAULT_SAVE)
    expect(parseSave('{not json')).toEqual(DEFAULT_SAVE)
    expect(parseSave('null')).toEqual(DEFAULT_SAVE)
  })
  it('round-trips a valid save', () => {
    const s = { stars: 40, best: 3, unlocked: 4, levelStars: stars(3, 2, 1), sound: false, speed: 2 }
    expect(parseSave(JSON.stringify(s))).toEqual(s)
  })
  it('clamps out-of-range values', () => {
    const s = parseSave(JSON.stringify({ unlocked: 99, speed: 7, levelStars: [9, -1], stars: -5 }))
    expect(s.unlocked).toBe(LEVEL_COUNT)
    expect(s.speed).toBe(2)
    expect(s.levelStars).toEqual(stars(3))
    expect(s.stars).toBe(0)
    expect(s.sound).toBe(true)
  })
  it('opens the level after the last one beaten (old 6-level saves)', () => {
    // Back when there were 6 levels, beating L6 left unlocked capped at 6.
    const old = { stars: 200, best: 9, unlocked: 6, levelStars: [3, 3, 3, 3, 3, 1], sound: true, speed: 1 }
    const s = parseSave(JSON.stringify(old))
    expect(s.unlocked).toBe(7)
    expect(s.levelStars).toEqual(stars(3, 3, 3, 3, 3, 1))
  })
  it('does not unlock anything on a save with no stars', () => {
    expect(parseSave(JSON.stringify({ unlocked: 1, levelStars: [] })).unlocked).toBe(1)
  })
})

describe('LEVELS', () => {
  it('never gets easier: cups and moves never drop, and fit on the table', () => {
    LEVELS.forEach((cfg, i) => {
      expect(cfg.cups).toBeGreaterThanOrEqual(3)
      expect(cfg.cups).toBeLessThanOrEqual(7)
      if (i === 0) return
      const prev = LEVELS[i - 1]
      expect(cfg.cups).toBeGreaterThanOrEqual(prev.cups)
      if (cfg.cups === prev.cups) expect(cfg.moves).toBeGreaterThan(prev.moves)
    })
  })
})
