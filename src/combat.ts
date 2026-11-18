/**
 * Pure combat rules, shared by the real attack (Unit.attack), the combat
 * preview in the UI and (later) the AI. No engine dependencies.
 *
 * Rules:
 * - d20 and d6 are always rolled with advantage (best of 2).
 * - Hit if ATK + d20 > DEF + 10, or critical, or back attack.
 * - Critical (d20 = 20 or forced): 12 + ATK - DEF.
 * - Back attack (attacker faces the same way as the target): d6 + 2*ATK - DEF.
 * - Normal: d6 + ATK - DEF.
 * - Minimum damage on hit is 1. A miss also deals 1 damage.
 */

export type Facing = 'up' | 'down' | 'left' | 'right'

export interface CombatStats {
  attack: number
  defense: number
}

export interface AttackContext {
  /** Special Attack skill: next attack is a guaranteed critical */
  forcesCritical: boolean
  /** Attacker is facing the same direction as the target */
  backAttack: boolean
}

export interface AttackOutcome {
  hit: boolean
  critical: boolean
  backAttack: boolean
  damage: number
  d20: number
}

export interface AttackForecast {
  hitChance: number
  critChance: number
  /** Damage range when the attack hits */
  minDamage: number
  maxDamage: number
  /** Average damage including misses */
  expectedDamage: number
  /** Chance that the damage is >= the target's current HP */
  killChance: number
  backAttack: boolean
  /** Hit is certain (critical forced or back attack) */
  guaranteedHit: boolean
}

export const MISS_DAMAGE = 1
export const CRITICAL_BASE_DAMAGE = 12

/** Direction a unit faces after stepping/attacking from `from` towards `to` */
export function facingBetween(from: { x: number, y: number }, to: { x: number, y: number }): Facing {
  if (from.y > to.y) return 'up'
  if (from.y < to.y) return 'down'
  if (from.x > to.x) return 'left'
  return 'right'
}

export function rollWithAdvantage(sides: number, random: () => number = Math.random): number {
  const first = Math.floor(random() * sides) + 1
  const second = Math.floor(random() * sides) + 1
  return Math.max(first, second)
}

/** Probability of rolling exactly `value` on a die with `sides` faces, with advantage */
export function advantageChance(value: number, sides: number): number {
  return (2 * value - 1) / (sides * sides)
}

export function resolveAttack(attacker: CombatStats, defender: CombatStats, context: AttackContext, d20: number, d6: number): AttackOutcome {
  const critical = d20 === 20 || context.forcesCritical
  const hit = attacker.attack + d20 > defender.defense + 10 || context.backAttack || critical

  let damage: number
  if (critical) {
    damage = CRITICAL_BASE_DAMAGE + attacker.attack - defender.defense
  } else if (context.backAttack) {
    damage = d6 + attacker.attack * 2 - defender.defense
  } else {
    damage = d6 + attacker.attack - defender.defense
  }
  damage = hit ? Math.max(damage, 1) : MISS_DAMAGE

  return { hit, critical, backAttack: context.backAttack, damage, d20 }
}

/** Exact odds, enumerating every d20 x d6 combination */
export function forecastAttack(attacker: CombatStats, defender: CombatStats, context: AttackContext, targetHealth: number): AttackForecast {
  let hitChance = 0
  let critChance = 0
  let expectedDamage = 0
  let killChance = 0
  let minDamage = Infinity
  let maxDamage = 0

  for (let d20 = 1; d20 <= 20; d20++) {
    for (let d6 = 1; d6 <= 6; d6++) {
      const p = advantageChance(d20, 20) * advantageChance(d6, 6)
      const outcome = resolveAttack(attacker, defender, context, d20, d6)
      expectedDamage += outcome.damage * p
      if (outcome.damage >= targetHealth) killChance += p
      if (outcome.critical) critChance += p
      if (outcome.hit) {
        hitChance += p
        minDamage = Math.min(minDamage, outcome.damage)
        maxDamage = Math.max(maxDamage, outcome.damage)
      }
    }
  }

  return {
    hitChance,
    critChance,
    minDamage: minDamage === Infinity ? MISS_DAMAGE : minDamage,
    maxDamage: Math.max(maxDamage, MISS_DAMAGE),
    expectedDamage,
    killChance,
    backAttack: context.backAttack,
    guaranteedHit: context.forcesCritical || context.backAttack
  }
}
