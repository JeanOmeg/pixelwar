import { UnitClass, unitClassOf } from '../unit-types'

export type { UnitClass } from '../unit-types'
export { unitClassOf } from '../unit-types'

export interface TerrainRules {
  /** Pays 1 movement point on slow terrain (doors still cost 2) */
  ignoresSlowTerrain: boolean
  /** Attack range pays 2 points per slow (forest) tile instead of 1; water costs 1 */
  slowTerrainCostsRange: boolean
  /** Water tiles are valid attack targets */
  targetsWater: boolean
}

const DEFAULT_RULES: TerrainRules = {
  ignoresSlowTerrain: false,
  slowTerrainCostsRange: false,
  targetsWater: false
}

export const TERRAIN_RULES: Record<UnitClass, Partial<TerrainRules>> = {
  Archer: { slowTerrainCostsRange: true, targetsWater: true },
  Mage: { slowTerrainCostsRange: true, targetsWater: true },
  Spearman: { slowTerrainCostsRange: true },
  Thief: { ignoresSlowTerrain: true },
  Barbarian: {},
  Cleric: {},
  Fighter: {},
  Warrior: {},
  Paladin: {},
  Berserker: {},
  Assassin: { ignoresSlowTerrain: true },
  Ranger: { ignoresSlowTerrain: true, slowTerrainCostsRange: true, targetsWater: true },
  Necromancer: { slowTerrainCostsRange: true, targetsWater: true },
  // reach 2 on any terrain: unlike the Spearman it doesn't pay extra range on slow tiles
  Halberdier: {}
}

export function getTerrainRules(unitName: string): TerrainRules {
  return { ...DEFAULT_RULES, ...TERRAIN_RULES[unitClassOf(unitName)] }
}
