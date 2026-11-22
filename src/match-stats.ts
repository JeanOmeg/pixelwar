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

/** Feats of one team, for the achievements (achievements.ts) */
export interface FeatRecord {
  /** Real critical hits (not the ones forced by Special) */
  criticals: number
  /** Most back attacks (not counterattacks) in a single phase of this team */
  backAttacksInPhase: number
  /** Enemies killed by a counterattack */
  counterKills: number
  /** Enemies killed at full HP by a single strike */
  oneShots: number
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
  private feats = new Map<Player, FeatRecord>()
  /** Back attacks of each team in the current phase */
  private phaseBackAttacks = new Map<Player, number>()

  /** A new phase starts (TurnManager): back attacks count per phase */
  phaseStarted() {
    this.phaseBackAttacks.clear()
  }

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
    if (event.kind === 'strike') this.recordFeats(event, result)
  }

  private recordFeats(event: Extract<AttackEvent, { kind: 'strike' }>, result: AttackEventResult) {
    const feats = this.featRecord(event.attacker.player)
    if (event.outcome.critical && !event.forced) feats.criticals++
    if (event.counter && result.killed) feats.counterKills++
    if (!event.counter && result.killed && result.dealt >= event.defender.unitConfig.health) feats.oneShots++
    if (!event.counter && event.outcome.backAttack) {
      const count = (this.phaseBackAttacks.get(event.attacker.player) ?? 0) + 1
      this.phaseBackAttacks.set(event.attacker.player, count)
      feats.backAttacksInPhase = Math.max(feats.backAttacksInPhase, count)
    }
  }

  feat(player: Player): FeatRecord {
    return this.feats.get(player) ?? { criticals: 0, backAttacksInPhase: 0, counterKills: 0, oneShots: 0 }
  }

  private featRecord(player: Player): FeatRecord {
    let record = this.feats.get(player)
    if (!record) {
      record = { criticals: 0, backAttacksInPhase: 0, counterKills: 0, oneShots: 0 }
      this.feats.set(player, record)
    }
    return record
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
