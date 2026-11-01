export const HAPPY_EMOJI = ['😄', '😁', '🥳', '🤩', '😍', '😊', '😆', '😸'] as const

export interface RainDrop {
  emoji: (typeof HAPPY_EMOJI)[number]
  /** horizontal position, % of screen width */
  left: number
  /** font size in px */
  size: number
  /** seconds for one fall */
  duration: number
  /** seconds before the first fall (negative-free; staggers the start) */
  delay: number
  /** degrees of spin over one fall; alternates direction */
  spin: number
}

/** Fractional part, for low-discrepancy sequences. */
const frac = (x: number) => x - Math.floor(x)

/**
 * Lay out `n` drops. Uses golden-ratio (Weyl) sequences instead of
 * Math.random: they spread evenly across the screen with no clumps or gaps,
 * the same every time, so tests and StrictMode re-renders agree.
 */
export function rainDrops(n: number): RainDrop[] {
  return Array.from({ length: n }, (_, i) => {
    const duration = 2.4 + frac(i * 0.5698403) * 1.2
    return {
      emoji: HAPPY_EMOJI[i % HAPPY_EMOJI.length],
      left: 2 + frac(i * 0.618034) * 96,
      size: Math.round(22 + frac(i * 0.4142136) * 16),
      duration,
      delay: frac(i * 0.7548777) * duration,
      spin: (i % 2 ? -1 : 1) * (20 + frac(i * 0.3247180) * 40),
    }
  })
}
