import type { Pos } from '../online/protocol'
import type { SkillId } from '../skills'
import type { TutorialTextKey } from '../i18n/en'

/**
 * The "Learn to play" match, step by step. Pure data.
 *
 * Twin Keeps (map_1), the classic army on both sides, Blue = the player. Every
 * action of both sides and every die is fixed here, so the match always plays
 * out the same way: 5 rounds, Blue loses the Mage and wins.
 * tests/tutorial.test.ts plays it on the real board and checks that each action
 * is legal, each attack does what `expect` says (so the texts stay true), every
 * lesson shows up and Blue wins at the last step. Changed stats, rules or
 * map_1? That test tells you which step broke.
 *
 * Units are named by the cell they stand on at that moment ([x, y]).
 */

export type TutorialAction =
  /** Destination only: the path is the game's own (resolve.ts), so the final facing is too */
  | { a: 'move', unit: Pos, to: Pos, skill?: 'skill-run' }
  /** `rolls`: [d20, d6] of the strike and, when there is one, of the counterattack */
  | { a: 'attack', unit: Pos, target: Pos, rolls: [number, number][], skill?: SkillId }
  | { a: 'self-skill', unit: Pos, skill: SkillId }
  | { a: 'heal', unit: Pos, target: Pos }
  | { a: 'undo', unit: Pos }
  | { a: 'pass', unit: Pos }
  | { a: 'end-turn' }

/** What an attack must do (checked by the test) */
export interface AttackExpectation {
  /** Damage of the strike */
  damage: number
  /** false = a miss (it still deals 1) */
  hit?: boolean
  critical?: boolean
  back?: boolean
  /** The target dies */
  kills?: boolean
  /** Damage of the counterattack; missing = no counterattack */
  counter?: number
}

/** Parts of the in-game UI a step can point at */
export type TutorialUi = 'unit-card' | 'forecast' | 'skills' | 'end-turn' | 'teams' | 'round' | 'pause'

export const LESSONS = [
  'goal', 'round', 'unit-card', 'select', 'move', 'door', 'undo', 'run', 'mp', 'forest', 'water', 'wait', 'end-turn',
  'enemy-phase', 'extras', 'ranged', 'forecast', 'miss', 'counter', 'critical', 'facing', 'back-attack',
  'special', 'class-skill', 'self-skill', 'heal', 'unit-lost', 'reach', 'victory'
] as const

/** What the match teaches; tests/tutorial.test.ts checks each one shows up */
export type Lesson = typeof LESSONS[number]

interface StepBase {
  /** Balloon text (key of the i18n `tutorial` texts); `[text]` is highlighted, like in the game hint */
  text?: TutorialTextKey
  /** Cells to point at, besides the ones of the action */
  cells?: Pos[]
  ui?: TutorialUi
  lessons?: Lesson[]
}

export type TutorialStep =
  /** Text only: the player presses Next */
  | (StepBase & { kind: 'info', text: TutorialTextKey })
  /** The player must do exactly this (nothing else is allowed) */
  | (StepBase & { kind: 'do', text: TutorialTextKey, action: TutorialAction, expect?: AttackExpectation })
  /** The CPU does this, animated; the text (if any) shows while it plays */
  | (StepBase & { kind: 'cpu', action: TutorialAction, expect?: AttackExpectation })

type Extra = StepBase & { expect?: AttackExpectation }

const info = (text: TutorialTextKey, extra: StepBase = {}): TutorialStep => ({ kind: 'info', text, ...extra })
const play = (text: TutorialTextKey, action: TutorialAction, extra: Extra = {}): TutorialStep => ({ kind: 'do', text, action, ...extra })
const cpu = (action: TutorialAction, extra: Extra = {}): TutorialStep => ({ kind: 'cpu', action, ...extra })

const move = (unit: Pos, to: Pos, skill?: 'skill-run'): TutorialAction => ({ a: 'move', unit, to, ...(skill ? { skill } : {}) })
const attack = (unit: Pos, target: Pos, rolls: [number, number][], skill?: SkillId): TutorialAction =>
  ({ a: 'attack', unit, target, rolls, ...(skill ? { skill } : {}) })
const endTurn: TutorialAction = { a: 'end-turn' }

export const TUTORIAL_STEPS: TutorialStep[] = [
  // ---- Round 1, Blue: moving ----
  info('welcome', { ui: 'teams', lessons: ['goal'] }),
  info('rounds', { ui: 'round', lessons: ['round'] }),
  info('card', { cells: [[4, 8]], ui: 'unit-card', lessons: ['unit-card'] }),
  play('moveWarrior', move([4, 8], [7, 8]), { lessons: ['select', 'move'] }),
  play('barbarianDoor', move([4, 4], [6, 4])),
  info('doorBad', { lessons: ['door'] }),
  play('undo', { a: 'undo', unit: [6, 4] }, { lessons: ['undo'] }),
  play('throughDoor', move([4, 4], [7, 4])),
  play('run', move([3, 4], [7, 6], 'skill-run'), { ui: 'skills', lessons: ['run'] }),
  info('mp', { lessons: ['mp'] }),
  play('wait', { a: 'pass', unit: [3, 9] }, { lessons: ['wait'] }),
  play('endTurnFirst', endTurn, { ui: 'end-turn', lessons: ['end-turn'] }),

  // ---- Round 1, Red: the enemy charges ----
  cpu(move([23, 4], [14, 6], 'skill-run'), { text: 'enemyTurn', lessons: ['enemy-phase'] }),
  cpu(move([24, 9], [16, 6], 'skill-run')),
  cpu(move([25, 8], [14, 8], 'skill-run')),
  cpu(move([24, 7], [18, 6], 'skill-run')),
  cpu(move([23, 8], [17, 8], 'skill-run')),
  cpu(move([24, 4], [16, 5], 'skill-run')),
  cpu(move([23, 12], [16, 12], 'skill-run')),
  cpu(move([24, 12], [17, 12], 'skill-run')),
  cpu(endTurn),

  // ---- Round 2, Blue: first shot ----
  info('pauseTip', { ui: 'pause', lessons: ['extras'] }),
  play('warriorForest', move([7, 8], [10, 8])),
  info('forest', { cells: [[10, 8], [12, 4]], lessons: ['forest', 'water'] }),
  play('thiefRun', move([2, 8], [9, 9], 'skill-run'), { ui: 'skills' }),
  play('archerMarked', move([7, 6], [8, 6])),
  play('fire',
    attack([8, 6], [14, 6], [[5, 3]]), { ui: 'forecast', lessons: ['ranged', 'forecast'], expect: { damage: 1, hit: false } }),
  info('miss', { lessons: ['miss'] }),
  play('protect', move([7, 4], [9, 6])),
  play('cleric', move([4, 12], [9, 12])),
  play('mage', move([3, 12], [7, 12])),
  play('endTurn', endTurn, { ui: 'end-turn' }),

  // ---- Round 2, Red: the clash ----
  cpu(move([16, 5], [13, 6]), { text: 'hereTheyCome' }),
  cpu(attack([13, 6], [9, 6], [[16, 4]]), { expect: { damage: 2 } }),
  cpu(move([16, 6], [10, 6])),
  cpu(attack([10, 6], [9, 6], [[12, 4], [14, 3]]), {
    text: 'counter',
    lessons: ['counter'],
    expect: { damage: 4, counter: 5 }
  }),
  cpu(move([14, 8], [11, 8])),
  cpu(attack([11, 8], [10, 8], [[20, 5], [13, 5]]), {
    text: 'critical',
    lessons: ['critical'],
    expect: { damage: 10, critical: true, counter: 5 }
  }),
  cpu(move([14, 6], [12, 5])),
  cpu(move([16, 12], [14, 10])),
  cpu(move([17, 12], [15, 10])),
  cpu(move([18, 6], [17, 10])),
  cpu(move([17, 8], [15, 8])),
  cpu(endTurn),

  // ---- Round 3, Blue: skills ----
  info('facing', { cells: [[10, 6]], lessons: ['facing'] }),
  play('thiefBehind', move([9, 9], [11, 6])),
  play('attackBehind', attack([11, 6], [10, 6], [[8, 4]]), { lessons: ['back-attack'], expect: { damage: 11, back: true, kills: true } }),
  play('barbarianMage', move([9, 6], [12, 6])),
  play('special',
    attack([12, 6], [13, 6], [[7, 2]], 'skill-special-attack'), { ui: 'skills', lessons: ['special'], expect: { damage: 15, critical: true, kills: true } }),
  play('guard',
    { a: 'self-skill', unit: [10, 8], skill: 'skill-guard' }, { ui: 'skills', lessons: ['self-skill'] }),
  play('clericWarrior', move([9, 12], [9, 8])),
  play('heal', { a: 'heal', unit: [9, 8], target: [10, 8] }, { ui: 'skills', lessons: ['heal'] }),
  play('archerMarked', move([8, 6], [10, 5])),
  play('aimedShot',
    attack([10, 5], [12, 5], [[6, 5]], 'skill-aimed-shot'), { ui: 'skills', lessons: ['class-skill'], expect: { damage: 6, hit: true } }),
  play('mageMarked', move([7, 12], [9, 10])),
  play('fireball',
    attack([9, 10], [14, 10], [[17, 6]], 'skill-fireball'), { ui: 'skills', expect: { damage: 4 } }),
  play('endTurn', endTurn, { ui: 'end-turn' }),

  // ---- Round 3, Red ----
  cpu(attack([11, 8], [10, 8], [[9, 3], [15, 5]]), {
    text: 'guardPays',
    expect: { damage: 1, hit: false, counter: 5 }
  }),
  cpu(attack([12, 5], [12, 6], [[14, 4], [12, 5]]), { expect: { damage: 3, counter: 6 } }),
  cpu(move([15, 8], [13, 6])),
  cpu(attack([13, 6], [12, 6], [[13, 5], [16, 6]]), { expect: { damage: 5, counter: 6 } }),
  cpu(move([14, 10], [10, 10])),
  cpu(attack([10, 10], [9, 10], [[14, 6]], 'skill-rage'), {
    text: 'rage',
    lessons: ['unit-lost'],
    expect: { damage: 14, kills: true }
  }),
  cpu(endTurn),

  // ---- Round 4, Blue: the counterattack ----
  info('lostMage', { ui: 'teams' }),
  play('finishCleric', attack([12, 6], [12, 5], [[11, 6]]), { expect: { damage: 7, kills: true } }),
  play('thiefWarrior', move([11, 6], [14, 6])),
  play('backAttack', attack([14, 6], [13, 6], [[9, 6]]), { expect: { damage: 11, back: true } }),
  play('archerWarrior', move([10, 5], [13, 5])),
  play('shoot', attack([13, 5], [13, 6], [[20, 1]]), { expect: { damage: 9, critical: true, kills: true } }),
  info('luck'),
  play('clericBehind', move([9, 8], [11, 10])),
  play('attackBehind', attack([11, 10], [10, 10], [[5, 6]]), { expect: { damage: 8, back: true } }),
  play('spearmanRun', move([3, 9], [8, 10], 'skill-run'), { ui: 'skills' }),
  play('reach',
    attack([8, 10], [10, 10], [[14, 6]]), { lessons: ['reach'], expect: { damage: 6, kills: true } }),
  play('endTurn', endTurn, { ui: 'end-turn' }),

  // ---- Round 4, Red ----
  cpu(attack([15, 10], [11, 10], [[16, 5]]), {
    text: 'careful',
    expect: { damage: 5, back: true }
  }),
  cpu(move([17, 10], [13, 10])),
  cpu(attack([13, 10], [11, 10], [[10, 3]], 'skill-pierce'), { expect: { damage: 11, back: true } }),
  cpu(endTurn),

  // ---- Round 5, Blue: victory ----
  info('twoLeft', { ui: 'teams' }),
  play('thiefArcher', move([14, 6], [16, 10])),
  play('backAttack', attack([16, 10], [15, 10], [[7, 3]]), { expect: { damage: 11, back: true, kills: true } }),
  play('spearmanNext', move([8, 10], [12, 10])),
  play('pierce', attack([12, 10], [13, 10], [[9, 6]], 'skill-pierce'), {
    ui: 'skills',
    expect: { damage: 10, kills: true }
  }),
  info('victory', { lessons: ['victory'] })
]
