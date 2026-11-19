import type { Pos } from '../online/protocol'
import type { SkillId } from '../skills'

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
  /** Balloon text; `[text]` is highlighted, like in the game hint */
  text?: string
  /** Cells to point at, besides the ones of the action */
  cells?: Pos[]
  ui?: TutorialUi
  lessons?: Lesson[]
}

export type TutorialStep =
  /** Text only: the player presses Next */
  | (StepBase & { kind: 'info', text: string })
  /** The player must do exactly this (nothing else is allowed) */
  | (StepBase & { kind: 'do', text: string, action: TutorialAction, expect?: AttackExpectation })
  /** The CPU does this, animated; the text (if any) shows while it plays */
  | (StepBase & { kind: 'cpu', action: TutorialAction, expect?: AttackExpectation })

type Extra = StepBase & { expect?: AttackExpectation }

const info = (text: string, extra: StepBase = {}): TutorialStep => ({ kind: 'info', text, ...extra })
const play = (text: string, action: TutorialAction, extra: Extra = {}): TutorialStep => ({ kind: 'do', text, action, ...extra })
const cpu = (action: TutorialAction, extra: Extra = {}): TutorialStep => ({ kind: 'cpu', action, ...extra })

const move = (unit: Pos, to: Pos, skill?: 'skill-run'): TutorialAction => ({ a: 'move', unit, to, ...(skill ? { skill } : {}) })
const attack = (unit: Pos, target: Pos, rolls: [number, number][], skill?: SkillId): TutorialAction =>
  ({ a: 'attack', unit, target, rolls, ...(skill ? { skill } : {}) })
const endTurn: TutorialAction = { a: 'end-turn' }

export const TUTORIAL_STEPS: TutorialStep[] = [
  // ---- Round 1, Blue: moving ----
  info('Welcome to PixelFantasyWar! You command the [Blue] army. Defeat every [Red] unit to win.', { ui: 'teams', lessons: ['goal'] }),
  info('The armies take turns: first you act with your units, then the enemy acts with theirs. That is one round.', { ui: 'round', lessons: ['round'] }),
  info('Select a unit and its card shows up at the top: HP, attack (ATK), defense (DEF), range and movement.', { cells: [[4, 8]], ui: 'unit-card', lessons: ['unit-card'] }),
  play('Select your [Warrior], choose [Move] and pick the marked tile. The blue tiles show how far it can go.', move([4, 8], [7, 8]), { lessons: ['select', 'move'] }),
  play('Now move the [Barbarian] onto the [door].', move([4, 4], [6, 4])),
  info('Entering a door costs 2 movement, and a unit standing on a door can\'t attack. Not a good spot!', { lessons: ['door'] }),
  play('Select the Barbarian again and choose [Undo move]. A move can be undone until the unit attacks.', { a: 'undo', unit: [6, 4] }, { lessons: ['undo'] }),
  play('Walk the [Barbarian] through the door instead.', move([4, 4], [7, 4])),
  play('The [Archer] only moves 4 tiles. Open [Skills], choose [Run] to double its movement this turn, then pick the marked tile.', move([3, 4], [7, 6], 'skill-run'), { ui: 'skills', lessons: ['run'] }),
  info('Skills cost [MP]. Every unit starts with 4 MP for the whole match, and MP never comes back. One skill per unit each turn.', { lessons: ['mp'] }),
  play('The [Spearman] stays home for now. Choose [Wait] to finish with it: it turns gray.', { a: 'pass', unit: [3, 9] }, { lessons: ['wait'] }),
  play('Press [End turn]. Units you didn\'t use simply stay where they are.', endTurn, { ui: 'end-turn', lessons: ['end-turn'] }),

  // ---- Round 1, Red: the enemy charges ----
  cpu(move([23, 4], [14, 6], 'skill-run'), { text: 'Enemy turn! Watch the [Red] army charge.', lessons: ['enemy-phase'] }),
  cpu(move([24, 9], [16, 6], 'skill-run')),
  cpu(move([25, 8], [14, 8], 'skill-run')),
  cpu(move([24, 7], [18, 6], 'skill-run')),
  cpu(move([23, 8], [17, 8], 'skill-run')),
  cpu(move([24, 4], [16, 5], 'skill-run')),
  cpu(move([23, 12], [16, 12], 'skill-run')),
  cpu(move([24, 12], [17, 12], 'skill-run')),
  cpu(endTurn),

  // ---- Round 2, Blue: first shot ----
  info('Tip: [Esc] or the pause button pauses the game. Use the mouse wheel (or pinch) to zoom the map.', { ui: 'pause', lessons: ['extras'] }),
  play('Move the [Warrior] into the [forest].', move([7, 8], [10, 8])),
  info('Forest costs 2 movement and gives [+2 DEF] to whoever stands in it: a good spot to hold the line. Water can\'t be crossed, but arrows and magic fly over it.', { cells: [[10, 8], [12, 4]], lessons: ['forest', 'water'] }),
  play('The [Thief] crosses forest at full speed. Use [Run] to bring it to the marked tile.', move([2, 8], [9, 9], 'skill-run'), { ui: 'skills' }),
  play('Move the [Archer] to the marked tile.', move([7, 6], [8, 6])),
  play('Choose [Attack] and point at the red [Cleric]: the forecast shows the hit chance and the damage. Archers shoot in a straight line, up to 6 tiles. Fire!',
    attack([8, 6], [14, 6], [[5, 3]]), { ui: 'forecast', lessons: ['ranged', 'forecast'], expect: { damage: 1, hit: false } }),
  info('A miss! The dice decide every attack, but even a miss deals [1 damage].', { lessons: ['miss'] }),
  play('Move the [Barbarian] in front of the Archer to protect it.', move([7, 4], [9, 6])),
  play('Bring the [Cleric] out through the lower door.', move([4, 12], [9, 12])),
  play('And the [Mage].', move([3, 12], [7, 12])),
  play('Press [End turn].', endTurn, { ui: 'end-turn' }),

  // ---- Round 2, Red: the clash ----
  cpu(move([16, 5], [13, 6]), { text: 'Here they come!' }),
  cpu(attack([13, 6], [9, 6], [[16, 4]]), { expect: { damage: 2 } }),
  cpu(move([16, 6], [10, 6])),
  cpu(attack([10, 6], [9, 6], [[12, 4], [14, 3]]), {
    text: 'Your [Barbarian] strikes back! Melee units (range 1) counterattack when they survive.',
    lessons: ['counter'],
    expect: { damage: 4, counter: 5 }
  }),
  cpu(move([14, 8], [11, 8])),
  cpu(attack([11, 8], [10, 8], [[20, 5], [13, 5]]), {
    text: 'Ouch, a [critical hit]! Rolling a 20 deals 12 + ATK − DEF. Your Warrior survives and hits back.',
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
  info('Units face where they last moved or attacked. Hitting an enemy from [behind] always hits, deals double ATK and can\'t be countered.', { cells: [[10, 6]], lessons: ['facing'] }),
  play('The red [Fighter] is facing your Barbarian. Move the [Thief] behind it.', move([9, 9], [11, 6])),
  play('Attack it from behind!', attack([11, 6], [10, 6], [[8, 4]]), { lessons: ['back-attack'], expect: { damage: 11, back: true, kills: true } }),
  play('Move the [Barbarian] next to the red [Mage].', move([9, 6], [12, 6])),
  play('Open [Skills] and choose [Special] (4 MP): the next attack is always a critical hit. Attack the Mage!',
    attack([12, 6], [13, 6], [[7, 2]], 'skill-special-attack'), { ui: 'skills', lessons: ['special'], expect: { damage: 15, critical: true, kills: true } }),
  play('The red [Thief] is next to your Warrior. Open the Warrior\'s [Skills] and choose [Guard]: +4 DEF until your next turn.',
    { a: 'self-skill', unit: [10, 8], skill: 'skill-guard' }, { ui: 'skills', lessons: ['self-skill'] }),
  play('Move the [Cleric] next to the Warrior.', move([9, 12], [9, 8])),
  play('Open [Skills], choose [Heal] and pick the Warrior: it gets back 6 HP.', { a: 'heal', unit: [9, 8], target: [10, 8] }, { ui: 'skills', lessons: ['heal'] }),
  play('Move the [Archer] to the marked tile.', move([8, 6], [10, 5])),
  play('Every class has a skill of its own. The Archer\'s [Aimed Shot] can\'t miss and deals 3 extra damage. Use it on the red [Cleric].',
    attack([10, 5], [12, 5], [[6, 5]], 'skill-aimed-shot'), { ui: 'skills', lessons: ['class-skill'], expect: { damage: 6, hit: true } }),
  play('Move the [Mage] to the marked tile.', move([7, 12], [9, 10])),
  play('The Mage\'s [Fireball] also burns the target and every enemy next to it. Aim at the red [Barbarian]!',
    attack([9, 10], [14, 10], [[17, 6]], 'skill-fireball'), { ui: 'skills', expect: { damage: 4 } }),
  play('Press [End turn].', endTurn, { ui: 'end-turn' }),

  // ---- Round 3, Red ----
  cpu(attack([11, 8], [10, 8], [[9, 3], [15, 5]]), {
    text: 'Guard pays off: the attack misses, and your Warrior\'s counterattack finishes the Thief.',
    expect: { damage: 1, hit: false, counter: 5 }
  }),
  cpu(attack([12, 5], [12, 6], [[14, 4], [12, 5]]), { expect: { damage: 3, counter: 6 } }),
  cpu(move([15, 8], [13, 6])),
  cpu(attack([13, 6], [12, 6], [[13, 5], [16, 6]]), { expect: { damage: 5, counter: 6 } }),
  cpu(move([14, 10], [10, 10])),
  cpu(attack([10, 10], [9, 10], [[14, 6]], 'skill-rage'), {
    text: 'The red Barbarian\'s [Rage] takes down your Mage. Keep fragile units behind your front line!',
    lessons: ['unit-lost'],
    expect: { damage: 14, kills: true }
  }),
  cpu(endTurn),

  // ---- Round 4, Blue: the counterattack ----
  info('You lost the Mage, but Red has already lost three units. Finish them!', { ui: 'teams' }),
  play('Your [Barbarian] can finish the wounded red [Cleric].', attack([12, 6], [12, 5], [[11, 6]]), { expect: { damage: 7, kills: true } }),
  play('Move the [Thief] behind the red [Warrior].', move([11, 6], [14, 6])),
  play('Back attack!', attack([14, 6], [13, 6], [[9, 6]]), { expect: { damage: 11, back: true } }),
  play('Move the [Archer] next to the red Warrior.', move([10, 5], [13, 5])),
  play('Shoot it!', attack([13, 5], [13, 6], [[20, 1]]), { expect: { damage: 9, critical: true, kills: true } }),
  info('A 20 on the die: [critical hit]! Luck can be on your side too.'),
  play('The red [Barbarian] has its back to you. Move the [Cleric] behind it.', move([9, 8], [11, 10])),
  play('Attack it from behind!', attack([11, 10], [10, 10], [[5, 6]]), { expect: { damage: 8, back: true } }),
  play('The [Spearman] joins the fight. Use [Run] to reach the marked tile.', move([3, 9], [8, 10], 'skill-run'), { ui: 'skills' }),
  play('Spearmen hit [2 tiles] away, so melee units can\'t strike back. Finish the Barbarian!',
    attack([8, 10], [10, 10], [[14, 6]]), { lessons: ['reach'], expect: { damage: 6, kills: true } }),
  play('Press [End turn].', endTurn, { ui: 'end-turn' }),

  // ---- Round 4, Red ----
  cpu(attack([15, 10], [11, 10], [[16, 5]]), {
    text: 'Careful: your [Cleric] has its back to the enemy. Facing matters for you too!',
    expect: { damage: 5, back: true }
  }),
  cpu(move([17, 10], [13, 10])),
  cpu(attack([13, 10], [11, 10], [[10, 3]], 'skill-pierce'), { expect: { damage: 11, back: true } }),
  cpu(endTurn),

  // ---- Round 5, Blue: victory ----
  info('Only two enemies left!', { ui: 'teams' }),
  play('Move the [Thief] behind the red [Archer].', move([14, 6], [16, 10])),
  play('Back attack!', attack([16, 10], [15, 10], [[7, 3]]), { expect: { damage: 11, back: true, kills: true } }),
  play('Move the [Spearman] next to the red Spearman.', move([8, 10], [12, 10])),
  play('The Spearman\'s [Pierce] ignores defense. End the battle!', attack([12, 10], [13, 10], [[9, 6]], 'skill-pierce'), {
    ui: 'skills',
    expect: { damage: 10, kills: true }
  }),
  info('[Victory!] You know the basics now: move, attack from good angles, use the terrain and spend MP wisely.', { lessons: ['victory'] })
]
