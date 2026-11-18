// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { AiPlan, aggressionOf, distanceToEnemies, makeContext, planUnit } from '../src/ai/planner'
import { ThreatMap } from '../src/ai/threat'
import type { Unit } from '../src/unit'
import { makeBoard, makePlayers, place } from './helpers'

/**
 * Normal AI with the randomness fixed at 0.5: no noise, no mistakes, skills on.
 * (Hard also assumes enemies may Run, which on these tiny boards reaches everything.)
 */
const plansFor = (unit: Unit, waiting: Unit[] = [unit]): AiPlan[] =>
  planUnit(unit, makeContext(unit.cell!.board, unit.player, { difficulty: 'normal', random: () => 0.5, waiting }))

const OPEN = [
  '..........',
  '..........',
  '..........',
  '..........',
  '..........'
]

describe('threat map', () => {
  test('marks where enemies can hit next turn', () => {
    const board = makeBoard(OPEN)
    const [a, b] = makePlayers(board)
    place(board, 'FighterB', 8, 2, b) // moves 6, hits adjacent tiles
    const threat = new ThreatMap(board, a)
    expect(threat.threatsAt(board.getCell(3, 2)!.pathNode)).toHaveLength(1)
    expect(threat.threatsAt(board.getCell(0, 0)!.pathNode)).toHaveLength(0)
  })

  test('counts a back attack when the enemy can get behind', () => {
    const board = makeBoard(OPEN)
    const [a, b] = makePlayers(board)
    const archer = place(board, 'ArcherA', 4, 2, a)
    // 3 steps to its right side; going around to the left takes 7 (it moves 6)
    place(board, 'ThiefB', 8, 2, b)
    const threat = new ThreatMap(board, a)
    const node = archer.cell!.pathNode
    // facing the thief, it has to come around; facing away, it hits the back
    expect(threat.harmAt(archer, node, 'left').expected).toBeGreaterThan(threat.harmAt(archer, node, 'right').expected)
  })
})

test('distance field follows the real path around walls', () => {
  const board = makeBoard([
    '.....',
    '.###.',
    '.....'
  ])
  const [a, b] = makePlayers(board)
  const fighter = place(board, 'FighterA', 2, 0, a)
  place(board, 'FighterB', 2, 2, b)
  const dist = distanceToEnemies(board, fighter)
  // straight down is blocked: around the wall it takes 5 steps to stand next to it
  expect(dist.get(board.getCell(2, 0)!.pathNode)).toBe(5)
})

test('an enemy behind a door is not "next to" it: the way around counts', () => {
  // the red fighter stands right behind the door, which blocks both the way and attacks
  const board = makeBoard([
    '.......',
    '##.####',
    '.D.....'
  ])
  const [a, b] = makePlayers(board)
  const fighter = place(board, 'FighterA', 0, 2, a)
  place(board, 'FighterB', 2, 2, b)
  const dist = distanceToEnemies(board, fighter)
  // through the door is blocked by the enemy itself: it must go around the top
  expect(dist.get(board.getCell(0, 2)!.pathNode)).toBeGreaterThan(4)
  // above the enemy is a real attack spot
  expect(dist.get(board.getCell(2, 1)!.pathNode)).toBe(0)
})

test('a ranged unit wants a tile it can shoot from', () => {
  const board = makeBoard([
    '.......',
    '.......'
  ])
  const [a, b] = makePlayers(board)
  const archer = place(board, 'MageA', 0, 0, a)
  place(board, 'FighterB', 6, 0, b)
  const dist = distanceToEnemies(board, archer)
  // range 5 in a straight line: from x = 1 it already hits the target
  expect(dist.get(board.getCell(1, 0)!.pathNode)).toBe(0)
  expect(dist.get(board.getCell(0, 0)!.pathNode)).toBe(1)
})

test('last stand: with 1-2 units left and behind, it stops being careful', () => {
  const board = makeBoard(OPEN)
  const [a, b] = makePlayers(board)
  place(board, 'FighterA', 0, 0, a)
  place(board, 'WarriorB', 9, 0, b)
  place(board, 'WarriorB', 9, 2, b)
  place(board, 'WarriorB', 9, 4, b)
  expect(aggressionOf(board, a, 1)).toBeGreaterThanOrEqual(1)
  expect(aggressionOf(board, b, 1)).toBeGreaterThan(1)
})

describe('decisions', () => {
  test('prefers the kill', () => {
    const board = makeBoard(OPEN)
    const [a, b] = makePlayers(board)
    const berserker = place(board, 'BerserkerA', 4, 2, a)
    const healthy = place(board, 'WarriorB', 5, 2, b)
    const hurt = place(board, 'FighterB', 4, 3, b)
    hurt.health = 2
    void healthy
    expect(plansFor(berserker)[0].attack?.target.name).toBe(hurt.name)
  })

  test('does not run when it can attack without running', () => {
    const board = makeBoard(OPEN)
    const [a, b] = makePlayers(board)
    const fighter = place(board, 'FighterA', 3, 2, a)
    place(board, 'ArcherB', 5, 2, b)
    const best = plansFor(fighter)[0]
    expect(best.attack).not.toBeNull()
    expect(best.run).toBe(false)
  })

  test('an archer shoots and then steps back out of reach', () => {
    const board = makeBoard(OPEN)
    const [a, b] = makePlayers(board)
    const archer = place(board, 'ArcherA', 3, 2, a)
    // moves 4 and hits adjacent tiles: it reaches the archer where it stands, not 6+ tiles away
    const enemy = place(board, 'BarbarianB', 6, 2, b)
    const best = plansFor(archer)[0]
    expect(best.attack?.target.name).toBe(enemy.name)
    const threat = new ThreatMap(board, a)
    expect(threat.threatsAt(best.dest)).toHaveLength(0)
  })

  // a dead-end hall: nobody can get behind the enemy, so its counterattack is certain
  const HALL = ['##########', '......####', '##########']

  test('next to an even enemy it strikes before stepping away (the counter is not a reason to just leave)', () => {
    const board = makeBoard(HALL)
    const [a, b] = makePlayers(board)
    const fighter = place(board, 'FighterA', 4, 1, a)
    fighter.mp = 0 // no skills: a plain hit
    const enemy = place(board, 'FighterB', 5, 1, b)
    enemy.miniDirection = 'left'
    const best = plansFor(fighter)[0]
    expect(best.attack?.target.name).toBe(enemy.name)
    expect(best.attack?.order).toBe('attack-first')
  })

  test('almost dead next to a strong melee enemy, it leaves without attacking', () => {
    const board = makeBoard(HALL)
    const [a, b] = makePlayers(board)
    const cleric = place(board, 'ClericA', 4, 1, a)
    cleric.health = 2
    cleric.mp = 0
    const barbarian = place(board, 'BarbarianB', 5, 1, b)
    barbarian.miniDirection = 'left'
    const best = plansFor(cleric)[0]
    expect(best.attack === null).toBe(true)
    expect(best.dest.x).toBeLessThan(4)
  })

  test('prefers hitting from behind', () => {
    const board = makeBoard(OPEN)
    const [a, b] = makePlayers(board)
    const thief = place(board, 'ThiefA', 4, 0, a)
    // from behind the thief almost surely kills it (double ATK, sure hit); from the front it can't
    const target = place(board, 'MageB', 4, 2, b)
    target.miniDirection = 'left' // its back is to the right
    const best = plansFor(thief)[0]
    expect(best.attack?.target.name).toBe(target.name)
    expect([best.dest.x, best.dest.y]).toEqual([5, 2])
  })

  test('a hurt unit far from help backs away from a stronger enemy', () => {
    const board = makeBoard(OPEN)
    const [a, b] = makePlayers(board)
    const mage = place(board, 'MageA', 2, 2, a)
    mage.health = 2
    place(board, 'BerserkerB', 7, 2, b)
    const best = plansFor(mage)[0]
    const threat = new ThreatMap(board, a)
    expect(threat.threatsAt(best.dest)).toHaveLength(0)
  })

  test('does not stand in the line of fire of an ally that still has to shoot', () => {
    const board = makeBoard(['........'])
    const [a, b] = makePlayers(board)
    const archer = place(board, 'ArcherA', 0, 0, a)
    const fighter = place(board, 'FighterA', 2, 0, a)
    place(board, 'WarriorB', 6, 0, b)
    const plans = plansFor(fighter, [fighter, archer])
    const blocking = plans.find(p => p.dest.x === 5 && !p.attack)
    expect(blocking?.parts.block).toBeLessThan(0)
  })
})
