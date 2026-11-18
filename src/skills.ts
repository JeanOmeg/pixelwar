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
  'skill-aimed-shot': skill('skill-aimed-shot', 'Aimed Shot', 2, 'attack', 'Next attack cannot miss.'),
  'skill-fireball': skill('skill-fireball', 'Fireball', 3, 'attack', 'Next attack also burns enemies next to the target for 3 damage.'),
  'skill-pierce': skill('skill-pierce', 'Pierce', 2, 'attack', 'Next attack ignores the target\'s defense (armor and forest).'),
  'skill-steal': skill('skill-steal', 'Steal', 1, 'attack', 'Next attack also steals up to 2 MP from the target.'),
  'skill-second-wind': skill('skill-second-wind', 'Second Wind', 2, 'self', 'Recover 6 HP.'),
  'skill-heal': skill('skill-heal', 'Heal', 3, 'ally', 'Restore 8 HP to itself or an adjacent ally.'),
  'skill-rage': skill('skill-rage', 'Rage', 2, 'attack', 'Next attack deals 3 extra damage if it hits.'),
  'skill-guard': skill('skill-guard', 'Guard', 2, 'self', '+3 DEF until its next turn.'),
  'skill-shield-wall': skill('skill-shield-wall', 'Shield Wall', 3, 'self', 'It and adjacent allies get +2 DEF until its next turn.'),
  'skill-frenzy': skill('skill-frenzy', 'Frenzy', 2, 'self', '+3 ATK and -2 DEF until its next turn.'),
  'skill-backstab': skill('skill-backstab', 'Backstab', 3, 'attack', 'Next attack counts as a back attack: sure hit, double ATK.'),
  'skill-pinning-shot': skill('skill-pinning-shot', 'Pinning Shot', 2, 'attack', 'The target cannot move on its next turn.'),
  'skill-drain': skill('skill-drain', 'Drain', 2, 'attack', 'Next attack heals it by the damage dealt.'),
  'skill-brace': skill('skill-brace', 'Brace', 2, 'self', '+1 DEF and counterattacks up to 2 tiles away until its next turn.')
}

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
export const FIREBALL_SPLASH = 3
export const STEAL_MP = 2
export const SECOND_WIND_HP = 6
export const HEAL_HP = 8
export const RAGE_DAMAGE = 3
export const GUARD_DEF = 3
export const SHIELD_WALL_DEF = 2
export const FRENZY_ATK = 3
export const FRENZY_DEF = -2
export const BRACE_DEF = 1
export const BRACE_REACH = 2
