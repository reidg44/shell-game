import { describe, expect, it } from 'vitest'
import { HAPPY_EMOJI, rainDrops } from '../components/rainDrops'

describe('rainDrops', () => {
  const drops = rainDrops(24)

  it('makes the requested number of drops, all happy emoji', () => {
    expect(drops).toHaveLength(24)
    drops.forEach((d) => expect(HAPPY_EMOJI).toContain(d.emoji))
  })
  it('uses every emoji', () => {
    expect(new Set(drops.map((d) => d.emoji)).size).toBe(HAPPY_EMOJI.length)
  })
  it('spreads drops across the whole width, not bunched up', () => {
    drops.forEach((d) => {
      expect(d.left).toBeGreaterThanOrEqual(2)
      expect(d.left).toBeLessThanOrEqual(98)
    })
    // every tenth of the screen gets at least one drop
    for (let band = 0; band < 10; band++) {
      expect(drops.some((d) => d.left >= band * 10 && d.left < (band + 1) * 10)).toBe(true)
    }
  })
  it('staggers start times so they do not fall in one line', () => {
    expect(new Set(drops.map((d) => d.delay.toFixed(2))).size).toBeGreaterThan(12)
  })
  it('is deterministic (no Math.random)', () => {
    expect(rainDrops(24)).toEqual(drops)
  })
})
