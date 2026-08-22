import { Bubble, FoxAvatar, Penny, RoundButton, SoundButton, StarsPill, StreakPill } from './common'
import type { FoxMood } from './common'
import type { GameApi } from '../game/useGame'
import { STATUS } from '../game/lines'
import { winStarCount } from '../game/engine'
import { WIN_STARS } from '../game/levels'
import './GameTable.css'

interface Props {
  game: GameApi
  stars: number
  sound: boolean
  onToggleSound: () => void
  onLevels: () => void
}

export function GameTable({ game, stars, sound, onToggleSound, onLevels }: Props) {
  const { state: s, pick, moveMs } = game
  const n = s.positions.length
  const slotLeft = (slot: number) => `${(((slot + 1) / (n + 1)) * 100).toFixed(2)}%`
  const moveSec = `${(moveMs / 1000).toFixed(3)}s`

  const mood: FoxMood =
    s.phase === 'shuffle'
      ? 'shuffle'
      : s.phase === 'reveal' && s.result === 'win'
        ? 'startled'
        : s.phase === 'reveal' && s.result === 'lose'
          ? 'gloat'
          : 'idle'

  const statusKey = s.phase === 'reveal' ? `reveal-${s.result}` : s.phase
  const pennyVisible = s.phase === 'peek' || s.phase === 'reveal'

  return (
    <main className="game" data-testid="screen-game" data-phase={s.phase}>
      <header className="game__header">
        <div className="game__header-left">
          <RoundButton size={40} label="Back to level select" onClick={onLevels} testId="back-btn">
            ←
          </RoundButton>
          <h1 className="game__title">Level {s.level + 1}</h1>
        </div>
        <div className="game__header-right">
          <StarsPill stars={stars} />
          <StreakPill streak={s.streak} />
          <SoundButton on={sound} onToggle={onToggleSound} size={40} />
        </div>
      </header>

      <div className="arena" data-testid="arena" style={{ '--move': moveSec } as React.CSSProperties}>
        <Penny
          size={46}
          fontSize={15}
          className="arena__penny"
          style={{ left: slotLeft(s.positions[s.penny] ?? 0), opacity: pennyVisible ? 1 : 0 }}
        />
        {s.positions.map((slot, cup) => {
          const lifted =
            (s.phase === 'peek' && cup === s.penny) ||
            (s.phase === 'reveal' && (cup === s.picked || cup === s.penny))
          const wrong = s.phase === 'reveal' && s.picked !== s.penny && cup === s.picked
          return (
            <button
              type="button"
              key={cup}
              className="cup"
              data-testid={`cup-${cup}`}
              data-slot={slot}
              data-lifted={lifted || undefined}
              data-wrong={wrong || undefined}
              aria-label={`Cup ${slot + 1}`}
              disabled={s.phase !== 'guess'}
              style={{ left: slotLeft(slot), width: `min(104px, ${(66 / n).toFixed(1)}vw)` }}
              onClick={() => pick(cup)}
            />
          )
        })}
      </div>

      <p className="game__status" data-testid="status" aria-live="polite">
        {STATUS[statusKey] ?? ''}
      </p>

      <div className="fox-row game__fox">
        <FoxAvatar mood={mood} />
        <Bubble style={{ maxWidth: 250 }}>{s.hostLine}</Bubble>
      </div>

      {s.showResult && s.result === 'win' && (
        <WinOverlay
          starCount={winStarCount(s.levelWins)}
          streak={s.streak}
          onNext={() => game.startLevel(s.level)}
          onLevels={onLevels}
        />
      )}
      {s.showResult && s.result === 'lose' && (
        <MissOverlay line={s.missLine} onRetry={() => game.startLevel(s.level)} onLevels={onLevels} />
      )}
    </main>
  )
}

function WinOverlay({
  starCount,
  streak,
  onNext,
  onLevels,
  confetti = true,
}: {
  starCount: number
  streak: number
  onNext: () => void
  onLevels: () => void
  confetti?: boolean
}) {
  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-labelledby="win-title" data-testid="win-overlay">
      <div className="card">
        {confetti && (
          <>
            <span className="confetti motion-confetti" style={{ left: '18%', fontSize: 18, animationDuration: '1.6s' }} aria-hidden>🎉</span>
            <span className="confetti motion-confetti" style={{ left: '50%', fontSize: 14, animationDuration: '1.9s', animationDelay: '.4s' }} aria-hidden>✨</span>
            <span className="confetti motion-confetti" style={{ left: '78%', fontSize: 16, animationDuration: '1.7s', animationDelay: '.8s' }} aria-hidden>🎊</span>
          </>
        )}
        <h2 id="win-title" className="card__title card__title--win">You found it!</h2>
        <div className="card__stars" aria-label={`${starCount} of 3 stars`} data-testid="win-stars">
          {'⭑'.repeat(starCount)}
        </div>
        <div className="card__meta">+{WIN_STARS} stars · streak {streak}</div>
        <button type="button" className="cta cta--md" style={{ marginTop: 6 }} onClick={onNext} autoFocus data-testid="next-btn">
          Next round →
        </button>
        <button type="button" className="btn-secondary" onClick={onLevels}>
          Level select
        </button>
      </div>
    </div>
  )
}

function MissOverlay({ line, onRetry, onLevels }: { line: string; onRetry: () => void; onLevels: () => void }) {
  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-labelledby="miss-title" data-testid="miss-overlay">
      <div className="card">
        <h2 id="miss-title" className="card__title card__title--miss">So close!</h2>
        <p className="card__line">{line}</p>
        <button type="button" className="cta cta--md" style={{ marginTop: 6 }} onClick={onRetry} autoFocus data-testid="retry-btn">
          Try again
        </button>
        <button type="button" className="btn-secondary" onClick={onLevels}>
          Level select
        </button>
      </div>
    </div>
  )
}
