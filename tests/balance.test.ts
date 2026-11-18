import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { computeCosts } from '../src/balance'
import { ARMY_BUDGET, CLASS_INFO, armyCost } from '../src/unit-classes'
import { UNIT_CLASSES, unitClassOf } from '../src/unit-types'

describe('army costs', () => {
  test('CLASS_INFO costs are the ones the balance formula gives', () => {
    const costs = computeCosts()
    for (const c of UNIT_CLASSES) expect({ [c]: CLASS_INFO[c].cost }).toEqual({ [c]: costs[c] })
  })

  test('without counterattack and forest the formula gives the old published costs', () => {
    // the costs before those rules existed (README/CLAUDE.md history)
    const old = { Archer: 9, Mage: 9, Spearman: 8, Thief: 9, Fighter: 12, Cleric: 16, Barbarian: 16, Warrior: 21, Paladin: 15, Berserker: 14, Assassin: 8, Ranger: 12, Necromancer: 8, Halberdier: 11 }
    expect(computeCosts({ counterattack: false, forest: false })).toEqual(old)
  })

  test('the 8 original classes cost exactly the budget', () => {
    expect(armyCost(UNIT_CLASSES.slice(0, 8))).toBe(ARMY_BUDGET)
  })
})

describe('maps', () => {
  const dir = join(__dirname, '../src/assets/tiledMap')
  const maps = readdirSync(dir).filter(file => file.endsWith('.tmx'))

  test.each(maps)('%s: each team\'s classic army costs exactly the budget', file => {
    const xml = readFileSync(join(dir, file), 'utf8')
    const units = [...xml.matchAll(/<object [^>]*name="(\w+)"[^>]*(?:type|class)="([01])"/g)]
    expect(units.length).toBeGreaterThan(0)
    for (const team of ['0', '1']) {
      const army = units.filter(u => u[2] === team).map(u => unitClassOf(u[1]))
      expect(armyCost(army)).toBe(ARMY_BUDGET)
    }
  })
})
