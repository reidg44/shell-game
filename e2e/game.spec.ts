import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { LEVEL_COUNT } from '../src/game/levels'

const stars = (...lead: number[]) => [...lead, ...Array(LEVEL_COUNT - lead.length).fill(0)]

/**
 * Math.random → 0 makes the game deterministic: the penny is always under
 * cup index 0 (whose data-testid follows the cup, not its slot), swaps always
 * hit slots 0/1, and trick levels always fire a distraction.
 */
async function deterministic(page: Page) {
  await page.addInitScript(() => {
    Math.random = () => 0
  })
}

async function playRound(page: Page, cup: number) {
  await expect(page.getByTestId('screen-game')).toHaveAttribute('data-phase', 'guess', { timeout: 20_000 })
  await page.getByTestId(`cup-${cup}`).click()
}

test.beforeEach(async ({ page }) => {
  await deterministic(page)
  await page.goto('/')
  await expect(page.getByTestId('play-btn')).toBeVisible()
})

test('title → levels → win a round → progress is saved', async ({ page }) => {
  await expect(page.getByTestId('title-stats')).toHaveText('Best streak: 0 · ⭑ 0')
  await page.getByTestId('play-btn').click()
  await expect(page.getByTestId('screen-levels')).toBeVisible()
  await expect(page.getByTestId('level-2')).toHaveAttribute('data-locked', 'true')
  await expect(page.getByTestId('level-1')).toContainText('3 cups + tricks')
  await expect(page.getByTestId('level-2')).not.toContainText('tricks')

  await page.getByTestId('level-1').click()
  await expect(page.getByTestId('screen-game')).toHaveAttribute('data-phase', 'peek')
  await expect(page.getByTestId('status')).toHaveText('Watch the penny…')
  await expect(page.getByTestId('cup-0')).toHaveAttribute('data-lifted', 'true')
  await expect(page.getByTestId('cup-0')).toBeDisabled()

  await playRound(page, 0)
  await expect(page.getByTestId('status')).toHaveText('You found it!')
  await expect(page.getByTestId('win-overlay')).toBeVisible()
  await expect(page.getByTestId('win-stars')).toHaveText('⭑')
  await expect(page.getByTestId('stars-pill').first()).toHaveText('⭑ 5')
  await expect(page.getByTestId('streak-pill')).toHaveText('streak 1')

  // Next round on the same level → second consecutive win → 2 stars
  await page.getByTestId('next-btn').click()
  await playRound(page, 0)
  await expect(page.getByTestId('win-stars')).toHaveText('⭑⭑')

  // persisted
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pennyhunt-save')!))
  expect(saved).toMatchObject({ stars: 10, best: 2, unlocked: 2, levelStars: stars(2) })

  await page.reload()
  await expect(page.getByTestId('title-stats')).toHaveText('Best streak: 2 · ⭑ 10')
  await page.getByTestId('play-btn').click()
  await expect(page.getByTestId('level-2')).toHaveAttribute('data-locked', 'false')
  await expect(page.getByTestId('level-3')).toHaveAttribute('data-locked', 'true')
})

test('a wrong pick shows the miss card, grays the cup, resets streak, costs nothing', async ({ page }) => {
  await page.getByTestId('play-btn').click()
  await page.getByTestId('level-1').click()
  await playRound(page, 0)
  await page.getByTestId('next-btn').click()
  await expect(page.getByTestId('streak-pill')).toHaveText('streak 1')

  await playRound(page, 1)
  await expect(page.getByTestId('status')).toHaveText('It was over here!')
  await expect(page.getByTestId('cup-1')).toHaveAttribute('data-wrong', 'true')
  await expect(page.getByTestId('cup-1')).toHaveAttribute('data-lifted', 'true')
  await expect(page.getByTestId('cup-0')).toHaveAttribute('data-lifted', 'true')
  await expect(page.getByTestId('miss-overlay')).toBeVisible()
  await expect(page.getByTestId('streak-pill')).toHaveText('streak 0')
  await expect(page.getByTestId('stars-pill').first()).toHaveText('⭑ 5')

  await page.getByTestId('retry-btn').click()
  await expect(page.getByTestId('screen-game')).toHaveAttribute('data-phase', 'peek')
  await expect(page.getByTestId('miss-overlay')).toBeHidden()
})

test('locked levels do not start a game', async ({ page }) => {
  await page.getByTestId('play-btn').click()
  // force: Playwright won't click an aria-disabled button on its own; a real tap still lands on it
  await page.getByTestId('level-4').click({ force: true })
  await expect(page.getByTestId('screen-levels')).toBeVisible()
  await expect(page.getByTestId('screen-game')).toHaveCount(0)
})

test('leaving mid-shuffle cancels timers and returns cleanly', async ({ page }) => {
  await page.getByTestId('play-btn').click()
  await page.getByTestId('level-1').click()
  await expect(page.getByTestId('screen-game')).toHaveAttribute('data-phase', 'shuffle', { timeout: 10_000 })
  await page.getByTestId('back-btn').click()
  await expect(page.getByTestId('screen-levels')).toBeVisible()
  await page.waitForTimeout(2500)
  await expect(page.getByTestId('screen-levels')).toBeVisible()
  // start fresh; the stale shuffle must not have leaked into this round
  await page.getByTestId('level-1').click()
  await expect(page.getByTestId('screen-game')).toHaveAttribute('data-phase', 'peek')
})

test('settings: sound + speed persist, reset wipes progress but keeps settings', async ({ page }) => {
  await page.getByTestId('settings-btn').click()
  const toggle = page.getByTestId('sound-toggle')
  await expect(toggle).toHaveAttribute('aria-checked', 'true')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await page.getByTestId('speed-chaos').click()
  await expect(page.getByTestId('speed-chaos')).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('settings-overlay')).toBeHidden()
  await expect(page.getByTestId('sound-btn')).toHaveAccessibleName('Unmute sound')

  await page.reload()
  await page.getByTestId('settings-btn').click()
  await expect(page.getByTestId('sound-toggle')).toHaveAttribute('aria-checked', 'false')
  await expect(page.getByTestId('speed-chaos')).toHaveAttribute('aria-checked', 'true')
  await page.getByTestId('settings-close').click()

  // earn something, then reset
  await page.getByTestId('play-btn').click()
  await page.getByTestId('level-1').click()
  await playRound(page, 0)
  await page.getByTestId('next-btn').click()
  await page.getByTestId('back-btn').click()
  await page.getByTestId('back-btn').click()
  await expect(page.getByTestId('title-stats')).toHaveText('Best streak: 1 · ⭑ 5')
  await page.getByTestId('settings-btn').click()
  await page.getByTestId('reset-btn').click()
  await page.getByTestId('settings-close').click()
  await expect(page.getByTestId('title-stats')).toHaveText('Best streak: 0 · ⭑ 0')
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pennyhunt-save')!))
  expect(saved).toEqual({ stars: 0, best: 0, unlocked: 1, levelStars: stars(), sound: false, speed: 2 })
})

test('trick level fires distraction lines and still reaches guess', async ({ page }) => {
  await page.evaluate(() =>
    localStorage.setItem('pennyhunt-save', JSON.stringify({ stars: 0, best: 0, unlocked: 6, levelStars: [], sound: false, speed: 2 })),
  )
  await page.reload()
  await page.getByTestId('play-btn').click()
  await page.getByTestId('level-3').click()
  await expect(page.getByTestId('screen-game')).toHaveAttribute('data-phase', 'shuffle', { timeout: 10_000 })
  await expect(page.getByTestId('host-line')).toHaveText('Whoa, is that a seagull with your sandwich?! 👀')
  await expect(page.getByTestId('cup-3')).toBeVisible()
  await playRound(page, 0)
  await expect(page.getByTestId('win-overlay')).toBeVisible()
})

test('old 6-level save opens level 7; the 7-cup finale plays without cups overlapping', async ({ page }) => {
  // what a player who beat L6 before the level expansion has in localStorage
  await page.evaluate(() =>
    localStorage.setItem('pennyhunt-save', JSON.stringify({ stars: 90, best: 4, unlocked: 6, levelStars: [3, 3, 3, 2, 2, 1], sound: false, speed: 2 })),
  )
  await page.reload()
  await page.getByTestId('play-btn').click()
  await expect(page.getByTestId('level-7')).toHaveAttribute('data-locked', 'false')
  await expect(page.getByTestId('level-8')).toHaveAttribute('data-locked', 'true')
  await expect(page.getByTestId(`level-${LEVEL_COUNT}`)).toContainText('7 cups')

  // jump to the last level
  await page.evaluate(
    (n) => localStorage.setItem('pennyhunt-save', JSON.stringify({ stars: 0, best: 0, unlocked: n, levelStars: [], sound: false, speed: 2 })),
    LEVEL_COUNT,
  )
  await page.reload()
  await page.getByTestId('play-btn').click()
  await page.getByTestId(`level-${LEVEL_COUNT}`).click()
  await expect(page.getByTestId('screen-game')).toHaveAttribute('data-phase', 'guess', { timeout: 20_000 })
  await expect(page.getByTestId('cup-6')).toBeVisible()
  await expect(page.locator('.cup')).toHaveCount(7)

  const boxes = await page.locator('.cup').evaluateAll((els) =>
    els.map((e) => e.getBoundingClientRect()).map((r) => ({ left: r.left, right: r.right })).sort((a, b) => a.left - b.left),
  )
  for (let i = 1; i < boxes.length; i++) expect(boxes[i].left).toBeGreaterThanOrEqual(boxes[i - 1].right)

  await page.getByTestId('cup-0').click()
  await expect(page.getByTestId('win-overlay')).toBeVisible()
})

test('cups shuffle faster with each consecutive win, and reset after a miss', async ({ page }) => {
  const moveVar = () => page.getByTestId('arena').evaluate((el) => parseFloat((el as HTMLElement).style.getPropertyValue('--move')))
  await page.evaluate(() =>
    localStorage.setItem('pennyhunt-save', JSON.stringify({ stars: 0, best: 0, unlocked: 2, levelStars: [], sound: false, speed: 2 })),
  )
  await page.reload()
  await page.getByTestId('play-btn').click()
  await page.getByTestId('level-2').click() // L1 is a trick level, which doesn't ramp
  const first = await moveVar()

  await playRound(page, 0)
  await page.getByTestId('next-btn').click()
  const second = await moveVar()
  expect(second).toBeLessThan(first)

  await playRound(page, 0)
  await page.getByTestId('next-btn').click()
  expect(await moveVar()).toBeLessThan(second)

  await playRound(page, 1) // miss
  await page.getByTestId('retry-btn').click()
  expect(await moveVar()).toBe(first)
})

test('trick levels hold a steady speed through a win streak', async ({ page }) => {
  const moveVar = () => page.getByTestId('arena').evaluate((el) => parseFloat((el as HTMLElement).style.getPropertyValue('--move')))
  await page.evaluate(() =>
    localStorage.setItem('pennyhunt-save', JSON.stringify({ stars: 0, best: 0, unlocked: 3, levelStars: [], sound: false, speed: 2 })),
  )
  await page.reload()
  await page.getByTestId('play-btn').click()
  await page.getByTestId('level-3').click()
  const first = await moveVar()
  for (let i = 0; i < 2; i++) {
    await playRound(page, 0)
    await page.getByTestId('next-btn').click()
    expect(await moveVar()).toBe(first)
  }
})
