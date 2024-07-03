import * as ex from 'excalibur'

import { ArcherAIdle, ArcherBIdle, BarbarianAIdle, BarbarianBIdle, ClericAIdle, ClericBIdle, FighterAIdle, FighterBIdle, MageAIdle, MageBIdle, SpearmanAIdle, SpearmanBIdle, WarriorAIdle, WarriorBIdle } from './resources'
export const SCALE = ex.vec(1.5, 1.5)
export const ENEMY_SPEED = 300

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
    attack: 2,
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
    attack: 2,
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
    attack: 5,
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
    health: 20,
    movement: 6,
    attack: 3,
    defense: 4,
    range: 1
  },
  ClericB: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: ClericBIdle
    },
    health: 20,
    movement: 6,
    attack: 3,
    defense: 4,
    range: 1
  },
  
  // Fighters
  FighterA: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: FighterAIdle
    },
    health: 15,
    movement: 6,
    attack: 4,
    defense: 3,
    range: 1
  },
  FighterB: {
    graphics: {
      offset: ex.vec(0, 12 * SCALE.y),
      idle: FighterBIdle
    },
    health: 15,
    movement: 6,
    attack: 4,
    defense: 3,
    range: 1
  },

  // Mages
  MageA: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: MageAIdle
    },
    health: 10,
    movement: 5,
    attack: 2,
    defense: 2,
    range: 5
  },
  MageB: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: MageBIdle
    },
    health: 10,
    movement: 5,
    attack: 2,
    defense: 2,
    range: 5
  },

  // Spearmans
  SpearmanA: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: SpearmanAIdle
    },
    health: 10,
    movement: 6,
    attack: 3,
    defense: 2,
    range: 3
  },
  SpearmanB: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: SpearmanBIdle
    },
    health: 10,
    movement: 6,
    attack: 3,
    defense: 2,
    range: 3
  },

  // Warriors
  WarriorA: {
    graphics: {
      offset: ex.vec(0, 8 * SCALE.y),
      idle: WarriorAIdle
    },
    health: 25,
    movement: 4,
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
    movement: 4,
    attack: 4,
    defense: 5,
    range: 1
  }
} as const

