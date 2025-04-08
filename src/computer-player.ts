import * as ex from 'excalibur'
import { Player } from './player'
import { SelectionManager } from './selection-manager'
import { Board } from './board'
import { ENEMY_SPEED } from './config'
import { PathNodeComponent } from './path-finding/path-node-component'
import { Cell } from './cell'
import { Unit } from './unit'

export class ComputerPlayer extends Player {
  public active = false
  constructor(name: string, private selectionManger: SelectionManager, board: Board) {
    super(name, board)
    this.selectionManger = selectionManger
  }

  override async turnStart(): Promise<void> {
    this.active = true
    let units = this.board.getUnits()
    units = units.filter(u => u.player === this)
    units.forEach(u => u.reset())
  }
  override async turnEnd(): Promise<void> {
    this.active = false
  }

  async findClosestEnemy(unit: Unit): Promise<Unit | null> {
    let enemyCells = await this.board.getUnits()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      range = this.board.pathFinder.getRange(unit.cell.pathNode, this.mask, unit.unitConfig.movement, unit.name).filter(node => {
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
      for (const cell of cells) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findAttackableTargets(unit: Unit): PathNodeComponent<any>[] {
    this.selectionManger.selectUnit(unit, 'attack')
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
    if (possibleTargets.length > 0 && possibleTargets.find(enemy => enemy.owner?.name === closestEnemy.cell?.name)) {
      const currentRange = possibleTargets
      this.selectionManger.showHighlight(currentRange, 'attack')
      await ex.Util.delay(ENEMY_SPEED)

      this.selectionManger.showHighlight([(closestEnemy.cell ?? {} as Cell).pathNode], 'path')
      await ex.Util.delay(ENEMY_SPEED)

      await unit.attack(closestEnemy)

      attacked = true
    }
    this.selectionManger.reset()
    return attacked
  }

  override async makeMove(): Promise<boolean> {
    let units = this.board.getUnits()
    await ex.Util.delay(150)

    units = units.filter(u => u.player === this)

    for (const unit of units) {
      let range: PathNodeComponent[] = []
      if (unit.cell) {
        range = this.board.pathFinder.getRange(unit.cell.pathNode, this.mask, unit.unitConfig.movement, unit.name)
      }

      const validCells = this.findValidMoveCells(unit)

      const closestEnemy = await this.findClosestEnemy(unit)

      if (closestEnemy) {
        const attacked = await this.maybeAttack(unit, closestEnemy)

        if (!attacked) {
          const closestCell = this.findClosestCell(closestEnemy, validCells)
          this.selectionManger.selectUnit(unit, 'move')

          const currentPath = this.selectionManger.findPath(closestCell ?? {} as Cell, range)
          this.selectionManger.showHighlight(currentPath, 'path')
          await ex.Util.delay(ENEMY_SPEED)

          await this.selectionManger.selectDestinationAndMove(unit, closestCell ??  {} as Cell)
          await ex.Util.delay(ENEMY_SPEED)

          await this.maybeAttack(unit, closestEnemy)
        }
        this.selectionManger.reset()
      }
      await unit.pass()
    }
    await ex.Util.delay(ENEMY_SPEED)
    return true
  }
}