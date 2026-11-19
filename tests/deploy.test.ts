// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import {
  DEPLOY_COLUMNS, DeployMap, canDeploy, defaultPlacement, deployCells, deployDepth, isPlacement, isValidPlacement
} from '../src/deploy'
import { loadMap, loadTileset, mapFiles } from './sim/map-loader'

/** `.` = deployable, `#` = not (wall, water, door...); digits = spawn of that team */
function deployMap(rows: string[]): DeployMap {
  const spawns: DeployMap['spawns'] = []
  const deployable: boolean[] = []
  rows.forEach((row, y) => [...row].forEach((char, x) => {
    deployable.push(char !== '#')
    if (char === '0' || char === '1') spawns.push({ x, y, team: Number(char) })
  }))
  return { width: rows[0].length, height: rows.length, deployable, spawns }
}

const MAP = deployMap([
  '0.#..........1',
  '..#...........',
  '0.....#......1'
])

describe('deploy zone', () => {
  test('first DEPLOY_COLUMNS columns from the own edge, walkable tiles only', () => {
    expect(DEPLOY_COLUMNS).toBe(6)
    expect(canDeploy(MAP, 0, 5, 0)).toBe(true)
    expect(canDeploy(MAP, 0, 6, 0)).toBe(false)
    expect(canDeploy(MAP, 0, 2, 0)).toBe(false) // wall
    expect(canDeploy(MAP, 1, 8, 1)).toBe(true)
    expect(canDeploy(MAP, 1, 7, 1)).toBe(false)
    expect(canDeploy(MAP, 0, 13, 0)).toBe(false) // the other team's side
    expect(canDeploy(MAP, 0, -1, 0)).toBe(false)
    expect(canDeploy(MAP, 0, 1.5, 0)).toBe(false)
  })

  test('the zone reaches the deepest unit the map drew', () => {
    const deep = deployMap(['.......0......', '..............'])
    expect(deployDepth(deep, 0)).toBe(8)
    expect(canDeploy(deep, 0, 7, 1)).toBe(true)
    expect(canDeploy(deep, 0, 8, 1)).toBe(false)
  })

  test('valid placement: one distinct zone cell per slot', () => {
    expect(isValidPlacement(MAP, 0, defaultPlacement(MAP, 0))).toBe(true)
    expect(isValidPlacement(MAP, 0, [[1, 1], [4, 2]])).toBe(true)
    expect(isValidPlacement(MAP, 0, [[1, 1], [1, 1]])).toBe(false) // same cell
    expect(isValidPlacement(MAP, 0, [[1, 1]])).toBe(false) // missing a slot
    expect(isValidPlacement(MAP, 0, [[1, 1], [2, 1]])).toBe(false) // wall
    expect(isValidPlacement(MAP, 0, [[1, 1], [9, 1]])).toBe(false) // out of the zone
    expect(isValidPlacement(MAP, 0, 'nope')).toBe(false)
    expect(isPlacement([[1, 1], [2, 'a']], 2)).toBe(false)
  })
})

describe('deploy zone on the real maps', () => {
  const flags = loadTileset()
  for (const file of mapFiles()) {
    test(file, () => {
      const sim = loadMap(file)
      const map: DeployMap = {
        width: sim.width,
        height: sim.height,
        spawns: sim.spawns,
        deployable: sim.gids.map(gid => {
          const tile = flags.get(gid - 1)
          return !!tile?.walkable && !tile.door
        })
      }
      for (const team of [0, 1]) {
        // the classic army is a valid placement, with room to spare
        expect(isValidPlacement(map, team, defaultPlacement(map, team))).toBe(true)
        expect(deployCells(map, team).length).toBeGreaterThanOrEqual(defaultPlacement(map, team).length * 3)
        // mirrored maps: same zone size on both sides
        expect(deployDepth(map, team)).toBe(deployDepth(map, 1 - team))
      }
    })
  }
})
