import * as ex from "excalibur"
import { Board } from "./board"
import { CursorAnimation, HighlightAnimation, RedHighlightAnimation, TileSpriteSheet } from "./resources"
import { SCALE } from "./config"
import { PathNodeComponent } from "./path-finding/path-node-component"
import { Unit } from "./unit"

const RangeHighlightAnimation = HighlightAnimation.clone()
const PathHighlightAnimation = HighlightAnimation.clone()
const AttackHighlightAnimation = RedHighlightAnimation.clone()

export enum Terrain {
  Grass = 'GA',
  GrassLast = 'GB',
  GrassStone = 'GC',
  River = 'RA',
  RiverLast = 'RB',
  RiverStone = 'RC',
  Sand = 'SA',
  SandLast = 'SB',
  SandStone = 'SC',
  Dungeon = 'DA',
  DungeonLast = 'DB',
  DungeonStone = 'DC',
  Three = 'TA',
  ForestCenter = 'FC',
  ForestLeft = 'FL',
  ForestRight = 'FR',
  ForestUp = 'FU',
  ForestDown = 'FD',
  ForestUpLeft = 'F1',
  ForestUpRight = 'F2',
  ForestDownLeft = 'F3',
  ForestDownRightt = 'F4',
  BridgeA1 = 'B1',
  BridgeA2 = 'B2',
  BridgeA3 = 'B3',
  BridgeB = 'BB',
  BridgeC = 'BC',
  WallUpA = 'WA',
  WallUpB = 'WB',
  WallDownA = 'W1',
  WallDownB = 'W2',
}

export class Cell extends ex.Actor {
  decoration: ex.Actor
  sprite!: ex.Sprite
  pathNode: PathNodeComponent
  unit: Unit | null = null
  private _terrain: Terrain = Terrain.Grass

  /**
   * Individual cells on the board
   * 
   * @param x integer coordinate
   * @param y integer coordinate
   * @param board 
   */
  constructor(public x: number, public y: number, public board: Board) {
    super({
      name: `cell(${x}, ${y})`,
      pos: ex.vec(
        x * (board.tileWidth + board.margin) * SCALE.x,
        y * (board.tileHeight + board.margin) * SCALE.y
      ),
      anchor: ex.Vector.Zero
    })
    this.decoration = new ex.Actor({ anchor: ex.vec(0, 0) })
    this.addChild(this.decoration)

    this.pathNode = new PathNodeComponent(this.pos)
    this.addComponent(this.pathNode)

    this.terrain = Terrain.Grass

    RangeHighlightAnimation.scale = ex.vec(2, 2)
    RangeHighlightAnimation.opacity = 0.8

    PathHighlightAnimation.scale = ex.vec(2, 2)
    PathHighlightAnimation.opacity = 0.5

    AttackHighlightAnimation.scale = ex.vec(2, 2)
    AttackHighlightAnimation.opacity = 0.8

    CursorAnimation.scale = ex.vec(2, 2)
    CursorAnimation.opacity = 0.8

    this.decoration.graphics.add('range', RangeHighlightAnimation)
    this.decoration.graphics.add('path', PathHighlightAnimation)
    this.decoration.graphics.add('attack', AttackHighlightAnimation)
    this.decoration.graphics.add('cursor', CursorAnimation)

    this.decoration.graphics.offset = ex.vec(-4, -4)
  }

  get terrain() {
    return this._terrain
  }

  set terrain(terrain: Terrain) {
    this._terrain = terrain
    switch (this.terrain) {
      case Terrain.Grass:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 14) ]
        break
      case Terrain.GrassLast:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 52) ]
        break
      case Terrain.GrassStone:
        this.pathNode.isWalkable = false
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(3, 18) ]
        break
      case Terrain.River:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 21) ]
        this.pathNode.isFast = false
        break
      case Terrain.RiverLast:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(2, 47) ]
        this.pathNode.isFast = false
        break
      case Terrain.RiverStone:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(2, 47) ]
        this.pathNode.isWalkable = false
        break
      case Terrain.Sand:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        break
      case Terrain.SandLast:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        break
      case Terrain.SandStone:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isWalkable = false
        break
      case Terrain.Dungeon:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        break
      case Terrain.DungeonLast:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        break
      case Terrain.DungeonStone:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isWalkable = false
        break
      case Terrain.Three:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isFast = false
        break
      case Terrain.Three:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isFast = false
        break
      case Terrain.ForestCenter:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isFast = false
        break
      case Terrain.ForestLeft:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isFast = false
        break
      case Terrain.ForestRight:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isFast = false
        break
      case Terrain.ForestUp:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isFast = false
        break
      case Terrain.ForestDown:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isFast = false
        break
      case Terrain.ForestUpLeft:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isFast = false
        break
      case Terrain.ForestUpRight:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isFast = false
        break
      case Terrain.ForestDownLeft:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isFast = false
        break
      case Terrain.ForestDownRightt:
        this.sprite = TileSpriteSheet.sprites[ this.getRandomNumber(4, 0) ]
        this.pathNode.isFast = false
        break
      case Terrain.BridgeA1:
        this.sprite = TileSpriteSheet.sprites[ 28 ]
        break
      case Terrain.BridgeA2:
        this.sprite = TileSpriteSheet.sprites[ 29 ]
        break
      case Terrain.BridgeA3:
        this.sprite = TileSpriteSheet.sprites[ 30 ]
        break
      case Terrain.BridgeB:
        this.sprite = TileSpriteSheet.sprites[ 29 ]
        break
      case Terrain.BridgeC:
        this.sprite = TileSpriteSheet.sprites[ 30 ]
        break
      case Terrain.WallUpA:
        this.sprite = TileSpriteSheet.sprites[ 30 ]
        this.pathNode.isWalkable = false
        break
      case Terrain.WallUpB:
        this.sprite = TileSpriteSheet.sprites[ 30 ]
        this.pathNode.isWalkable = false
        break
      case Terrain.WallDownA:
        this.sprite = TileSpriteSheet.sprites[ 30 ]
        this.pathNode.isWalkable = false
        break
      case Terrain.WallDownB:
        this.sprite = TileSpriteSheet.sprites[ 30 ]
        this.pathNode.isWalkable = false
        break
    }
    this.sprite.scale = SCALE
    this.graphics.use(this.sprite.clone())
  }

  getRandomNumber(num1: number, num2: number) {
    return Math.floor(Math.random() * num1) + num2
  }

  addUnit(unit: Unit) {
    this.unit = unit
    this.unit.scale = SCALE
    this.unit.offset = ex.vec(0, 0)
    this.unit.cell = this
    this.pathNode.walkableMask = unit.player.mask
  }

  removeUnit(unit: Unit) {
    this.pathNode.walkableMask = -1
    this.unit = null
    unit.cell = null
  }

  toggleHighlight(show: boolean, type: 'range' | 'path' | 'attack') {
    this.decoration.graphics.hide()

    if (show) {
      this.decoration.graphics.use(type)
    } else {
      this.decoration.graphics.hide()
    }
  }

  toggleCursor(show: boolean) {
    if (show) {
      this.decoration.graphics.use('cursor')
    } else {
      this.decoration.graphics.hide()
    }
  }

  getDistance(other: Cell) {
    return Math.abs(this.pos.x - other.pos.x) + Math.abs(this.pos.y - other.pos.y)
  }

  /**
   * Returns the orthogonal neighbors (up, down, left, right)
   * @returns 
   */
  getNeighbors(): Cell[] {
    return [
      this.board.getCell(this.x, this.y - 1),
      this.board.getCell(this.x, this.y + 1),
      this.board.getCell(this.x + 1, this.y),
      this.board.getCell(this.x - 1, this.y),
    ].filter(function (cell) {
      return cell !== null
    }) as Cell[]
  }

}