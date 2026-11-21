import type { AttackEventResult } from './board'
import type { Player } from './player'
import type { AttackEvent, Unit } from './unit'

export interface UnitRecord {
  unit: Unit
  /** HP really taken from enemies (overkill not counted) */
  damage: number
  kills: number
}

export interface TeamRecord {
  damage: number
  kills: number
  lost: number
}

export interface CriticalRecord {
  unit: Unit
  damage: number
}

/**
 * Numbers for the game over screen, collected from every step of every attack
 * (Board.onAttackEvent): damage dealt, kills, units lost, the MVP and the
 * strongest critical hit. Changes nothing in the game.
 */
export class MatchStats {
  private units = new Map<Unit, UnitRecord>()
  private teams = new Map<Player, TeamRecord>()
  bestCritical: CriticalRecord | null = null

  record(event: AttackEvent, result: AttackEventResult) {
    const attacker = event.kind === 'strike' ? event.attacker : event.kind === 'splash' ? event.by : null
    const defender = event.kind === 'strike' ? event.defender : event.kind === 'splash' ? event.unit : null
    if (!attacker || !defender) return

    const unit = this.unitRecord(attacker)
    unit.damage += result.dealt
    const team = this.teamRecord(attacker.player)
    team.damage += result.dealt
    if (result.killed) {
      unit.kills++
      team.kills++
    }
    if (event.kind === 'strike' && event.outcome.critical && event.outcome.damage > (this.bestCritical?.damage ?? 0)) {
      this.bestCritical = { unit: attacker, damage: event.outcome.damage }
    }
  }

  /** A unit dropped to 0 HP (whatever killed it) */
  unitLost(unit: Unit) {
    this.teamRecord(unit.player).lost++
  }

  team(player: Player): TeamRecord {
    return this.teams.get(player) ?? { damage: 0, kills: 0, lost: 0 }
  }

  /** Most kills, then most damage; null if nobody dealt damage */
  mvp(): UnitRecord | null {
    let best: UnitRecord | null = null
    for (const record of this.units.values()) {
      if (record.damage <= 0) continue
      if (!best || record.kills > best.kills || (record.kills === best.kills && record.damage > best.damage)) best = record
    }
    return best
  }

  private unitRecord(unit: Unit): UnitRecord {
    let record = this.units.get(unit)
    if (!record) {
      record = { unit, damage: 0, kills: 0 }
      this.units.set(unit, record)
    }
    return record
  }

  private teamRecord(player: Player): TeamRecord {
    let record = this.teams.get(player)
    if (!record) {
      record = { damage: 0, kills: 0, lost: 0 }
      this.teams.set(player, record)
    }
    return record
  }
}
