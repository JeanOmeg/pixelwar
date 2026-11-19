/**
 * Deployment: before the match each team places its units anywhere in its
 * deploy zone, the columns next to its own edge (Blue on the left, Red on the
 * right). Pure: no engine, no assets (used by the army screen, the level and
 * the online room).
 */

/** Cell of each army slot, in slot order: [x, y] */
export type Placement = [number, number][]

/** Zone depth in columns from the team's edge */
export const DEPLOY_COLUMNS = 6

/** What the deploy rules need from a map (MapInfo has it all) */
export interface DeployMap {
  width: number
  height: number
  /** Per cell, row by row: a unit may start there (walkable, not a door) */
  deployable: boolean[]
  /** Units drawn in the map, in .tmx order */
  spawns: { x: number, y: number, team: number }[]
}

function spawnsOf(map: DeployMap, team: number) {
  return map.spawns.filter(spawn => spawn.team === team)
}

/** Columns between `x` and the team's edge (0 = the edge column itself) */
function columnFromEdge(map: DeployMap, team: number, x: number): number {
  return team === 0 ? x : map.width - 1 - x
}

/**
 * Zone depth for a team: DEPLOY_COLUMNS, or deeper if the map drew a unit
 * further out (so the classic army is always a valid placement).
 */
export function deployDepth(map: DeployMap, team: number): number {
  const deepest = Math.max(0, ...spawnsOf(map, team).map(spawn => columnFromEdge(map, team, spawn.x) + 1))
  return Math.max(DEPLOY_COLUMNS, deepest)
}

export function canDeploy(map: DeployMap, team: number, x: number, y: number): boolean {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= map.width || y >= map.height) return false
  if (columnFromEdge(map, team, x) >= deployDepth(map, team)) return false
  return map.deployable[x + y * map.width] || spawnsOf(map, team).some(spawn => spawn.x === x && spawn.y === y)
}

/** Every cell of the team's zone where a unit can start */
export function deployCells(map: DeployMap, team: number): { x: number, y: number }[] {
  const cells: { x: number, y: number }[] = []
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (canDeploy(map, team, x, y)) cells.push({ x, y })
    }
  }
  return cells
}

/** The map's own positions (the spawns drawn in the .tmx) */
export function defaultPlacement(map: DeployMap, team: number): Placement {
  return spawnsOf(map, team).map(spawn => [spawn.x, spawn.y])
}

/** Right shape: `slots` distinct integer cells (doesn't know the map: the online room uses it) */
export function isPlacement(value: unknown, slots: number): value is Placement {
  if (!Array.isArray(value) || value.length !== slots) return false
  const seen = new Set<string>()
  for (const cell of value) {
    if (!Array.isArray(cell) || cell.length !== 2 || !cell.every(n => Number.isInteger(n))) return false
    const key = `${cell[0]},${cell[1]}`
    if (seen.has(key)) return false
    seen.add(key)
  }
  return true
}

/** One distinct cell per slot, all inside the team's zone */
export function isValidPlacement(map: DeployMap, team: number, value: unknown): value is Placement {
  return isPlacement(value, spawnsOf(map, team).length)
    && value.every(([x, y]) => canDeploy(map, team, x, y))
}
