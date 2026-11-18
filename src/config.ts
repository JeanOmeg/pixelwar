import * as ex from 'excalibur'
import { UNIT_ANIMATIONS, UnitAnimations } from './resources'
import { SkillDefinition, skillsOf } from './skills'
import { UNIT_TYPES, UnitClass, UnitType, unitClassOf } from './unit-types'
import { CLASS_STATS, ClassStats } from './class-stats'

export type { UnitType } from './unit-types'

export const SCALE = ex.vec(2, 2)
export const SCALE_CURSOR = ex.vec(2.5, 2.5)
export const SCALE_UNIT = ex.vec(1.8, 1.8)
export const UNIT_OFFSET = ex.vec(25, 20 * SCALE_UNIT.y)

/** Base pause (ms) between the CPU's steps; divided by the game speed (speed.ts) */
export const ENEMY_SPEED = 200

export interface UnitConfig extends ClassStats {
  graphics: UnitAnimations & { offset: ex.Vector }
  mp: number
  skills: SkillDefinition[]
}

/** Every class starts a match with this much MP (it doesn't regenerate) */
export const STARTING_MP = 4

function unitConfig(type: UnitType): UnitConfig {
  const unitClass: UnitClass = unitClassOf(type)
  return {
    ...CLASS_STATS[unitClass],
    graphics: { offset: UNIT_OFFSET, ...UNIT_ANIMATIONS[type] },
    mp: STARTING_MP,
    skills: skillsOf(unitClass)
  }
}

/** Stats, animations and skills of each unit type. Both teams have the same stats. */
export const UNIT_CONFIG = Object.fromEntries(UNIT_TYPES.map(type => [type, unitConfig(type)])) as Record<UnitType, UnitConfig>
