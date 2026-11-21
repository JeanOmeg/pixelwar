import type { UnitClass } from './unit-types'
import { t } from './i18n'

/**
 * Skills: every class has Run and Special plus one skill of its own.
 * Pure data (no engine), used by Unit (rules), the menu, the AI and the
 * Units/How to play pages.
 *
 * Kinds:
 * - move: changes the next move (Run). Refunded if the move is cancelled.
 * - attack: changes the next attack. Refunded if the attack is cancelled.
 * - self: takes effect at once on the unit (and maybe allies around it).
 * - ally: pick the unit itself or an adjacent ally.
 *
 * Effects that last "until its next turn" are cleared by Unit.reset() when the
 * owner's turn starts.
 */

export type SkillKind = 'move' | 'attack' | 'self' | 'ally'

export type SkillId =
  | 'skill-run' | 'skill-special-attack'
  | 'skill-aimed-shot' | 'skill-fireball' | 'skill-pierce' | 'skill-steal'
  | 'skill-second-wind' | 'skill-heal' | 'skill-rage' | 'skill-guard'
  | 'skill-shield-wall' | 'skill-frenzy' | 'skill-backstab' | 'skill-pinning-shot'
  | 'skill-drain' | 'skill-brace'

export interface SkillDefinition {
  id: SkillId
  name: string
  description: string
  cost: number
  kind: SkillKind
}

/** Name and description come from the current language (i18n) */
const skill = (id: SkillId, cost: number, kind: SkillKind): SkillDefinition => ({
  id,
  cost,
  kind,
  get name() { return t().skills[id].name },
  get description() { return t().skills[id].description }
})

export const SKILLS: Record<SkillId, SkillDefinition> = {
  'skill-run': skill('skill-run', 2, 'move'),
  'skill-special-attack': skill('skill-special-attack', 4, 'attack'),
  'skill-aimed-shot': skill('skill-aimed-shot', 2, 'attack'),
  'skill-fireball': skill('skill-fireball', 2, 'attack'),
  'skill-pierce': skill('skill-pierce', 2, 'attack'),
  'skill-steal': skill('skill-steal', 2, 'attack'),
  'skill-second-wind': skill('skill-second-wind', 2, 'self'),
  'skill-heal': skill('skill-heal', 2, 'ally'),
  'skill-rage': skill('skill-rage', 2, 'attack'),
  'skill-guard': skill('skill-guard', 2, 'self'),
  'skill-shield-wall': skill('skill-shield-wall', 2, 'self'),
  'skill-frenzy': skill('skill-frenzy', 2, 'self'),
  'skill-backstab': skill('skill-backstab', 4, 'attack'),
  'skill-pinning-shot': skill('skill-pinning-shot', 2, 'attack'),
  'skill-drain': skill('skill-drain', 2, 'attack'),
  'skill-brace': skill('skill-brace', 2, 'self')
}

/** Every skill costs 2 MP (twice per match) or 4 MP (once): see "Skills" in CLAUDE.md */
export const SKILL_COSTS = [2, 4] as const

/** The skill only this class has */
export const CLASS_SKILL: Record<UnitClass, SkillId> = {
  Archer: 'skill-aimed-shot',
  Mage: 'skill-fireball',
  Spearman: 'skill-pierce',
  Thief: 'skill-steal',
  Fighter: 'skill-second-wind',
  Cleric: 'skill-heal',
  Barbarian: 'skill-rage',
  Warrior: 'skill-guard',
  Paladin: 'skill-shield-wall',
  Berserker: 'skill-frenzy',
  Assassin: 'skill-backstab',
  Ranger: 'skill-pinning-shot',
  Necromancer: 'skill-drain',
  Halberdier: 'skill-brace'
}

/** Run, Special and the class skill, in menu order */
export function skillsOf(unitClass: UnitClass): SkillDefinition[] {
  return [SKILLS['skill-run'], SKILLS['skill-special-attack'], SKILLS[CLASS_SKILL[unitClass]]]
}

// Numbers used by the effects (kept here so rules, AI and texts agree)
export const AIMED_SHOT_DAMAGE = 3
/** Fireball: burns the target (hit or miss) and every enemy next to it */
export const FIREBALL_SPLASH = 2
export const STEAL_MP = 2
/** MP a unit earns back for each enemy it kills and for each critical hit it lands, never above its starting MP */
export const MP_PER_KILL = 1
export const MP_PER_CRITICAL = 1
export const SECOND_WIND_HP = 6
export const HEAL_HP = 6
export const RAGE_DAMAGE = 5
export const DRAIN_DAMAGE = 2
export const PINNING_SHOT_DAMAGE = 2
export const GUARD_DEF = 4
export const SHIELD_WALL_DEF = 2
export const FRENZY_ATK = 4
export const FRENZY_DEF = -1
export const BRACE_DEF = 2

/** Extra damage on hit given by an attack skill (Aimed Shot, Rage, Drain) */
export function skillBonusDamage(id: SkillId | null | undefined): number {
  switch (id) {
  case 'skill-aimed-shot': return AIMED_SHOT_DAMAGE
  case 'skill-rage': return RAGE_DAMAGE
  case 'skill-drain': return DRAIN_DAMAGE
  case 'skill-pinning-shot': return PINNING_SHOT_DAMAGE
  default: return 0
  }
}
export const BRACE_REACH = 2
