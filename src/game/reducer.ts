/**
 * Game-table state machine. Pure: every random value arrives inside the
 * action payload (computed by useGame), so this file is fully unit-testable.
 */
import { LEVELS } from './levels'
import { moveCost } from './engine'
import { LINE_GUESS, LINE_MISS, LINE_PEEK, LINE_SHUFFLE } from './lines'

export type Phase = 'idle' | 'peek' | 'cover' | 'shuffle' | 'guess' | 'reveal'
export type Result = '' | 'win' | 'lose'

export interface GameState {
  level: number
  phase: Phase
  /** cup index → slot index */
  positions: number[]
  /** cup index hiding the penny */
  penny: number
  picked: number
  result: Result
  showResult: boolean
  hostLine: string
  missLine: string
  movesLeft: number
  /** increments on every shuffle move so effects can re-fire within the same phase */
  step: number
  streak: number
  levelWins: number
}

export const INITIAL_GAME: GameState = {
  level: 0,
  phase: 'idle',
  positions: [0, 1, 2],
  penny: 0,
  picked: -1,
  result: '',
  showResult: false,
  hostLine: '',
  missLine: '',
  movesLeft: 0,
  step: 0,
  streak: 0,
  levelWins: 0,
}

export type GameAction =
  | { type: 'START_LEVEL'; level: number; penny: number }
  | { type: 'COVER' }
  | { type: 'SHUFFLE_STEP'; positions: number[]; distract: boolean; distractLine?: string }
  | { type: 'GUESS_READY' }
  | { type: 'PICK'; cup: number; winLine: string }
  | { type: 'SHOW_RESULT'; missLine: string }
  | { type: 'LEAVE' }
  | { type: 'RESET_RUN' }

export function gameReducer(s: GameState, a: GameAction): GameState {
  switch (a.type) {
    case 'START_LEVEL': {
      const cfg = LEVELS[a.level]
      return {
        ...s,
        level: a.level,
        phase: 'peek',
        positions: Array.from({ length: cfg.cups }, (_, i) => i),
        penny: a.penny,
        picked: -1,
        result: '',
        showResult: false,
        hostLine: LINE_PEEK,
        missLine: '',
        movesLeft: cfg.moves,
        step: 0,
        // consecutive wins only carry over when replaying the same level
        levelWins: s.level === a.level ? s.levelWins : 0,
      }
    }
    case 'COVER':
      return s.phase === 'peek' ? { ...s, phase: 'cover' } : s
    case 'SHUFFLE_STEP': {
      if (s.phase !== 'cover' && s.phase !== 'shuffle') return s
      const hostLine = a.distract
        ? (a.distractLine ?? s.hostLine)
        : s.phase === 'shuffle'
          ? s.hostLine
          : LINE_SHUFFLE
      return {
        ...s,
        phase: 'shuffle',
        positions: a.positions,
        hostLine,
        movesLeft: s.movesLeft - moveCost(a.distract),
        step: s.step + 1,
      }
    }
    case 'GUESS_READY':
      return s.phase === 'shuffle' ? { ...s, phase: 'guess', hostLine: LINE_GUESS } : s
    case 'PICK': {
      if (s.phase !== 'guess') return s
      const win = a.cup === s.penny
      return {
        ...s,
        phase: 'reveal',
        picked: a.cup,
        result: win ? 'win' : 'lose',
        hostLine: win ? a.winLine : LINE_MISS,
      }
    }
    case 'SHOW_RESULT': {
      if (s.phase !== 'reveal') return s
      if (s.result === 'win') {
        return { ...s, showResult: true, streak: s.streak + 1, levelWins: s.levelWins + 1 }
      }
      return { ...s, showResult: true, streak: 0, levelWins: 0, missLine: a.missLine }
    }
    case 'LEAVE':
      return { ...s, phase: 'idle', showResult: false }
    case 'RESET_RUN':
      return { ...s, streak: 0, levelWins: 0 }
  }
}
