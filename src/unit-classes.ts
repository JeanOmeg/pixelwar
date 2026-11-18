import { UNIT_CONFIG, UnitType } from './config'
import { TERRAIN_RULES, UnitClass } from './path-finding/terrain-rules'

/**
 * Role, description and army point cost of each class.
 *
 * Costs come from the balance analysis described in CLAUDE.md ("Balanceamento"):
 * power = average damage dealt x average attacks survived x threat (move + range),
 * all computed with the real combat odds (combat.ts). Scaled so the classic army
 * (the 8 original classes) costs exactly ARMY_BUDGET.
 */
export const CLASS_INFO: Record<UnitClass, { role: string, description: string, cost: number }> = {
  Archer: { role: 'Ranged', cost: 9, description: 'Picks off targets from far away. Fragile up close.' },
  Mage: { role: 'Ranged', cost: 9, description: 'Strikes from a distance and moves a bit faster than the archer.' },
  Spearman: { role: 'Reach', cost: 8, description: 'Hits two tiles away on open ground. Quick on its feet.' },
  Thief: { role: 'Skirmisher', cost: 9, description: 'Hard hitter that crosses rough terrain at full speed. Perfect for back attacks.' },
  Fighter: { role: 'Melee', cost: 12, description: 'Solid all-rounder with good mobility.' },
  Cleric: { role: 'Support', cost: 16, description: 'Sturdy and mobile. Holds the line well.' },
  Barbarian: { role: 'Bruiser', cost: 16, description: 'Strong attacker with thick hide, but slow.' },
  Warrior: { role: 'Tank', cost: 21, description: 'Highest HP and defense. Slow, built to block paths.' },
  Paladin: { role: 'Holy knight', cost: 15, description: 'Armored swordsman: almost as tough as a Barbarian and faster on its feet.' },
  Berserker: { role: 'Berserker', cost: 14, description: 'The hardest hitter in the game. Light armor, so strike first.' },
  Assassin: { role: 'Assassin', cost: 8, description: 'Fastest unit, crosses rough terrain freely. Deadly from behind, dies to a stiff breeze.' },
  Ranger: { role: 'Ranged', cost: 12, description: 'Forest archer: shorter range than the Archer, but stronger and swift through the woods.' },
  Necromancer: { role: 'Dark mage', cost: 8, description: 'Dark magic that hits twice as hard as the Mage, at a shorter range.' },
  Halberdier: { role: 'Reach', cost: 11, description: 'Armored pikeman. Its reach of 2 works on any terrain.' }
}

/** Points available to build an army (the classic 8-class army costs exactly this) */
export const ARMY_BUDGET = 100

export const ORIGINAL_CLASSES: UnitClass[] = ['Archer', 'Mage', 'Spearman', 'Thief', 'Fighter', 'Cleric', 'Barbarian', 'Warrior']
export const NEW_CLASSES: UnitClass[] = ['Paladin', 'Berserker', 'Assassin', 'Ranger', 'Necromancer', 'Halberdier']
export const UNIT_CLASSES: UnitClass[] = [...ORIGINAL_CLASSES, ...NEW_CLASSES]

export function classCost(unitClass: UnitClass): number {
  return CLASS_INFO[unitClass].cost
}

export function armyCost(army: UnitClass[]): number {
  return army.reduce((sum, unitClass) => sum + classCost(unitClass), 0)
}

/** Unit type of a class for a team: team 0 = A (blue), 1 = B (red) */
export function unitTypeOf(unitClass: UnitClass, team: number): UnitType {
  return `${unitClass}${team === 0 ? 'A' : 'B'}` as UnitType
}

/** Readable special rules, derived from the pathfinder rules */
export function classTraits(unitClass: UnitClass): string[] {
  const rules = TERRAIN_RULES[unitClass]
  const traits: string[] = []
  if (rules.ignoresSlowTerrain) traits.push('Full speed on slow terrain')
  if (rules.targetsWater) traits.push('Can target across water')
  if (rules.slowTerrainCostsRange) traits.push('Range halves over slow terrain')
  else if (classStats(unitClass).range > 1) traits.push('Full range on any terrain')
  return traits
}

/** Stats of the blue variant (both teams have the same stats) */
export function classStats(unitClass: UnitClass) {
  return UNIT_CONFIG[unitTypeOf(unitClass, 0)]
}
