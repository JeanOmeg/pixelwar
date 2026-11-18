/* eslint-disable no-console -- report */
import { test } from 'vitest'
import type { AiWeights } from '../../src/ai/weights'
import { newAi } from './match'
import { duel, report } from './duel'

/**
 * yarn ai:tune — weight variations playing the Normal AI (with no noise, so
 * only the weights differ). Used to pick the Hard weights.
 */
const VARIANTS: Record<string, Partial<AiWeights>> = {
  'mp 12': { mp: 12 },
  'mp 12 + damage 0.9': { mp: 12, damageShare: 0.9 },
  'mp 12 + damage 0.9 + kill 100': { mp: 12, damageShare: 0.9, killBonus: 100 },
  'mp 10 + kill 80': { mp: 10, killBonus: 80 }
}

test('weight variations against the Normal weights', async () => {
  const baseline = newAi('hard', 'balanced', {}, 'baseline')
  for (const [label, weights] of Object.entries(VARIANTS)) {
    const variant = newAi('hard', 'balanced', weights, label)
    report(variant, baseline, await duel(variant, baseline))
  }
})
