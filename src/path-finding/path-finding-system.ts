import * as ex from 'excalibur'
import { PathNodeComponent } from "./path-node-component"


export class PathFinder {
  query: ex.Query<typeof PathNodeComponent>

  constructor(scene: ex.Scene) {
    this.query = scene.world.queryManager.createQuery([PathNodeComponent])
  }

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
      const startX = localStorage.getItem('x')
      const startY = localStorage.getItem('y')
      const x = cell.owner?.name.split(' ')[1].split(')')[0]
      const y = cell.owner?.name.split(',')[0].split('(')[1]
      let newRange
      accum.push(cell)
      cell.connections.filter(node => node.isWalkable && !!(node.walkableMask & mask) && (startY == y || startX == x)).forEach(cell => {
        newRange = 1
        if (!cell.isFast) {
          newRange = 2
        }
        this._getRangeHelperAttack(cell, accum, mask, range - newRange)
      })
    }
  }

  getRangeAttack(start: PathNodeComponent, mask: number, range: number): PathNodeComponent[] {
    let result: PathNodeComponent[] = []
    const x = start.owner?.name.split(' ')[1].split(')')[0]
    const y = start.owner?.name.split(',')[0].split('(')[1]
    localStorage.setItem('x', x as string)
    localStorage.setItem('y', y as string)
    this._getRangeHelperAttack(start, result, mask, range)
    result = result.filter((node, index, nodeArray) => nodeArray.indexOf(node) === index)
    result = result.filter(node => node.isWalkable && (node.owner?.name.split(' ')[1].split(')')[0] == x || node.owner?.name.split(',')[0].split('(')[1] == y))
    localStorage.removeItem(x as string)
    localStorage.removeItem(y as string)
    return result
  }

  private _getRangeHelper(cell: PathNodeComponent, accum: PathNodeComponent[], mask: number, range: number) {
    if (range >= 0) {
      let newRange
      accum.push(cell)
      cell.connections.filter(node => node.isWalkable && !!(node.walkableMask & mask)).forEach(cell => {
        newRange = 1
        if (!cell.isFast) {
          newRange = 2
        }
        this._getRangeHelper(cell, accum, mask, range - newRange)
      })
    }
  }

  getRange(start: PathNodeComponent, mask: number, range: number): PathNodeComponent[] {
    let result: PathNodeComponent[] = []
    this._getRangeHelper(start, result, mask, range)
    result = result.filter((node, index, nodeArray) => nodeArray.indexOf(node) === index)
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