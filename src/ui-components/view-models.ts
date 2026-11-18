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
}

export interface UnitView {
  name: string
  team: Team
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  attack: number
  defense: number
  range: number
  movement: number
  facing: Facing
  status: string[]
  done: boolean
}

export interface ForecastView {
  attacker: UnitView
  defender: UnitView
  forecast: AttackForecast
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
}

export interface GameResultView {
  title: string
  subtitle: string
  /** Winning team, or null for a draw */
  team: Team | null
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
