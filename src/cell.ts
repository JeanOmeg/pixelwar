import * as ex from 'excalibur'
import { Board } from './board'
import { CursorAnimation, HighlightAnimation, RedHighlightAnimation } from './resources'
import { SCALE } from './config'
import { PathNodeComponent } from './path-finding/path-node-component'
import { Unit } from './unit'

const RangeHighlightAnimation = HighlightAnimation.clone()
const PathHighlightAnimation = CursorAnimation.clone()
const AttackHighlightAnimation = RedHighlightAnimation.clone()
const CursorHighlightAnimation = CursorAnimation.clone()

export class Cell extends ex.Actor {
  decoration: ex.Actor
  sprite!: ex.Sprite
  pathNode: PathNodeComponent
  unit: Unit | null = null

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
        x * (board.tileWidth) * SCALE.x,
        y * (board.tileHeight) * SCALE.y
      ),
      anchor: ex.Vector.Zero
    })
    this.decoration = new ex.Actor({ anchor: ex.vec(0, 0) })
    this.addChild(this.decoration)

    this.pathNode = new PathNodeComponent(this.pos)
    this.addComponent(this.pathNode)

    RangeHighlightAnimation.scale = ex.vec(2, 2)

    PathHighlightAnimation.scale = ex.vec(2, 2)

    AttackHighlightAnimation.scale = ex.vec(2, 2)

    CursorHighlightAnimation.scale = ex.vec(2, 2)

    this.decoration.graphics.add('range', RangeHighlightAnimation)
    this.decoration.graphics.add('path', PathHighlightAnimation)
    this.decoration.graphics.add('attack', AttackHighlightAnimation)
    this.decoration.graphics.add('cursor', CursorHighlightAnimation)

    this.decoration.graphics.offset = ex.vec(-4, -4)
  }

  getRandomNumber(num1: number, num2: number) {
    return Math.floor(Math.random() * num2) + num1
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