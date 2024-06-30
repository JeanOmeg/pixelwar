import * as ex from 'excalibur'

import { ArcherAIdle, ArcherBIdle, BarbarianAIdle, BarbarianBIdle, ClericAIdle, ClericBIdle, FighterAIdle, FighterBIdle, MageAIdle, MageBIdle, SpearmanAIdle, SpearmanBIdle, WarriorAIdle, WarriorBIdle } from './resources'
export const SCALE = ex.vec(2, 2)
export const ENEMY_SPEED = 200

export type UnitType = 'ArcherA' | 'ArcherB' | 'BarbarianA' | 'BarbarianB' | 'ClericA' | 'ClericB' | 'FighterA' | 'FighterB' | 'MageA' | 'MageB' | 'SpearmanA' | 'SpearmanB' | 'WarriorA' | 'WarriorB'
export type ClassType = 'AA' | 'AB' | 'BA' | 'BB' | 'CA' | 'CB' | 'FA' | 'FB' | 'MA' | 'MB' | 'SA' | 'SB' | 'WA' | 'WB'

export interface UnitConfig {
  graphics: {
    offset: ex.Vector,
    idle: ex.Animation
  }
  health: number
  attack: number
  defense: number
  movement: number
  range: number
}

export const UNIT_CONFIG: Record<UnitType, UnitConfig> = {
  // Archers
  ArcherA: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: ArcherAIdle
    },
    health: 10,
    movement: 4,
    attack: 3,
    defense: 2,
    range: 6
  },
  ArcherB: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: ArcherBIdle
    },
    health: 10,
    movement: 4,
    attack: 3,
    defense: 2,
    range: 6
  },

  // Barbarians
  BarbarianA: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: BarbarianAIdle
    },
    health: 20,
    movement: 4,
    attack: 6,
    defense: 4,
    range: 1
  },
  BarbarianB: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: BarbarianBIdle
    },
    health: 20,
    movement: 4,
    attack: 6,
    defense: 4,
    range: 1
  },
  
  // Clerics
  ClericA: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: ClericAIdle
    },
    health: 12,
    movement: 6,
    attack: 3,
    defense: 3,
    range: 5
  },
  ClericB: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: ClericBIdle
    },
    health: 12,
    movement: 6,
    attack: 4,
    defense: 2,
    range: 5
  },
  
  // Fighters
  FighterA: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: FighterAIdle
    },
    health: 20,
    movement: 6,
    attack: 4,
    defense: 4,
    range: 1
  },
  FighterB: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: FighterBIdle
    },
    health: 20,
    movement: 6,
    attack: 4,
    defense: 4,
    range: 1
  },

  // Mages
  MageA: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: MageAIdle
    },
    health: 15,
    movement: 4,
    attack: 3,
    defense: 3,
    range: 5
  },
  MageB: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: MageBIdle
    },
    health: 15,
    movement: 4,
    attack: 3,
    defense: 3,
    range: 5
  },

  // Spearmans
  SpearmanA: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: SpearmanAIdle
    },
    health: 15,
    movement: 6,
    attack: 3,
    defense: 3,
    range: 3
  },
  SpearmanB: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: SpearmanBIdle
    },
    health: 15,
    movement: 6,
    attack: 3,
    defense: 3,
    range: 3
  },

  // Warriors
  WarriorA: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: WarriorAIdle
    },
    health: 25,
    movement: 5,
    attack: 4,
    defense: 5,
    range: 1
  },
  WarriorB: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: WarriorBIdle
    },
    health: 25,
    movement: 5,
    attack: 4,
    defense: 5,
    range: 1
  }
} as const

