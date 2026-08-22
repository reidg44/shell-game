import { Bubble, Penny, RoundButton, SoundButton } from './common'
import { LINE_TITLE } from '../game/lines'
import './TitleScreen.css'

interface Props {
  stars: number
  best: number
  sound: boolean
  onToggleSound: () => void
  onSettings: () => void
  onPlay: () => void
}

export function TitleScreen({ stars, best, sound, onToggleSound, onSettings, onPlay }: Props) {
  return (
    <main className="title screen-pop" data-testid="screen-title">
      <div className="title__controls">
        <SoundButton on={sound} onToggle={onToggleSound} />
        <RoundButton label="Settings" onClick={onSettings} testId="settings-btn">
          <span aria-hidden>⚙️</span>
        </RoundButton>
      </div>
      <h1 className="title__wordmark">
        Penny
        <br />
        Hunt!
      </h1>
      <Penny size={60} fontSize={20} className="title__penny motion-idle" />
      <div className="title__fox">
        <img src={`${import.meta.env.BASE_URL}fox-sitting.svg`} alt="A cartoon fox, the game host" className="title__fox-img motion-idle" />
        <Bubble large style={{ maxWidth: 140, marginTop: 14 }}>
          {LINE_TITLE}
        </Bubble>
      </div>
      <div className="title__footer">
        <button type="button" className="cta" onClick={onPlay} data-testid="play-btn">
          Play!
        </button>
        <div className="title__stats" data-testid="title-stats">
          Best streak: {best} · ⭑ {stars}
        </div>
      </div>
    </main>
  )
}
