/* eslint-disable no-console -- report */
import { expect, test } from 'vitest'
import { Contender, legacyAi, newAi } from './match'
import { Tally, duel, report } from './duel'

test('new AI against the old one and between difficulties', async () => {
  const runs: [Contender, Contender][] = [
    [newAi('hard'), legacyAi],
    [newAi('normal'), legacyAi],
    [newAi('easy'), legacyAi],
    [newAi('hard'), newAi('easy')],
    [newAi('hard'), newAi('normal')],
    [newAi('normal', 'aggressive'), newAi('normal', 'defensive')]
  ]
  const results: Tally[] = []
  for (const [a, b] of runs) {
    const t = await duel(a, b)
    report(a, b, t)
    results.push(t)
  }
  // the new AI (normal and hard) must beat the old one
  expect(results[0].wins).toBeGreaterThan(results[0].losses)
  expect(results[1].wins).toBeGreaterThan(results[1].losses)
})
