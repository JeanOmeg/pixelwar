import type { UnitClass } from './unit-types'

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

const skill = (id: SkillId, name: string, cost: number, kind: SkillKind, description: string): SkillDefinition =>
  ({ id, name, cost, kind, description })

export const SKILLS: Record<SkillId, SkillDefinition> = {
  'skill-run': skill('skill-run', 'Run', 2, 'move', 'Double movement this turn. You can still attack.'),
  'skill-special-attack': skill('skill-special-attack', 'Special', 4, 'attack', 'Next attack is always critical.'),
  'skill-aimed-shot': skill('skill-aimed-shot', 'Aimed Shot', 2, 'attack', 'Next attack cannot miss and deals 3 extra damage.'),
  'skill-fireball': skill('skill-fireball', 'Fireball', 2, 'attack', 'Next attack also burns the target and every enemy next to it for 2 damage, hit or miss.'),
  'skill-pierce': skill('skill-pierce', 'Pierce', 2, 'attack', 'Next attack ignores the target\'s defense (armor and forest).'),
  'skill-steal': skill('skill-steal', 'Steal', 2, 'attack', 'Next attack also steals up to 2 MP from the target.'),
  'skill-second-wind': skill('skill-second-wind', 'Second Wind', 2, 'self', 'Recover 6 HP.'),
  'skill-heal': skill('skill-heal', 'Heal', 2, 'ally', 'Restore 6 HP to itself or an adjacent ally.'),
  'skill-rage': skill('skill-rage', 'Rage', 2, 'attack', 'Next attack deals 5 extra damage if it hits.'),
  'skill-guard': skill('skill-guard', 'Guard', 2, 'self', '+4 DEF until its next turn.'),
  'skill-shield-wall': skill('skill-shield-wall', 'Shield Wall', 2, 'self', 'It and adjacent allies get +2 DEF until its next turn.'),
  'skill-frenzy': skill('skill-frenzy', 'Frenzy', 2, 'self', '+4 ATK and -1 DEF until its next turn.'),
  'skill-backstab': skill('skill-backstab', 'Backstab', 4, 'attack', 'Next attack counts as a back attack: sure hit, double ATK, no counterattack.'),
  'skill-pinning-shot': skill('skill-pinning-shot', 'Pinning Shot', 2, 'attack', 'Next attack deals 2 extra damage if it hits, and the target cannot move on its next turn.'),
  'skill-drain': skill('skill-drain', 'Drain', 2, 'attack', 'Next attack deals 2 extra damage if it hits and heals it by the damage dealt.'),
  'skill-brace': skill('skill-brace', 'Brace', 2, 'self', '+2 DEF and counterattacks up to 2 tiles away until its next turn.')
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
