import { FOREST_DEFENSE, ICE_DEFENSE } from '../combat'
import type { PathNodeComponent } from './path-node-component'
import { UnitClass, unitClassOf } from '../unit-types'

export type { UnitClass } from '../unit-types'
export { unitClassOf } from '../unit-types'

export interface TerrainRules {
  /** Pays 1 movement point on slow terrain (doors still cost 2) */
  ignoresSlowTerrain: boolean
  /** Pays 1 movement point on ice instead of 2 */
  ignoresIce: boolean
  /** Attack range pays 2 points per slow (forest) tile instead of 1; water and ice cost 1 */
  slowTerrainCostsRange: boolean
  /** Water tiles are valid attack targets */
  targetsWater: boolean
}

const DEFAULT_RULES: TerrainRules = {
  ignoresSlowTerrain: false,
  ignoresIce: false,
  slowTerrainCostsRange: false,
  targetsWater: false
}

export const TERRAIN_RULES: Record<UnitClass, Partial<TerrainRules>> = {
  Archer: { slowTerrainCostsRange: true, targetsWater: true },
  Mage: { slowTerrainCostsRange: true, targetsWater: true },
  Spearman: { slowTerrainCostsRange: true },
  Thief: { ignoresSlowTerrain: true, ignoresIce: true },
  Barbarian: {},
  Cleric: {},
  Fighter: {},
  Warrior: {},
  Paladin: {},
  Berserker: {},
  Assassin: { ignoresSlowTerrain: true, ignoresIce: true },
  // fast in the forest, but slips on ice like everyone else
  Ranger: { ignoresSlowTerrain: true, slowTerrainCostsRange: true, targetsWater: true },
  Necromancer: { slowTerrainCostsRange: true, targetsWater: true },
  // reach 2 on any terrain: unlike the Spearman it doesn't pay extra range on slow tiles
  Halberdier: {}
}

export function getTerrainRules(unitName: string): TerrainRules {
  return { ...DEFAULT_RULES, ...TERRAIN_RULES[unitClassOf(unitName)] }
}

/** Forest: walkable, not fast, not a door, not ice (+FOREST_DEFENSE) */
export function isForest(node: PathNodeComponent): boolean {
  return node.isWalkable && !node.isFast && !node.isDoor && !node.isIce
}

/** Defense change of a unit standing on `node`: +2 in the forest, -2 on ice */
export function terrainDefense(node: PathNodeComponent): number {
  if (node.isIce) return -ICE_DEFENSE
  return isForest(node) ? FOREST_DEFENSE : 0
}
