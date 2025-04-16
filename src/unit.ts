import * as ex from 'excalibur'
import { Board } from './board'
import { Resources } from './resources'
import { SCALE, UNIT_CONFIG, UnitConfig, UnitType } from './config'
import { Cell } from './cell'
import { PathNodeComponent } from './path-finding/path-node-component'
import { Player } from './player'
import { DustParticles } from './dust-particles'
import { DamageManager } from './damage-manager'

export class Unit extends ex.Actor {
  cell: Cell | null = null
  unitConfig: UnitConfig
  moved = false
  attacked = false
  passed = false
  anim: ex.Animation
  miniDirection: string = 'right'
  oldPosition!: ex.Vector | null
  health: number
  damageManager!: DamageManager
  constructor(x: number, y: number, unitType: UnitType, board: Board, public player: Player) {
    super({
      name: unitType,
      anchor: ex.vec(0, 0),
      z: 2
    })
    this.unitConfig = { ...UNIT_CONFIG[unitType] }

    this.health = this.unitConfig.health

    this.anim = this.unitConfig.graphics.idle.clone()
    this.anim.scale = SCALE
    this.graphics.use(this.anim)
    this.player = player

    const cell = board.getCell(x, y)
    if (cell) {
      this.pos = cell.pos.sub(this.unitConfig.graphics.offset)
      cell.addUnit(this)
    }
  }

  onInitialize(engine: ex.Engine): void {
    this.damageManager = new DamageManager(engine.currentScene)
  }

  async onPostUpdate(): Promise<void> {
    const actions = this.hasActions()
    if (!actions) {
      this.anim.tint = ex.Color.Gray
    } else {
      this.anim.tint = ex.Color.White
    }

    if (this.health <= 0) {
      this.cell?.removeUnit(this)
      const deathAnim = new ex.ActionSequence(this, (ctx) => {
        this.setAnim(this.selectAnimationDeath())
        ctx.moveTo({ pos: this.pos, duration: 500, easing: ex.EasingFunctions.EaseInOutCubic })
      })
      await this.actions.runAction(deathAnim).toPromise()
      Resources.ExplosionSound.play()
      ex.Util.delay(600)
      this.actions.runAction(deathAnim).die()
      this.kill()
    }
  }

  async move(path: PathNodeComponent[]) {
    this.oldPosition = null
    const oldPos = this.cell?.pos as ex.Vector

    if (this.cell) {
      this.cell.removeUnit(this)
    }

    let currentCell: Cell | null = null
    let pathMinusFirst = path.slice(1, path.length)
    for (let node of pathMinusFirst) {
      const position: ex.Vector = this.oldPosition ? this.oldPosition : oldPos
      currentCell = node.owner as Cell

      this.defineDirection(position, currentCell.pos)

      this.oldPosition = currentCell.pos

      const sound = new ex.ActionSequence(this, (ctx) => {
        ctx.delay(200)
        ctx.callMethod(() => {
          Resources.MoveSound.play()
        })
      })

      const move = new ex.ActionSequence(this, (ctx) => {
        this.setAnim(this.selectAnimationMove())
        ctx.moveTo({ pos: currentCell!.pos.sub(this.unitConfig.graphics.offset), duration: 200 })
        ctx.callMethod(() => {
          DustParticles.pos = this.pos.add(SCALE.scale(32))
          DustParticles.emitParticles(3)
        })
      })

      const parallel = new ex.ParallelActions([
        sound,
        move
      ])

      await this.actions.runAction(parallel).toPromise()
      this.setAnim(this.selectAnimationIdle())
    }
    if (currentCell) {
      currentCell.addUnit(this)
    }
    await ex.Util.delay(250)
    this.moved = true
  }


  defineDirection(oldPos: ex.Vector, newPos: ex.Vector) {
    if (oldPos.y > newPos.y) {
      this.miniDirection = 'up'
    } else if (oldPos.y < newPos.y) {
      this.miniDirection = 'down'
    } else if (oldPos.x > newPos.x) {
      this.miniDirection = 'left'
      this.graphics.flipHorizontal = true
    } else {
      this.miniDirection = 'right'
      this.graphics.flipHorizontal = false
    }
  }

  selectAnimationIdle() {
    if (this.miniDirection == 'up') {
      return this.unitConfig.graphics.idleUp.clone()
    } else if (this.miniDirection == 'down') {
      return this.unitConfig.graphics.idleDown.clone()
    } else {
      return this.unitConfig.graphics.idle.clone()
    }
  }

  selectAnimationAttack() {
    if (this.miniDirection == 'up') {
      return this.unitConfig.graphics.attackUp.clone()
    } else if (this.miniDirection == 'down') {
      return this.unitConfig.graphics.attackDown.clone()
    } else {
      return this.unitConfig.graphics.attack.clone()
    }
  }

  selectAnimationMove() {
    if (this.miniDirection == 'up') {
      return this.unitConfig.graphics.moveUp.clone()
    } else if (this.miniDirection == 'down') {
      return this.unitConfig.graphics.moveDown.clone()
    } else {
      return this.unitConfig.graphics.move.clone()
    }
  }

  selectAnimationDeath() {
    if (this.miniDirection == 'up') {
      return this.unitConfig.graphics.deathUp.clone()
    } else if (this.miniDirection == 'down') {
      return this.unitConfig.graphics.deathDown.clone()
    } else {
      return this.unitConfig.graphics.death.clone()
    }
  }

  reset() {
    this.moved = false
    this.attacked = false
    this.passed = false
  }

  canAttack() {
    return this.getPossibleTargets()?.length !== 0 && !this.attacked
  }

  canMove() {
    return !this.moved
  }

  hasActions() {
    if (this.passed) {
      return false
    } else {
      return this.canMove() || this.canAttack()
    }
  }

  availableActions() {
    let available: ('move' | 'attack')[] = []
    if (this.canMove()) {
      available.push('move')
    }
    if (this.canAttack()) {
      available.push('attack')
    }
    return available
  }

  async pass() {
    this.moved = true
    this.attacked = true
    this.passed = true
  }

  getPossibleTargets() {
    if (this.cell) {
      const range = this.cell.board.pathFinder.getRangeAttack(this.cell.pathNode, ~this.player.mask, this.unitConfig.range, this.name)
      const cellsWithEnemies = range.map(node => node.owner as Cell).filter(cell => {
        if (cell.unit?.player) {
          return cell.unit.player !== this.player
        }
        return false
      })
      return cellsWithEnemies
    }
  }

  setAnim(animation: ex.Animation) {
    this.anim = animation
    this.anim.scale = SCALE
    this.graphics.use(this.anim)
  }

  async attack(other: Unit) {
    this.defineDirection(this.pos, other.pos)

    const atkAnim = new ex.ActionSequence(this, (ctx) => {
      this.setAnim(this.selectAnimationAttack())
      ctx.moveTo({ pos: this.pos, duration: 500, easing: ex.EasingFunctions.EaseInOutCubic })
    })

    const parallel = new ex.ParallelActions([
      atkAnim
    ])

    const fD20 = Math.floor(Math.random() * 20) + 1
    const lD20 = Math.floor(Math.random() * 20) + 1
    const fD6 = Math.floor(Math.random() * 6) + 1
    const lD6 = Math.floor(Math.random() * 6) + 1

    const d20 = fD20 > lD20 ? fD20 : lD20
    const d6 = fD6 > lD6 ? fD6 : lD6

    const atk = this.unitConfig.attack + d20
    const def = other.unitConfig.defense + 10
    let damage

    if (d20 === 20) {
      damage = (12 + this.unitConfig.attack) - other.unitConfig.defense
    } else if (this.miniDirection == other.miniDirection) {
      damage = (d6 + (this.unitConfig.attack * 2)) - other.unitConfig.defense
    }else {
      damage = (d6 + this.unitConfig.attack) - other.unitConfig.defense
    }

    if (atk > def || this.miniDirection == other.miniDirection) {
      damage = damage > 0 ? damage : 1
    } else {
      damage = 1
    }

    Resources.HitSound.play()

    await this.actions.runAction(parallel).toPromise()
    this.setAnim(this.selectAnimationIdle())

    other.health -= damage
    await ex.Util.delay(350)

    await this.damageManager.spawnDamageNumber(other.pos.add(other.unitConfig.graphics.offset).add(ex.vec(16 * SCALE.x, 0)), damage, d20)

    if (other.health > 0) {
      other.actions.blink(100, 100, 4)
    }

    this.attacked = true
  }
}