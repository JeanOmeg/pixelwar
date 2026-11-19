import type { MatchSettings } from '../game-modes'

/**
 * Where the tutorial is played and what comes after it. Pure (no engine), so
 * the menu can import it without loading the match code.
 */

/** Twin Keeps (map_1): TUTORIAL_STEPS is written for it */
export const TUTORIAL_MAP_ID = 'twin-keeps'

const PREF_DONE = 'pixelfantasywar.tutorial.done'

/** The guided match: classic armies drawn in the map, nothing to choose */
export function tutorialSettings(): MatchSettings {
  return { mode: 'tutorial', armies: [null, null], placements: [null, null] }
}

/** "Play a real match?" after the tutorial: same map and armies, CPU on Easy */
export function afterTutorialSettings(): MatchSettings {
  return { mode: 'p1vscpu', armies: [null, null], placements: [null, null], difficulty: 'easy' }
}

export function isTutorialDone(): boolean {
  try { return localStorage.getItem(PREF_DONE) === '1' } catch { return false }
}

export function markTutorialDone() {
  try { localStorage.setItem(PREF_DONE, '1') } catch { /* storage unavailable */ }
}
