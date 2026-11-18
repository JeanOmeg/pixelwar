import type { UnitClass } from './path-finding/terrain-rules'

export type GameMode = 'p1vscpu' | 'p1vsp2' | 'cpuvscpu'

export interface GameModeDefinition {
  id: GameMode
  title: string
  description: string
  /** Who controls Blue and Red */
  sides: [string, string]
}

export const GAME_MODES: GameModeDefinition[] = [
  {
    id: 'p1vscpu',
    title: 'Player vs CPU',
    description: 'Command the blue army against the computer.',
    sides: ['You', 'CPU']
  },
  {
    id: 'p1vsp2',
    title: 'Player vs Player',
    description: 'Two players take turns on the same computer.',
    sides: ['P1', 'P2']
  },
  {
    id: 'cpuvscpu',
    title: 'CPU vs CPU',
    description: 'Sit back and watch two AI armies fight it out.',
    sides: ['CPU', 'CPU']
  }
]

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
}
