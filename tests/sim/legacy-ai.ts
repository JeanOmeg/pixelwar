import { Player } from '../../src/player'
import type { Board } from '../../src/board'
import type { Cell } from '../../src/cell'
import type { Unit } from '../../src/unit'
import type { PathNodeComponent } from '../../src/path-finding/path-node-component'
import { AttackContext, PLAIN_ATTACK, forecastAttack } from '../../src/combat'
import { CLASS_SKILL, FIREBALL_SPLASH, FRENZY_ATK, SKILLS, SkillId } from '../../src/skills'
import { unitClassOf } from '../../src/unit-types'

/**
 * The AI as it was before src/ai/ (ComputerPlayer of 2026-11-17), kept only to
 * measure the new one against it in the simulation. Same scoring and loop; the
 * animated moves/attacks are replaced by instant ones.
 */

const SKILL_KILL_GAIN = 0.25
const SKILL_DAMAGE_GAIN = 2.5

interface ActionPlan {
  type: 'attack' | 'move' | 'flee' | 'wait' | 'moveAndAttack' | 'skillRun' | 'skillSpecialAttack'
  score: number
  target?: Unit
  destination?: Cell
  path?: PathNodeComponent[]
}

export class LegacyAi extends Player {
  constructor(name: string, board: Board) {
    super(name, board)
  }

  findClosestCell(unit: Unit, cells: Cell[]) {
    let closest = null
    let distance = Infinity
    for (const cell of cells) {
      if (!unit.cell) break
      const cellDistance = cell.pos.squareDistance(unit.cell.pos)
      if (cellDistance < distance) {
        closest = cell
        distance = cellDistance
      }
    }
    return closest
  }

  findAttackableTargets(unit: Unit): PathNodeComponent[] {
    if (!unit.cell) return []
    const attackRange = this.board.pathFinder.getRangeAttack(unit.cell.pathNode, ~unit.player.mask, unit.unitConfig.range, unit.name)
    return attackRange.filter(node => {
      const cell = node.owner as Cell
      return cell.unit && cell.unit.player !== this
    }).sort((a, b) => ((a.owner as Cell).unit as Unit).health - ((b.owner as Cell).unit as Unit).health)
  }

  maybeAttack(unit: Unit, target: Unit) {
    const match = this.findAttackableTargets(unit).find(node => node === target.cell?.pathNode)
    if (!match) return false
    if (!unit.usedSkill) this.maybeUseAttackSkill(unit, target)
    unit.attackInstant(target)
    unit.settlePendingSkill()
    return true
  }

  evaluateAttack(unit: Unit, target: Unit, context: AttackContext = unit.attackContext(target)): number {
    const forecast = forecastAttack(unit.combatStats(), target.combatStats(), context, target.health)
    let score = forecast.killChance * 1000 + (1 - forecast.killChance) * (forecast.expectedDamage * 3 + (target.unitConfig.health - target.health))
    if (forecast.killChance < 1 && target.canCounter(unit, context)) {
      const counter = forecastAttack(target.combatStats(), unit.combatStats(), PLAIN_ATTACK, unit.health)
      score -= (1 - forecast.killChance) * (counter.expectedDamage * 3 + counter.killChance * 400)
    }
    return score
  }

  evaluateCriticalAttack(unit: Unit, target: Unit): number {
    const normal = forecastAttack(unit.combatStats(), target.combatStats(), unit.attackContext(target), target.health)
    const critical = forecastAttack(unit.combatStats(), target.combatStats(), { ...unit.attackContext(target), forcesCritical: true }, target.health)
    if (critical.killChance - normal.killChance < 0.4) return -1
    return 1200 * critical.killChance
  }

  private contextWith(unit: Unit, target: Unit, skill: SkillId): AttackContext {
    const base = unit.attackContext(target)
    switch (skill) {
    case 'skill-aimed-shot': return { ...base, guaranteedHit: true }
    case 'skill-pierce': return { ...base, ignoreDefense: true }
    case 'skill-rage': return { ...base, bonusDamage: 3 }
    case 'skill-backstab': return { ...base, backAttack: true }
    default: return base
    }
  }

  private maybeUseAttackSkill(unit: Unit, target: Unit) {
    const id = CLASS_SKILL[unitClassOf(unit.name)]
    if (!unit.canUseSkill(id)) return
    const normal = forecastAttack(unit.combatStats(), target.combatStats(), unit.attackContext(target), target.health)
    let use = false
    switch (id) {
    case 'skill-aimed-shot':
    case 'skill-pierce':
    case 'skill-rage':
    case 'skill-backstab': {
      const boosted = forecastAttack(unit.combatStats(), target.combatStats(), this.contextWith(unit, target, id), target.health)
      use = boosted.killChance - normal.killChance >= SKILL_KILL_GAIN || boosted.expectedDamage - normal.expectedDamage >= SKILL_DAMAGE_GAIN
      break
    }
    case 'skill-frenzy': {
      const stats = unit.combatStats()
      const boosted = forecastAttack({ ...stats, attack: stats.attack + FRENZY_ATK }, target.combatStats(), unit.attackContext(target), target.health)
      use = boosted.killChance - normal.killChance >= SKILL_KILL_GAIN
      break
    }
    case 'skill-drain': use = unit.unitConfig.health - unit.health >= 3; break
    case 'skill-steal': use = target.mp >= 2; break
    case 'skill-pinning-shot': use = normal.killChance < 0.5 && target.unitConfig.range === 1; break
    case 'skill-fireball':
      use = !!target.cell && target.cell.getNeighbors().filter(c => c.unit && c.unit.player !== this).length > 0
        || normal.killChance < 1 && target.health <= FIREBALL_SPLASH
      break
    }
    if (use) unit.startSkill(id)
  }

  private threatsTo(unit: Unit): Unit[] {
    if (!unit.cell) return []
    const { x, y } = unit.cell
    return this.board.getUnits().filter(enemy => enemy.player !== this && enemy.cell &&
      Math.abs(enemy.cell.x - x) + Math.abs(enemy.cell.y - y) <= enemy.unitConfig.movement + enemy.unitConfig.range)
  }

  private useEndOfTurnSkill(unit: Unit) {
    if (unit.usedSkill || !unit.cell) return
    const id = CLASS_SKILL[unitClassOf(unit.name)]
    if (!unit.canUseSkill(id) || SKILLS[id].kind === 'attack') return
    const threatened = this.threatsTo(unit).length > 0
    switch (id) {
    case 'skill-guard':
    case 'skill-brace':
      if (threatened) unit.startSkill(id)
      break
    case 'skill-shield-wall': {
      const allies = unit.cell.getNeighbors().filter(c => c.unit?.player === this).length
      if (threatened && allies > 0) unit.startSkill(id)
      break
    }
    case 'skill-second-wind':
      if (unit.unitConfig.health - unit.health >= 4) unit.startSkill(id)
      break
    case 'skill-heal': {
      const target = unit.healTargets().sort((a, b) => (b.unitConfig.health - b.health) - (a.unitConfig.health - a.health))[0]
      if (target && target.unitConfig.health - target.health >= 5) unit.useSkillOn(id, target)
      break
    }
    }
  }

  findAttackableFromCell(fromCell: Cell, unit: Unit): Unit[] {
    const range = this.board.pathFinder.getRangeAttack(fromCell.pathNode, ~this.mask, unit.unitConfig.range, unit.name, unit.cell?.pathNode)
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
    case 'attack': return action.target ? this.evaluateAttack(unit, action.target) + (unit.unitConfig.range > 1 ? 60 : 0) : 0
    case 'skillSpecialAttack': return action.target ? this.evaluateCriticalAttack(unit, action.target) : 0
    case 'skillRun': return action.destination ? this.evaluateMove(unit, action.destination) - 15 : 0
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
    return unit.health < unit.unitConfig.health * 0.2 && ownUnits.length < enemyUnits.length
  }

  decideActionForUnit(unit: Unit) {
    const executedTypes = new Set<string>()

    const generate = (): ActionPlan[] => {
      const actions: ActionPlan[] = []
      const attackTargets = this.findAttackableTargets(unit)
      if (!unit.attacked && attackTargets.length > 0) {
        const targets = attackTargets.map(node => (node.owner as Cell).unit!).filter(Boolean)
        const bestTarget = targets.reduce((best, t) => this.evaluateAttack(unit, t) > this.evaluateAttack(unit, best) ? t : best)
        actions.push({ type: 'attack', score: 0, target: bestTarget })
        if (unit.canUseSkill('skill-special-attack')) {
          const specialTarget = targets.reduce((best, t) => this.evaluateCriticalAttack(unit, t) > this.evaluateCriticalAttack(unit, best) ? t : best)
          actions.push({ type: 'skillSpecialAttack', score: 0, target: specialTarget })
        }
      }
      if (!unit.moved && unit.cell) {
        const start = unit.cell.pathNode
        const moveMap = this.board.pathFinder.getMovementMap(start, this.mask, unit.unitConfig.movement, unit.name)
        if (unit.canUseSkill('skill-run')) {
          const runMap = this.board.pathFinder.getMovementMap(start, this.mask, unit.unitConfig.movement * 2, unit.name)
          for (const node of runMap.range) {
            if (moveMap.canStopAt(node)) continue
            const path = runMap.pathTo(node)
            if (path.length < 2) continue
            actions.push({ type: 'skillRun', score: 0, destination: node.owner as Cell, path })
          }
        }
        const flee = this.shouldFlee(unit)
        for (const node of moveMap.range) {
          const path = moveMap.pathTo(node)
          if (path.length < 2) continue
          const cell = node.owner as Cell
          if (flee) actions.push({ type: 'flee', score: 0, destination: cell, path })
          else if (!unit.attacked) {
            const targetsFromDest = this.findAttackableFromCell(cell, unit)
            if (targetsFromDest.length > 0) actions.push({ type: 'moveAndAttack', score: 0, destination: cell, path, target: targetsFromDest[0] })
            else actions.push({ type: 'move', score: 0, destination: cell, path })
          } else actions.push({ type: 'move', score: 0, destination: cell, path })
        }
      }
      actions.push({ type: 'wait', score: -10 })
      for (const action of actions) action.score = this.evaluateAction(unit, action)
      return actions.sort((a, b) => b.score - a.score)
    }

    const execute = (action: ActionPlan): boolean => {
      switch (action.type) {
      case 'attack': return !unit.attacked && !!action.target && this.maybeAttack(unit, action.target)
      case 'skillSpecialAttack': return !!action.target && unit.startSkill('skill-special-attack') && this.maybeAttack(unit, action.target)
      case 'skillRun':
        if (action.path && unit.startSkill('skill-run')) {
          unit.moveInstant(action.path)
          unit.settlePendingSkill()
          return true
        }
        return false
      case 'moveAndAttack':
        if (!unit.moved && action.path) {
          unit.moveInstant(action.path)
          if (!unit.attacked && action.target) this.maybeAttack(unit, action.target)
          return true
        }
        return false
      case 'move':
      case 'flee':
        if (!unit.moved && action.path) {
          unit.moveInstant(action.path)
          return true
        }
        return false
      case 'wait': return true
      }
    }

    while (!unit.attacked || !unit.moved) {
      const actions = generate().filter(a => !executedTypes.has(a.type))
      if (actions.length === 0 || actions.every(a => a.score <= 0)) break
      const action = actions[0]
      const success = execute(action)
      executedTypes.add(action.type)
      if (!success) continue
      if (unit.attacked && unit.moved) break
      if (unit.health <= 0) break
    }
    if (unit.health > 0) this.useEndOfTurnSkill(unit)
    unit.pass()
  }

  async makeMove(): Promise<boolean> {
    const units = this.board.getUnits().filter(u => u.player === this).sort((a, b) => a.health - b.health)
    for (const unit of units) {
      if (unit.health <= 0 || !unit.cell) continue
      this.decideActionForUnit(unit)
    }
    return true
  }
}
