import { AttackContext, CombatStats, FOREST_DEFENSE, PLAIN_ATTACK, forecastAttack } from './combat'
import { CLASS_STATS } from './class-stats'
import { TERRAIN_RULES } from './path-finding/terrain-rules'
import { UNIT_CLASSES, UnitClass } from './unit-types'

/**
 * Army point costs from the real combat math (see "Balanceamento" in CLAUDE.md).
 * Pure, so a test can check that CLASS_INFO costs match it.
 *
 * - attack: average expected damage against every class (target in the forest
 *   FOREST_SHARE of the time), plus, for melee classes, the counterattacks they
 *   deal when a melee enemy attacks them;
 * - resistance: HP / average expected damage taken from every class, plus, for
 *   melee classes, the counterattacks they take when attacking a melee enemy;
 * - threat: movement + range, where classes slowed by forest lose half of them
 *   on the FOREST_SHARE of the map that is forest;
 * - power = attack x resistance x threat / 6 x (1 + 0.12 per tile of range past 1).
 *
 * Costs are the power scaled so the 8 original classes (the army drawn in the
 * maps) add up to exactly ARMY_COST_TOTAL. Class skills are left out: every
 * class has one, paid from the same 4 MP.
 */

/** Share of the walkable map that is forest (slow terrain) */
export const FOREST_SHARE = 0.35
/** What the 8 original classes cost together (= ARMY_BUDGET) */
export const ARMY_COST_TOTAL = 100

export interface BalanceRules {
  /** Melee defenders strike back */
  counterattack: boolean
  /** +FOREST_DEFENSE on forest tiles */
  forest: boolean
}

export const CURRENT_RULES: BalanceRules = { counterattack: true, forest: true }

const ORIGINAL_CLASSES = UNIT_CLASSES.slice(0, 8)
const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length
const isMelee = (c: UnitClass) => CLASS_STATS[c].range === 1

function expectedDamage(attacker: UnitClass, defender: UnitClass, rules: BalanceRules, context: AttackContext = PLAIN_ATTACK): number {
  const open = forecastAttack(CLASS_STATS[attacker], CLASS_STATS[defender], context, Infinity).expectedDamage
  if (!rules.forest) return open
  const covered: CombatStats = { ...CLASS_STATS[defender], defense: CLASS_STATS[defender].defense + FOREST_DEFENSE }
  const forest = forecastAttack(CLASS_STATS[attacker], covered, context, Infinity).expectedDamage
  return (1 - FOREST_SHARE) * open + FOREST_SHARE * forest
}

export interface ClassPower {
  attack: number
  resistance: number
  threat: number
  power: number
}

export function classPower(c: UnitClass, rules: BalanceRules = CURRENT_RULES): ClassPower {
  const stats = CLASS_STATS[c]
  const terrain = TERRAIN_RULES[c]
  const slowed = 1 - FOREST_SHARE / 2

  let dealt = mean(UNIT_CLASSES.map(d => expectedDamage(c, d, rules)))
  let taken = mean(UNIT_CLASSES.map(a => expectedDamage(a, c, rules)))
  if (rules.counterattack && isMelee(c)) {
    // attacked by a melee enemy: it strikes back; attacking a melee enemy: it gets struck back
    dealt += mean(UNIT_CLASSES.map(a => isMelee(a) ? expectedDamage(c, a, rules) : 0))
    taken += mean(UNIT_CLASSES.map(d => isMelee(d) ? expectedDamage(d, c, rules) : 0))
  }
  const resistance = stats.health / taken

  const move = stats.movement * (terrain.ignoresSlowTerrain ? 1 : slowed)
  const range = stats.range * (terrain.slowTerrainCostsRange ? slowed : 1)
  const threat = move + range
  const power = dealt * resistance * threat / 6 * (1 + 0.12 * (range - 1))
  return { attack: dealt, resistance, threat, power }
}

/**
 * Point cost of every class. The originals are rounded with the largest
 * remainder method so they add up to exactly ARMY_COST_TOTAL.
 */
export function computeCosts(rules: BalanceRules = CURRENT_RULES): Record<UnitClass, number> {
  const power = Object.fromEntries(UNIT_CLASSES.map(c => [c, classPower(c, rules).power])) as Record<UnitClass, number>
  const scale = ARMY_COST_TOTAL / ORIGINAL_CLASSES.reduce((sum, c) => sum + power[c], 0)
  const costs = Object.fromEntries(UNIT_CLASSES.map(c => [c, Math.round(power[c] * scale)])) as Record<UnitClass, number>

  const exact = ORIGINAL_CLASSES.map(c => ({ c, value: power[c] * scale }))
  const floors = exact.map(({ c, value }) => ({ c, floor: Math.floor(value), rest: value - Math.floor(value) }))
  let missing = ARMY_COST_TOTAL - floors.reduce((sum, f) => sum + f.floor, 0)
  for (const f of floors) costs[f.c] = f.floor
  for (const f of [...floors].sort((a, b) => b.rest - a.rest)) {
    if (missing-- <= 0) break
    costs[f.c]++
  }
  return costs
}
