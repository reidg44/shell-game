export const DISTRACT = [
  'Whoa, is that a seagull with your sandwich?! 👀',
  'Look! A dog on a skateboard!',
  'Wait — is your shoe untied?',
  'Ooh, free churros over there!',
]

export const WIN_LINES = [
  'No way! Nobody beats these paws!',
  "Sharp eyes! I'm impressed.",
  'Okay okay, you got me this time.',
  "Beginner's luck. Again!",
]

/** `{n}` is replaced with the 1-based level number. */
export const LOSE_LINES = [
  'Watch my paws this time!',
  'These paws are just too fast!',
  'Told you level {n} gets tricky.',
  'Blink less, friend.',
]

export const LINE_PEEK = 'Eyes on the penny, friend!'
export const LINE_SHUFFLE = 'Follow that cup!'
export const LINE_GUESS = "So… where'd it go?"
export const LINE_MISS = 'Ooh, tough break!'
export const LINE_TITLE = 'Think you can keep up with these paws?'
export const LINE_LEVELS = 'Level 4 is where I start playing dirty…'

export const STATUS: Record<string, string> = {
  peek: 'Watch the penny…',
  cover: 'Here we go!',
  shuffle: 'Follow that cup!',
  guess: 'Tap the cup with the penny!',
  'reveal-win': 'You found it!',
  'reveal-lose': 'It was over here!',
}
