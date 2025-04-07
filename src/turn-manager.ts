import * as ex from 'excalibur'
import { Player } from './player'
import { SelectionManager } from './selection-manager'
import { SCALE } from './config'
import { HumanPlayer } from './human-player'
import { Resources } from './resources'
import { LevelBase } from './levels/level-base'

export class TurnManager {
  public currentTurn = 1
  public currentPlayer: Player
  private currentPlayerIndex = 0
  public selectionManager: SelectionManager
  private turnActor: ex.Actor
  private turnText: ex.Text
  private topScreen = ex.vec(0, 0)
  private centerScreen = ex.vec(0, 0)
  private bottomScreen = ex.vec(0, 0)
  private victory: ex.Actor
  private victoryDirections: ex.Actor
  private failure: ex.Actor
  private turn: number = this.maxTurns

  constructor(public engine: ex.Engine, public level: LevelBase, public players: Player[], selectionManager: SelectionManager, public maxTurns: number) {
    if (players.length === 0) throw Error('Players should be non-zero in length')
    this.currentPlayer = players[this.currentPlayerIndex]
    this.selectionManager = selectionManager
    this.level = level
    this.maxTurns = maxTurns

    const screenWidth = engine.screen.contentArea.width
    const screenHeight = engine.screen.contentArea.height

    this.topScreen = ex.vec(screenWidth / 2, -(screenHeight + 200))
    this.centerScreen = ex.vec(screenWidth / 2, screenHeight / 2)
    this.bottomScreen = ex.vec(screenWidth / 2, screenHeight + 200)

    this.turnText = new ex.Text({
      text: `Turn ${this.currentTurn}`,
      font: new ex.Font({
        family: 'notjamslab14',
        size: 32 * SCALE.x,
        unit: ex.FontUnit.Px,
        color: ex.Color.White,
        baseAlign: ex.BaseAlign.Top,
        quality: 1
      }),
    })

    this.turnActor = new ex.Actor({
      name: 'turn text',
      pos: this.topScreen,
      coordPlane: ex.CoordPlane.Screen,
      z: 10
    })

    this.turnActor.graphics.opacity = 0
    this.turnActor.graphics.add('text', this.turnText)
    this.turnActor.graphics.use('text')
    this.turnActor.addChild(new ex.Actor({
      color: new ex.Color(255, 255, 255, .4),
      width: screenWidth,
      height: 100,
    }))
    engine.add(this.turnActor)

    const victory = new ex.Text({
      text: 'Victory!',
      font: new ex.Font({
        family: 'notjamslab14',
        size: 32 * SCALE.x,
        unit: ex.FontUnit.Px,
        color: ex.Color.White,
        baseAlign: ex.BaseAlign.Top,
        quality: 1
      }),
    })

    this.victory = new ex.Actor({
      name: 'victory text',
      pos: this.topScreen,
      coordPlane: ex.CoordPlane.Screen,
      color: new ex.Color(50, 240, 50, .4),
      width: screenWidth,
      height: 100,
      z: 10
    })

    this.victory.graphics.opacity = 0
    this.victory.graphics.add('text', victory)
    this.victory.graphics.use('text')
    engine.add(this.victory)

    const victoryDirections = new ex.Text({
      text: 'Click to proceed!',
      font: new ex.Font({
        family: 'notjamslab14',
        size: 32 * SCALE.x,
        unit: ex.FontUnit.Px,
        color: ex.Color.White,
        baseAlign: ex.BaseAlign.Top,
        quality: 1
      }),
    })

    this.victoryDirections = new ex.Actor({
      name: 'directions',
      pos: this.topScreen,
      coordPlane: ex.CoordPlane.Screen,
      color: new ex.Color(50, 240, 50, .4),
      width: screenWidth,
      height: 100,
      z: 10
    })

    this.victoryDirections.graphics.opacity = 0
    this.victoryDirections.graphics.add('text', victoryDirections)
    this.victoryDirections.graphics.use('text')
    engine.add(this.victoryDirections)

    const failureText1 = new ex.Text({
      text: 'Failure!',
      font: new ex.Font({
        family: 'notjamslab14',
        size: 32 * SCALE.x,
        unit: ex.FontUnit.Px,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Center,
        baseAlign: ex.BaseAlign.Top,
        quality: 1
      }),
    })

    const failureText2 = new ex.Text({
      text: 'Click to try again!',
      font: new ex.Font({
        family: 'notjamslab14',
        size: 32 * SCALE.x,
        unit: ex.FontUnit.Px,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Center,
        baseAlign: ex.BaseAlign.Top,
        quality: 1
      }),
    })

    const failureGroup = new ex.GraphicsGroup({
      members: [
        new ex.Rectangle({
          width: screenWidth,
          height: 250,
          color: new ex.Color(240, 50, 50, .4)
        }),
        { graphic: failureText1, useBounds: false, offset: ex.vec(screenWidth / 2, 0) },
        { graphic: failureText2, useBounds: false, offset: ex.vec(screenWidth / 2, 100) },
      ]
    })

    this.failure = new ex.Actor({
      name: 'failure text',
      pos: this.topScreen,
      coordPlane: ex.CoordPlane.Screen,
      z: 10
    })

    this.failure.graphics.opacity = 0
    this.failure.graphics.use(failureGroup)
    engine.add(this.failure)
  }

  async showTurnDisplay() {
    let color
    switch (this.currentPlayer.name) {
    case 'Human':
      color = ex.Color.Blue
      break
    case 'Human A':
      color = ex.Color.Blue
      break
    case 'CPU A':
      color = ex.Color.Blue
      break
    case 'CPU':
      color = ex.Color.Red
      break
    case 'CPU B':
      color = ex.Color.Red
      break
    case 'Human B':
      color = ex.Color.Red
      break
    }

    this.turnText.text = `${this.currentPlayer.name} Phase - Turn ${(this.turn - this.maxTurns) + 1} - Round ${this.currentTurn}`
    this.turnText.color = color
    const transitionTime = 1000
    const waitTime = 1000

    await this.turnActor.actions.runAction(
      new ex.ParallelActions([
        new ex.ActionSequence(this.turnActor, ctx => ctx.moveTo({
          pos: this.centerScreen,
          duration: transitionTime,
          easing: ex.EasingFunctions.EaseInOutCubic
        }).delay(waitTime).moveTo({
          pos: this.bottomScreen,
          duration: transitionTime,
          easing: ex.EasingFunctions.EaseInOutCubic
        })),
        new ex.ActionSequence(this.turnActor, ctx => ctx.fade(1, transitionTime).delay(waitTime).fade(0, transitionTime))
      ])
    ).toPromise()

    this.turnActor.pos = this.topScreen
    return true
  }

  async showGameOver() {
    const transitionTime = 1000
    await this.failure.actions.runAction(
      new ex.ParallelActions([
        new ex.ActionSequence(this.failure, ctx =>
          ctx.moveTo({ pos: this.centerScreen, duration: transitionTime, easing: ex.EasingFunctions.EaseInOutCubic })),
        new ex.ActionSequence(this.failure, ctx =>
          ctx.fade(1, transitionTime))
      ])
    ).toPromise()
  }

  async showVictory() {
    const transitionTime = 1000
    await this.victory.actions.runAction(
      new ex.ParallelActions([
        new ex.ActionSequence(this.victory, ctx =>
          ctx.moveTo({ pos: this.centerScreen, duration: transitionTime, easing: ex.EasingFunctions.EaseInOutCubic })),
        new ex.ActionSequence(this.victory, ctx =>
          ctx.fade(1, transitionTime))
      ])
    ).toPromise()

    await this.victoryDirections.actions.runAction(
      new ex.ParallelActions([
        new ex.ActionSequence(this.victoryDirections, ctx =>
          ctx.moveTo({ pos: this.centerScreen.add(ex.vec(0, 150)), duration: transitionTime, easing: ex.EasingFunctions.EaseInOutCubic })),
        new ex.ActionSequence(this.victoryDirections, ctx =>
          ctx.fade(1, transitionTime))
      ])
    ).toPromise()
  }

  async checkWin(player: Player) {
    const lost = player.hasLost()
    if (lost || this.maxTurns == 0) {
      if (player instanceof HumanPlayer) {
        await this.showGameOver()
        this.engine.input.pointers.once('down', async () => {
          Resources.LevelMusic2.stop()
          await this.engine.goToScene('start', {
            destinationIn: new ex.FadeInOut({ duration: 2000, direction: 'in' }),
            sourceOut: new ex.FadeInOut({ duration: 1000, direction: 'out' })
          })
        })
        return true
      } else {
        await this.showVictory()
        this.engine.input.pointers.once('down', async () => {
          Resources.LevelMusic2.stop()
          await this.engine.goToScene('start', {
            destinationIn: new ex.FadeInOut({ duration: 2000, direction: 'in' }),
            sourceOut: new ex.FadeInOut({ duration: 1000, direction: 'out' })
          })
        })
        return true
      }
    }
    return false
  }

  async start() {
    while (this.maxTurns >= 0) {
      const winFirst = await this.checkWin(this.currentPlayer)
      if (winFirst) return
      this.selectionManager.selectPlayer(this.currentPlayer)
      await this.showTurnDisplay()
      await ex.Util.delay(1000)
      await this.currentPlayer.turnStart()
      let move = true
      do {
        move = await this.currentPlayer.makeMove()
      } while (!move)
      const win = await this.checkWin(this.currentPlayer)
      if (win) return
      await this.currentPlayer.turnEnd()
      await this.nextTurn()
    }
  }

  async nextTurn() {
    this.maxTurns--
    this.currentPlayerIndex++
    this.currentPlayerIndex = this.currentPlayerIndex % this.players.length
    this.currentPlayer = this.players[this.currentPlayerIndex]
    if (this.currentPlayerIndex === 0) {
      this.currentTurn++
    }
  }
}