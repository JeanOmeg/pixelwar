import { FOREST_DEFENSE, ICE_DEFENSE } from './combat'
import type { PathNodeComponent } from './path-finding/path-node-component'
import { isForest, TERRAIN_RULES, type TerrainRules } from './path-finding/terrain-rules'
import { UNIT_CLASSES } from './unit-types'
import { className } from './unit-classes'
import { t } from './i18n'

/** Terrain with rules of its own (plain ground has no card) */
export type TerrainKind = 'forest' | 'door' | 'water' | 'ice' | 'obstacle'

export interface TerrainRuleView {
  icon: 'boot' | 'shield' | 'bow'
  text: string
  /** Defense change: green when it helps, red when it hurts */
  tone?: 'up' | 'down'
}

export interface TerrainView {
  kind: TerrainKind
  name: string
  rules: TerrainRuleView[]
}

/**
 * Which special terrain a tile is, from its flags only (no table of tile ids):
 * bushes, tall grass and rubble are slow walkable tiles, so they count as forest,
 * exactly like in movement and combat.
 */
export function terrainKind(node: PathNodeComponent): TerrainKind | null {
  if (node.isDoor) return 'door'
  if (node.isIce) return 'ice'
  if (node.isWater && !node.isWalkable) return 'water'
  if (!node.isWalkable) return 'obstacle'
  if (isForest(node)) return 'forest'
  return null
}

/** Names of the classes with a terrain rule, in the current language: "Thief, Assassin and Ranger" */
function classesWith(rule: keyof TerrainRules): string {
  const names = UNIT_CLASSES.filter(c => TERRAIN_RULES[c][rule]).map(className)
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} ${t().terrain.and} ${names[names.length - 1]}`
}

/** Name and rules of the terrain of a tile, or null for tiles without a card */
export function terrainView(node: PathNodeComponent): TerrainView | null {
  const kind = terrainKind(node)
  if (!kind) return null
  const text = t().terrain
  const rules: TerrainRuleView[] = []
  switch (kind) {
  case 'forest':
    rules.push(
      { icon: 'boot', text: text.slowMove(classesWith('ignoresSlowTerrain')) },
      { icon: 'shield', text: text.defense(`+${FOREST_DEFENSE}`), tone: 'up' },
      { icon: 'bow', text: text.forestRange(classesWith('slowTerrainCostsRange')) }
    )
    break
  case 'door':
    rules.push(
      { icon: 'boot', text: text.doorMove },
      { icon: 'bow', text: text.doorAttacks }
    )
    break
  case 'water':
    rules.push(
      { icon: 'boot', text: text.waterMove },
      { icon: 'bow', text: text.waterAttacks }
    )
    break
  case 'obstacle':
    rules.push(
      { icon: 'boot', text: text.waterMove },
      { icon: 'bow', text: node.isAttackable ? text.waterAttacks : text.obstacleAttacks }
    )
    break
  case 'ice':
    rules.push(
      { icon: 'boot', text: text.slowMove(classesWith('ignoresIce')) },
      { icon: 'shield', text: text.defense(`−${ICE_DEFENSE}`), tone: 'down' },
      { icon: 'bow', text: text.iceRange }
    )
    break
  }
  return { kind, name: text.names[kind], rules }
}
