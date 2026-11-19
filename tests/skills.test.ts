import { describe, expect, test } from 'vitest'
import { AttackContext, PLAIN_ATTACK } from '../src/combat'
import { skillGain } from '../src/balance'
import { CLASS_SKILL, SKILLS, SKILL_COSTS, skillBonusDamage } from '../src/skills'
import type { UnitClass } from '../src/unit-types'

describe('skill costs', () => {
  test('every skill costs 2 or 4 MP', () => {
    for (const skill of Object.values(SKILLS)) expect({ [skill.id]: SKILL_COSTS.includes(skill.cost as 2 | 4) }).toEqual({ [skill.id]: true })
  })

  // Skills that only change the damage of one attack: per MP they must give
  // about what Special gives the same class (70%-130%)
  const damageSkills: [UnitClass, AttackContext][] = [
    ['Archer', { ...PLAIN_ATTACK, guaranteedHit: true, bonusDamage: skillBonusDamage('skill-aimed-shot') }],
    ['Spearman', { ...PLAIN_ATTACK, ignoreDefense: true }],
    ['Barbarian', { ...PLAIN_ATTACK, bonusDamage: skillBonusDamage('skill-rage') }],
    ['Assassin', { ...PLAIN_ATTACK, backAttack: true }]
  ]
  test.each(damageSkills)('%s: class skill damage per MP is close to Special', (c, context) => {
    const special = skillGain(c, { ...PLAIN_ATTACK, forcesCritical: true }) / SKILLS['skill-special-attack'].cost
    const own = skillGain(c, context) / SKILLS[CLASS_SKILL[c]].cost
    expect(own / special).toBeGreaterThan(0.7)
    expect(own / special).toBeLessThan(1.3)
  })
})
