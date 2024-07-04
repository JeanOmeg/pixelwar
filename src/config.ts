import * as ex from 'excalibur'

import { ArcherAAttack, ArcherAIdle, ArcherAMove, ArcherBAttack, ArcherBIdle, ArcherBMove, BarbarianAAttack, BarbarianAIdle, BarbarianAMove, BarbarianBAttack, BarbarianBIdle, BarbarianBMove, ClericAAttack, ClericAIdle, ClericAMove, ClericBAttack, ClericBIdle, ClericBMove, FighterAAttack, FighterAIdle, FighterAMove, FighterBAttack, FighterBIdle, FighterBMove, MageAAttack, MageAIdle, MageAMove, MageBAttack, MageBIdle, MageBMove, SpearmanAAttack, SpearmanAIdle, SpearmanAMove, SpearmanBAttack, SpearmanBIdle, SpearmanBMove, WarriorAAttack, WarriorAIdle, WarriorAMove, WarriorBAttack, WarriorBIdle, WarriorBMove } from './resources'
export const SCALE = ex.vec(1.5, 1.5)
export const ENEMY_SPEED = 200

export type UnitType = 'ArcherA' | 'ArcherB' | 'BarbarianA' | 'BarbarianB' | 'ClericA' | 'ClericB' | 'FighterA' | 'FighterB' | 'MageA' | 'MageB' | 'SpearmanA' | 'SpearmanB' | 'WarriorA' | 'WarriorB'
export type ClassType = 'AA' | 'AB' | 'BA' | 'BB' | 'CA' | 'CB' | 'FA' | 'FB' | 'MA' | 'MB' | 'SA' | 'SB' | 'WA' | 'WB'

export interface UnitConfig {
  graphics: {
    offset: ex.Vector
    idle: ex.Animation
    move: ex.Animation
    attack: ex.Animation
  }
  primary_color: string
  secondary_color: string
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
      offset: ex.vec(14, 14 * SCALE.y),
      idle: ArcherAIdle,
      move: ArcherAMove,
      attack: ArcherAAttack
    },
    health: 10,
    movement: 4,
    attack: 2,
    defense: 2,
    range: 6,
    primary_color: '0000FF',
    secondary_color: '00008B'
  },
  ArcherB: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: ArcherBIdle,
      move: ArcherBMove,
      attack: ArcherBAttack
    },
    health: 10,
    movement: 4,
    attack: 2,
    defense: 2,
    range: 6,
    primary_color: 'FF0000',
    secondary_color: '8B0000'
  },

  // Barbarians
  BarbarianA: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: BarbarianAIdle,
      move: BarbarianAMove,
      attack: BarbarianAAttack
    },
    health: 20,
    movement: 4,
    attack: 5,
    defense: 4,
    range: 1,
    primary_color: '0000FF',
    secondary_color: '00008B'
  },
  BarbarianB: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: BarbarianBIdle,
      move: BarbarianBMove,
      attack: BarbarianBAttack
    },
    health: 20,
    movement: 4,
    attack: 6,
    defense: 4,
    range: 1,
    primary_color: 'FF0000',
    secondary_color: '8B0000'
  },
  
  // Clerics
  ClericA: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: ClericAIdle,
      move: ClericAMove,
      attack: ClericAAttack
    },
    health: 20,
    movement: 6,
    attack: 3,
    defense: 4,
    range: 1,
    primary_color: '0000FF',
    secondary_color: '00008B'
  },
  ClericB: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: ClericBIdle,
      move: ClericBMove,
      attack: ClericBAttack
    },
    health: 20,
    movement: 6,
    attack: 3,
    defense: 4,
    range: 1,
    primary_color: 'FF0000',
    secondary_color: '8B0000'
  },
  
  // Fighters
  FighterA: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: FighterAIdle,
      move: FighterAMove,
      attack: FighterAAttack
    },
    health: 15,
    movement: 6,
    attack: 4,
    defense: 3,
    range: 1,
    primary_color: '0000FF',
    secondary_color: '00008B'
  },
  FighterB: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: FighterBIdle,
      move: FighterBMove,
      attack: FighterBAttack
    },
    health: 15,
    movement: 6,
    attack: 4,
    defense: 3,
    range: 1,
    primary_color: 'FF0000',
    secondary_color: '8B0000'
  },

  // Mages
  MageA: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: MageAIdle,
      move: MageAMove,
      attack: MageAAttack
    },
    health: 10,
    movement: 5,
    attack: 2,
    defense: 2,
    range: 5,
    primary_color: '0000FF',
    secondary_color: '00008B'
  },
  MageB: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: MageBIdle,
      move: MageBMove,
      attack: MageBAttack
    },
    health: 10,
    movement: 5,
    attack: 2,
    defense: 2,
    range: 5,
    primary_color: 'FF0000',
    secondary_color: '8B0000'
  },

  // Spearmans
  SpearmanA: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: SpearmanAIdle,
      move: SpearmanAMove,
      attack: SpearmanAAttack
    },
    health: 10,
    movement: 6,
    attack: 4,
    defense: 2,
    range: 2,
    primary_color: '0000FF',
    secondary_color: '00008B'
  },
  SpearmanB: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: SpearmanBIdle,
      move: SpearmanBMove,
      attack: SpearmanBAttack
    },
    health: 10,
    movement: 6,
    attack: 4,
    defense: 2,
    range: 2,
    primary_color: 'FF0000',
    secondary_color: '8B0000'
  },

  // Warriors
  WarriorA: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: WarriorAIdle,
      move: WarriorAMove,
      attack: WarriorAAttack
    },
    health: 25,
    movement: 4,
    attack: 4,
    defense: 5,
    range: 1,
    primary_color: '0000FF',
    secondary_color: '00008B'
  },
  WarriorB: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: WarriorBIdle,
      move: WarriorBMove,
      attack: WarriorBAttack
    },
    health: 25,
    movement: 4,
    attack: 4,
    defense: 5,
    range: 1,
    primary_color: 'FF0000',
    secondary_color: '8B0000'
  }
} as const

