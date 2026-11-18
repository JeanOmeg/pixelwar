import { describe, expect, test } from 'vitest'
import {
  CRITICAL_BASE_DAMAGE, MISS_DAMAGE, PLAIN_ATTACK, advantageChance, facingBetween,
  forecastAttack, resolveAttack, rollWithAdvantage
} from '../src/combat'

const fighter = { attack: 4, defense: 3 }
const warrior = { attack: 4, defense: 5 }

describe('dice', () => {
  test('advantage keeps the best of two rolls', () => {
    const rolls = [0.1, 0.9] // 3 and 19 on a d20
    expect(rollWithAdvantage(20, () => rolls.shift()!)).toBe(19)
  })

  test('advantage chances add up to 1', () => {
    const total = Array.from({ length: 20 }, (_, i) => advantageChance(i + 1, 20)).reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(1)
  })
})

describe('resolveAttack', () => {
  test('hits when ATK + d20 beats DEF + 10', () => {
    expect(resolveAttack(fighter, warrior, PLAIN_ATTACK, 12, 3)).toMatchObject({ hit: true, damage: 3 + 4 - 5 })
    expect(resolveAttack(fighter, warrior, PLAIN_ATTACK, 11, 3)).toMatchObject({ hit: false, damage: MISS_DAMAGE })
  })

  test('a natural 20 is a critical', () => {
    expect(resolveAttack(fighter, warrior, PLAIN_ATTACK, 20, 1)).toMatchObject({ critical: true, damage: CRITICAL_BASE_DAMAGE + 4 - 5 })
  })

  test('back attacks always hit for d6 + 2 ATK - DEF', () => {
    expect(resolveAttack(fighter, warrior, { ...PLAIN_ATTACK, backAttack: true }, 1, 2)).toMatchObject({ hit: true, damage: 2 + 8 - 5 })
  })

  test('damage on a hit is at least 1', () => {
    expect(resolveAttack({ attack: 1, defense: 0 }, { attack: 0, defense: 0 }, PLAIN_ATTACK, 19, 1).damage).toBeGreaterThanOrEqual(1)
  })

  test('skill modifiers: aimed shot, pierce and rage', () => {
    expect(resolveAttack(fighter, warrior, { ...PLAIN_ATTACK, guaranteedHit: true }, 1, 3)).toMatchObject({ hit: true })
    expect(resolveAttack(fighter, warrior, { ...PLAIN_ATTACK, ignoreDefense: true }, 1, 3)).toMatchObject({ hit: false })
    expect(resolveAttack(fighter, warrior, { ...PLAIN_ATTACK, ignoreDefense: true }, 7, 3)).toMatchObject({ hit: true, damage: 3 + 4 })
    expect(resolveAttack(fighter, warrior, { ...PLAIN_ATTACK, bonusDamage: 3 }, 12, 3)).toMatchObject({ damage: 3 + 4 - 5 + 3 })
    // rage adds nothing to a miss
    expect(resolveAttack(fighter, warrior, { ...PLAIN_ATTACK, bonusDamage: 3 }, 2, 3).damage).toBe(MISS_DAMAGE)
  })
})

describe('forecastAttack', () => {
  test('probabilities match the exact rules', () => {
    const f = forecastAttack(fighter, warrior, PLAIN_ATTACK, 25)
    // hit needs d20 >= 12 (or 20): P(max of 2 d20 >= 12) = 1 - (11/20)^2
    expect(f.hitChance).toBeCloseTo(1 - (11 / 20) ** 2)
    expect(f.critChance).toBeCloseTo(1 - (19 / 20) ** 2)
    expect(f.killChance).toBe(0)
  })

  test('forced critical and aimed shot are sure hits', () => {
    const critical = forecastAttack(fighter, warrior, { ...PLAIN_ATTACK, forcesCritical: true }, 99)
    expect(critical.hitChance).toBeCloseTo(1)
    expect(critical.guaranteedHit).toBe(true)
    expect(forecastAttack(fighter, warrior, { ...PLAIN_ATTACK, guaranteedHit: true }, 99).hitChance).toBeCloseTo(1)
  })
})

test('facing between cells', () => {
  expect(facingBetween({ x: 2, y: 2 }, { x: 2, y: 1 })).toBe('up')
  expect(facingBetween({ x: 2, y: 2 }, { x: 2, y: 3 })).toBe('down')
  expect(facingBetween({ x: 2, y: 2 }, { x: 1, y: 2 })).toBe('left')
  expect(facingBetween({ x: 2, y: 2 }, { x: 3, y: 2 })).toBe('right')
})
