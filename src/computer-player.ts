import * as ex from 'excalibur'
import { Player } from './player'
import type { SelectionManager } from './selection-manager'
import type { Board } from './board'
import { ENEMY_SPEED } from './config'
import type { PathNodeComponent } from './path-finding/path-node-component'
import type { Cell } from './cell'
import type { Unit } from './unit'

interface ActionPlan {
  type: 'attack' | 'move' | 'flee' | 'wait'
  score: number
  target?: Unit
  destination?: Cell
  path?: PathNodeComponent[]
}

export class ComputerPlayer extends Player {
  public override active = false

  constructor(name: string, private selectionManger: SelectionManager, board: Board) {
    super(name, board)
    this.selectionManger = selectionManger
  }

  override async turnStart() {
    this.active = true
    const units = this.board.getUnits().filter(unit => unit.player instanceof ComputerPlayer && unit.player === this)
    for (const unit of units) {
      unit.reset()
    }
  }

  override async turnEnd() {
    this.active = false
  }

  findValidMoveCells(unit: Unit): Cell[] {
    if (!unit.cell) return []
    const range = this.board.pathFinder.getRange(unit.cell.pathNode, this.mask, unit.unitConfig.movement, unit.name)
    return range
      .filter(node => (node.owner as Cell).unit?.player !== this)
      .map(node => node.owner as Cell)
  }

  findClosestCell(unit: Unit, cells: Cell[]) {
    let closest = null
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

  findAttackableTargets(unit: Unit): PathNodeComponent[] {
    this.selectionManger.selectUnit(unit, 'attack')
    const attackRange = this.selectionManger.findAttackRange(unit)
    return attackRange.filter(node => {
      const cell = node.owner as Cell
      return cell.unit && cell.unit.player !== this
    })
  }

  async maybeAttack(unit: Unit, target: Unit) {
    const possibleTargets = this.findAttackableTargets(unit)
    const match = possibleTargets.find(enemy => enemy.owner?.name === target.cell?.name)
    if (!match) return false

    this.selectionManger.showHighlight([(target.cell ?? {} as Cell).pathNode], 'attack')
    await ex.Util.delay(ENEMY_SPEED * 2)
    await unit.attack(target)
    this.selectionManger.reset()
    return true
  }

  evaluateAttack(unit: Unit, target: Unit): number {
    const damagePotential = unit.unitConfig.attack - target.unitConfig.defense
    const estimated = damagePotential > 0 ? damagePotential : 1
    if (target.health <= estimated) return 1000 // prioridade máxima
    return (estimated * 3) + (target.unitConfig.health - target.health)
  }

  evaluateMove(unit: Unit, destination: Cell): number {
    const enemies = this.board.getUnits().filter(enemy => enemy.player !== this && enemy.cell)
    const closest = this.findClosestCell(destination.unit ?? unit, enemies.map(e => e.cell) as Cell[])
    if (!closest) return 0
    const dist = destination.pos.squareDistance(closest.pos)
    return 100 / (dist + 1)
  }

  evaluateFlee(unit: Unit, destination: Cell): number {
    const enemies = this.board.getUnits().filter(enemy => enemy.player !== this && enemy.cell)
    const closest = this.findClosestCell(destination.unit ?? unit, enemies.map(e => e.cell) as Cell[])
    if (!closest) return 0
    const dist = destination.pos.squareDistance(closest.pos)
    const healthRatio = unit.health / unit.unitConfig.health
    return healthRatio < 0.4 ? dist * 1.5 : -100
  }

  evaluateAction(unit: Unit, action: ActionPlan): number {
    switch (action.type) {
    case 'attack': return action.target ? this.evaluateAttack(unit, action.target) : 0
    case 'move': return action.destination ? this.evaluateMove(unit, action.destination) : 0
    case 'flee': return action.destination ? this.evaluateFlee(unit, action.destination) : 0
    case 'wait': return -10
    }
  }

  shouldFlee(unit: Unit): boolean {
    const ownUnits = this.board.getUnits().filter(u => u.player === this)
    const enemyUnits = this.board.getUnits().filter(u => u.player !== this)
    const isLowHealth = unit.health < unit.unitConfig.health * 0.4
    const isOutnumbered = (ownUnits.length + 1) < enemyUnits.length
    return isLowHealth && isOutnumbered
  }

  async decideActionForUnit(unit: Unit): Promise<void> {
    const executedTypes = new Set<string>()

    const generateAndEvaluateActions = async (): Promise<ActionPlan[]> => {
      const actions: ActionPlan[] = []
      const attackTargets = this.findAttackableTargets(unit)
      const validCells = this.findValidMoveCells(unit)

      if (!unit.attacked) {
        if (attackTargets.length > 0) {
          const unitPos = unit.cell?.pos ?? ex.vec(0, 0)
          const enemyCells = attackTargets
            .map(node => node.owner as Cell)
            .filter(cell => {
              if (!cell.unit) return false
              const pos = cell.pos
              return pos.x === unitPos.x || pos.y === unitPos.y // só linha ou coluna
            })
  
          const closest = this.findClosestCell(unit, enemyCells)
          if (closest?.unit) {
            actions.push({ type: 'attack', score: 0, target: closest.unit })
          }
        }
      }

      if (!unit.moved) {
        for (const cell of validCells) {
          const range = this.board.pathFinder.getRange((unit.cell ?? {} as Cell).pathNode, this.mask, unit.unitConfig.movement, unit.name)
          const path = this.selectionManger.findPath(cell, range, unit.name)
          if (path.length > 0) {
            actions.push({ type: 'move', score: 0, destination: cell, path })
          }
        }

        await ex.Util.delay(ENEMY_SPEED)
  
        if (this.shouldFlee(unit)) {
          for (const cell of validCells) {
            const range = this.board.pathFinder.getRange((unit.cell ?? {} as Cell).pathNode, this.mask, unit.unitConfig.movement, unit.name)
            const path = this.selectionManger.findPath(cell, range, unit.name)
            if (path.length > 0) {
              actions.push({ type: 'flee', score: 0, destination: cell, path })
            }
          }
        }
      }

      actions.push({ type: 'wait', score: -10 })

      for (const action of actions) {
        action.score = this.evaluateAction(unit, action)
      }

      return actions.sort((a, b) => b.score - a.score)
    }

    const executeAction = async (action: ActionPlan): Promise<boolean> => {
      switch (action.type) {
      case 'attack':
        if (!unit.attacked && action.target) {
          return await this.maybeAttack(unit, action.target)
        }
        break
      case 'move':
      case 'flee':
        if (!unit.moved && action.destination && action.path) {
          this.selectionManger.showHighlight(action.path, 'path')
          await ex.Util.delay(ENEMY_SPEED + ENEMY_SPEED)
          await this.selectionManger.selectDestinationAndMove(unit, action.destination)
          return true
        }
        break
      case 'wait':
        return true
      }
      return false
    }

    for (let i = 0; i < 2; i++) {
      const actions = (await generateAndEvaluateActions()).filter(a => !executedTypes.has(a.type))
      if (actions.length === 0 || actions.every(a => a.score <= 0)) {
        break
      }
      const action = actions[0]
      const success = await executeAction(action!)
      if (success) {
        executedTypes.add(action!.type)

      }
      if (unit.attacked && unit.moved) break
    }

    this.selectionManger.reset()
    unit.pass()
  }

  override async makeMove(): Promise<boolean> {
    const units = this.board.getUnits().filter(u => u.player === this)
    await ex.Util.delay(150)
    units.sort((a, b) => b.health - a.health)

    for (const unit of units) {
      await this.decideActionForUnit(unit)
      await ex.Util.delay(ENEMY_SPEED)
    }

    await ex.Util.delay(ENEMY_SPEED)
    return true
  }
}
