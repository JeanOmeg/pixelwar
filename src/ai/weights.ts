/**
 * Every number the AI scores with, in one place. Scores are in "value points":
 * a unit is worth its army cost x VALUE_PER_POINT (an Archer 100, a Warrior 210),
 * so killing, hurting, risking and moving are all compared on the same scale.
 */

export const VALUE_PER_POINT = 10

export interface AiWeights {
  /** Extra for a kill on top of the target's value (one less enemy acting) */
  killBonus: number
  /** Share of the target's value that hurting it counts for (per fraction of its HP) */
  damageShare: number
  /** Share of its own value lost per fraction of HP the unit may lose (counterattack, next enemy turn) */
  harmShare: number
  /** Share of its own value lost per chance of dying next enemy turn */
  deathShare: number
  /**
   * How much the counterattack of the target counts (x harm and death).
   * Below 1: striking first is worth something by itself (the target is
   * weaker for the allies acting next and for its own turn), so an even trade
   * isn't a reason to walk away without attacking.
   */
  counterShare: number
  /** Enemies don't all hit the same unit: share of the threat map damage that counts */
  threatShare: number
  /** Per point of path distance past the ideal distance to the enemy */
  approach: number
  /** Distances further than this (movement points) all count the same */
  approachCap: number
  /** Value of 1 MP (it doesn't come back) */
  mp: number
  /** Standing in the line of fire of an allied ranged unit that hasn't attacked */
  blockAlly: number
  /** A hurt ally next to a healer (it can heal it next) */
  nearHurtAlly: number
  /** A tank standing next to a fragile ally */
  guardAlly: number
  /** Pinning Shot: value of taking a unit's move away, as a share of its value */
  pinShare: number
  /** Skirmishers (Thief, Assassin): extra share of the target value for a back attack */
  skirmisherBackShare: number
  /**
   * Ending the turn on a door (x aggression). Nobody can attack a unit there,
   * but it can't attack either: without this the losing side camps on a door
   * and the match stalls into a draw.
   */
  door: number
}

export const AI_WEIGHTS: AiWeights = {
  killBonus: 40,
  damageShare: 0.6,
  harmShare: 0.6,
  deathShare: 1,
  counterShare: 0.5,
  threatShare: 0.6,
  approach: 4,
  approachCap: 24,
  mp: 7,
  blockAlly: 25,
  nearHurtAlly: 12,
  guardAlly: 8,
  pinShare: 0.15,
  skirmisherBackShare: 0.2,
  door: 45
}

export type Difficulty = 'easy' | 'normal' | 'hard'

export interface DifficultySettings {
  label: string
  /** Random noise added to each plan, relative to (20 + |score| / 10) */
  noise: number
  /** How much the AI cares about the enemy's next turn (threat map) */
  threatScale: number
  /** Chance of considering each skill at all */
  skillChance: number
  /** Chance of taking the 2nd or 3rd best plan instead of the best */
  mistakeChance: number
  /** Assume enemies may Run when building the threat map */
  enemyRun: boolean
  /** Weights that differ from AI_WEIGHTS at this level */
  weights?: Partial<AiWeights>
}

export const DIFFICULTIES: Record<Difficulty, DifficultySettings> = {
  easy: { label: 'Easy', noise: 3, threatScale: 0.2, skillChance: 0.3, mistakeChance: 0.4, enemyRun: false },
  normal: { label: 'Normal', noise: 0.3, threatScale: 0.85, skillChance: 0.85, mistakeChance: 0.05, enemyRun: false },
  // Hard weights picked with yarn ai:tune (they beat the plain weights ~2.6 to 1)
  hard: { label: 'Hard', noise: 0.03, threatScale: 1, skillChance: 1, mistakeChance: 0, enemyRun: false, weights: { mp: 12, damageShare: 0.9, killBonus: 100 } }
}

export const DIFFICULTY_IDS = Object.keys(DIFFICULTIES) as Difficulty[]

export function findDifficulty(id: string | null | undefined): Difficulty | undefined {
  return DIFFICULTY_IDS.find(d => d === id)
}

export type Personality = 'balanced' | 'aggressive' | 'defensive'

/** Multipliers on top of the weights: how much the AI fears damage vs. wants to close in */
export const PERSONALITIES: Record<Personality, { threat: number, approach: number, damage: number }> = {
  balanced: { threat: 1, approach: 1, damage: 1 },
  aggressive: { threat: 0.65, approach: 1.4, damage: 1.15 },
  defensive: { threat: 1.4, approach: 0.7, damage: 0.95 }
}

/** Half the matches balanced, the rest split between aggressive and defensive */
export function randomPersonality(random: () => number = Math.random): Personality {
  const r = random()
  return r < 0.5 ? 'balanced' : r < 0.75 ? 'aggressive' : 'defensive'
}
