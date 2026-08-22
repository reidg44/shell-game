import { useEffect, useRef } from 'react'
import { SPEED_LABELS } from '../game/levels'
import type { Speed } from '../game/levels'
import './SettingsModal.css'

interface Props {
  sound: boolean
  speed: Speed
  onToggleSound: () => void
  onSpeed: (s: Speed) => void
  onReset: () => void
  onClose: () => void
}

export function SettingsModal({ sound, speed, onToggleSound, onSpeed, onReset, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="scrim scrim--dark" onClick={onClose} data-testid="settings-overlay">
      <div
        className="settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings__header">
          <h2 id="settings-title" className="settings__title">Settings</h2>
          <button ref={closeRef} type="button" className="round-btn round-btn--36" aria-label="Close settings" onClick={onClose} data-testid="settings-close">
            ✕
          </button>
        </div>

        <div className="settings__row">
          <span className="settings__label">🔊 Sound</span>
          <button
            type="button"
            role="switch"
            aria-checked={sound}
            aria-label="Sound"
            className="toggle"
            data-on={sound || undefined}
            onClick={onToggleSound}
            data-testid="sound-toggle"
          >
            <span className="toggle__knob" />
          </button>
        </div>

        <div className="settings__row settings__row--col">
          <span className="settings__label">🌀 Shuffle speed</span>
          <div className="seg" role="radiogroup" aria-label="Shuffle speed">
            {SPEED_LABELS.map((label, i) => (
              <button
                type="button"
                key={label}
                role="radio"
                aria-checked={speed === i}
                className="seg__opt"
                data-selected={speed === i || undefined}
                onClick={() => onSpeed(i as Speed)}
                data-testid={`speed-${label.toLowerCase()}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings__row">
          <span className="settings__label">🗑️ Reset progress</span>
          <button type="button" className="btn-danger" onClick={onReset} data-testid="reset-btn">
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
