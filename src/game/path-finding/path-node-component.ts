import * as ex from 'excalibur'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class PathNodeComponent<T = any> extends ex.Component {
  static type = 'path-node' as const
  readonly type = 'path-node'
  pos = ex.vec(0, 0)
  /**
   * False, não atravessa
   */
  isWalkable = true
  /**
   * False, terreno lento
   */
  isFast = true
  /**
   * False, não pode atacar
   */
  isAttackable = true
  /**
   * True, não pode atacar, terreno lento
   */
  isDoor = false
  /**
   * True, não atravessa, mas ataque a distancia pode atacar
   */
  isWater = false
  /**
   * Is this path node traversable by certain things
   */
  walkableMask = -1 // 32-bit mask
  constructor(pos: ex.Vector) {
    super()
    this.pos = pos
  }

  gScore = Infinity
  hScore = Infinity
  weight = 1
  data?: T
  direction: ex.Vector = ex.Vector.Zero

  connections: PathNodeComponent<T>[] = []

  previousNode: PathNodeComponent<T> | null = null
}
