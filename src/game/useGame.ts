import { useCallback, useEffect, useReducer, useRef } from 'react'
import { gameReducer, INITIAL_GAME } from './reducer'
import type { GameState } from './reducer'
import { COVER_MS, MOVE_GAP_MS, PEEK_MS, REVEAL_MS, LEVELS, moveMs } from './levels'
import type { Speed } from './levels'
import { applyWin, pickIndex, rollDistraction, swapRandomPair } from './engine'
import type { SaveData } from './engine'
import { DISTRACT, LOSE_LINES, WIN_LINES } from './lines'
import { sfx } from '../audio/sound'

interface Options {
  save: SaveData
  setSave: (fn: (s: SaveData) => SaveData) => void
  speed: Speed
  rng?: () => number
}

export interface GameApi {
  state: GameState
  startLevel: (level: number) => void
  pick: (cup: number) => void
  leave: () => void
  resetRun: () => void
  moveMs: number
}

/**
 * Owns the game reducer and every timer. Each phase transition is scheduled
 * from an effect keyed on (phase, step); the effect's cleanup cancels the
 * pending timeout, so navigating away or unmounting never leaves an orphaned
 * shuffle callback behind.
 */
export function useGame({ save, setSave, speed, rng = Math.random }: Options): GameApi {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME)
  const rngRef = useRef(rng)
  rngRef.current = rng
  const setSaveRef = useRef(setSave)
  setSaveRef.current = setSave
  const saveRef = useRef(save)
  saveRef.current = save

  const positionsRef = useRef(state.positions)
  positionsRef.current = state.positions

  const { phase, step, level, movesLeft, result, streak, levelWins } = state
  const ms = moveMs(level, speed)

  useEffect(() => {
    const r = rngRef.current
    let t: ReturnType<typeof setTimeout> | undefined
    switch (phase) {
      case 'peek':
        sfx.peek()
        t = setTimeout(() => dispatch({ type: 'COVER' }), PEEK_MS)
        break
      case 'cover':
        sfx.cover()
        t = setTimeout(() => shuffleStep(), COVER_MS)
        break
      case 'shuffle':
        t = setTimeout(() => {
          if (movesLeft <= 0) dispatch({ type: 'GUESS_READY' })
          else shuffleStep()
        }, ms + MOVE_GAP_MS)
        break
      case 'guess':
        sfx.guess()
        break
      case 'reveal': {
        if (result === 'win') sfx.win()
        else sfx.lose()
        t = setTimeout(() => {
          if (result === 'win') {
            setSaveRef.current((s) => applyWin(s, { streak, levelWins }, level).save)
          }
          dispatch({
            type: 'SHOW_RESULT',
            missLine: pickIndex(LOSE_LINES, r).replace('{n}', String(level + 1)),
          })
        }, REVEAL_MS)
        break
      }
    }
    return () => {
      if (t !== undefined) clearTimeout(t)
    }

    function shuffleStep() {
      const distract = rollDistraction(level, r)
      sfx.tick(r)
      dispatch({
        type: 'SHUFFLE_STEP',
        positions: swapRandomPair(positionsRef.current, r),
        distract,
        distractLine: distract ? pickIndex(DISTRACT, r) : undefined,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, step])

  const startLevel = useCallback((lv: number) => {
    const cups = LEVELS[lv].cups
    dispatch({ type: 'START_LEVEL', level: lv, penny: Math.floor(rngRef.current() * cups) })
  }, [])

  const pick = useCallback((cup: number) => {
    dispatch({ type: 'PICK', cup, winLine: pickIndex(WIN_LINES, rngRef.current) })
  }, [])

  const leave = useCallback(() => dispatch({ type: 'LEAVE' }), [])
  const resetRun = useCallback(() => dispatch({ type: 'RESET_RUN' }), [])

  return { state, startLevel, pick, leave, resetRun, moveMs: ms }
}
