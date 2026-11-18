import { armyCost, classCost } from './unit-classes'
import type { UnitClass } from './unit-types'

/**
 * CPU army building. Each slot keeps the role of the class the map drew there
 * (so the map's formation still makes sense) and gets a random class of that
 * role; then the army is fitted to the point budget. Pure: no engine, and the
 * random source can be injected for tests.
 */

export type ArmyRole = 'ranged' | 'reach' | 'skirmisher' | 'melee' | 'heavy'

export const ROLE_CLASSES: Record<ArmyRole, UnitClass[]> = {
  ranged: ['Archer', 'Mage', 'Ranger', 'Necromancer'],
  reach: ['Spearman', 'Halberdier'],
  skirmisher: ['Thief', 'Assassin'],
  melee: ['Fighter', 'Paladin', 'Berserker'],
  heavy: ['Cleric', 'Barbarian', 'Warrior']
}

export function roleOf(unitClass: UnitClass): ArmyRole {
  const role = (Object.keys(ROLE_CLASSES) as ArmyRole[]).find(r => ROLE_CLASSES[r].includes(unitClass))
  if (!role) throw new Error(`No role for ${unitClass}`)
  return role
}

const pick = <T>(list: T[], random: () => number): T => list[Math.floor(random() * list.length)]

/**
 * A random army for the CPU with the same roles as `classic` (the map's army),
 * costing at most `budget`. Falls back to `classic` if nothing else fits.
 */
export function buildCpuArmy(classic: UnitClass[], budget: number, random: () => number = Math.random): UnitClass[] {
  const roles = classic.map(roleOf)
  const army = roles.map(role => pick(ROLE_CLASSES[role], random))

  // too expensive: swap the priciest unit for the cheapest of its role
  while (armyCost(army) > budget) {
    const candidates = army
      .map((unitClass, slot) => ({ slot, cheapest: cheapestOf(roles[slot]), saving: classCost(unitClass) - classCost(cheapestOf(roles[slot])) }))
      .filter(c => c.saving > 0)
      .sort((a, b) => b.saving - a.saving)
    if (candidates.length === 0) return [...classic]
    army[candidates[0].slot] = candidates[0].cheapest
  }

  // points left: upgrade random slots to pricier classes of the same role
  for (let tries = 0; tries < army.length * 4; tries++) {
    const left = budget - armyCost(army)
    const slot = Math.floor(random() * army.length)
    const upgrades = ROLE_CLASSES[roles[slot]].filter(c => {
      const extra = classCost(c) - classCost(army[slot])
      return extra > 0 && extra <= left
    })
    if (upgrades.length > 0) army[slot] = pick(upgrades, random)
  }
  return army
}

function cheapestOf(role: ArmyRole): UnitClass {
  return [...ROLE_CLASSES[role]].sort((a, b) => classCost(a) - classCost(b))[0]
}
