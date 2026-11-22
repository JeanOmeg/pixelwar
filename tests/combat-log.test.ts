// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { CombatLog, LOG_LIMIT } from '../src/combat-log'
import { fixedRolls } from '../src/unit'
import { forecastAttack, PLAIN_ATTACK } from '../src/combat'
import { makeBoard, makePlayers, place } from './helpers'

function track(board: ReturnType<typeof makeBoard>, round = () => 1) {
  const [a, b] = makePlayers(board)
  const log = new CombatLog(unit => ({ name: unit.name, team: unit.player === a ? 'blue' : 'red' }), round)
  board.onAttackEvent = (event, result) => log.record(event, result)
  return { log, a, b }
}

describe('combat log', () => {
  test('logs the attack with its odds, then the counterattack', () => {
    const board = makeBoard(['...'])
    const { log, a, b } = track(board)
    const fighter = place(board, 'FighterA', 0, 0, a)
    const warrior = place(board, 'WarriorB', 1, 0, b)
    warrior.miniDirection = 'left'
    const odds = forecastAttack(fighter.combatStats(), warrior.combatStats(), PLAIN_ATTACK, warrior.health).hitChance
    fighter.attackInstant(warrior, fixedRolls([[2, 1], [19, 6]]))

    expect(log.entries).toHaveLength(2)
    const [strike, counter] = log.entries
    expect(strike).toMatchObject({ kind: 'strike', counter: false, hit: false, damage: 1, killed: false, attacker: { name: 'FighterA', team: 'blue' }, defender: { name: 'WarriorB', team: 'red' } })
    if (strike.kind === 'strike') expect(strike.hitChance).toBeCloseTo(odds)
    expect(counter).toMatchObject({ kind: 'strike', counter: true, hit: true, attacker: { name: 'WarriorB' }, defender: { name: 'FighterA' } })
    expect(log.version).toBe(2)
  })

  test('kills, burns and skill effects', () => {
    const board = makeBoard(['.....'])
    const { log, a, b } = track(board, () => 3)
    const mage = place(board, 'MageA', 0, 0, a)
    const thief = place(board, 'ThiefB', 2, 0, b)
    const cleric = place(board, 'ClericB', 3, 0, b)
    mage.startSkill('skill-fireball')
    mage.attackInstant(thief, fixedRolls([[20, 6]]))
    const kinds = log.entries.map(e => e.kind)
    expect(kinds[0]).toBe('strike')
    expect(kinds.filter(k => k === 'burn').length).toBeGreaterThanOrEqual(1)
    expect(log.entries.every(e => e.round === 3)).toBe(true)
    const burnOnCleric = log.entries.find(e => e.kind === 'burn' && e.defender.name === cleric.name)
    expect(burnOnCleric).toBeTruthy()

    const necro = place(board, 'NecromancerA', 4, 0, a)
    necro.health = 2
    necro.startSkill('skill-drain')
    necro.attackInstant(cleric, fixedRolls([[20, 6], [1, 1]]))
    expect(log.entries.some(e => e.kind === 'heal' && e.unit.name === 'NecromancerA')).toBe(true)
  })

  test('keeps only the last entries', () => {
    const board = makeBoard(['...'])
    const { log, a, b } = track(board)
    const fighter = place(board, 'FighterA', 0, 0, a)
    const warrior = place(board, 'WarriorB', 1, 0, b)
    for (let i = 0; i < LOG_LIMIT; i++) {
      warrior.health = 25
      fighter.health = 15
      warrior.miniDirection = 'left'
      fighter.attackInstant(warrior, fixedRolls([[2, 1], [2, 1]]))
    }
    expect(log.entries).toHaveLength(LOG_LIMIT)
    expect(log.version).toBe(LOG_LIMIT * 2)
  })
})
