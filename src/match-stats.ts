import type { AttackEventResult } from './board'
import type { Player } from './player'
import type { AttackEvent, Unit } from './unit'

export interface UnitRecord {
  unit: Unit
  /** HP really taken from enemies (overkill not counted) */
  damage: number
  kills: number
  /** HP this unit lost to enemies */
  taken: number
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
  /** Most enemies killed in a single phase of this team (counterattacks don't count) */
  killsInPhase: number
  /** Most kills of a single unit */
  bestUnitKills: number
  /** Highest damage rolled by one strike */
  biggestStrike: number
  /** Hits that had LONG_SHOT_CHANCE or less to hit */
  longShots: number
  /** Kills with a missed strike (a miss still deals 1) */
  missKills: number
  /** Kills from FAR_SHOT_TILES or more */
  farKills: number
  /** Counterattack kills from 2 tiles (Brace) */
  reachCounterKills: number
  /** Kills by Fireball's burn */
  burnKills: number
  /** Kills by Backstab */
  backstabKills: number
  /** MP taken with Steal */
  mpStolen: number
  /** HP restored with Heal */
  healed: number
  /** HP drained with Drain */
  drained: number
  /** Enemies pinned by Pinning Shot */
  pins: number
  /** Most HP lost by one unit that is still alive */
  toughest: number
  /** Most units this team was behind (own losses − enemy losses) */
  maxDeficit: number
  /** Kills of enemies standing on ice */
  iceKills: number
}

/** A strike that hits with at most this chance (Against the odds) */
export const LONG_SHOT_CHANCE = 0.25
/** Distance of a long range kill (Deadeye) */
export const FAR_SHOT_TILES = 5

export const emptyFeats = (): FeatRecord => ({
  criticals: 0, backAttacksInPhase: 0, counterKills: 0, oneShots: 0, killsInPhase: 0, bestUnitKills: 0, biggestStrike: 0,
  longShots: 0, missKills: 0, farKills: 0, reachCounterKills: 0, burnKills: 0, backstabKills: 0, mpStolen: 0, healed: 0,
  drained: 0, pins: 0, toughest: 0, maxDeficit: 0, iceKills: 0
})

const distance = (a: Unit, b: Unit) => a.cell && b.cell ? Math.abs(a.cell.pathNode.x - b.cell.pathNode.x) + Math.abs(a.cell.pathNode.y - b.cell.pathNode.y) : 0

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
  /** Back attacks and kills of each team in the current phase */
  private phaseBackAttacks = new Map<Player, number>()
  private phaseKills = new Map<Player, number>()

  /** A new phase starts (TurnManager): back attacks count per phase */
  phaseStarted() {
    this.phaseBackAttacks.clear()
    this.phaseKills.clear()
  }

  /** The Heal skill restored HP (Board.onHeal) */
  healed(healer: Unit, amount: number) {
    this.featRecord(healer.player).healed += amount
  }

  record(event: AttackEvent, result: AttackEventResult) {
    if (event.kind === 'steal') this.featRecord(event.to.player).mpStolen += event.amount
    if (event.kind === 'heal') this.featRecord(event.unit.player).drained += event.amount
    if (event.kind === 'pin') this.featRecord(event.by.player).pins++
    const attacker = event.kind === 'strike' ? event.attacker : event.kind === 'splash' ? event.by : null
    const defender = event.kind === 'strike' ? event.defender : event.kind === 'splash' ? event.unit : null
    if (!attacker || !defender) return

    const unit = this.unitRecord(attacker)
    unit.damage += result.dealt
    this.unitRecord(defender).taken += result.dealt
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
    if (result.killed) this.recordKill(event, attacker, defender)
  }

  private recordKill(event: AttackEvent, attacker: Unit, defender: Unit) {
    const feats = this.featRecord(attacker.player)
    if (event.kind === 'splash') feats.burnKills++
    if (defender.cell?.pathNode.isIce) feats.iceKills++
    if (event.kind === 'strike' && event.counter) return
    const kills = (this.phaseKills.get(attacker.player) ?? 0) + 1
    this.phaseKills.set(attacker.player, kills)
    feats.killsInPhase = Math.max(feats.killsInPhase, kills)
  }

  private recordFeats(event: Extract<AttackEvent, { kind: 'strike' }>, result: AttackEventResult) {
    const feats = this.featRecord(event.attacker.player)
    if (event.outcome.critical && !event.forced) feats.criticals++
    if (event.counter && result.killed) feats.counterKills++
    if (event.counter && result.killed && distance(event.attacker, event.defender) >= 2) feats.reachCounterKills++
    if (!event.counter && result.killed && distance(event.attacker, event.defender) >= FAR_SHOT_TILES) feats.farKills++
    if (!event.counter && result.killed && event.skill === 'skill-backstab') feats.backstabKills++
    if (result.killed && !event.outcome.hit) feats.missKills++
    if (event.outcome.hit && event.hitChance !== undefined && event.hitChance <= LONG_SHOT_CHANCE) feats.longShots++
    feats.biggestStrike = Math.max(feats.biggestStrike, event.outcome.damage)
    if (!event.counter && result.killed && result.dealt >= event.defender.unitConfig.health) feats.oneShots++
    if (!event.counter && event.outcome.backAttack) {
      const count = (this.phaseBackAttacks.get(event.attacker.player) ?? 0) + 1
      this.phaseBackAttacks.set(event.attacker.player, count)
      feats.backAttacksInPhase = Math.max(feats.backAttacksInPhase, count)
    }
  }

  /** Feats of a team; the ones about its units are worked out now (who is still alive) */
  feat(player: Player): FeatRecord {
    const feats = { ...(this.feats.get(player) ?? emptyFeats()) }
    for (const record of this.units.values()) {
      if (record.unit.player !== player) continue
      feats.bestUnitKills = Math.max(feats.bestUnitKills, record.kills)
      if (record.unit.health > 0) feats.toughest = Math.max(feats.toughest, record.taken)
    }
    return feats
  }

  private featRecord(player: Player): FeatRecord {
    let record = this.feats.get(player)
    if (!record) {
      record = emptyFeats()
      this.feats.set(player, record)
    }
    return record
  }

  /** A unit dropped to 0 HP (whatever killed it) */
  unitLost(unit: Unit) {
    const lost = ++this.teamRecord(unit.player).lost
    const enemyLost = Math.max(0, ...[...this.teams].filter(([player]) => player !== unit.player).map(([, team]) => team.lost))
    const feats = this.featRecord(unit.player)
    feats.maxDeficit = Math.max(feats.maxDeficit, lost - enemyLost)
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
      record = { unit, damage: 0, kills: 0, taken: 0 }
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
