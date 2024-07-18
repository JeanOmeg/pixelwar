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
    let units = await this.board.getUnits()
    units = units.filter(u => u.player === this)
    units.forEach(u => u.reset())
  }
  override async turnEnd(): Promise<void> {
    this.active = false
  }

  async findClosestEnemy(unit: Unit): Promise<Unit | null> {
    let enemyCells = await this.board.getUnits()
    enemyCells = enemyCells.filter(u => u.player !== this).map(u => u.cell).filter(c => !!c) as any
    const closestCell = this.findClosestCell(unit, enemyCells as unknown as Cell[])
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
    let closest = cells[0]
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

  findAttackableTargets(unit: Unit): PathNodeComponent<any>[] {
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
    })
  }

  async maybeAttack(unit: Unit, closestEnemy: Unit) {
    let attacked = false
    const possibleTargets = this.findAttackableTargets(unit)
    if (possibleTargets.length > 0 && possibleTargets.find(enemy => enemy.owner?.name == closestEnemy.cell?.name)) {
      const currentRange = possibleTargets
      this.selectionManger.showHighlight(currentRange, 'attack')
      await ex.Util.delay(ENEMY_SPEED)

      this.selectionManger.showHighlight([closestEnemy.cell!.pathNode], 'path')
      await ex.Util.delay(ENEMY_SPEED)

      await unit.attack(closestEnemy)
      await ex.Util.delay(150)

      attacked = true
    }
    this.selectionManger.reset()
    return attacked
  }

  override async makeMove(): Promise<boolean> {
    let units = await this.board.getUnits()
    await ex.Util.delay(150)

    units = units.filter(u => u.player === this)

    for (let unit of units) {
      let range: PathNodeComponent[] = []
      if (unit.cell) {
        range = this.board.pathFinder.getRange(unit.cell.pathNode, this.mask, unit.unitConfig.movement)
      }

      let validCells = this.findValidMoveCells(unit)

      const closestEnemy = this.findClosestEnemy(unit)

      if (closestEnemy) {
        const attacked = await this.maybeAttack(unit, closestEnemy as unknown as Unit)
        await ex.Util.delay(150)


        if (!attacked) {
          const closestCell = this.findClosestCell(closestEnemy as unknown as Unit, validCells)
          this.selectionManger.selectUnit(unit, 'move')

          const currentPath = this.selectionManger.findPath(closestCell!, range)
          this.selectionManger.showHighlight(currentPath, 'path')
          await ex.Util.delay(ENEMY_SPEED)

          await this.selectionManger.selectDestinationAndMove(unit, closestCell!)
          await ex.Util.delay(ENEMY_SPEED)

          await this.maybeAttack(unit, closestEnemy as unknown as Unit)
        }
        this.selectionManger.reset()
      }
      await unit.pass()
    }
    await ex.Util.delay(ENEMY_SPEED)
    return true
  }
}