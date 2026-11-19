import * as ex from 'excalibur'
import { Cell } from './cell'
import { SCALE } from './config'
import { PathFinder } from './path-finding/path-finding-system'
import { Unit } from './unit'

export class Board {
  tileWidth: number = 32
  tileHeight: number = 32
  rows: number
  cols: number

  cells: Cell[] = []

  pathFinder: PathFinder
  scene: ex.Scene
  /** Called when a unit drops to 0 HP (TurnManager checks whether the match is over) */
  onUnitDown: ((unit: Unit) => void) | null = null

  /**
   * @param mirrored draws column x at cols - 1 - x (online: the red player
   * also plays from the left). Only the picture changes: cells, rules and
   * messages keep the real coordinates.
   */
  constructor(rows: number, cols: number, scene: ex.Scene, public readonly mirrored = false) {
    this.rows = rows
    this.cols = cols
    this.scene = scene
    for (let i = 0; i < this.rows * this.cols; i++) {
      const cell = new Cell(i % this.cols, Math.floor(i / this.cols), this)
      this.cells.push(cell)
      scene.add(cell)
    };

    for (let cell of this.cells) {
      cell.pathNode.connections = cell.getNeighbors().map(c => c.pathNode)
    }

    this.pathFinder = new PathFinder()
  }

  getCenter() {
    return ex.vec(
      this.cols * (this.tileWidth * SCALE.x),
      this.rows * (this.tileHeight * SCALE.y)
    ).scale(.5)
  }

  getUnits() {
    let result: Unit[] = []
    for (let cell of this.cells) {
      // a unit at 0 HP is already out, even while its death animation plays
      if (cell.unit && cell.unit.active && cell.unit.health > 0) {
        result.push(cell.unit)
      }
    }
    return result
  }

  /**
   * Units still alive, including ones walking between cells (which are
   * temporarily off the board, so `getUnits()` doesn't see them)
   */
  getLivingUnits(): Unit[] {
    return this.scene.actors.filter((actor): actor is Unit => actor instanceof Unit && actor.health > 0)
  }

  getCellByWorldPos(pos: ex.Vector): Cell | null {
    return this.getCell(
      this.screenColumn(Math.floor(pos.x / (this.tileWidth * SCALE.x))),
      Math.floor(pos.y  / (this.tileHeight * SCALE.y))
    )
  }

  /** Column where cell column `x` is drawn (and back: the mirror is its own inverse) */
  screenColumn(x: number): number {
    return this.mirrored ? this.cols - 1 - x : x
  }

  getCell(x: number, y: number): Cell | null {
    if (x < 0 || x >= this.cols) return null
    if (y < 0 || y >= this.rows) return null
    return this.cells[ x + y * this.cols ]
  }
}