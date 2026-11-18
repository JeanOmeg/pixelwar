import { defineConfig } from 'vitest/config'
import base from './vitest.config'

/** yarn ai:sim — full CPU vs CPU matches without graphics (slow, not part of yarn test) */
export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: ['tests/sim/**/*.sim.ts'],
    environment: 'happy-dom',
    testTimeout: 30 * 60 * 1000
  }
})
