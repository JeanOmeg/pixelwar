import { Layer, TiledResource } from '@excaliburjs/plugin-tiled'
import { Resources } from './resources'
import type { UnitType } from './config'
import { UnitClass, unitClassOf } from './path-finding/terrain-rules'
import { Placement, isValidPlacement } from './deploy'
import { t } from './i18n'

/**
 * Every playable map. This list is the single source of truth: scenes are
 * registered from it (main.ts), the map selector lists it and "Random" draws
 * from it.
 *
 * Adding a map:
 * 1. Draw it in Tiled (tile layer `map`, object layer `unit`, see CLAUDE.md).
 * 2. Add a `TiledResource` for it in `Resources` (resources.ts).
 * 3. Add an entry here. Size, spawns and the preview are read from the .tmx.
 */
export interface MapDefinition {
  /** Stable id: used in the scene name and in saved preferences. Don't rename. */
  id: string
  readonly name: string
  /** One or two short sentences shown in the map selector (i18n `maps`) */
  readonly description: string
  tiledMap: TiledResource
  /** Player phases before the match ends in a draw (2 phases = 1 round) */
  maxTurns: number
}

/** Name and description come from the current language (i18n, keyed by id) */
const map = (entry: Omit<MapDefinition, 'name' | 'description'>): MapDefinition => ({
  ...entry,
  get name() { return t().maps[entry.id]?.name ?? entry.id },
  get description() { return t().maps[entry.id]?.description ?? '' }
})

export const MAPS: MapDefinition[] = [
  map({ id: 'twin-keeps', tiledMap: Resources.TiledMap1, maxTurns: 100 }),
  map({ id: 'river-isles', tiledMap: Resources.TiledMap2, maxTurns: 100 }),
  map({ id: 'greenwood', tiledMap: Resources.TiledMap3, maxTurns: 100 }),
  map({ id: 'split-river', tiledMap: Resources.TiledMap4, maxTurns: 100 }),
  map({ id: 'crater-lake', tiledMap: Resources.TiledMap5, maxTurns: 100 }),
  map({ id: 'old-fortress', tiledMap: Resources.TiledMap6, maxTurns: 100 }),
  map({ id: 'riverside-village', tiledMap: Resources.TiledMap7, maxTurns: 100 }),
  map({ id: 'ruined-temple', tiledMap: Resources.TiledMap8, maxTurns: 100 }),
  map({ id: 'desert-oasis', tiledMap: Resources.TiledMap9, maxTurns: 100 }),
  map({ id: 'frozen-pass', tiledMap: Resources.TiledMap10, maxTurns: 100 }),
  map({ id: 'hamlet-ford', tiledMap: Resources.TiledMap11, maxTurns: 100 }),
  map({ id: 'fallen-citadel', tiledMap: Resources.TiledMap12, maxTurns: 100 })
]

export function sceneNameOf(map: MapDefinition): string {
  return `map-${map.id}`
}

export function findMap(id: string | null | undefined): MapDefinition | undefined {
  return MAPS.find(map => map.id === id)
}

export function randomMap(): MapDefinition {
  return MAPS[Math.floor(Math.random() * MAPS.length)]
}

/** A unit placed on the map in Tiled (object layer `unit`) */
export interface MapSpawn {
  x: number
  y: number
  unitType: UnitType
  /** Player index: 0 = Blue, 1 = Red */
  team: number
}

export interface MapInfo {
  width: number
  height: number
  tileWidth: number
  tileHeight: number
  /** Tile gid per cell, row by row (layer `map`) */
  gids: number[]
  spawns: MapSpawn[]
  /** Unit count per team index */
  unitsPerTeam: number[]
  /** Per cell, row by row: a unit may start there (walkable, not a door; see deploy.ts) */
  deployable: boolean[]
}

interface GidLayer extends Layer {
  data: number[]
}

/** Spawns of one team, in the .tmx object order (this order defines the army slots) */
export function teamSpawns(info: MapInfo, team: number): MapSpawn[] {
  return info.spawns.filter(spawn => spawn.team === team)
}

/** Class in each slot of the army drawn in the map */
export function defaultArmy(info: MapInfo, team: number): UnitClass[] {
  return teamSpawns(info, team).map(spawn => unitClassOf(spawn.unitType))
}

/**
 * Spawns with the chosen armies applied: slot i of a team gets armies[team][i]
 * at placements[team][i]. Missing or mismatched armies keep the map's units;
 * a missing or invalid placement (outside the deploy zone...) keeps the map's
 * positions.
 */
export function spawnsWithArmies(info: MapInfo, armies?: (UnitClass[] | null)[], placements?: (Placement | null)[]): MapSpawn[] {
  const next = [0, 0]
  const valid = [0, 1].map(team => isValidPlacement(info, team, placements?.[team]))
  return info.spawns.map(spawn => {
    const army = armies?.[spawn.team]
    const slot = next[spawn.team]++
    let placed = spawn
    if (valid[spawn.team]) {
      const [x, y] = (placements?.[spawn.team] as Placement)[slot]
      placed = { ...placed, x, y }
    }
    if (!army || army.length !== teamSpawns(info, spawn.team).length) return placed
    return { ...placed, unitType: `${army[slot]}${spawn.team === 0 ? 'A' : 'B'}` as UnitType }
  })
}

/** Reads size, tiles and spawns from the loaded .tmx (resources must be loaded) */
export function getMapInfo(map: MapDefinition): MapInfo {
  const tiled = map.tiledMap
  const { width, height, tilewidth, tileheight } = tiled.map
  const gids = (tiled.getLayersByName('map')[0] as GidLayer).data
  const objects = tiled.getObjectLayers('unit')[0]?.objects ?? []

  const spawns: MapSpawn[] = objects.map(object => ({
    x: Math.floor(object.x / tilewidth),
    y: Math.floor(object.y / tileheight),
    unitType: object.name as UnitType,
    team: Number(object.class)
  }))

  const unitsPerTeam: number[] = []
  for (const spawn of spawns) unitsPerTeam[spawn.team] = (unitsPerTeam[spawn.team] ?? 0) + 1

  const deployable = gids.map(gid => {
    const tile = tiled.getTilesetForTileGid(gid)?.getTileByGid(gid)
    return !!tile?.properties.get('iswalkable') && !tile?.properties.get('isdoor')
  })

  return {
    width, height, tileWidth: tilewidth, tileHeight: tileheight, gids, spawns,
    unitsPerTeam: Array.from(unitsPerTeam, n => n ?? 0),
    deployable
  }
}
