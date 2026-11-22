import type { AttackEventResult } from './board'
import type { AttackEvent, Unit } from './unit'
import type { Team } from './ui-components/view-models'

/**
 * Combat history of the match ("Archer → Cleric: 4 dmg (68%)"), fed by every
 * step of every attack (Board.onAttackEvent, so it works the same in local,
 * online, tutorial and catch-up). Changes nothing in the game; the panel is
 * the <combat-log> component.
 */

export interface LogUnit {
  /** class name in the current language */
  name: string
  team: Team
}

export type LogEntry =
  /** an attack or a counterattack */
  | { kind: 'strike', round: number, attacker: LogUnit, defender: LogUnit, counter: boolean, hit: boolean, critical: boolean, back: boolean, damage: number, killed: boolean, hitChance: number | null }
  /** Fireball's burn */
  | { kind: 'burn', round: number, attacker: LogUnit, defender: LogUnit, damage: number, killed: boolean }
  /** Drain heals the attacker */
  | { kind: 'heal', round: number, unit: LogUnit, amount: number }
  /** Steal takes MP */
  | { kind: 'steal', round: number, attacker: LogUnit, defender: LogUnit, amount: number }
  /** Pinning Shot */
  | { kind: 'pin', round: number, unit: LogUnit }

/** Entries kept (the oldest go away) */
export const LOG_LIMIT = 60

export class CombatLog {
  private list: LogEntry[] = []
  /** Grows with each entry, so the UI only redraws when something changed */
  version = 0

  /** `describe`: name and team of a unit; `round`: the round being played */
  constructor(private describe: (unit: Unit) => LogUnit, private round: () => number) {}

  get entries(): readonly LogEntry[] {
    return this.list
  }

  record(event: AttackEvent, result: AttackEventResult) {
    const entry = this.entryOf(event, result)
    if (!entry) return
    this.list.push(entry)
    if (this.list.length > LOG_LIMIT) this.list.splice(0, this.list.length - LOG_LIMIT)
    this.version++
  }

  private entryOf(event: AttackEvent, result: AttackEventResult): LogEntry | null {
    const round = this.round()
    switch (event.kind) {
    case 'strike': {
      const { outcome } = event
      return {
        kind: 'strike',
        round,
        attacker: this.describe(event.attacker),
        defender: this.describe(event.defender),
        counter: event.counter,
        hit: outcome.hit,
        critical: outcome.critical,
        back: outcome.backAttack,
        damage: outcome.damage,
        killed: result.killed,
        hitChance: event.hitChance ?? null
      }
    }
    case 'splash':
      return { kind: 'burn', round, attacker: this.describe(event.by), defender: this.describe(event.unit), damage: event.damage, killed: result.killed }
    case 'heal':
      return event.amount > 0 ? { kind: 'heal', round, unit: this.describe(event.unit), amount: event.amount } : null
    case 'steal':
      return event.amount > 0 ? { kind: 'steal', round, attacker: this.describe(event.to), defender: this.describe(event.from), amount: event.amount } : null
    case 'pin':
      return { kind: 'pin', round, unit: this.describe(event.unit) }
    }
  }
}
