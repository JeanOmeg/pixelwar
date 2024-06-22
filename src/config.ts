import * as ex from "excalibur"

import { CrabIdle, KnightIdle, SlimeIdle, SpiderIdle } from "./resources"
const seed = Date.now()
console.log("Random seed:", seed)
export const RANDOM = new ex.Random(seed)

export const SCALE = ex.vec(2, 2)
export const BOARD_OFFSET = ex.vec(32 * 3, 32 * 4)
export const ENEMY_SPEED = 200

export type UnitType = "Knight" | "Spider" | "Slime" | "Crab"
export interface UnitConfig {
  graphics: {
    offset: ex.Vector,
    idle: ex.Animation
  }
  health: number
  movement: number
  direction: string
  attack: number
  defense: number
  range: number
}
export const UNIT_CONFIG: Record<UnitType, UnitConfig> = {
  Knight: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: KnightIdle
    },
    health: 5,
    movement: 2,
    attack: 2,
    defense: 2,
    range: 1,
    direction: 'direita'
  },
  Spider: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: SpiderIdle
    },
    health: 3,
    movement: 2,
    attack: 1,
    range: 1,
    direction: 'direita',
    defense: 0
  },
  Slime: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: SlimeIdle
    },
    health: 2,
    movement: 1,
    attack: 4,
    range: 1,
    direction: 'direita',
    defense: 0
  },
  Crab: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: CrabIdle
    },
    health: 3,
    movement: 3,
    attack: 2,
    range: 1,
    direction: 'direita',
    defense: 0
  }
} as const;

