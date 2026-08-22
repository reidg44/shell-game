import { Bubble, FoxAvatar, RoundButton, StarsPill } from './common'
import { LEVEL_COUNT, levelSubLabel } from '../game/levels'
import { LINE_LEVELS } from '../game/lines'
import { sfx } from '../audio/sound'
import './LevelSelect.css'

interface Props {
  stars: number
  unlocked: number
  levelStars: number[]
  onBack: () => void
  onPick: (level: number) => void
}

export function LevelSelect({ stars, unlocked, levelStars, onBack, onPick }: Props) {
  return (
    <main className="levels screen-pop" data-testid="screen-levels">
      <header className="levels__header">
        <RoundButton size={42} label="Back to title" onClick={onBack} testId="back-btn">
          ←
        </RoundButton>
        <h1 className="levels__title">Pick a level</h1>
        <StarsPill stars={stars} />
      </header>
      <div className="levels__grid">
        {Array.from({ length: LEVEL_COUNT }, (_, i) => {
          const locked = i + 1 > unlocked
          const earned = levelStars[i] ?? 0
          return (
            <button
              type="button"
              key={i}
              className={locked ? 'level-card level-card--locked' : 'level-card'}
              aria-label={locked ? `Level ${i + 1}, locked` : `Level ${i + 1}, ${levelSubLabel(i)}, ${earned} stars`}
              aria-disabled={locked}
              data-testid={`level-${i + 1}`}
              data-locked={locked}
              onClick={() => (locked ? sfx.locked() : onPick(i))}
            >
              <div className="level-card__num">{locked ? '🔒' : i + 1}</div>
              <div className="level-card__stars" aria-hidden>
                {locked ? '' : '⭑'.repeat(earned) || '·'}
              </div>
              <div className="level-card__sub">{levelSubLabel(i)}</div>
            </button>
          )
        })}
      </div>
      <div className="levels__spacer" />
      <div className="fox-row levels__fox">
        <FoxAvatar size={60} />
        <Bubble>{LINE_LEVELS}</Bubble>
      </div>
    </main>
  )
}
