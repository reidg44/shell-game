import { describe, expect, it } from 'vitest'
import { gameReducer, INITIAL_GAME } from '../game/reducer'
import type { GameAction, GameState } from '../game/reducer'
import { LINE_GUESS, LINE_MISS, LINE_PEEK, LINE_SHUFFLE } from '../game/lines'

const run = (actions: GameAction[], start: GameState = INITIAL_GAME) =>
  actions.reduce(gameReducer, start)

const start = (level = 0, penny = 1): GameAction => ({ type: 'START_LEVEL', level, penny })
const step = (positions: number[], distract = false, distractLine?: string): GameAction => ({
  type: 'SHUFFLE_STEP',
  positions,
  distract,
  distractLine,
})

describe('gameReducer', () => {
  it('START_LEVEL sets up cups, penny, and the peek phase', () => {
    const s = run([start(2, 3)])
    expect(s.phase).toBe('peek')
    expect(s.positions).toEqual([0, 1, 2, 3])
    expect(s.penny).toBe(3)
    expect(s.movesLeft).toBe(8)
    expect(s.hostLine).toBe(LINE_PEEK)
    expect(s.showResult).toBe(false)
  })

  it('keeps levelWins only when replaying the same level', () => {
    const base = { ...INITIAL_GAME, level: 1, levelWins: 2 }
    expect(gameReducer(base, start(1)).levelWins).toBe(2)
    expect(gameReducer(base, start(2)).levelWins).toBe(0)
  })

  it('walks peek → cover → shuffle → guess', () => {
    let s = run([start(), { type: 'COVER' }])
    expect(s.phase).toBe('cover')
    s = gameReducer(s, step([1, 0, 2]))
    expect(s.phase).toBe('shuffle')
    expect(s.positions).toEqual([1, 0, 2])
    expect(s.hostLine).toBe(LINE_SHUFFLE)
    expect(s.movesLeft).toBe(4)
    expect(s.step).toBe(1)
    s = gameReducer(s, { type: 'GUESS_READY' })
    expect(s.phase).toBe('guess')
    expect(s.hostLine).toBe(LINE_GUESS)
  })

  it('a distraction move costs half and swaps in the distraction line', () => {
    let s = run([start(3), { type: 'COVER' }, step([1, 0, 2, 3])])
    expect(s.movesLeft).toBe(9)
    s = gameReducer(s, step([0, 1, 2, 3], true, 'Look! A dog!'))
    expect(s.movesLeft).toBe(8.5)
    expect(s.hostLine).toBe('Look! A dog!')
    // a normal move after a distraction keeps the current line (doesn't reset to "Follow that cup!")
    s = gameReducer(s, step([1, 0, 2, 3]))
    expect(s.hostLine).toBe('Look! A dog!')
  })

  it('ignores out-of-phase actions', () => {
    const s = run([start()])
    expect(gameReducer(s, { type: 'GUESS_READY' })).toBe(s)
    expect(gameReducer(s, { type: 'PICK', cup: 1, winLine: 'x' })).toBe(s)
    expect(gameReducer(s, { type: 'SHOW_RESULT', missLine: 'x' })).toBe(s)
  })

  const toGuess = (penny = 1) =>
    run([start(0, penny), { type: 'COVER' }, step([0, 1, 2]), { type: 'GUESS_READY' }])

  it('a correct pick wins and bumps streak/levelWins on SHOW_RESULT', () => {
    let s = gameReducer(toGuess(1), { type: 'PICK', cup: 1, winLine: 'Nice!' })
    expect(s.phase).toBe('reveal')
    expect(s.result).toBe('win')
    expect(s.hostLine).toBe('Nice!')
    s = gameReducer(s, { type: 'SHOW_RESULT', missLine: 'unused' })
    expect(s.showResult).toBe(true)
    expect(s.streak).toBe(1)
    expect(s.levelWins).toBe(1)
    expect(s.missLine).toBe('')
  })

  it('a wrong pick loses and resets the run', () => {
    let s = { ...toGuess(1), streak: 4, levelWins: 2 }
    s = gameReducer(s, { type: 'PICK', cup: 0, winLine: 'x' })
    expect(s.result).toBe('lose')
    expect(s.picked).toBe(0)
    expect(s.hostLine).toBe(LINE_MISS)
    s = gameReducer(s, { type: 'SHOW_RESULT', missLine: 'Blink less.' })
    expect(s.streak).toBe(0)
    expect(s.levelWins).toBe(0)
    expect(s.missLine).toBe('Blink less.')
  })

  it('LEAVE returns to idle and hides overlays but keeps the run', () => {
    const s = gameReducer({ ...toGuess(), showResult: true, streak: 3 }, { type: 'LEAVE' })
    expect(s.phase).toBe('idle')
    expect(s.showResult).toBe(false)
    expect(s.streak).toBe(3)
  })
})
