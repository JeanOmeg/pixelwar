import * as ex from 'excalibur'
import { Board } from '../board'
import { Terrain } from '../cell'
import { SCALE, UnitType } from '../config'
import { Unit } from '../unit'
import { Player } from '../player'
import { HumanPlayer } from '../human-player'
import { SelectionManager } from '../selection-manager'
import { UIManager } from '../ui-manager'
import { TurnManager } from '../turn-manager'
import { ComputerPlayer } from '../computer-player'
import { Cloud } from '../cloud'
import { DustParticles } from '../dust-particles'
import { Resources } from '../resources'

export interface LevelData {
  name: string
  displayName: string
  nextLevel: string
  width: number
  height: number
  maxTurns: number
  /**
   * By convention the first player is human
   */
  players: string[]
  data: string[]
}

export const CharToUnit = {
  K: 'Knight',
  S: 'Spider',
  M: 'Slime',
  C: 'Crab'
} as const

export class LevelBase extends ex.Scene {

  board!: Board
  selectionManager!: SelectionManager
  uiManager!: UIManager
  engine!: ex.Engine
  players!: Player[]
  turnManager!: TurnManager
  levelName!: ex.Actor
  constructor(public levelData: LevelData, public name: string) {
    super()
  }

  override onInitialize(engine: ex.Engine): void {
    this.engine = engine
    this.input.keyboard.on('press', (evt) => {
      // DELETEME for debugging
      if (evt.key === ex.Keys.W) {
        (this.players[1] as ComputerPlayer).lose()
      }
      if (evt.key === ex.Keys.L) {
        (this.players[0] as HumanPlayer).lose()
      }
    })
  }

  isMobile() {
    const userAgent = navigator.userAgent
    const mobileRegex = /Android|webOS|iPhone/i
    return mobileRegex.test(userAgent)
  }

  setLandscapeAndFullscreen() {
    const docElement = document.documentElement as HTMLElement & {
      mozRequestFullScreen?: () => Promise<void>
      webkitRequestFullscreen?: () => Promise<void>
      msRequestFullscreen?: () => Promise<void>
    }

    if (docElement.requestFullscreen) {
      docElement.requestFullscreen()
    } else if (docElement.mozRequestFullScreen) {
      docElement.mozRequestFullScreen()
    } else if (docElement.webkitRequestFullscreen) {
      docElement.webkitRequestFullscreen()
    } else if (docElement.msRequestFullscreen) {
      docElement.msRequestFullscreen()
    }

    const screenOrientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: "portrait" | "portrait-primary" | "portrait-secondary" | "landscape" | "landscape-primary" | "landscape-secondary") => Promise<void>
    }

    if (screenOrientation && screenOrientation.lock) {
      screenOrientation.lock('landscape').catch(function (error) {
        console.error('Erro ao tentar definir a orientação para paisagem:', error)
      })
    }
  }

  resetAndLoad() {
    const entities = this.entities
    for (let i = entities.length - 1; i >= 0; i--) {
      this.world.remove(entities[i], false)
    }

    Resources.LevelMusic2.stop()

    this.add(new Cloud(ex.vec(800, 0)))

    this.board = this.parse(this.levelData)

    this.add(DustParticles)

    this.camera.pos = this.board.getCenter()
  }

  private _subscriptions: ex.Subscription[] = []
  override onActivate() {
    if (this.isMobile()) {
      this.setLandscapeAndFullscreen()
    }
    this.resetAndLoad()
    this.turnManager.start()
    Resources.LevelMusic2.loop = true
    Resources.LevelMusic2.play()
  }

  override onDeactivate(): void {
    Resources.LevelMusic2.instances.forEach(i => i.stop())
    Resources.LevelMusic2.stop()
    this._subscriptions.forEach(s => s.close())
  }

  parse(levelData: LevelData): Board {
    const board = new Board(levelData.height, levelData.width, this)
    this.selectionManager = new SelectionManager(board)
    this.selectionManager.showCursor(0, 0)
    this.uiManager = new UIManager(this.engine)
    let mode = localStorage.getItem('start_screen')
    while (!mode || mode?.length === 0) {
      mode = localStorage.getItem('start_screen')
    }

    if (mode == 'CPU') {
      this.players = [
        new HumanPlayer(levelData.players[0], this.engine, this.selectionManager, this.uiManager, board),
        new ComputerPlayer(levelData.players[1], this.selectionManager, board)
      ]
    } else {
      this.players = [
        new HumanPlayer(levelData.players[0], this.engine, this.selectionManager, this.uiManager, board),
        new HumanPlayer(levelData.players[1], this.engine, this.selectionManager, this.uiManager, board),
      ]
    }

    this.turnManager = new TurnManager(this.engine, this, this.players, this.selectionManager, this.levelData.maxTurns)

    for (let y = 0; y < levelData.height; y++) {
      for (let x = 0; x < levelData.width; x++) {
        const data = levelData.data[x + y * levelData.width]
        const terrain = data.charAt(0) as Terrain
        let unit: Unit | null = null
        if (data.length === 3) {
          const unitType: UnitType = CharToUnit[data.charAt(1) as 'K' | 'S' | 'M' | 'C']
          const playerIndex = (+data.charAt(2)) - 1

          unit = new Unit(x, y, unitType, board, this.players[playerIndex])
          if (playerIndex == 0) {
            unit.graphics.flipHorizontal = false
          } else {
            unit.graphics.flipHorizontal = true
          }
          this.add(unit)
        }
        const cell = board.getCell(x, y)
        if (cell) {
          cell.terrain = terrain
          if (unit) {
            cell.addUnit(unit)
          }
        }
      }
    }

    return board
  }
}