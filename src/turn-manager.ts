import * as ex from 'excalibur'
import { Player } from './player'
import { SelectionManager } from './selection-manager'
import { Resources } from './resources'
import { LevelBase } from './levels/level-base'
import type { GameUI } from './game-ui'
import type { GameResultView } from './ui-components/view-models'
import type { GameOverChoice } from './ui-components/game-over'

export interface MatchResult {
  /** null when the match ended in a draw */
  winner: Player | null
  /** forfeit/abandoned/out-of-sync: online only */
  reason: 'elimination' | 'turn-limit' | 'forfeit' | 'abandoned' | 'out-of-sync'
}

/** Online play hooks into the turn loop (see OnlineMatch) */
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
}

export class TurnManager {
  /** Full rounds (every player played once) */
  public round = 1
  public currentPlayer: Player
  private currentPlayerIndex = 0
  /** Player phases left before the match ends in a draw */
  private phasesLeft: number
  /** The player left the match (pause menu): the loop stops at the next step */
  private aborted = false
  /** The game over screen was shown (once per match) */
  private finished = false
  hooks: TurnHooks = {}

  constructor(public engine: ex.Engine, public level: LevelBase, public players: Player[], public selectionManager: SelectionManager, public ui: GameUI, maxTurns: number) {
    if (players.length === 0) throw Error('Players should be non-zero in length')
    this.engine = engine
    this.level = level
    this.players = players
    this.selectionManager = selectionManager
    this.ui = ui
    this.currentPlayer = players[0]
    this.phasesLeft = maxTurns
  }

  /** Winner when only one player still has units */
  private checkResult(): MatchResult | null {
    const alive = this.players.filter(p => !p.hasLost())
    if (alive.length > 1) return null
    return { winner: alive[0] ?? null, reason: 'elimination' }
  }

  async start() {
    for (;;) {
      if (this.aborted) return
      const result = this.checkResult() ?? (this.phasesLeft <= 0 ? { winner: null, reason: 'turn-limit' } as MatchResult : null)
      if (result) {
        await this.finish(result)
        return
      }

      this.selectionManager.selectPlayer(this.currentPlayer)
      this.ui.setTurn(this.currentPlayer, this.round, this.phasesLeft)
      if (!this.hooks.skipBanner?.()) await this.ui.playPhaseBanner(this.currentPlayer, this.round)
      if (this.aborted) return
      await this.currentPlayer.turnStart()
      this.hooks.phaseStarted?.(this.currentPlayer)

      let done = false
      while (!done) {
        if (this.aborted) return
        done = await this.currentPlayer.makeMove()
      }
      if (this.aborted) return

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
    // the result is checked after nextTurn(), so a new round may have just been counted
    const lastRound = this.currentPlayerIndex === 0 ? Math.max(this.round - 1, 1) : this.round
    const winner = result.winner
    if (!winner) {
      if (result.reason === 'out-of-sync') return { title: 'Match ended', subtitle: 'The two games went out of sync', team: null }
      return {
        title: 'Draw',
        subtitle: result.reason === 'turn-limit' ? `Turn limit reached after ${lastRound} rounds` : 'No units left',
        team: null
      }
    }

    const loser = this.players.find(p => p !== winner)
    const loserName = loser?.displayName ?? (loser ? this.ui.teamLabel(loser) : 'The opponent')
    const survivors = this.level.board.getLivingUnits().filter(u => u.player === winner).length
    const subtitle = result.reason === 'forfeit' ? `${loserName} left the match`
      : result.reason === 'abandoned' ? `${loserName} stopped responding`
        : `Round ${lastRound} - ${survivors} unit${survivors === 1 ? '' : 's'} left`
    const locals = this.players.filter(p => p.isLocal)

    // one player on this device (vs CPU, online): speak from their point of view
    if (locals.length === 1) {
      // online defeat: say who won
      const named = !winner.isLocal && winner.displayName ? `${winner.displayName} wins - ${subtitle}` : subtitle
      return { title: winner.isLocal ? 'Victory!' : 'Defeat', subtitle: named, team: this.ui.teamOf(winner) }
    }
    return { title: `${winner.displayName ?? this.ui.teamLabel(winner)} wins!`, subtitle, team: this.ui.teamOf(winner) }
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
    const choice = await this.ui.showGameOver(this.describe(result))
    Resources.LevelMusic2.stop()
    if (this.hooks.finished) {
      await this.hooks.finished(result, choice)
    } else if (choice === 'rematch') {
      await this.level.restart()
    } else {
      await this.returnToMainMenu()
    }
  }

  /** Leaves the match from the pause menu, without a result */
  async quit() {
    if (this.aborted) return
    this.aborted = true
    this.players.forEach(p => { p.active = false })
    this.selectionManager.reset()
    Resources.LevelMusic2.stop()
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
