import { test } from 'vitest'
import type { AiWeights } from '../../src/ai/weights'
import { newAi } from './match'
import { duel, report } from './duel'

/**
 * yarn ai:tune — weight variations playing the Normal AI (with no noise, so
 * only the weights differ). Used to pick the Hard weights.
 */
const VARIANTS: Record<string, Partial<AiWeights>> = {
  'counter 0.8': { counterShare: 0.8 },
  'counter 0.65': { counterShare: 0.65 },
  'counter 0.5': { counterShare: 0.5 }
}

test('weight variations against the Normal weights', async () => {
  for (const level of ['hard', 'normal'] as const) {
    const baseline = newAi(level, 'balanced', {}, `${level} baseline`)
    for (const [label, weights] of Object.entries(VARIANTS)) {
      const variant = newAi(level, 'balanced', weights, `${level} ${label}`)
      report(variant, baseline, await duel(variant, baseline))
    }
  }
})
