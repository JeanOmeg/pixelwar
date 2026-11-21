import { CLASS_STATS, ClassStats } from './class-stats'
import { TERRAIN_RULES } from './path-finding/terrain-rules'
import { UNIT_CLASSES, UnitClass } from './unit-types'
import { t } from './i18n'

export { UNIT_CLASSES, unitTypeOf } from './unit-types'

/**
 * Role, description and army point cost of each class.
 *
 * Costs come from the balance analysis described in CLAUDE.md ("Balanceamento"):
 * power = average damage dealt x average attacks survived x threat (move + range),
 * all computed with the real combat odds (combat.ts). Scaled so the classic army
 * (the 8 original classes) costs exactly ARMY_BUDGET.
 */
export interface ClassInfo {
  /** Name shown to the player (translated; the code uses the UnitClass id) */
  readonly name: string
  readonly role: string
  readonly description: string
  readonly cost: number
}

/** Name, role and description come from the current language (i18n) */
const info = (unitClass: UnitClass, cost: number): ClassInfo => ({
  cost,
  get name() { return t().classes[unitClass].name },
  get role() { return t().classes[unitClass].role },
  get description() { return t().classes[unitClass].description }
})

export const CLASS_INFO: Record<UnitClass, ClassInfo> = {
  Archer: info('Archer', 9),
  Mage: info('Mage', 8),
  Spearman: info('Spearman', 8),
  Thief: info('Thief', 10),
  Fighter: info('Fighter', 12),
  Cleric: info('Cleric', 15),
  Barbarian: info('Barbarian', 17),
  Warrior: info('Warrior', 21),
  Paladin: info('Paladin', 15),
  Berserker: info('Berserker', 17),
  Assassin: info('Assassin', 9),
  Ranger: info('Ranger', 11),
  Necromancer: info('Necromancer', 8),
  Halberdier: info('Halberdier', 12)
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
  if (rules.ignoresSlowTerrain) traits.push(t().traits.pathfinder)
  if (rules.targetsWater) traits.push(t().traits.overWater)
  if (classStats(unitClass).range === 1) traits.push(t().traits.counterattack)
  return traits
}

/** Stats of a class (both teams have the same stats) */
export function classStats(unitClass: UnitClass): ClassStats {
  return CLASS_STATS[unitClass]
}

/**
 * How the range works on the map. Range is counted in points: 1 per tile, but
 * some classes pay 2 per forest tile, so "range 6" is 6 tiles in the open (or
 * over water) and 3 over forest.
 */
export function rangeNote(unitName: string, range: number): string {
  if (range <= 1) return t().details.melee
  const rules = TERRAIN_RULES[unitName.replace(/[AB]$/, '') as UnitClass] ?? {}
  return rules.slowTerrainCostsRange
    ? t().details.rangeSlow(range, Math.floor(range / 2))
    : t().details.rangeAny(range)
}

/** Class name in the current language (the code always uses the UnitClass id) */
export function className(unitClass: UnitClass): string {
  return t().classes[unitClass]?.name ?? unitClass
}
