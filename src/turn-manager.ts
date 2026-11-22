import * as ex from 'excalibur'
import { Player } from './player'
import { SelectionManager } from './selection-manager'
import { MatchMusic } from './music'
import { LevelBase } from './levels/level-base'
import type { GameUI } from './game-ui'
import type { GameResultView, MatchStatsView, StandoutView } from './ui-components/view-models'
import type { GameOverChoice } from './ui-components/game-over'
import { t } from './i18n'
import { MatchStats } from './match-stats'
import { playSound } from './effects'
import { Resources } from './resources'
import { unitPortrait } from './ui-sprites'
import { className } from './unit-classes'
import { unitClassOf } from './unit-types'
import type { UnitType } from './config'
import type { Unit } from './unit'
import { MAPS, getMapInfo, spawnsWithArmies } from './maps'
import { type MatchSummary, addMatch, loadRecords, saveRecords } from './records'
import { type AchievementId, achievementText, loadUnlocked, newAchievements, unlock } from './achievements'
import { todayKey } from './daily'

/** From the last unit's death to the game over screen (its death animation takes ~0.8 s) */
const GAME_OVER_DELAY_MS = 2000

export interface MatchResult {
  /** null when the match ended in a draw */
  winner: Player | null
  /** forfeit/abandoned/out-of-sync: online only */
  reason: 'elimination' | 'turn-limit' | 'forfeit' | 'abandoned' | 'out-of-sync'
}

/** Online play and the tutorial hook into the turn loop (see OnlineMatch, TutorialMatch) */
export interface TurnHooks {
  /** Catching up on a match already going: no phase banner */
  skipBanner?: () => boolean
  /** The player's phase begins (after the banner) */
  phaseStarted?: (player: Player) => void
  /** The player's phase is over (before the next one starts) */
  phaseEnded?: (player: Player) => void
  /** The match just ended (before the game over screen) */
  ended?: (result: MatchResult) => void
  /** Replaces "Play again"/"Main menu" after the game over screen */
  finished?: (result: MatchResult, choice: GameOverChoice) => Promise<void>
  /** Replaces the title/subtitle of the game over screen (tutorial) */
  describe?: (result: MatchResult) => GameResultView | null
}

export class TurnManager {
  /** Full rounds (every player played once) */
  public round = 1
  /** Round of the last phase that started (the game over screen shows it) */
  private playedRound = 1
  public currentPlayer: Player
  private currentPlayerIndex = 0
  /** Player phases left before the match ends in a draw */
  private phasesLeft: number
  /** The player left the match (pause menu): the loop stops at the next step */
  private aborted = false
  /** The game over screen was shown (once per match) */
  private finished = false
  /** A side was wiped out: the game over screen comes after a short pause */
  private ending = false
  hooks: TurnHooks = {}
  /** Damage, kills... for the game over screen */
  readonly stats = new MatchStats()

  constructor(public engine: ex.Engine, public level: LevelBase, public players: Player[], public selectionManager: SelectionManager, public ui: GameUI, maxTurns: number) {
    if (players.length === 0) throw Error('Players should be non-zero in length')
    this.engine = engine
    this.level = level
    this.players = players
    this.selectionManager = selectionManager
    this.ui = ui
    this.currentPlayer = players[0]
    this.phasesLeft = maxTurns
    // a side may be wiped out in the middle of a phase: don't wait for it to end
    level.board.onAttackEvent = (event, outcome) => {
      this.stats.record(event, outcome)
      ui.recordAttack(event, outcome)
    }
    level.board.onHeal = (healer, amount) => this.stats.healed(healer, amount)
    level.board.onUnitDown = unit => {
      this.stats.unitLost(unit)
      const result = this.checkResult()
      if (result) void this.endAfterPause(result)
    }
  }

  /**
   * Elimination: everybody stops acting now (the CPU doesn't keep moving its
   * units, the human doesn't have to end the turn) and the game over screen
   * comes after the death animation and a short pause.
   */
  private async endAfterPause(result: MatchResult) {
    if (this.ending || this.finished || this.aborted) return
    this.ending = true
    this.players.forEach(p => {
      p.active = false
      p.disposed = true
    })
    this.ui.dismissAll()
    // the engine clock stops while paused, and so does this wait
    await ex.Util.delay(GAME_OVER_DELAY_MS, this.engine.clock)
    if (this.aborted) return
    this.aborted = true
    await this.finish(result)
  }

  /** Winner when only one player still has units */
  private checkResult(): MatchResult | null {
    const alive = this.players.filter(p => !p.hasLost())
    if (alive.length > 1) return null
    return { winner: alive[0] ?? null, reason: 'elimination' }
  }

  async start() {
    for (;;) {
      if (this.aborted || this.ending) return
      const eliminated = this.checkResult()
      if (eliminated) {
        await this.endAfterPause(eliminated)
        return
      }
      if (this.phasesLeft <= 0) {
        await this.finish({ winner: null, reason: 'turn-limit' })
        return
      }

      this.selectionManager.selectPlayer(this.currentPlayer)
      this.playedRound = this.round
      this.ui.setTurn(this.currentPlayer, this.round, this.phasesLeft)
      if (!this.hooks.skipBanner?.()) await this.ui.playPhaseBanner(this.currentPlayer, this.round)
      if (this.aborted) return
      this.stats.phaseStarted()
      await this.currentPlayer.turnStart()
      this.hooks.phaseStarted?.(this.currentPlayer)

      let done = false
      while (!done) {
        if (this.aborted || this.ending) return
        done = await this.currentPlayer.makeMove()
      }
      if (this.aborted || this.ending) return

      await this.currentPlayer.turnEnd()
      this.hooks.phaseEnded?.(this.currentPlayer)
      this.nextTurn()
    }
  }

  nextTurn() {
    this.phasesLeft--
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
    this.currentPlayer = this.players[this.currentPlayerIndex]
    if (this.currentPlayerIndex === 0) {
      this.round++
    }
  }

  private describe(result: MatchResult): GameResultView {
    const lastRound = this.playedRound
    const winner = result.winner
    if (!winner) {
      if (result.reason === 'out-of-sync') return { title: t().gameOver.matchEnded, subtitle: t().gameOver.outOfSync, team: null }
      return {
        title: t().gameOver.draw,
        subtitle: result.reason === 'turn-limit' ? t().gameOver.turnLimit(lastRound) : t().gameOver.noUnits,
        team: null
      }
    }

    const loser = this.players.find(p => p !== winner)
    const loserName = loser?.displayName ?? (loser ? this.ui.teamLabel(loser) : t().gameOver.theOpponent)
    const survivors = this.level.board.getLivingUnits().filter(u => u.player === winner).length
    const subtitle = result.reason === 'forfeit' ? t().gameOver.leftMatch(loserName)
      : result.reason === 'abandoned' ? t().gameOver.stoppedResponding(loserName)
        : t().gameOver.roundSurvivors(lastRound, survivors)
    const locals = this.players.filter(p => p.isLocal)

    // one player on this device (vs CPU, online): speak from their point of view
    if (locals.length === 1) {
      // online defeat: say who won
      const named = !winner.isLocal && winner.displayName ? t().gameOver.winsDash(winner.displayName, subtitle) : subtitle
      return { title: winner.isLocal ? t().gameOver.victory : t().gameOver.defeat, subtitle: named, team: this.ui.teamOf(winner) }
    }
    return { title: t().gameOver.wins(winner.displayName ?? this.ui.teamLabel(winner)), subtitle, team: this.ui.teamOf(winner) }
  }

  /**
   * Online: ends the match now (the opponent left, stopped responding, or the
   * games went out of sync), whatever the turn loop is waiting for.
   */
  endWith(result: MatchResult) {
    if (this.finished || this.aborted) return
    this.aborted = true
    this.players.forEach(p => { p.active = false })
    void this.finish(result)
  }

  private async finish(result: MatchResult) {
    if (this.finished) return
    this.finished = true
    this.hooks.ended?.(result)
    this.selectionManager.reset()
    MatchMusic.stop()
    const earned = this.recordProgress(result)
    const view = this.hooks.describe?.(result) ?? this.describe(result)
    playSound(this.wonHere(result) ? Resources.VictorySound : Resources.DefeatSound)
    const choice = await this.ui.showGameOver({ ...view, stats: this.statsView(), achievements: earned.map(achievementText) })
    if (this.hooks.finished) {
      await this.hooks.finished(result, choice)
    } else if (choice === 'rematch') {
      await this.level.restart()
    } else {
      await this.returnToMainMenu()
    }
  }

  /**
   * Records and achievements (Records screen): only with one player on this
   * device, against the CPU, online or in the daily challenge (the tutorial
   * only unlocks its own achievement). Returns the achievements this match
   * unlocked.
   */
  private recordProgress(result: MatchResult): AchievementId[] {
    const settings = this.level.settings
    const locals = this.players.filter(p => p.isLocal)
    if (locals.length !== 1 || result.reason === 'out-of-sync') return []
    const me = locals[0]
    const today = todayKey()
    if (settings.mode === 'tutorial') return result.winner === me ? unlock(['graduate'], today) : []
    if (settings.mode !== 'p1vscpu' && settings.mode !== 'online' && settings.mode !== 'daily') return []

    const team = this.players.indexOf(me)
    const army = spawnsWithArmies(getMapInfo(this.level.map), settings.armies, settings.placements)
      .filter(spawn => spawn.team === team)
      .map(spawn => unitClassOf(spawn.unitType))
    const own = this.stats.team(me)
    const survivors = this.level.board.getLivingUnits().filter(u => u.player === me)
    const match: MatchSummary = {
      bucket: settings.mode === 'online' ? 'online' : settings.difficulty ?? 'normal',
      mapId: this.level.map.id,
      outcome: !result.winner ? 'drawn' : result.winner === me ? 'won' : 'lost',
      rounds: this.playedRound,
      army,
      lost: own.lost,
      survivors: survivors.length,
      survivorHp: survivors.reduce((sum, unit) => sum + unit.health, 0),
      kills: own.kills,
      damage: own.damage,
      feats: this.stats.feat(me),
      daily: settings.mode === 'daily' ? settings.daily : undefined
    }
    const records = addMatch(loadRecords(), match)
    saveRecords(records)
    return unlock(newAchievements({ match, records, today, mapCount: MAPS.length }, loadUnlocked()), today)
  }

  /**
   * Victory jingle when somebody on this device won (or, with nobody or
   * everybody here, when anybody won); defeat jingle for a loss or a draw
   */
  private wonHere(result: MatchResult): boolean {
    if (!result.winner) return false
    const locals = this.players.filter(p => p.isLocal)
    return locals.length === 1 ? result.winner.isLocal : true
  }

  private standout(unit: Unit, detail: string): StandoutView {
    const team = this.ui.teamOf(unit.player)
    const type = unit.name as UnitType
    return { portrait: unitPortrait(type, team === 'red'), name: className(unitClassOf(type)), team, detail }
  }

  private statsView(): MatchStatsView {
    const mvp = this.stats.mvp()
    const critical = this.stats.bestCritical
    return {
      rounds: this.playedRound,
      teams: this.players.map(player => ({
        team: this.ui.teamOf(player),
        label: player.displayName ?? this.ui.teamLabel(player),
        ...this.stats.team(player)
      })),
      mvp: mvp ? this.standout(mvp.unit, t().gameOver.mvpDetail(mvp.kills, mvp.damage)) : null,
      bestCritical: critical ? this.standout(critical.unit, t().gameOver.damageDetail(critical.damage)) : null
    }
  }

  /** Leaves the match from the pause menu, without a result */
  async quit() {
    if (this.aborted) return
    this.aborted = true
    this.players.forEach(p => { p.active = false })
    this.selectionManager.reset()
    MatchMusic.stop()
    await this.returnToMainMenu()
  }

  showStartScreenUi() {
    document.querySelector('start-screen-ui')?.remove()
    const startScreen = document.createElement('start-screen-ui') as HTMLElement & { engine: ex.Engine }
    startScreen.engine = this.engine
    document.body.appendChild(startScreen)
  }

  async returnToMainMenu() {
    await this.engine.goToScene('menu-shell', {
      destinationIn: new ex.FadeInOut({ duration: 500, direction: 'in' }),
      sourceOut: new ex.FadeInOut({ duration: 1000, direction: 'out' })
    })
    this.showStartScreenUi()
  }
}
