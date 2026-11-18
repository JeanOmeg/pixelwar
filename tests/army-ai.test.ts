import { describe, expect, test } from 'vitest'
import { buildCpuArmy, roleOf } from '../src/army-ai'
import { ARMY_BUDGET, armyCost } from '../src/unit-classes'
import { UNIT_CLASSES, UnitClass } from '../src/unit-types'

/** Small deterministic random source */
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32
    return seed / 2 ** 32
  }
}

const classic: UnitClass[] = ['Fighter', 'Warrior', 'Barbarian', 'Spearman', 'Thief', 'Archer', 'Cleric', 'Mage']

describe('buildCpuArmy', () => {
  test('every class has a role', () => {
    for (const c of UNIT_CLASSES) expect(() => roleOf(c)).not.toThrow()
  })

  test.each(Array.from({ length: 30 }, (_, i) => i + 1))('seed %i: fits the budget and keeps the roles', seed => {
    const army = buildCpuArmy(classic, ARMY_BUDGET, seeded(seed))
    expect(army).toHaveLength(classic.length)
    expect(armyCost(army)).toBeLessThanOrEqual(ARMY_BUDGET)
    expect(army.map(roleOf)).toEqual(classic.map(roleOf))
  })

  test('uses most of the budget', () => {
    const costs = Array.from({ length: 30 }, (_, i) => armyCost(buildCpuArmy(classic, ARMY_BUDGET, seeded(i + 100))))
    expect(Math.min(...costs)).toBeGreaterThanOrEqual(ARMY_BUDGET - 8)
  })

  test('a tiny budget falls back to the classic army', () => {
    expect(buildCpuArmy(classic, 10, seeded(1))).toEqual(classic)
  })
})
