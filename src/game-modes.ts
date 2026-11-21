import type { UnitClass } from './path-finding/terrain-rules'
import type { Difficulty } from './ai/weights'
import type { Placement } from './deploy'
import { t } from './i18n'

export type GameMode = 'tutorial' | 'p1vscpu' | 'p1vsp2' | 'cpuvscpu' | 'online'

export interface GameModeDefinition {
  id: GameMode
  readonly title: string
  readonly description: string
  /** Who controls Blue and Red */
  readonly sides: [string, string]
}

/** Texts come from the current language (i18n) */
const gameMode = (id: GameMode): GameModeDefinition => ({
  id,
  get title() { return t().gameModes[id].title },
  get description() { return t().gameModes[id].description },
  get sides() { return t().gameModes[id].sides }
})

export const GAME_MODES: GameModeDefinition[] = (['tutorial', 'online', 'p1vscpu', 'p1vsp2', 'cpuvscpu'] as GameMode[]).map(gameMode)

export function findGameMode(id: string | null | undefined): GameModeDefinition | undefined {
  return GAME_MODES.find(mode => mode.id === id)
}

/** Data passed to a level scene through `goToScene(..., { sceneActivationData })` */
export interface MatchSettings {
  mode: GameMode
  /**
   * Class chosen for each spawn slot, per team (index 0 = Blue, 1 = Red).
   * null or missing = the army drawn in the map.
   */
  armies?: (UnitClass[] | null)[]
  /**
   * Cell of each slot, per team, inside the team's deploy zone (deploy.ts).
   * null, missing or invalid = the positions drawn in the map.
   */
  placements?: (Placement | null)[]
  /** How well the CPU plays (missing = normal) */
  difficulty?: Difficulty
}
