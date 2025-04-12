import * as ex from 'excalibur'
import { ArcherAAttack, ArcherAAttackDown, ArcherAAttackUp, ArcherADeath, ArcherADeathDown, ArcherADeathUp, ArcherAIdle, ArcherAIdleDown, ArcherAIdleUp, ArcherAMove, ArcherAMoveDown, ArcherAMoveUp, ArcherBAttack, ArcherBAttackDown, ArcherBAttackUp, ArcherBDeath, ArcherBDeathDown, ArcherBDeathUp, ArcherBIdle, ArcherBIdleDown, ArcherBIdleUp, ArcherBMove, ArcherBMoveDown, ArcherBMoveUp, BarbarianAAttack, BarbarianAAttackDown, BarbarianAAttackUp, BarbarianADeath, BarbarianADeathDown, BarbarianADeathUp, BarbarianAIdle, BarbarianAIdleDown, BarbarianAIdleUp, BarbarianAMove, BarbarianAMoveDown, BarbarianAMoveUp, BarbarianBAttack, BarbarianBAttackDown, BarbarianBAttackUp, BarbarianBDeath, BarbarianBDeathDown, BarbarianBDeathUp, BarbarianBIdle, BarbarianBIdleDown, BarbarianBIdleUp, BarbarianBMove, BarbarianBMoveDown, BarbarianBMoveUp, ClericAAttack, ClericAAttackDown, ClericAAttackUp, ClericADeath, ClericADeathDown, ClericADeathUp, ClericAIdle, ClericAIdleDown, ClericAIdleUp, ClericAMove, ClericAMoveDown, ClericAMoveUp, ClericBAttack, ClericBAttackDown, ClericBAttackUp, ClericBDeath, ClericBDeathDown, ClericBDeathUp, ClericBIdle, ClericBIdleDown, ClericBIdleUp, ClericBMove, ClericBMoveDown, ClericBMoveUp, FighterAAttack, FighterAAttackDown, FighterAAttackUp, FighterADeath, FighterADeathDown, FighterADeathUp, FighterAIdle, FighterAIdleDown, FighterAIdleUp, FighterAMove, FighterAMoveDown, FighterAMoveUp, FighterBAttack, FighterBAttackDown, FighterBAttackUp, FighterBDeath, FighterBDeathDown, FighterBDeathUp, FighterBIdle, FighterBIdleDown, FighterBIdleUp, FighterBMove, FighterBMoveDown, FighterBMoveUp, MageAAttack, MageAAttackDown, MageAAttackUp, MageADeath, MageADeathDown, MageADeathUp, MageAIdle, MageAIdleDown, MageAIdleUp, MageAMove, MageAMoveDown, MageAMoveUp, MageBAttack, MageBAttackDown, MageBAttackUp, MageBDeath, MageBDeathDown, MageBDeathUp, MageBIdle, MageBIdleDown, MageBIdleUp, MageBMove, MageBMoveDown, MageBMoveUp, SpearmanAAttack, SpearmanAAttackDown, SpearmanAAttackUp, SpearmanADeath, SpearmanADeathDown, SpearmanADeathUp, SpearmanAIdle, SpearmanAIdleDown, SpearmanAIdleUp, SpearmanAMove, SpearmanAMoveDown, SpearmanAMoveUp, SpearmanBAttack, SpearmanBAttackDown, SpearmanBAttackUp, SpearmanBDeath, SpearmanBDeathDown, SpearmanBDeathUp, SpearmanBIdle, SpearmanBIdleDown, SpearmanBIdleUp, SpearmanBMove, SpearmanBMoveDown, SpearmanBMoveUp, ThiefAAttack, ThiefAAttackDown, ThiefAAttackUp, ThiefADeath, ThiefADeathDown, ThiefADeathUp, ThiefAIdle, ThiefAIdleDown, ThiefAIdleUp, ThiefAMove, ThiefAMoveDown, ThiefAMoveUp, ThiefBAttack, ThiefBAttackDown, ThiefBAttackUp, ThiefBDeath, ThiefBDeathDown, ThiefBDeathUp, ThiefBIdle, ThiefBIdleDown, ThiefBIdleUp, ThiefBMove, ThiefBMoveDown, ThiefBMoveUp, WarriorAAttack, WarriorAAttackDown, WarriorAAttackUp, WarriorADeath, WarriorADeathDown, WarriorADeathUp, WarriorAIdle, WarriorAIdleDown, WarriorAIdleUp, WarriorAMove, WarriorAMoveDown, WarriorAMoveUp, WarriorBAttack, WarriorBAttackDown, WarriorBAttackUp, WarriorBDeath, WarriorBDeathDown, WarriorBDeathUp, WarriorBIdle, WarriorBIdleDown, WarriorBIdleUp, WarriorBMove, WarriorBMoveDown, WarriorBMoveUp } from './resources'
export const SCALE = ex.vec(1.5, 1.5)
export const ENEMY_SPEED = 200

export type UnitType = 'ArcherA' | 'ArcherB' | 'BarbarianA' | 'BarbarianB' | 'ClericA' | 'ClericB' | 'FighterA' | 'FighterB' | 'MageA' | 'MageB' | 'SpearmanA' | 'SpearmanB' | 'WarriorA' | 'WarriorB' | 'ThiefA' | 'ThiefB'
export type ClassType = 'AA' | 'AB' | 'BA' | 'BB' | 'CA' | 'CB' | 'FA' | 'FB' | 'MA' | 'MB' | 'SA' | 'SB' | 'WA' | 'WB' | 'TA' | 'TB'

export interface UnitConfig {
  description?: string
  graphics: {
    offset: ex.Vector
    idle: ex.Animation
    idleUp: ex.Animation
    idleDown: ex.Animation
    move: ex.Animation
    moveUp: ex.Animation
    moveDown: ex.Animation
    attack: ex.Animation
    attackUp: ex.Animation
    attackDown: ex.Animation
    death: ex.Animation
    deathUp: ex.Animation
    deathDown: ex.Animation
  }
  primary_color: string
  secondary_color: string
  health: number
  attack: number
  defense: number
  movement: number
  range: number
  skill?: {
    longShot?: {
      use: boolean
      maxCount: number
      count: number
      description: string
    }
    berserker?: {
      use: boolean
      count: number
      maxCount: number
      attack: number
      damage: number
      description: string
    }
    heal?: {
      use: boolean
      count: number
      maxCount: number
      description: string
    }
    specialAttack?: {
      use: boolean
      count: number
      maxCount: number
      attack: number
      damage: number
      description: string
    }
    fireBall?: {
      use: boolean
      count: number
      maxCount: number
      attack: number
      damage: number
      description: string
    }
    multipleAttack?: {
      use: boolean
      count: number
      maxCount: number
      attack: number
      damage: number
      description: string
    }
    criticalAttack?: {
      use: boolean
      count: number
      maxCount: number
      attack: number
      damage: number
      description: string
    }
    run?: {
      use: boolean
      count: number
      maxCount: number
      description: string
    }
  }
}

export const UNIT_CONFIG: Record<UnitType, UnitConfig> = {
  // Archers
  ArcherA: {
    description: 'Lorem ipsum lorem havox crux ipsum',
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: ArcherAIdle,
      move: ArcherAMove,
      attack: ArcherAAttack,
      idleUp: ArcherAIdleUp,
      idleDown: ArcherAIdleDown,
      moveUp: ArcherAMoveUp,
      moveDown: ArcherAMoveDown,
      attackUp: ArcherAAttackUp,
      attackDown: ArcherAAttackDown,
      death: ArcherADeath,
      deathUp: ArcherADeathUp,
      deathDown: ArcherADeathDown
    },
    primary_color: '0000FF',
    secondary_color: '00008B',
    health: 10,
    movement: 4,
    attack: 2,
    defense: 2,
    range: 6,
    skill: {
      longShot: {
        use: false,
        maxCount: 2,
        count: 2,
        description: 'string'
      }
    }
  },

  ArcherB: {
    description: 'Lorem ipsum lorem havox crux ipsum',
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: ArcherBIdle,
      move: ArcherBMove,
      attack: ArcherBAttack,
      idleUp: ArcherBIdleUp,
      idleDown: ArcherBIdleDown,
      moveUp: ArcherBMoveUp,
      moveDown: ArcherBMoveDown,
      attackUp: ArcherBAttackUp,
      attackDown: ArcherBAttackDown,
      death: ArcherBDeath,
      deathUp: ArcherBDeathUp,
      deathDown: ArcherBDeathDown
    },
    health: 10,
    movement: 4,
    attack: 2,
    defense: 2,
    range: 6,
    primary_color: 'FF0000',
    secondary_color: '8B0000',
    skill: {
      longShot: {
        use: false,
        maxCount: 2,
        count: 2,
        description: 'string'
      },
    }
  },

  // Barbarians
  BarbarianA: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: BarbarianAIdle,
      move: BarbarianAMove,
      attack: BarbarianAAttack,
      idleUp: BarbarianAIdleUp,
      idleDown: BarbarianAIdleDown,
      moveUp: BarbarianAMoveUp,
      moveDown: BarbarianAMoveDown,
      attackUp: BarbarianAAttackUp,
      attackDown: BarbarianAAttackDown,
      death: BarbarianADeath,
      deathUp: BarbarianADeathUp,
      deathDown: BarbarianADeathDown
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
      attack: BarbarianBAttack,
      idleUp: BarbarianBIdleUp,
      idleDown: BarbarianBIdleDown,
      moveUp: BarbarianBMoveUp,
      moveDown: BarbarianBMoveDown,
      attackUp: BarbarianBAttackUp,
      attackDown: BarbarianBAttackDown,
      death: BarbarianBDeath,
      deathUp: BarbarianBDeathUp,
      deathDown: BarbarianBDeathDown
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
      attack: ClericAAttack,
      idleUp: ClericAIdleUp,
      idleDown: ClericAIdleDown,
      moveUp: ClericAMoveUp,
      moveDown: ClericAMoveDown,
      attackUp: ClericAAttackUp,
      attackDown: ClericAAttackDown,
      death: ClericADeath,
      deathUp: ClericADeathUp,
      deathDown: ClericADeathDown
    },
    health: 20,
    movement: 6,
    attack: 3,
    defense: 4,
    range: 1,
    primary_color: '0000FF',
    secondary_color: '00008B',
  },
  ClericB: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: ClericBIdle,
      move: ClericBMove,
      attack: ClericBAttack,
      idleUp: ClericBIdleUp,
      idleDown: ClericBIdleDown,
      moveUp: ClericBMoveUp,
      moveDown: ClericBMoveDown,
      attackUp: ClericBAttackUp,
      attackDown: ClericBAttackDown,
      death: ClericBDeath,
      deathUp: ClericBDeathUp,
      deathDown: ClericBDeathDown
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
      attack: FighterAAttack,
      idleUp: FighterAIdleUp,
      idleDown: FighterAIdleDown,
      moveUp: FighterAMoveUp,
      moveDown: FighterAMoveDown,
      attackUp: FighterAAttackUp,
      attackDown: FighterAAttackDown,
      death: FighterADeath,
      deathUp: FighterADeathUp,
      deathDown: FighterADeathDown
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
      attack: FighterBAttack,
      idleUp: FighterBIdleUp,
      idleDown: FighterBIdleDown,
      moveUp: FighterBMoveUp,
      moveDown: FighterBMoveDown,
      attackUp: FighterBAttackUp,
      attackDown: FighterBAttackDown,
      death: FighterBDeath,
      deathUp: FighterBDeathUp,
      deathDown: FighterBDeathDown
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
      attack: MageAAttack,
      idleUp: MageAIdleUp,
      idleDown: MageAIdleDown,
      moveUp: MageAMoveUp,
      moveDown: MageAMoveDown,
      attackUp: MageAAttackUp,
      attackDown: MageAAttackDown,
      death: MageADeath,
      deathUp: MageADeathUp,
      deathDown: MageADeathDown
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
      attack: MageBAttack,
      idleUp: MageBIdleUp,
      idleDown: MageBIdleDown,
      moveUp: MageBMoveUp,
      moveDown: MageBMoveDown,
      attackUp: MageBAttackUp,
      attackDown: MageBAttackDown,
      death: MageBDeath,
      deathUp: MageBDeathUp,
      deathDown: MageBDeathDown
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
      attack: SpearmanAAttack,
      idleUp: SpearmanAIdleUp,
      idleDown: SpearmanAIdleDown,
      moveUp: SpearmanAMoveUp,
      moveDown: SpearmanAMoveDown,
      attackUp: SpearmanAAttackUp,
      attackDown: SpearmanAAttackDown,
      death: SpearmanADeath,
      deathUp: SpearmanADeathUp,
      deathDown: SpearmanADeathDown
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
      attack: SpearmanBAttack,
      idleUp: SpearmanBIdleUp,
      idleDown: SpearmanBIdleDown,
      moveUp: SpearmanBMoveUp,
      moveDown: SpearmanBMoveDown,
      attackUp: SpearmanBAttackUp,
      attackDown: SpearmanBAttackDown,
      death: SpearmanBDeath,
      deathUp: SpearmanBDeathUp,
      deathDown: SpearmanBDeathDown
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
      attack: WarriorAAttack,
      idleUp: WarriorAIdleUp,
      idleDown: WarriorAIdleDown,
      moveUp: WarriorAMoveUp,
      moveDown: WarriorAMoveDown,
      attackUp: WarriorAAttackUp,
      attackDown: WarriorAAttackDown,
      death: WarriorADeath,
      deathUp: WarriorADeathUp,
      deathDown: WarriorADeathDown
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
      attack: WarriorBAttack,
      idleUp: WarriorBIdleUp,
      idleDown: WarriorBIdleDown,
      moveUp: WarriorBMoveUp,
      moveDown: WarriorBMoveDown,
      attackUp: WarriorBAttackUp,
      attackDown: WarriorBAttackDown,
      death: WarriorBDeath,
      deathUp: WarriorBDeathUp,
      deathDown: WarriorBDeathDown
    },
    health: 25,
    movement: 4,
    attack: 4,
    defense: 5,
    range: 1,
    primary_color: 'FF0000',
    secondary_color: '8B0000'
  },

  // Thiefs
  ThiefA: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: ThiefAIdle,
      move: ThiefAMove,
      attack: ThiefAAttack,
      idleUp: ThiefAIdleUp,
      idleDown: ThiefAIdleDown,
      moveUp: ThiefAMoveUp,
      moveDown: ThiefAMoveDown,
      attackUp: ThiefAAttackUp,
      attackDown: ThiefAAttackDown,
      death: ThiefADeath,
      deathUp: ThiefADeathUp,
      deathDown: ThiefADeathDown
    },
    health: 10,
    movement: 6,
    attack: 5,
    defense: 2,
    range: 1,
    primary_color: '0000FF',
    secondary_color: '00008B'
  },
  ThiefB: {
    graphics: {
      offset: ex.vec(14, 14 * SCALE.y),
      idle: ThiefBIdle,
      move: ThiefBMove,
      attack: ThiefBAttack,
      idleUp: ThiefBIdleUp,
      idleDown: ThiefBIdleDown,
      moveUp: ThiefBMoveUp,
      moveDown: ThiefBMoveDown,
      attackUp: ThiefBAttackUp,
      attackDown: ThiefBAttackDown,
      death: ThiefBDeath,
      deathUp: ThiefBDeathUp,
      deathDown: ThiefBDeathDown
    },
    health: 10,
    movement: 6,
    attack: 5,
    defense: 2,
    range: 1,
    primary_color: 'FF0000',
    secondary_color: '8B0000'
  }
} as const

