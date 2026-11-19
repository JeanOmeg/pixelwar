import type { UnitClass } from './path-finding/terrain-rules'
import type { Difficulty } from './ai/weights'
import type { Placement } from './deploy'

export type GameMode = 'tutorial' | 'p1vscpu' | 'p1vsp2' | 'cpuvscpu' | 'online'

export interface GameModeDefinition {
  id: GameMode
  title: string
  description: string
  /** Who controls Blue and Red */
  sides: [string, string]
}

export const GAME_MODES: GameModeDefinition[] = [
  {
    id: 'tutorial',
    title: 'Learn to play',
    description: 'New here? A guided match teaches you the basics.',
    sides: ['You', 'CPU']
  },
  {
    id: 'online',
    title: 'Online',
    description: 'Play or watch a friend on another device.',
    sides: ['You', 'Friend']
  },
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
  /**
   * Cell of each slot, per team, inside the team's deploy zone (deploy.ts).
   * null, missing or invalid = the positions drawn in the map.
   */
  placements?: (Placement | null)[]
  /** How well the CPU plays (missing = normal) */
  difficulty?: Difficulty
}
