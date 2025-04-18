import * as ex from 'excalibur'
import { Board } from '../board'
import { SCALE, UnitType } from '../config'
import { Unit } from '../unit'
import { Player } from '../player'
import { HumanPlayer } from '../human-player'
import { SelectionManager } from '../selection-manager'
import { UIManager } from '../ui-manager'
import { TurnManager } from '../turn-manager'
import { ComputerPlayer } from '../computer-player'
import { DustParticles } from '../dust-particles'
import { Resources } from '../resources'
import { Layer, Tile, TiledResource } from '@excaliburjs/plugin-tiled'

export interface LevelData {
  name: string
  maxTurns: number
  players: string[]
  tiledMap: TiledResource
}

interface mapGidList extends Layer {
  data: number[]
}

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
    this.levelData = levelData
    this.name = name
  }

  override onInitialize(engine: ex.Engine): void {
    this.engine = engine
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
    const MapGidList = (levelData.tiledMap.getLayersByName('map')[0] as mapGidList).data
    const tileset = levelData.tiledMap.getTilesetForTileGid(MapGidList[0])
    const objectUniList = levelData.tiledMap.getObjectLayers('unit')[0].objects
    
    Resources.LevelMusic2.loop = true
    Resources.LevelMusic2.play()

    const board = new Board(levelData.tiledMap.map.height, levelData.tiledMap.map.width, this)
    this.selectionManager = new SelectionManager(board)
    this.uiManager = new UIManager(this.engine)

    this.selectionManager.showCursor(4, 8)

    const mode = localStorage.getItem('start_screen')

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
    
    
    for (let y = 0; y < levelData.tiledMap.map.height; y++) {
      for (let x = 0; x < levelData.tiledMap.map.width; x++) {
        const Gid = MapGidList[x + y * levelData.tiledMap.map.width]
        const tile = tileset.getTileByGid(Gid) as Tile
        const spriteTile = tileset.getSpriteForGid(Gid)
        
        const cell = board.getCell(x, y)
        if (cell) {
          cell.pathNode.isWalkable = (tile.properties.get('iswalkable') ?? false) as boolean
          cell.pathNode.isAttackable = (tile.properties.get('isattackable') ?? false) as boolean
          cell.pathNode.isFast = (tile.properties.get('isfast') ?? false) as boolean
          cell.pathNode.isDoor = (tile.properties.get('isdoor') ?? false) as boolean
          cell.pathNode.isWater = (tile.properties.get('iswater') ?? false) as boolean
          cell.sprite = spriteTile
          cell.sprite.scale = SCALE
          cell.graphics.use(cell.sprite.clone())

          for (const object of objectUniList) {
            const objectPos = { x: object.x * SCALE.x, y: object.y * SCALE.y } as ex.Vector
            const objectCell = board.getCellByWorldPos(objectPos)
            if (cell.name == objectCell?.name) {
              const unitType = object.name as UnitType
              const playerIndex = Number(object.class)
  
              const unit = new Unit(x, y, unitType, board, this.players[playerIndex])
              if (playerIndex == 0) {
                unit.graphics.flipHorizontal = false
              } else {
                unit.graphics.flipHorizontal = true
              }
              this.add(unit)
              cell.addUnit(unit)
            }
          }
        }
      }
    }

    return board
  }
}