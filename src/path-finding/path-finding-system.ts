import * as ex from 'excalibur'
import { PathNodeComponent } from "./path-node-component"

export class PathFinder {
  query: ex.Query<typeof PathNodeComponent>

  constructor(scene: ex.Scene) {
    this.query = scene.world.queryManager.createQuery([PathNodeComponent])
  }

  pos_x: string | undefined = undefined
  pos_y: string | undefined = undefined
  name_unit: string | undefined = undefined

  heuristicWeight = 1
  heuristic: (start: PathNodeComponent, end: PathNodeComponent) => number = (start: PathNodeComponent, end: PathNodeComponent) => {
    // manhattan distance
    return Math.abs(start.pos.x - end.pos.x) + Math.abs(start.pos.y - end.pos.y)
  }

  private _buildPath(currentNode: PathNodeComponent) {
    const path: PathNodeComponent[] = []
    while (currentNode.previousNode) {
      path.unshift(currentNode)
      currentNode = currentNode.previousNode
    }
    path.unshift(currentNode)
    return path
  }

  private _getRangeHelperAttack(cell: PathNodeComponent, accum: PathNodeComponent[], mask: number, range: number) {
    if (range >= 0) {
      let newRange
      const unitName = this.name_unit
      const startX = this.pos_x
      const startY = this.pos_y

      const name = cell.owner?.name as string
      const x = this.getXOrYByNameCell(name, 'x')
      const y = this.getXOrYByNameCell(name, 'y')

      accum.push(cell)
      cell.connections.filter(node => node.isAttackable && !!(node.walkableMask & mask) && (startY == y || startX == x)).forEach(cell => {
        newRange = cell.isFast ? 1 : 2
        if (!cell.isFast && unitName !== 'Archer' && unitName !== 'Mage' && unitName !== 'Spearman') {
          newRange = 1
        }

        this._getRangeHelperAttack(cell, accum, mask, range - newRange)
      })
    }
  }

  getXOrYByNameCell(name: string, direction: 'x' | 'y'): string {
    if (direction === 'x') {
      return name.split(' ')[1].split(')')[0]
    } else {
      return name.split(',')[0].split('(')[1]
    }
  }

  getNameUnit(name: string): string {
    return name.replace(/[AB]$/, '')
  }

  getRangeAttack(start: PathNodeComponent, mask: number, range: number, unitName: string): PathNodeComponent[] {
    let result: PathNodeComponent[] = []
    if (start.isDoor) {
      return result
    }
    const name = start.owner?.name as string
    const x = this.getXOrYByNameCell(name, 'x')
    const y = this.getXOrYByNameCell(name, 'y')

    this.name_unit = this.getNameUnit(unitName)
    this.pos_x = x
    this.pos_y = y

    this._getRangeHelperAttack(start, result, mask, range)

    result = Array.from(new Set(result))
    result = result.filter(node => node.isAttackable && (this.getXOrYByNameCell(node.owner?.name as string, 'x') === x || this.getXOrYByNameCell(node.owner?.name as string, 'y') === y))
    result = result.filter(node => {
      if (this.name_unit !== 'Archer' && this.name_unit !== 'Mage') {
        return !node.isWater
      }
      return true
    })
    result = result.filter(node => !node.isDoor)

    this.name_unit = undefined
    this.pos_x = undefined
    this.pos_y = undefined

    return result
  }

  private _getRangeHelper(cell: PathNodeComponent, accum: PathNodeComponent[], mask: number, range: number): void {
    if (range < 0) return
    const unitName = this.name_unit

    accum.push(cell)
    cell.connections.filter(node => node.isWalkable && !!(node.walkableMask & mask)).forEach(connection => {
      const newRange = connection.isFast ? 1 : unitName == 'Thief' && !connection.isDoor ? 1 : 2
      this._getRangeHelper(connection, accum, mask, range - newRange)
    })
  }

  getRange(start: PathNodeComponent, mask: number, range: number, unitName: string): PathNodeComponent[] {
    let result: PathNodeComponent[] = []
    
    this.name_unit = this.getNameUnit(unitName)
    this._getRangeHelper(start, result, mask, range)
    this.name_unit = undefined

    result = Array.from(new Set(result))
    result = result.filter(node => node.isWalkable)
    return result
  }

  /**
   * 
   * @param start start node for the path
   * @param end end node for the path
   * @param mask bit mask to test against the node's walkability mask, same bit position means walkable (0b111 & 0b001) = walkable, (0b010 & 0b001) = not walkable
   * @param range 
   * @returns 
   */
  findPath(start: PathNodeComponent, end: PathNodeComponent, mask: number, range?: PathNodeComponent[]): PathNodeComponent[] {
    const nodes = this.query.getEntities().map(n => n.get(PathNodeComponent)) as PathNodeComponent[]
    nodes.forEach(node => {
      node.gScore = 0
      node.hScore = 0
      node.previousNode = null
    })

    start.gScore = 0
    start.hScore = start.gScore + this.heuristic(start, end) * this.heuristicWeight
    start.direction = ex.Vector.Down

    const openNodes: PathNodeComponent[] = [start]
    const closedNodes: PathNodeComponent[] = []

    while (openNodes.length > 0) {
      const priorityNodes = openNodes.sort((a, b) => {
        return a.hScore - b.hScore
      })

      const current = priorityNodes[0]

      if (current === end) {
        return this._buildPath(current)
      }

      const index = openNodes.indexOf(current)
      openNodes.splice(index, 1)
      closedNodes.push(current)

      let neighbors = current.connections.filter(node => {
        return node.isWalkable && !!(node.walkableMask & mask)
      }).filter(node => {
        return closedNodes.indexOf(node) === -1
      })

      if (range) {
        neighbors = neighbors.filter(node => range.indexOf(node) > -1)
      }

      let currentDirection = current.direction

      neighbors.forEach((node) => {
        if (openNodes.indexOf(node) === -1) {
          node.previousNode = current
          node.gScore = node.weight + current.gScore
          node.hScore = node.gScore + this.heuristic(node, end) * this.heuristicWeight

          const newDirection = node.pos.sub(current.pos).normalize()
          node.direction = newDirection
          const inline = currentDirection.dot(newDirection)
          if (inline === 0.0) {
            node.hScore += 130.0
          }

          openNodes.push(node)
        }
      })
    }

    return []
  }
}