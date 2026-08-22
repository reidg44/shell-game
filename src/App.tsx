import { useCallback, useEffect, useState } from 'react'
import { TitleScreen } from './components/TitleScreen'
import { LevelSelect } from './components/LevelSelect'
import { GameTable } from './components/GameTable'
import { SettingsModal } from './components/SettingsModal'
import { useSave } from './save/useSave'
import { useGame } from './game/useGame'
import { DEFAULT_SAVE } from './game/engine'
import type { Speed } from './game/levels'
import { setSoundEnabled } from './audio/sound'

type Screen = 'title' | 'levels' | 'game'

export default function App() {
  const [screen, setScreen] = useState<Screen>('title')
  const [showSettings, setShowSettings] = useState(false)
  const { save, setSave } = useSave()
  const game = useGame({ save, setSave, speed: save.speed })

  useEffect(() => setSoundEnabled(save.sound), [save.sound])

  const toggleSound = useCallback(() => setSave((s) => ({ ...s, sound: !s.sound })), [setSave])
  const setSpeed = useCallback((speed: Speed) => setSave((s) => ({ ...s, speed })), [setSave])
  const closeSettings = useCallback(() => setShowSettings(false), [])

  const goLevels = () => {
    game.leave()
    setScreen('levels')
  }
  const startLevel = (lv: number) => {
    game.startLevel(lv)
    setScreen('game')
  }
  const resetProgress = () => {
    setSave((s) => ({ ...DEFAULT_SAVE, levelStars: DEFAULT_SAVE.levelStars.slice(), sound: s.sound, speed: s.speed }))
    game.resetRun()
  }

  return (
    <div className="app">
      {screen === 'title' && (
        <TitleScreen
          stars={save.stars}
          best={save.best}
          sound={save.sound}
          onToggleSound={toggleSound}
          onSettings={() => setShowSettings(true)}
          onPlay={() => setScreen('levels')}
        />
      )}
      {screen === 'levels' && (
        <LevelSelect
          stars={save.stars}
          unlocked={save.unlocked}
          levelStars={save.levelStars}
          onBack={() => setScreen('title')}
          onPick={startLevel}
        />
      )}
      {screen === 'game' && (
        <GameTable game={game} stars={save.stars} sound={save.sound} onToggleSound={toggleSound} onLevels={goLevels} />
      )}
      {showSettings && (
        <SettingsModal
          sound={save.sound}
          speed={save.speed}
          onToggleSound={toggleSound}
          onSpeed={setSpeed}
          onReset={resetProgress}
          onClose={closeSettings}
        />
      )}
    </div>
  )
}
