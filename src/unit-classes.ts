import { CLASS_STATS, ClassStats } from './class-stats'
import { TERRAIN_RULES } from './path-finding/terrain-rules'
import { UNIT_CLASSES, UnitClass } from './unit-types'

export { UNIT_CLASSES, unitTypeOf } from './unit-types'

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
  Mage: { role: 'Ranged', cost: 8, description: 'Strikes from a distance and moves a bit faster than the archer.' },
  Spearman: { role: 'Reach', cost: 8, description: 'Hits two tiles away on open ground, safe from counterattacks.' },
  Thief: { role: 'Skirmisher', cost: 10, description: 'Hard hitter that crosses rough terrain at full speed. Perfect for back attacks.' },
  Fighter: { role: 'Melee', cost: 12, description: 'Solid all-rounder with good mobility.' },
  Cleric: { role: 'Support', cost: 15, description: 'Sturdy and mobile. Holds the line well.' },
  Barbarian: { role: 'Bruiser', cost: 17, description: 'Strong attacker with thick hide, but slow.' },
  Warrior: { role: 'Tank', cost: 21, description: 'Highest HP and defense. Slow, built to block paths.' },
  Paladin: { role: 'Holy knight', cost: 15, description: 'Armored swordsman: almost as tough as a Barbarian and faster on its feet.' },
  Berserker: { role: 'Berserker', cost: 17, description: 'The hardest hitter in the game. Light armor, so strike first.' },
  Assassin: { role: 'Assassin', cost: 9, description: 'Fastest unit, crosses rough terrain freely. Deadly from behind, dies to a stiff breeze.' },
  Ranger: { role: 'Ranged', cost: 11, description: 'Forest archer: shorter range than the Archer, but stronger and swift through the woods.' },
  Necromancer: { role: 'Dark mage', cost: 8, description: 'Dark magic that hits twice as hard as the Mage, at a shorter range.' },
  Halberdier: { role: 'Reach', cost: 12, description: 'Armored pikeman. Its reach of 2 works on any terrain.' }
}

/** Points available to build an army (the classic 8-class army costs exactly this) */
export const ARMY_BUDGET = 100

/** The 8 classes the maps were drawn with (their classic army costs ARMY_BUDGET) */
export const ORIGINAL_CLASSES: UnitClass[] = UNIT_CLASSES.slice(0, 8)

export function classCost(unitClass: UnitClass): number {
  return CLASS_INFO[unitClass].cost
}

export function armyCost(army: UnitClass[]): number {
  return army.reduce((sum, unitClass) => sum + classCost(unitClass), 0)
}

/** Readable special rules, derived from the pathfinder rules */
export interface ClassTrait {
  name: string
  description: string
}

/**
 * Passive rules of a class, shown next to its skills. How range behaves on
 * forest/water is left to `rangeNote`, which already says it.
 */
export function classTraits(unitClass: UnitClass): ClassTrait[] {
  const rules = TERRAIN_RULES[unitClass]
  const traits: ClassTrait[] = []
  if (rules.ignoresSlowTerrain) traits.push({ name: 'Pathfinder', description: 'Moves at full speed through forest.' })
  if (rules.targetsWater) traits.push({ name: 'Over water', description: 'Can target enemies across water.' })
  if (classStats(unitClass).range === 1) traits.push({ name: 'Counterattack', description: 'Strikes back once when an adjacent enemy attacks it and it survives.' })
  return traits
}

/** Stats of a class (both teams have the same stats) */
export function classStats(unitClass: UnitClass): ClassStats {
  return CLASS_STATS[unitClass]
}

/**
 * How the range works on the map. Range is counted in points: 1 per tile, but
 * some classes pay 2 per forest or water tile, so "range 6" is 6 tiles in the
 * open and 3 over forest or water.
 */
export function rangeNote(unitName: string, range: number): string {
  if (range <= 1) return 'Melee: adjacent tiles'
  const rules = TERRAIN_RULES[unitName.replace(/[AB]$/, '') as UnitClass] ?? {}
  return rules.slowTerrainCostsRange
    ? `${range} tiles in the open, ${Math.floor(range / 2)} over forest or water`
    : `${range} tiles on any terrain`
}
