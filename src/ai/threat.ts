import type { Board } from '../board'
import type { Player } from '../player'
import type { Unit } from '../unit'
import type { PathNodeComponent } from '../path-finding/path-node-component'
import { AttackForecast, Facing, forecastAttack } from '../combat'
import { terrainDefense } from '../path-finding/terrain-rules'

/** Grid step of each facing */
export const STEP: Record<Facing, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }

/** Defense `unit` would have standing on `node` (skill bonuses + forest/ice), as Unit.combatStats */
export function defenseAt(unit: Unit, node: PathNodeComponent): number {
  return unit.unitConfig.defense + unit.defenseBonus + terrainDefense(node)
}

export interface Harm {
  /** Damage the enemies are expected to deal here next turn (strongest 3 attackers) */
  expected: number
  /** Rough chance of dying here next turn */
  death: number
  /** Enemies that can hit this tile */
  attackers: number
}

const NO_HARM: Harm = { expected: 0, death: 0, attackers: 0 }

/**
 * What the enemies of `player` can do on their next turn: for every tile,
 * which enemies can attack it (moving first, then attacking in a straight
 * line, by the real pathfinding rules), and where each enemy can stand.
 */
export class ThreatMap {
  private attackersAt = new Map<PathNodeComponent, Set<Unit>>()
  private standable = new Map<Unit, Set<PathNodeComponent>>()
  private forecasts = new Map<string, AttackForecast>()
  private harmCache = new Map<string, Harm>()

  constructor(private board: Board, player: Player, enemyRun = false) {
    for (const enemy of board.getUnits()) {
      if (enemy.player === player || !enemy.cell) continue
      const start = enemy.cell.pathNode
      const canRun = enemyRun && enemy.mp >= 2
      const budget = enemy.unitConfig.movement * (canRun ? 2 : 1)
      // a pinned unit can't move next turn
      const stops = enemy.pinned
        ? [start]
        : board.pathFinder.getMovementMap(start, enemy.player.mask, budget, enemy.name).range
      this.standable.set(enemy, new Set(stops))
      for (const stop of stops) {
        if (stop.isDoor) continue // units on doors can't attack
        const reachable = board.pathFinder.getRangeAttack(stop, ~enemy.player.mask, enemy.unitConfig.range, enemy.name, start)
        for (const node of reachable) {
          let set = this.attackersAt.get(node)
          if (!set) this.attackersAt.set(node, set = new Set())
          set.add(enemy)
        }
      }
    }
  }

  /** Enemies that can attack `node` next turn */
  threatsAt(node: PathNodeComponent): Unit[] {
    return [...(this.attackersAt.get(node) ?? [])]
  }

  /** Whether `enemy` can end its next move on `node` */
  canStand(enemy: Unit, node: PathNodeComponent): boolean {
    return this.standable.get(enemy)?.has(node) ?? false
  }

  /**
   * Whether `enemy` could hit a unit at `node` facing `facing` in the back:
   * it can stand somewhere on the line behind it, within its range.
   */
  canHitFromBehind(enemy: Unit, node: PathNodeComponent, facing: Facing): boolean {
    const [dx, dy] = STEP[facing]
    for (let i = 1; i <= enemy.unitConfig.range; i++) {
      const cell = this.board.getCell(node.x - dx * i, node.y - dy * i)
      if (!cell) return false
      if (this.canStand(enemy, cell.pathNode)) return true
      if (!cell.pathNode.isAttackable || (cell.unit && cell.unit !== enemy)) return false
    }
    return false
  }

  /** Expected damage and death risk for `unit` ending its turn on `node` facing `facing` */
  harmAt(unit: Unit, node: PathNodeComponent, facing: Facing): Harm {
    const attackers = this.attackersAt.get(node)
    if (!attackers || attackers.size === 0) return NO_HARM
    const key = `${unit.id}|${node.x},${node.y}|${facing}|${unit.health}`
    const cached = this.harmCache.get(key)
    if (cached) return cached

    const defense = defenseAt(unit, node)
    const hits = [...attackers].map(enemy => {
      const back = this.canHitFromBehind(enemy, node, facing)
      return this.forecast(enemy, defense, back, unit.health)
    }).sort((a, b) => b.expectedDamage - a.expectedDamage).slice(0, 3)

    const expected = hits.reduce((sum, f) => sum + f.expectedDamage, 0)
    const survivesEach = hits.reduce((p, f) => p * (1 - f.killChance), 1)
    // several hits together can kill even when none can alone
    const piled = Math.min(1, Math.max(0, (expected - unit.health * 0.75) / (unit.health * 0.5))) * 0.8
    const harm = { expected, death: Math.max(1 - survivesEach, piled), attackers: attackers.size }
    this.harmCache.set(key, harm)
    return harm
  }

  private forecast(enemy: Unit, defense: number, back: boolean, health: number): AttackForecast {
    const key = `${enemy.id}|${defense}|${back}|${health}`
    let forecast = this.forecasts.get(key)
    if (!forecast) {
      forecast = forecastAttack(enemy.combatStats(), { attack: 0, defense }, { forcesCritical: false, backAttack: back }, health)
      this.forecasts.set(key, forecast)
    }
    return forecast
  }
}
