import { rainDrops } from './rainDrops'
import './EmojiRain.css'

const DROPS = rainDrops(24)

/** Full-screen rain of happy emoji, behind the win card. Decorative only. */
export function EmojiRain() {
  return (
    <div className="emoji-rain" aria-hidden data-testid="emoji-rain">
      {DROPS.map((d, i) => (
        <span
          key={i}
          className="emoji-rain__drop"
          style={
            {
              left: `${d.left.toFixed(2)}%`,
              fontSize: d.size,
              animationDuration: `${d.duration.toFixed(2)}s`,
              animationDelay: `${d.delay.toFixed(2)}s`,
              '--spin': `${d.spin.toFixed(0)}deg`,
            } as React.CSSProperties
          }
        >
          {d.emoji}
        </span>
      ))}
    </div>
  )
}
