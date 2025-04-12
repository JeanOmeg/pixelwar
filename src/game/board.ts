import * as ex from 'excalibur'
import { Cell } from './cell'
import { SCALE } from './config'
import { PathFinder } from './path-finding/path-finding-system'
import type { Unit } from './unit'

export class Board {
  tileWidth = 32
  tileHeight = 32
  rows: number
  cols: number

  cells: Cell[] = []

  pathFinder: PathFinder

  constructor(rows: number, cols: number, scene: ex.Scene) {
    this.rows = rows
    this.cols = cols
    for (let i = 0; i < this.rows * this.cols; i++) {
      const cell = new Cell(i % this.cols, Math.floor(i / this.cols), this)
      this.cells.push(cell)
      scene.add(cell)
    };

    for (const cell of this.cells) {
      cell.pathNode.connections = cell.getNeighbors().map(c => c.pathNode)
    }

    this.pathFinder = new PathFinder(scene)
  }

  getCenter() {
    return ex.vec(
      this.cols * (this.tileWidth * SCALE.x),
      this.rows * (this.tileHeight * SCALE.y)
    ).scale(.5)
  }

  getUnits() {
    const result: Unit[] = []
    for (const cell of this.cells) {
      if (cell.unit?.isActive) {
        result.push(cell.unit)
      }
    }
    return result
  }

  getEmptyCells(): Cell[] {
    return this.cells.filter(cell => !cell.unit)
  }

  getCellByWorldPos(pos: ex.Vector): Cell | null {
    return this.getCell(
      Math.floor(pos.x / (this.tileWidth * SCALE.x)),
      Math.floor(pos.y  / (this.tileHeight * SCALE.y))
    )
  }

  getCell(x: number, y: number): Cell | null {
    if (x < 0 || x >= this.cols) return null
    if (y < 0 || y >= this.rows) return null
    return this.cells[ x + y * this.cols ] ?? null
  }
}
