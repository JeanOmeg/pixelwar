import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import * as ex from 'excalibur'
import { Board } from '../../src/board'
import type { UnitClass } from '../../src/unit-types'
import { unitClassOf } from '../../src/unit-types'

/** Reads the real maps without the engine's Tiled loader (same rules as LevelBase/getMapInfo) */

const MAP_DIR = join(__dirname, '../../src/assets/tiledMap')

interface TileFlags { walkable: boolean, attackable: boolean, fast: boolean, door: boolean, water: boolean }

let tileset: Map<number, TileFlags> | null = null

export function loadTileset(): Map<number, TileFlags> {
  if (tileset) return tileset
  const xml = readFileSync(join(MAP_DIR, 'NewFullTile.tsx'), 'utf8')
  tileset = new Map()
  for (const [, id, body] of xml.matchAll(/<tile id="(\d+)"[^>]*>([\s\S]*?)<\/tile>/g)) {
    const flag = (name: string) => new RegExp(`name="${name}"[^>]*value="true"`, 'i').test(body)
    tileset.set(Number(id), {
      walkable: flag('iswalkable'), attackable: flag('isattackable'), fast: flag('isfast'), door: flag('isdoor'), water: flag('iswater')
    })
  }
  return tileset
}

export interface SimMap {
  name: string
  width: number
  height: number
  gids: number[]
  /** Spawns in .tmx order: class and team */
  spawns: { x: number, y: number, unitClass: UnitClass, team: number }[]
}

export function mapFiles(): string[] {
  return readdirSync(MAP_DIR).filter(f => f.endsWith('.tmx')).sort()
}

export function loadMap(file: string): SimMap {
  const xml = readFileSync(join(MAP_DIR, file), 'utf8')
  // \s: not tilewidth/tileheight
  const width = Number(/<map [^>]*\swidth="(\d+)"/.exec(xml)![1])
  const height = Number(/<map [^>]*\sheight="(\d+)"/.exec(xml)![1])
  const tile = Number(/<map [^>]*tilewidth="(\d+)"/.exec(xml)![1])
  const csv = /<layer [^>]*name="map"[^>]*>\s*<data encoding="csv">([\s\S]*?)<\/data>/.exec(xml)![1]
  const gids = csv.split(',').map(s => Number(s.trim()))
  const spawns = [...xml.matchAll(/<object [^>]*name="(\w+)"[^>]*(?:type|class)="([01])"[^>]*x="([\d.]+)"[^>]*y="([\d.]+)"/g)]
    .map(([, name, team, x, y]) => ({ unitClass: unitClassOf(name), team: Number(team), x: Math.floor(Number(x) / tile), y: Math.floor(Number(y) / tile) }))
  return { name: file, width, height, gids, spawns }
}

const boards = new Map<string, Board>()

/**
 * A board with the map's terrain and no units. One per map, reused: engine
 * actors are never freed, so a new board per match would leak ~50 MB each.
 */
export function boardOf(map: SimMap): Board {
  const cached = boards.get(map.name)
  if (cached) {
    for (const cell of cached.cells) if (cell.unit) cell.removeUnit(cell.unit)
    return cached
  }
  const flags = loadTileset()
  // Board only calls scene.add; a real ex.Scene per match leaks (it registers engine/input handlers)
  const scene = { add: () => {}, actors: [] } as unknown as ex.Scene
  const board = new Board(map.height, map.width, scene)
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tile = flags.get(map.gids[x + y * map.width] - 1)
      const node = board.getCell(x, y)!.pathNode
      node.isWalkable = tile?.walkable ?? false
      node.isAttackable = tile?.attackable ?? false
      node.isFast = tile?.fast ?? false
      node.isDoor = tile?.door ?? false
      node.isWater = tile?.water ?? false
    }
  }
  boards.set(map.name, board)
  return board
}
