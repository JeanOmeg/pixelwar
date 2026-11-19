// @vitest-environment happy-dom
import * as ex from 'excalibur'
import { describe, expect, test } from 'vitest'
import { FOREST_DEFENSE, PLAIN_ATTACK } from '../src/combat'
import { AIMED_SHOT_DAMAGE, FIREBALL_SPLASH, GUARD_DEF, HEAL_HP, SKILLS, skillsOf } from '../src/skills'
import { UNIT_CLASSES } from '../src/unit-types'
import { makeBoard, makePlayers, place } from './helpers'

describe('skills', () => {
  test('every class has Run, Special and one skill of its own', () => {
    const own = UNIT_CLASSES.map(c => skillsOf(c)[2].id)
    for (const c of UNIT_CLASSES) expect(skillsOf(c).map(s => s.id).slice(0, 2)).toEqual(['skill-run', 'skill-special-attack'])
    expect(new Set(own).size).toBe(UNIT_CLASSES.length)
  })

  test('a move/attack skill is refunded if it was not used', () => {
    const board = makeBoard(['...'])
    const [a] = makePlayers(board)
    const fighter = place(board, 'FighterA', 0, 0, a)
    expect(fighter.startSkill('skill-run')).toBe(true)
    expect(fighter.mp).toBe(4 - SKILLS['skill-run'].cost)
    expect(fighter.effectiveMovement).toBe(12)
    fighter.settlePendingSkill()
    expect(fighter.mp).toBe(4)
    expect(fighter.usedSkill).toBe(false)
  })

  test('one skill per turn, and only if there is MP', () => {
    const board = makeBoard(['...'])
    const [a] = makePlayers(board)
    const warrior = place(board, 'WarriorA', 0, 0, a)
    expect(warrior.startSkill('skill-guard')).toBe(true)
    expect(warrior.canUseSkill('skill-run')).toBe(false)
    warrior.reset()
    warrior.mp = 1
    expect(warrior.canUseSkill('skill-guard')).toBe(false)
  })

  test('a class cannot use another class\'s skill', () => {
    const board = makeBoard(['...'])
    const [a] = makePlayers(board)
    expect(place(board, 'FighterA', 0, 0, a).canUseSkill('skill-guard')).toBe(false)
  })

  test('Guard lasts until the owner\'s next turn', () => {
    const board = makeBoard(['...'])
    const [a] = makePlayers(board)
    const warrior = place(board, 'WarriorA', 0, 0, a)
    warrior.startSkill('skill-guard')
    expect(warrior.combatStats().defense).toBe(5 + GUARD_DEF)
    warrior.reset()
    expect(warrior.combatStats().defense).toBe(5)
  })

  test('Heal targets itself or adjacent hurt allies', () => {
    const board = makeBoard(['....'])
    const [a, b] = makePlayers(board)
    const cleric = place(board, 'ClericA', 1, 0, a)
    const ally = place(board, 'FighterA', 2, 0, a)
    const enemy = place(board, 'FighterB', 0, 0, b)
    ally.health = 3
    enemy.health = 3
    expect(cleric.healTargets()).toEqual([ally])
    expect(cleric.useSkillOn('skill-heal', ally)).toBe(true)
    expect(ally.health).toBe(3 + HEAL_HP)
    expect(cleric.mp).toBe(4 - SKILLS['skill-heal'].cost)
  })

  test('Pinning Shot: the target cannot move on its next turn', () => {
    const board = makeBoard(['...'])
    const [, b] = makePlayers(board)
    const enemy = place(board, 'FighterB', 0, 0, b)
    enemy.pinned = true
    enemy.reset()
    expect(enemy.canMove()).toBe(false)
    expect(enemy.pinned).toBe(false)
  })

  test('attack skills change the attack context', () => {
    const board = makeBoard(['...'])
    const [a, b] = makePlayers(board)
    const archer = place(board, 'ArcherA', 0, 0, a)
    const target = place(board, 'FighterB', 2, 0, b)
    archer.startSkill('skill-aimed-shot')
    expect(archer.attackContext(target).guaranteedHit).toBe(true)
    expect(archer.attackContext(target).bonusDamage).toBe(AIMED_SHOT_DAMAGE)
  })

  test('Fireball burns the target, hit or miss, and the enemies next to it', () => {
    const board = makeBoard(['......'])
    const [a, b] = makePlayers(board)
    const mage = place(board, 'MageA', 0, 0, a)
    const target = place(board, 'WarriorB', 3, 0, b)
    const near = place(board, 'WarriorB', 4, 0, b)
    mage.startSkill('skill-fireball')
    mage.attackInstant(target, () => [1, 1]) // a miss: 1 damage
    expect(target.health).toBe(25 - 1 - FIREBALL_SPLASH)
    expect(near.health).toBe(25 - FIREBALL_SPLASH)
  })
})

describe('forest and counterattacks', () => {
  test('forest gives +2 DEF', () => {
    const board = makeBoard(['.f'])
    const [a] = makePlayers(board)
    expect(place(board, 'FighterA', 0, 0, a).combatStats().defense).toBe(3)
    expect(place(board, 'FighterA', 1, 0, a).combatStats().defense).toBe(3 + FOREST_DEFENSE)
  })

  test('melee units strike back at adjacent attackers, not at ranged ones', () => {
    const board = makeBoard(['......'])
    const [a, b] = makePlayers(board)
    const defender = place(board, 'FighterB', 2, 0, b)
    const melee = place(board, 'FighterA', 1, 0, a)
    const archer = place(board, 'ArcherA', 5, 0, a)
    expect(defender.canCounter(melee, PLAIN_ATTACK)).toBe(true)
    expect(defender.canCounter(archer, PLAIN_ATTACK)).toBe(false)
  })

  test('no counterattack after a back attack', () => {
    const board = makeBoard(['...'])
    const [a, b] = makePlayers(board)
    const defender = place(board, 'FighterB', 1, 0, b)
    const attacker = place(board, 'FighterA', 0, 0, a)
    expect(defender.canCounter(attacker, { ...PLAIN_ATTACK, backAttack: true })).toBe(false)
  })

  test('ranged and reach classes do not strike back; Brace lets the Halberdier do it from 2 tiles', () => {
    const board = makeBoard(['....'])
    const [a, b] = makePlayers(board)
    const halberdier = place(board, 'HalberdierB', 2, 0, b)
    const spearman = place(board, 'SpearmanA', 0, 0, a)
    expect(halberdier.canCounter(spearman, PLAIN_ATTACK)).toBe(false)
    halberdier.startSkill('skill-brace')
    expect(halberdier.canCounter(spearman, PLAIN_ATTACK)).toBe(true)
  })
})

describe('mirrored board (online, red player)', () => {
  test('cells are drawn mirrored, and a click finds the real cell', () => {
    const board = makeBoard(['....'], true)
    const tile = board.getCell(1, 0)!.pos.x
    expect(board.getCell(0, 0)!.pos.x).toBe(tile * 3 / 2)
    expect(board.getCell(3, 0)!.pos.x).toBe(0)
    expect(board.getCellByWorldPos(board.getCell(0, 0)!.pos.add(ex.vec(1, 1)))).toBe(board.getCell(0, 0))
    expect(board.getCellByWorldPos(board.getCell(2, 0)!.pos.add(ex.vec(1, 1)))).toBe(board.getCell(2, 0))
  })

  test('facing stays in board coordinates; only the sprite turns the other way', () => {
    for (const mirrored of [false, true]) {
      const board = makeBoard(['...'], mirrored)
      const [a, b] = makePlayers(board)
      const fighter = place(board, 'FighterA', 0, 0, a)
      const target = place(board, 'FighterB', 1, 0, b)
      fighter.defineDirection(fighter.cell!, target.cell!)
      expect(fighter.miniDirection).toBe('right')
      // facing right on the board looks to the left of the screen when mirrored
      expect(fighter.graphics.flipHorizontal).toBe(mirrored)
      target.miniDirection = 'left'
      expect(target.graphics.flipHorizontal).toBe(!mirrored)
    }
  })
})
