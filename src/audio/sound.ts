/**
 * Tiny WebAudio bleeps. No samples, just oscillators — same as the prototype.
 * The AudioContext is created lazily on the first user-triggered sound so
 * browsers' autoplay policies are satisfied.
 */
let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(on: boolean) {
  enabled = on
}

export function beep(freq: number, dur: number, type: OscillatorType = 'sine') {
  if (!enabled) return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(0.12, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + dur)
  } catch {
    /* audio unavailable — play silently */
  }
}

const later = (fn: () => void, ms: number) => setTimeout(fn, ms)

export const sfx = {
  peek: () => {
    beep(660, 0.12)
    beep(880, 0.14)
  },
  cover: () => beep(300, 0.08, 'triangle'),
  tick: (rng: () => number = Math.random) => beep(200 + rng() * 120, 0.05, 'triangle'),
  guess: () => beep(720, 0.1),
  win: () => {
    beep(523, 0.12)
    later(() => beep(659, 0.12), 110)
    later(() => beep(784, 0.22), 220)
  },
  lose: () => {
    beep(220, 0.25, 'sawtooth')
    later(() => beep(165, 0.35, 'sawtooth'), 200)
  },
  locked: () => beep(160, 0.1, 'square'),
}
