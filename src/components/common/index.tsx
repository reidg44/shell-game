import type { ReactNode } from 'react'
import './common.css'

export function RoundButton({
  size = 44,
  label,
  onClick,
  children,
  testId,
}: {
  size?: 44 | 42 | 40 | 36
  label: string
  onClick: () => void
  children: ReactNode
  testId?: string
}) {
  const cls = size === 44 ? 'round-btn' : `round-btn round-btn--${size}`
  return (
    <button type="button" className={cls} aria-label={label} onClick={onClick} data-testid={testId}>
      {children}
    </button>
  )
}

export function StarsPill({ stars }: { stars: number }) {
  return (
    <div className="pill pill--stars" aria-label={`${stars} stars`} data-testid="stars-pill">
      ⭑ {stars}
    </div>
  )
}

export function StreakPill({ streak }: { streak: number }) {
  return (
    <div className="pill pill--streak" data-testid="streak-pill">
      streak {streak}
    </div>
  )
}

export function SoundButton({
  on,
  onToggle,
  size = 44,
}: {
  on: boolean
  onToggle: () => void
  size?: 44 | 40
}) {
  return (
    <RoundButton size={size} label={on ? 'Mute sound' : 'Unmute sound'} onClick={onToggle} testId="sound-btn">
      <span aria-hidden>{on ? '🔊' : '🔇'}</span>
    </RoundButton>
  )
}

export function Bubble({ children, large, style }: { children: ReactNode; large?: boolean; style?: React.CSSProperties }) {
  return (
    <div className={large ? 'bubble bubble--lg' : 'bubble'} style={style} data-testid="host-line">
      {children}
    </div>
  )
}

export type FoxMood = 'idle' | 'shuffle' | 'startled' | 'gloat'

export function FoxAvatar({ mood = 'idle', size = 62 }: { mood?: FoxMood; size?: 62 | 60 }) {
  return (
    <div className={size === 60 ? 'fox-avatar fox-avatar--60' : 'fox-avatar'} data-mood={mood}>
      <img src={`${import.meta.env.BASE_URL}fox.svg`} alt="" className="motion-idle" />
    </div>
  )
}

export function Penny({ size, fontSize, style, className }: { size: number; fontSize: number; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={className ? `penny ${className}` : 'penny'}
      style={{ width: size, height: size, fontSize, ...style }}
      aria-hidden
    >
      1¢
    </div>
  )
}
