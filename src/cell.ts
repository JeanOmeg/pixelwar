import * as ex from 'excalibur'
import { Board } from './board'
import { CursorAnimation, HighlightAnimation, RedHighlightAnimation } from './resources'
import { SCALE, SCALE_CURSOR } from './config'
import { PathNodeComponent } from './path-finding/path-node-component'
import { Unit } from './unit'
import { Facing } from './combat'
import { backAttackMarker, destinationFacingArrow, screenFacing } from './board-markers'

const RangeHighlightAnimation = HighlightAnimation.clone()
const PathHighlightAnimation = CursorAnimation.clone()
const AttackHighlightAnimation = RedHighlightAnimation.clone()
const CursorHighlightAnimation = CursorAnimation.clone()

export type HighlightType = 'range' | 'path' | 'attack'

export class Cell extends ex.Actor {
  /** Range/path/attack highlight */
  decoration: ex.Actor
  /** Pointer cursor: its own actor, so moving it doesn't erase highlights */
  cursor: ex.Actor
  /** Move preview: the way the unit will face when it stops here */
  private facingMarker: ex.Actor
  /** Move preview: this enemy would be attacked from behind */
  private backMarker: ex.Actor
  sprite!: ex.Sprite
  pathNode: PathNodeComponent
  unit: Unit | null = null
  hasCursor = false
  highlight: HighlightType | null = null

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
        board.screenColumn(x) * (board.tileWidth) * SCALE.x,
        y * (board.tileHeight) * SCALE.y
      ),
      anchor: ex.Vector.Zero
    })
    this.decoration = new ex.Actor({ anchor: ex.vec(0, 0) })
    this.addChild(this.decoration)
    this.cursor = new ex.Actor({ anchor: ex.vec(0, 0), z: 1 })
    this.addChild(this.cursor)
    // above the units (z 2) and their HP bars (z 3)
    const tileWidth = board.tileWidth * SCALE.x
    const tileHeight = board.tileHeight * SCALE.y
    this.facingMarker = new ex.Actor({ pos: ex.vec(tileWidth / 2, tileHeight / 2), z: 4 })
    this.addChild(this.facingMarker)
    // over the unit's head; on the top row, inside the tile (the map ends there)
    const backPos = y === 0 ? ex.vec(tileWidth * 0.85, tileHeight * 0.3) : ex.vec(tileWidth / 2, -tileHeight * 0.55)
    this.backMarker = new ex.Actor({ pos: backPos, z: 4 })
    this.addChild(this.backMarker)

    this.pathNode = new PathNodeComponent(this.pos, x, y)
    this.addComponent(this.pathNode)

    RangeHighlightAnimation.scale = SCALE_CURSOR

    PathHighlightAnimation.scale = SCALE_CURSOR

    AttackHighlightAnimation.scale = SCALE_CURSOR

    CursorHighlightAnimation.scale = SCALE_CURSOR

    this.decoration.graphics.add('range', RangeHighlightAnimation)
    this.decoration.graphics.add('path', PathHighlightAnimation)
    this.decoration.graphics.add('attack', AttackHighlightAnimation)
    this.cursor.graphics.add('cursor', CursorHighlightAnimation)

    this.decoration.graphics.offset = ex.vec(-4, -4)
    this.cursor.graphics.offset = ex.vec(-4, -4)
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

  toggleHighlight(show: boolean, type: HighlightType) {
    if (show) {
      this.decoration.graphics.use(type)
      this.highlight = type
    } else if (this.highlight === type || this.highlight === null) {
      this.decoration.graphics.hide()
      this.highlight = null
    }
  }

  /** Arrow of the way a unit moving here ends up facing (null hides it) */
  showFacingPreview(facing: Facing | null) {
    if (facing) this.facingMarker.graphics.use(destinationFacingArrow(screenFacing(facing, this.board.mirrored)))
    else this.facingMarker.graphics.hide()
  }

  /** Sword over an enemy that the previewed move would attack from behind */
  toggleBackMarker(show: boolean) {
    if (show) this.backMarker.graphics.use(backAttackMarker())
    else this.backMarker.graphics.hide()
  }

  toggleCursor(show: boolean) {
    if (show === this.hasCursor) return
    this.hasCursor = show
    if (show) this.cursor.graphics.use('cursor')
    else this.cursor.graphics.hide()
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