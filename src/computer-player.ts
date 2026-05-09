import * as ex from 'excalibur'
import { Player } from './player'
import type { SelectionManager } from './selection-manager'
import type { Board } from './board'
import { ENEMY_SPEED } from './config'
import type { PathNodeComponent } from './path-finding/path-node-component'
import type { Cell } from './cell'
import type { Unit } from './unit'

interface ActionPlan {
  type: 'attack' | 'move' | 'flee' | 'wait' | 'moveAndAttack' | 'skillRun' | 'skillSpecialAttack'
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
    }).sort((a, b) => ((a.owner as Cell).unit as Unit).health - ((b.owner as Cell).unit as Unit).health)
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
    const estimated = damagePotential > 0 ? damagePotential + 6 : 6
    if (target.health <= estimated) return 1000
    return (estimated * 3) + (target.unitConfig.health - target.health)
  }

  evaluateCriticalAttack(unit: Unit, target: Unit): number {
    const critDamage = Math.max((12 + unit.unitConfig.attack) - target.unitConfig.defense, 1)
    const damagePotential = unit.unitConfig.attack - target.unitConfig.defense
    const estimatedNormal = damagePotential > 0 ? damagePotential + 6 : 6
    const critKills = target.health <= critDamage
    const normalKills = target.health <= estimatedNormal
    if (critKills && !normalKills) return 1200  // unique kill — worth the 4 MP
    if (critKills && normalKills) return -1      // normal attack already kills, save MP
    return -1                                    // no kill either way, not worth 4 MP
  }

  findAttackableFromCell(fromCell: Cell, unit: Unit): Unit[] {
    const range = this.board.pathFinder.getRangeAttack(
      fromCell.pathNode,
      ~this.mask,
      unit.unitConfig.range,
      unit.name
    )
    return range
      .map(node => (node.owner as Cell).unit)
      .filter((u): u is Unit => !!u && u.player !== this)
      .sort((a, b) => this.evaluateAttack(unit, b) - this.evaluateAttack(unit, a))
  }

  evaluateMove(unit: Unit, destination: Cell, flee = false): number {
    const enemies = this.board.getUnits().filter(enemy => enemy.player !== this && enemy.cell)
    const closest = this.findClosestCell(destination.unit ?? unit, enemies.map(e => e.cell) as Cell[])
    if (!closest) return 0
    const dist = destination.pos.squareDistance(closest.pos)

    if (flee) return dist * 1.5

    const canAttackFromHere = this.findAttackableFromCell(destination, unit).length > 0
    return 100 / (dist + 1) + (canAttackFromHere ? 200 : 0)
  }

  evaluateAction(unit: Unit, action: ActionPlan): number {
    switch (action.type) {
    case 'attack': {
      if (!action.target) return 0
      const rangeBonus = unit.unitConfig.range > 1 ? 60 : 0
      return this.evaluateAttack(unit, action.target) + rangeBonus
    }
    case 'skillSpecialAttack':
      return action.target ? this.evaluateCriticalAttack(unit, action.target) : 0
    case 'skillRun':
      return action.destination ? this.evaluateMove(unit, action.destination) - 15 : 0
    case 'moveAndAttack': {
      const attackScore = action.target ? this.evaluateAttack(unit, action.target) : 0
      const moveScore = action.destination ? this.evaluateMove(unit, action.destination) : 0
      return attackScore + moveScore * 0.2
    }
    case 'move': return action.destination ? this.evaluateMove(unit, action.destination) : 0
    case 'flee': return action.destination ? this.evaluateMove(unit, action.destination, true) : 0
    case 'wait': return -10
    }
  }

  shouldFlee(unit: Unit): boolean {
    const ownUnits = this.board.getUnits().filter(u => u.player === this)
    const enemyUnits = this.board.getUnits().filter(u => u.player !== this)
    const isLowHealth = unit.health < unit.unitConfig.health * 0.2
    const isOutnumbered = ownUnits.length < enemyUnits.length
    return isLowHealth && isOutnumbered
  }

  async decideActionForUnit(unit: Unit): Promise<void> {
    const executedTypes = new Set<string>()

    const generateAndEvaluateActions = async (): Promise<ActionPlan[]> => {
      const actions: ActionPlan[] = []
      const attackTargets = this.findAttackableTargets(unit)
      const validCells = this.findValidMoveCells(unit)

      if (!unit.attacked && attackTargets.length > 0) {
        const targets = attackTargets.map(node => (node.owner as Cell).unit!).filter(Boolean)
        const bestTarget = targets.reduce((best, t) =>
          this.evaluateAttack(unit, t) > this.evaluateAttack(unit, best) ? t : best
        )
        actions.push({ type: 'attack', score: 0, target: bestTarget })

        if (unit.canUseSkill('skill-special-attack')) {
          const specialTarget = targets.reduce((best, t) =>
            this.evaluateCriticalAttack(unit, t) > this.evaluateCriticalAttack(unit, best) ? t : best
          )
          actions.push({ type: 'skillSpecialAttack', score: 0, target: specialTarget })
        }
      }

      if (!unit.moved) {
        await ex.Util.delay(ENEMY_SPEED)

        if (unit.canUseSkill('skill-run')) {
          const normalRange = this.board.pathFinder.getRange(
            (unit.cell ?? {} as Cell).pathNode, this.mask, unit.unitConfig.movement, unit.name
          )
          const normalNames = new Set(normalRange.map(n => n.owner?.name))
          const doubleRange = this.board.pathFinder.getRange(
            (unit.cell ?? {} as Cell).pathNode, this.mask, unit.unitConfig.movement * 2, unit.name
          )
          const runCells = doubleRange
            .filter(n => !normalNames.has(n.owner?.name) && (n.owner as Cell).unit?.player !== this)
            .map(n => n.owner as Cell)

          for (const cell of runCells) {
            const path = this.selectionManger.findPath(cell, doubleRange, unit.name)
            if (path.length === 0) continue
            actions.push({ type: 'skillRun', score: 0, destination: cell, path })
          }
        }

        const flee = this.shouldFlee(unit)
        for (const cell of validCells) {
          const range = this.board.pathFinder.getRange((unit.cell ?? {} as Cell).pathNode, this.mask, unit.unitConfig.movement, unit.name)
          const path = this.selectionManger.findPath(cell, range, unit.name)
          if (path.length === 0) continue

          if (flee) {
            actions.push({ type: 'flee', score: 0, destination: cell, path })
          } else if (!unit.attacked) {
            const targetsFromDest = this.findAttackableFromCell(cell, unit)
            if (targetsFromDest.length > 0) {
              actions.push({ type: 'moveAndAttack', score: 0, destination: cell, path, target: targetsFromDest[0] })
            } else {
              actions.push({ type: 'move', score: 0, destination: cell, path })
            }
          } else {
            actions.push({ type: 'move', score: 0, destination: cell, path })
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
      case 'skillSpecialAttack':
        if (unit.canUseSkill('skill-special-attack') && action.target) {
          unit.mp -= 4
          unit.forcesCritical = true
          unit.usedSkill = true
          return await this.maybeAttack(unit, action.target)
        }
        break
      case 'skillRun':
        if (unit.canUseSkill('skill-run') && action.destination && action.path) {
          unit.mp -= 2
          unit.isRunning = true
          unit.usedSkill = true
          this.selectionManger.showHighlight(action.path, 'path')
          await ex.Util.delay(ENEMY_SPEED + ENEMY_SPEED)
          await this.selectionManger.selectDestinationAndMove(unit, action.destination)
          unit.isRunning = false
          if (!unit.moved) {
            unit.mp += 2
            unit.usedSkill = false
          }
          return true
        }
        break
      case 'moveAndAttack':
        if (!unit.moved && action.destination && action.path) {
          this.selectionManger.showHighlight(action.path, 'path')
          await ex.Util.delay(ENEMY_SPEED + ENEMY_SPEED)
          await this.selectionManger.selectDestinationAndMove(unit, action.destination)
          if (!unit.attacked && action.target) {
            await this.maybeAttack(unit, action.target)
          }
          return true
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

    while(!unit.attacked || !unit.moved) {
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
    units.sort((a, b) => a.health - b.health)

    for (const unit of units) {
      await this.decideActionForUnit(unit)
      await ex.Util.delay(ENEMY_SPEED)
    }

    await ex.Util.delay(ENEMY_SPEED)
    return true
  }
}
