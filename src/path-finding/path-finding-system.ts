import { PathNodeComponent } from './path-node-component'
import { getTerrainRules, TerrainRules } from './terrain-rules'

/** Direction index used only as the start state (no previous step) */
const NO_DIRECTION = 4
/** Priority = cost * COST_WEIGHT + turns, so turns only break ties between equal costs */
const COST_WEIGHT = 1000

interface SearchState {
  node: PathNodeComponent
  dir: number
  cost: number
  turns: number
  prev: SearchState | null
}

const priorityOf = (s: SearchState) => s.cost * COST_WEIGHT + s.turns

function directionIndex(from: PathNodeComponent, to: PathNodeComponent): number {
  if (to.y < from.y) return 0
  if (to.y > from.y) return 1
  if (to.x > from.x) return 2
  return 3
}

/** Binary heap of search states ordered by `priorityOf` */
class StateHeap {
  private items: SearchState[] = []

  private key(state: SearchState) {
    return priorityOf(state)
  }

  get size() {
    return this.items.length
  }

  push(item: SearchState) {
    const items = this.items
    items.push(item)
    let i = items.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.key(items[parent]) <= this.key(items[i])) break
      [items[parent], items[i]] = [items[i], items[parent]]
      i = parent
    }
  }

  pop(): SearchState | undefined {
    const items = this.items
    if (items.length === 0) return undefined
    const top = items[0]
    const last = items.pop() as SearchState
    if (items.length > 0) {
      items[0] = last
      let i = 0
      for (;;) {
        const left = i * 2 + 1
        const right = left + 1
        let smallest = i
        if (left < items.length && this.key(items[left]) < this.key(items[smallest])) smallest = left
        if (right < items.length && this.key(items[right]) < this.key(items[smallest])) smallest = right
        if (smallest === i) break
        [items[smallest], items[i]] = [items[i], items[smallest]]
        i = smallest
      }
    }
    return top
  }
}

/**
 * Result of a movement search from one node: which nodes are reachable within
 * the budget and the cheapest path (fewest turns on ties) to each of them.
 */
export class MovementMap {
  /** Nodes the unit can stop at: the start node plus every reachable empty node */
  readonly range: PathNodeComponent[]
  private readonly rangeSet: Set<PathNodeComponent>
  readonly start: PathNodeComponent
  private readonly best: Map<PathNodeComponent, SearchState>

  constructor(start: PathNodeComponent, best: Map<PathNodeComponent, SearchState>) {
    this.start = start
    this.best = best
    this.range = [...best.keys()].filter(node => node === start || !node.isOccupied)
    this.rangeSet = new Set(this.range)
  }

  canStopAt(node: PathNodeComponent): boolean {
    return this.rangeSet.has(node)
  }

  costTo(node: PathNodeComponent): number {
    return this.best.get(node)?.cost ?? Infinity
  }

  /**
   * Path from start to `end` (both included). Empty when `end` is unreachable
   * or occupied; `[start]` when `end` is the start node.
   */
  pathTo(end: PathNodeComponent): PathNodeComponent[] {
    if (!this.canStopAt(end)) return []
    const path: PathNodeComponent[] = []
    let state = this.best.get(end) ?? null
    while (state) {
      path.unshift(state.node)
      state = state.prev
    }
    return path
  }
}

export class PathFinder {
  /**
   * Movement cost of entering `node`: fast terrain 1, otherwise 2.
   * Units that ignore slow terrain (Thief) pay 1 anywhere except doors.
   */
  movementCost(node: PathNodeComponent, rules: TerrainRules): number {
    if (node.isFast) return 1
    if (rules.ignoresSlowTerrain && !node.isDoor) return 1
    return 2
  }

  /**
   * Range points spent when an attack crosses `node`: 1, or 2 on slow terrain
   * for units with `slowTerrainCostsRange` (Archer, Mage, Spearman).
   */
  attackCost(node: PathNodeComponent, rules: TerrainRules): number {
    return !node.isFast && rules.slowTerrainCostsRange ? 2 : 1
  }

  /**
   * Dijkstra over (node, direction) states. Orthogonal moves only.
   * Units can pass through nodes whose `walkableMask` matches `mask`
   * (empty tiles and allies) but never stop on an occupied node.
   *
   * @param mask the moving player's mask
   * @param budget movement points available
   */
  getMovementMap(start: PathNodeComponent, mask: number, budget: number, unitName: string): MovementMap {
    const rules = getTerrainRules(unitName)
    const bestByDirection = new Map<PathNodeComponent, number[]>()
    const best = new Map<PathNodeComponent, SearchState>()
    const open = new StateHeap()

    const startState: SearchState = { node: start, dir: NO_DIRECTION, cost: 0, turns: 0, prev: null }
    bestByDirection.set(start, [Infinity, Infinity, Infinity, Infinity, 0])
    open.push(startState)

    while (open.size > 0) {
      const state = open.pop() as SearchState
      const priority = priorityOf(state)
      if (priority > (bestByDirection.get(state.node) as number[])[state.dir]) continue

      // states pop in priority order, so the first one for a node is its best
      if (!best.has(state.node)) best.set(state.node, state)

      for (const next of state.node.connections) {
        if (!next.isWalkable || !(next.walkableMask & mask)) continue

        const cost = state.cost + this.movementCost(next, rules)
        if (cost > budget) continue

        const dir = directionIndex(state.node, next)
        const turns = state.turns + (state.dir !== NO_DIRECTION && state.dir !== dir ? 1 : 0)
        const nextState: SearchState = { node: next, dir, cost, turns, prev: state }

        let known = bestByDirection.get(next)
        if (!known) {
          known = [Infinity, Infinity, Infinity, Infinity, Infinity]
          bestByDirection.set(next, known)
        }
        const nextPriority = priorityOf(nextState)
        if (nextPriority < known[dir]) {
          known[dir] = nextPriority
          open.push(nextState)
        }
      }
    }

    return new MovementMap(start, best)
  }

  /** Nodes the unit can stop at, including the start node */
  getRange(start: PathNodeComponent, mask: number, budget: number, unitName: string): PathNodeComponent[] {
    return this.getMovementMap(start, mask, budget, unitName).range
  }

  /** Cheapest path within `budget`, or [] if `end` can't be reached */
  findPath(start: PathNodeComponent, end: PathNodeComponent, mask: number, budget: number, unitName: string): PathNodeComponent[] {
    return this.getMovementMap(start, mask, budget, unitName).pathTo(end)
  }

  /**
   * Attackable nodes in straight lines (same row or column) from `start`.
   * Each line stops at the first unit (enemies are included, allies are not),
   * at doors and at tiles that aren't attackable (walls, trees).
   * A unit standing on a door can't attack.
   *
   * @param mask nodes whose `walkableMask` matches are targetable; pass `~player.mask`
   * @param ignore node treated as empty, e.g. the attacker's current cell when
   * evaluating an attack from another position
   */
  getRangeAttack(start: PathNodeComponent, mask: number, range: number, unitName: string, ignore?: PathNodeComponent): PathNodeComponent[] {
    if (start.isDoor) return []
    const rules = getTerrainRules(unitName)
    const result: PathNodeComponent[] = []

    for (const first of start.connections) {
      const dx = first.x - start.x
      const dy = first.y - start.y
      let node: PathNodeComponent | undefined = first
      let remaining = range

      while (node) {
        if (!node.isAttackable || node.isDoor) break
        remaining -= this.attackCost(node, rules)
        if (remaining < 0) break

        const occupied = node.isOccupied && node !== ignore
        if (occupied && !(node.walkableMask & mask)) break

        if (!node.isWater || rules.targetsWater) result.push(node)
        if (occupied) break

        const current: PathNodeComponent = node
        node = current.connections.find(c => c.x === current.x + dx && c.y === current.y + dy)
      }
    }

    return result
  }
}
