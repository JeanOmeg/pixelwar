import type { UnitClass } from './unit-types'

/** Combat stats of a class. Pure data, so rules, balance and tests can use it. */
export interface ClassStats {
  health: number
  attack: number
  defense: number
  /** Attack range in points: 1 per tile, 2 per forest tile for some classes (terrain-rules.ts) */
  range: number
  /** Movement points: 1 per open tile, 2 per forest tile or door */
  movement: number
}

/**
 * Stats of every class (both teams). The army point costs that come from them
 * live in unit-classes.ts (see "Balanceamento" in CLAUDE.md).
 */
export const CLASS_STATS: Record<UnitClass, ClassStats> = {
  Archer: { health: 10, attack: 2, defense: 2, range: 6, movement: 4 },
  Mage: { health: 10, attack: 2, defense: 2, range: 5, movement: 5 },
  Spearman: { health: 10, attack: 4, defense: 2, range: 2, movement: 5 },
  Thief: { health: 10, attack: 5, defense: 2, range: 1, movement: 6 },
  Fighter: { health: 15, attack: 4, defense: 3, range: 1, movement: 6 },
  Cleric: { health: 20, attack: 3, defense: 4, range: 1, movement: 6 },
  Barbarian: { health: 20, attack: 5, defense: 4, range: 1, movement: 4 },
  Warrior: { health: 25, attack: 4, defense: 5, range: 1, movement: 4 },
  Paladin: { health: 18, attack: 4, defense: 4, range: 1, movement: 5 },
  Berserker: { health: 16, attack: 7, defense: 2, range: 1, movement: 5 },
  Assassin: { health: 8, attack: 6, defense: 1, range: 1, movement: 7 },
  Ranger: { health: 10, attack: 3, defense: 2, range: 5, movement: 5 },
  Necromancer: { health: 8, attack: 4, defense: 2, range: 4, movement: 4 },
  Halberdier: { health: 14, attack: 4, defense: 3, range: 2, movement: 4 }
}
