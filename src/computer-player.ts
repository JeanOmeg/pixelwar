import * as ex from 'excalibur'

import { Player } from "./player"
import { SelectionManager } from "./selection-manager"
import { Board } from './board'
import { ENEMY_SPEED } from './config'
import { PathNodeComponent } from './path-finding/path-node-component'
import { Cell } from './cell'
import { Unit } from './unit'

export class ComputerPlayer extends Player {
  public active: boolean = false
  constructor(name: string, private selectionManger: SelectionManager, board: Board) {
    super(name, board)
  }

  override async turnStart(): Promise<void> {
    this.active = true
  }
  override async turnEnd(): Promise<void> {
    this.active = false
  }

  findClosestEnemy(unit: Unit): Unit | null {
    const enemyCells = this.board.getUnits()
      .filter(u => u.player !== this)
      .map(u => u.cell)
      .filter(c => !!c) as Cell[]

    const closestCell = this.findClosestCell(unit, enemyCells)
    if (closestCell?.unit) {
      return closestCell.unit
    }
    return null
  }

  findValidMoveCells(unit: Unit): Cell[] {
    let range: PathNodeComponent[] = []
    if (unit.cell) {
      range = this.board.pathFinder.getRange(unit.cell.pathNode, this.mask, unit.unitConfig.movement).filter(node => {
        const cell = node.owner as Cell
        return cell.unit?.player !== this
      })
    }
    return range.map(node => node.owner as Cell)
  }

  findClosestCell(unit: Unit, cells: Cell[]) {
    let closest = cells[ 0 ]
    if (closest) {
      let distance = Infinity
      for (let cell of cells) {
        const cellDistance = cell.pos.squareDistance(unit.cell?.pos ?? ex.vec(0, 0))
        if (cellDistance < distance) {
          closest = cell
          distance = cellDistance
        }
      }
      return closest
    }
    return null
  }

  findAttackableTargets(unit: Unit): Cell[] {
    this.selectionManger.selectUnit(unit, "attack")
    const attackRange = this.selectionManger.findAttackRange(unit)
    return attackRange.filter(node => {
      if (node.owner) {
        const cell = node.owner as Cell
        if (cell.unit) {
          return cell.unit.player !== this
        }
      }
      return false
    }).map(node => node.owner as Cell)
  }

  async maybeAttack(unit: Unit, closestEnemy: Unit) {
    let attacked = false
    const possibleTargets = this.findAttackableTargets(unit)
    if (possibleTargets.length > 0) {
      const currentRange = possibleTargets.map(c => c.pathNode)
      this.selectionManger.showHighlight(currentRange, 'attack')
      await ex.Util.delay(ENEMY_SPEED)

      this.selectionManger.showHighlight([ closestEnemy.cell!.pathNode ], 'path')
      await ex.Util.delay(ENEMY_SPEED)

      await unit.attack(closestEnemy)
      attacked = true
    }

    return attacked
  }

  override async makeMove(): Promise<boolean> {
    const enemyUnits = this.board.getUnits().filter(u => u.player !== this)

    const units = this.board.getUnits().filter(u => u.player === this)


    for (let unit of units) {
      await ex.Util.delay(ENEMY_SPEED)

      let range: PathNodeComponent[] = []
      if (unit.cell) {
        range = this.board.pathFinder.getRange(unit.cell.pathNode, this.mask, unit.unitConfig.movement)
      }

      let validCells = this.findValidMoveCells(unit)

      const closestEnemy = this.findClosestEnemy(unit)

      if (closestEnemy) {
        const attacked = await this.maybeAttack(unit, closestEnemy)

        const closestCell = this.findClosestCell(closestEnemy, validCells)

        if (!attacked) {
          this.selectionManger.selectUnit(unit, 'move')
          await ex.Util.delay(ENEMY_SPEED)

          const currentPath = this.selectionManger.findPath(closestCell!, range)
          this.selectionManger.showHighlight(currentPath, 'path')
          await ex.Util.delay(ENEMY_SPEED)

          await this.selectionManger.selectDestinationAndMove(unit, closestCell!)
          await ex.Util.delay(ENEMY_SPEED)

          await this.maybeAttack(unit, closestEnemy)
        }
        this.selectionManger.reset()
      }
    }

    return true
  }

  lose() {
    this.active = false
    const computerUnits = this.board.getUnits().filter(u => u.player instanceof ComputerPlayer)
    computerUnits.forEach(u => {
      u.health = 0
      u.cell?.removeUnit(u)
    })
  }
}