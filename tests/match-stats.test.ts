// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { MatchStats } from '../src/match-stats'
import { fixedRolls } from '../src/unit'
import { FIREBALL_SPLASH } from '../src/skills'
import { makeBoard, makePlayers, place } from './helpers'

function track(board: ReturnType<typeof makeBoard>) {
  const stats = new MatchStats()
  board.onAttackEvent = (event, result) => stats.record(event, result)
  board.onUnitDown = unit => stats.unitLost(unit)
  return stats
}

describe('match statistics', () => {
  test('counts damage really dealt, kills and losses', () => {
    const board = makeBoard(['...'])
    const [a, b] = makePlayers(board)
    const stats = track(board)
    const berserker = place(board, 'BerserkerA', 0, 0, a)
    const thief = place(board, 'ThiefB', 1, 0, b)
    thief.health = 3
    // critical: far more than the 3 HP left, only 3 count
    berserker.attackInstant(thief, fixedRolls([[20, 6]]))
    // in a scene, Unit.die() reports the death (no scene here)
    board.onUnitDown?.(thief)
    expect(stats.team(a)).toEqual({ damage: 3, kills: 1, lost: 0 })
    expect(stats.team(b)).toEqual({ damage: 0, kills: 0, lost: 1 })
    expect(stats.mvp()?.unit).toBe(berserker)
    expect(stats.bestCritical?.unit).toBe(berserker)
    expect(stats.bestCritical?.damage).toBeGreaterThan(3)
  })

  test('the counterattack counts for the defender, Fireball splash for the mage', () => {
    const board = makeBoard(['....'])
    const [a, b] = makePlayers(board)
    const stats = track(board)
    const fighter = place(board, 'FighterA', 0, 0, a)
    const warrior = place(board, 'WarriorB', 1, 0, b)
    warrior.miniDirection = 'left'
    fighter.attackInstant(warrior, fixedRolls([[2, 1], [2, 1]]))
    // a miss still does 1, and the warrior strikes back
    expect(stats.team(a).damage).toBe(1)
    expect(stats.team(b).damage).toBeGreaterThan(0)

    const mage = place(board, 'MageA', 3, 0, a)
    const before = stats.team(a).damage
    const health = warrior.health
    mage.startSkill('skill-fireball')
    mage.attackInstant(warrior, fixedRolls([[2, 1]]))
    // strike + the target burning
    expect(health - warrior.health).toBeGreaterThan(FIREBALL_SPLASH)
    expect(stats.team(a).damage).toBe(before + health - warrior.health)
  })
})
