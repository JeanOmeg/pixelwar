import { Layer, TiledResource } from '@excaliburjs/plugin-tiled'
import { Resources } from './resources'
import type { UnitType } from './config'
import { UnitClass, unitClassOf } from './path-finding/terrain-rules'

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
  name: string
  /** One or two short sentences shown in the map selector */
  description: string
  tiledMap: TiledResource
  /** Player phases before the match ends in a draw (2 phases = 1 round) */
  maxTurns: number
}

export const MAPS: MapDefinition[] = [
  {
    id: 'twin-keeps',
    name: 'Twin Keeps',
    description: 'Two walled keeps face each other across an open field. Woods in the middle give cover, bridges cross the ponds.',
    tiledMap: Resources.TiledMap1,
    maxTurns: 100
  },
  {
    id: 'river-isles',
    name: 'River Isles',
    description: 'Armies start on small islands linked by narrow bridges. Hold the crossings and the central meadow.',
    tiledMap: Resources.TiledMap2,
    maxTurns: 100
  },
  {
    id: 'greenwood',
    name: 'Greenwood',
    description: 'Open meadow with scattered groves and rocks for cover. A small pond with a bridge sits in the very center.',
    tiledMap: Resources.TiledMap3,
    maxTurns: 100
  },
  {
    id: 'split-river',
    name: 'Split River',
    description: 'A river cuts the field in two. Only three narrow bridges cross it, but archers and mages can shoot over the water.',
    tiledMap: Resources.TiledMap4,
    maxTurns: 100
  },
  {
    id: 'crater-lake',
    name: 'Crater Lake',
    description: 'A wide lake fills the middle, crossed by one long bridge. Rocky passes guard the shores to the north and south.',
    tiledMap: Resources.TiledMap5,
    maxTurns: 100
  },
  {
    id: 'old-fortress',
    name: 'Old Fortress',
    description: 'An abandoned fortress stands between the armies. Its doors are the only way in, and its pillared courtyard is the prize.',
    tiledMap: Resources.TiledMap6,
    maxTurns: 100
  },
  {
    id: 'riverside-village',
    name: 'Riverside Village',
    description: 'A village split by a river. Fight between houses and gardens, and hold the stone squares at both bridges.',
    tiledMap: Resources.TiledMap7,
    maxTurns: 100
  },
  {
    id: 'ruined-temple',
    name: 'Ruined Temple',
    description: 'Broken walls and pillars surround an old altar. Watchtowers on each meadow shelter the archers.',
    tiledMap: Resources.TiledMap8,
    maxTurns: 100
  }
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
 * Spawns with the chosen armies applied: slot i of a team gets armies[team][i].
 * Missing or mismatched armies keep the map's units.
 */
export function spawnsWithArmies(info: MapInfo, armies?: (UnitClass[] | null)[]): MapSpawn[] {
  const next = [0, 0]
  return info.spawns.map(spawn => {
    const army = armies?.[spawn.team]
    const slot = next[spawn.team]++
    if (!army || army.length !== teamSpawns(info, spawn.team).length) return spawn
    return { ...spawn, unitType: `${army[slot]}${spawn.team === 0 ? 'A' : 'B'}` as UnitType }
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

  return { width, height, tileWidth: tilewidth, tileHeight: tileheight, gids, spawns, unitsPerTeam: Array.from(unitsPerTeam, n => n ?? 0) }
}
