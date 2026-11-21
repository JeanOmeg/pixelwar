import * as ex from 'excalibur'

export class PathNodeComponent extends ex.Component {
  static type = 'path-node' as const
  readonly type = 'path-node' as const
  /**
   * Is this path node traversable by anything at all?
   */
  isWalkable = true
  isFast = true
  isAttackable = true
  isDoor = false
  isWater = false
  /** Slippery ice: costs 2 to enter (except for sure-footed units), -2 DEF, open for attacks */
  isIce = false
  /**
   * Who can pass through this node: -1 when empty, otherwise the mask of the
   * player whose unit is standing here (32-bit mask)
   */
  walkableMask: number = -1

  connections: PathNodeComponent[] = []

  pos: ex.Vector
  /** Grid coordinates */
  x: number
  y: number

  constructor(pos: ex.Vector, x: number, y: number) {
    super()
    this.pos = pos
    this.x = x
    this.y = y
  }

  get isOccupied(): boolean {
    return this.walkableMask !== -1
  }
}
