import type { AttackForecast, Facing } from '../combat'

/** Plain data the UI components render. Built by GameUI from the game state. */

export type Team = 'blue' | 'red'

export interface TeamView {
  team: Team
  /** 'Blue' / 'Red' */
  label: string
  /** 'Player', 'Player 1', 'CPU'... */
  controller: string
  alive: number
  total: number
  hp: number
  maxHp: number
}

export interface HudView {
  teams: TeamView[]
  activeTeam: Team
  round: number
  phasesLeft: number
  /** Current player is a human waiting for input */
  canEndTurn: boolean
  /** Units of the current player that still have actions */
  unitsWithActions: number
  /** The pause button is shown (the match is still going) */
  canPause: boolean
  /** Game speed: 1, 2 or 3 */
  speed: number
  /** Tutorial: the speed can't change */
  speedLocked?: boolean
  /** Tutorial: End turn shows but can't be pressed yet */
  endTurnLocked?: boolean
  /** false: End turn doesn't ask "N left - sure?" (tutorial) */
  confirmEndTurn?: boolean
  /** Tutorial: part of the bar the lesson talks about */
  highlight?: HudHighlight | null
  /** Online only (missing offline) */
  online?: OnlineHudView
}

export type HudHighlight = 'teams' | 'round' | 'pause' | 'end-turn'

export interface OnlineHudView {
  /** Seconds left in the current turn (null: no timer, e.g. catching up) */
  timeLeft: number | null
  timeTotal: number
  /** This device only watches: "Watching" instead of End turn */
  watching: boolean
  spectators: number
  /** The emote button is offered (players only) */
  canEmote: boolean
  /** Emotes on screen, under each team's bar */
  emotes: Partial<Record<Team, string>>
}

export interface UnitView {
  name: string
  team: Team
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  /** Current attack/defense (skills and forest included) and the class base values */
  attack: number
  baseAttack: number
  defense: number
  baseDefense: number
  /** Range in points (1 per tile, 2 per forest tile for some classes) */
  range: number
  /** How the range works on the map, e.g. 'Forest tiles count double' */
  rangeNote: string
  movement: number
  facing: Facing
  status: UnitStatus[]
  /** Skills of the unit and whether its MP still pays for them (an enemy's threat) */
  skills: SkillChipView[]
  done: boolean
}

export interface SkillChipView {
  name: string
  cost: number
  /** MP left covers the cost */
  affordable: boolean
}

export interface ForecastView {
  attacker: UnitView
  defender: UnitView
  forecast: AttackForecast
  /** The defender's counterattack if it survives (null: it can't strike back) */
  counter: AttackForecast | null
}

export interface MenuItem {
  id: string
  label: string
  enabled: boolean
  /** Short text on the right side (e.g. skill cost) */
  detail?: string
  /** Longer description shown under the label */
  description?: string
  children?: MenuItem[]
  /** Tutorial: the item the lesson asks for */
  highlight?: boolean
}

export interface GameResultView {
  title: string
  subtitle: string
  /** Winning team, or null for a draw */
  team: Team | null
  /** Damage, kills, MVP... (not shown when missing) */
  stats?: MatchStatsView
}

export interface TeamStatsView {
  team: Team
  label: string
  damage: number
  kills: number
  lost: number
}

/** A unit singled out on the game over screen (MVP, strongest critical) */
export interface StandoutView {
  portrait: string
  name: string
  team: Team
  /** "3 kills · 24 damage", "14 damage" */
  detail: string
}

export interface MatchStatsView {
  rounds: number
  teams: TeamStatsView[]
  mvp: StandoutView | null
  bestCritical: StandoutView | null
}

export function hpLevel(hp: number, maxHp: number): '' | 'mid' | 'low' {
  const ratio = maxHp > 0 ? hp / maxHp : 0
  if (ratio <= 0.25) return 'low'
  if (ratio <= 0.5) return 'mid'
  return ''
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

/** A chip on the unit card; `hot` = a skill ready to use */
export interface UnitStatus {
  label: string
  hot?: boolean
}

/** Terrain card: name and rules of a special tile (built by terrain-info.ts) */
export type { TerrainView, TerrainRuleView } from '../terrain-info'
