import * as ex from 'excalibur'
import { Board } from '../board'
import { ClassType, UnitType } from '../config'
import { Unit } from '../unit'
import { Player } from '../player'
import { HumanPlayer } from '../human-player'
import { SelectionManager } from '../selection-manager'
import { UIManager } from '../ui-manager'
import { TurnManager } from '../turn-manager'
import { ComputerPlayer } from '../computer-player'
import { DustParticles } from '../dust-particles'
import { Resources } from '../resources'
import { Terrain } from '../maps/tarrain-enum'

export interface LevelData {
  name: string
  displayName: string
  width: number
  height: number
  maxTurns: number
  nextLevel: string
  /**
   * By convention the first player is human
   */
  players: string[]
  data: string[]
}

export const CharToUnit = {
  AA: 'ArcherA',
  AB: 'ArcherB',
  BA: 'BarbarianA',
  BB: 'BarbarianB',
  CA: 'ClericA',
  CB: 'ClericB',
  FA: 'FighterA',
  FB: 'FighterB',
  MA: 'MageA',
  MB: 'MageB',
  SA: 'SpearmanA',
  SB: 'SpearmanB',
  WA: 'WarriorA',
  WB: 'WarriorB',
  TA: 'ThiefA',
  TB: 'ThiefB',
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
    if (this.isMobile()) {
      this.setLandscapeAndFullscreen()
    }
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

  async resetAndLoad() {
    const entities = this.entities
    for (let i = entities.length - 1; i >= 0; i--) {
      this.world.remove(entities[i], false)
    }

    Resources.LevelMusic2.stop()

    this.backgroundColor = ex.Color.fromHex('#0070d4')
    
    this.board = await this.parse(this.levelData)

    this.add(DustParticles)

    this.camera.pos = this.board.getCenter()
  }

  private _subscriptions: ex.Subscription[] = []

  override async onActivate() {
    await this.resetAndLoad()
    await this.turnManager.start()
  }

  override onDeactivate(): void {
    Resources.LevelMusic2.instances.forEach(i => i.stop())
    Resources.LevelMusic2.stop()
    this._subscriptions.forEach(s => s.close())
  }

  async parse(levelData: LevelData): Promise<Board> {
    Resources.LevelMusic2.loop = true
    Resources.LevelMusic2.play()
    const board = new Board(levelData.height, levelData.width, this)
    this.selectionManager = new SelectionManager(board)
    this.selectionManager.showCursor(0, 0)
    this.uiManager = new UIManager(this.engine)
    let mode = localStorage.getItem('start_screen')
    while (!mode || mode?.length === 0) {
      mode = localStorage.getItem('start_screen')
    }

    if (mode == 'p1vscpu') {
      this.players = [
        new HumanPlayer(levelData.players[0], this.engine, this.selectionManager, this.uiManager, board),
        new ComputerPlayer(levelData.players[1], this.selectionManager, board)
      ]
    } else if (mode == 'p1vsp2') {
      this.players = [
        new HumanPlayer(`${levelData.players[0]} A`, this.engine, this.selectionManager, this.uiManager, board),
        new HumanPlayer(`${levelData.players[0]} B`, this.engine, this.selectionManager, this.uiManager, board),
      ]
    } else {
      this.players = [
        new ComputerPlayer(`${levelData.players[1]} A`, this.selectionManager, board),
        new ComputerPlayer(`${levelData.players[1]} B`, this.selectionManager, board)
      ]
    }

    this.turnManager = new TurnManager(this.engine, this, this.players, this.selectionManager, this.levelData.maxTurns)

    for (let y = 0; y < levelData.height; y++) {
      for (let x = 0; x < levelData.width; x++) {
        const data = levelData.data[x + y * levelData.width]
        const terrain = `${data.charAt(0)}${data.charAt(1)}${data.charAt(2)}` as Terrain
        let unit: Unit | null = null
        if (data.length === 6) {
          const unitType: UnitType = CharToUnit[`${data.charAt(3)}${data.charAt(4)}` as ClassType]
          const playerIndex = (+data.charAt(5)) - 1

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