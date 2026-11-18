import * as ex from 'excalibur'
import { Player } from './player'
import { SelectionManager } from './selection-manager'
import { Resources } from './resources'
import { LevelBase } from './levels/level-base'
import type { GameUI } from './game-ui'
import type { GameResultView } from './ui-components/view-models'

interface MatchResult {
  /** null when the match ended in a draw */
  winner: Player | null
  reason: 'elimination' | 'turn-limit'
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
      await this.ui.playPhaseBanner(this.currentPlayer, this.round)
      await this.currentPlayer.turnStart()

      let done = false
      while (!done) {
        if (this.aborted) return
        done = await this.currentPlayer.makeMove()
      }
      if (this.aborted) return

      await this.currentPlayer.turnEnd()
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
      return {
        title: 'Draw',
        subtitle: result.reason === 'turn-limit' ? `Turn limit reached after ${lastRound} rounds` : 'No units left',
        team: null
      }
    }

    const survivors = this.level.board.getLivingUnits().filter(u => u.player === winner).length
    const subtitle = `Round ${lastRound} - ${survivors} unit${survivors === 1 ? '' : 's'} left`
    const humans = this.players.filter(p => p.isHuman)

    // Player vs CPU: speak from the human's point of view
    if (humans.length === 1) {
      return { title: winner.isHuman ? 'Victory!' : 'Defeat', subtitle, team: this.ui.teamOf(winner) }
    }
    return { title: `${this.ui.teamLabel(winner)} wins!`, subtitle, team: this.ui.teamOf(winner) }
  }

  private async finish(result: MatchResult) {
    this.selectionManager.reset()
    const choice = await this.ui.showGameOver(this.describe(result))
    Resources.LevelMusic2.stop()
    if (choice === 'rematch') {
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
