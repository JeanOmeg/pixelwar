import * as ex from "excalibur"
import { Board } from "./board"
import { Explosion, HeartSpriteSheet, Resources, Smoke, SpiderSpriteSheet } from "./resources"
import { SCALE, UNIT_CONFIG, UnitConfig, UnitType } from "./config"
import { Cell } from "./cell"
import { PathNodeComponent } from "./path-finding/path-node-component"
import { Player } from "./player"
import { DustParticles } from "./dust-particles"
import { DamageManager } from "./damage-manager"
import { AnimationManager } from "./animation-manager"



export class Unit extends ex.Actor {
  cell: Cell | null = null;
  unitConfig: UnitConfig
  moved = false;
  attacked = false;
  anim: ex.Animation
  direction!: string
  health: number
  damageManager!: DamageManager
  animationManger!: AnimationManager
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
    this.graphics.onPostDraw = this.onPostDraw.bind(this)

    const cell = board.getCell(x, y)
    if (cell) {
      this.pos = cell.pos.sub(this.unitConfig.graphics.offset)
      cell.addUnit(this)
    }
  }

  onInitialize(engine: ex.Engine): void {
    this.damageManager = new DamageManager(engine.currentScene)
    this.animationManger = new AnimationManager(engine.currentScene)
  }

  onPostUpdate(): void {
    if (!this.hasActions()) {
      this.anim.tint = ex.Color.Gray
    } else {
      this.anim.tint = ex.Color.White
    }

    if (this.health <= 0) {
      this.cell?.removeUnit(this)
      this.actions.delay(500).callMethod(() => {
        this.animationManger.playExplosion(this.pos)
        Resources.ExplosionSound.play()
      }).callMethod(() => {
        this.kill()
      })
    }
  }

  onPostDraw(ctx: ex.ExcaliburGraphicsContext) {
    if (this.health > 0) {
      const heart = HeartSpriteSheet.getSprite(ex.clamp(this.health, 0, 35), 0)
      if (heart) {
        heart.scale = ex.vec(0.7, 0.7)
        heart.draw(ctx,
          5 * SCALE.x + this.unitConfig.graphics.offset.x,
          9 * SCALE.y + this.unitConfig.graphics.offset.y
        )
      }
    }
  }

  async move(path: PathNodeComponent[]) {
    let oldPosi = this.cell?.pos.x as number
    if (this.cell) {
      this.cell.removeUnit(this)
    }
    let currentCell: Cell | null = null
    let pathMinusFirst = path.slice(1, path.length)
    for (let node of pathMinusFirst) {
      currentCell = node.owner as Cell

      this.defineDirection(oldPosi, currentCell.pos.x)

      const sound = new ex.ActionSequence(this, (ctx) => {
        ctx.delay(200)
        ctx.callMethod(() => {
          Resources.MoveSound.play()
        })
      })

      const move = new ex.ActionSequence(this, (ctx) => {
        ctx.easeTo(currentCell!.pos.sub(this.unitConfig.graphics.offset), 300, ex.EasingFunctions.EaseInOutCubic)
        ctx.callMethod(() => {
          DustParticles.pos = this.pos.add(SCALE.scale(16))
          DustParticles.emitParticles(5)
        })
      })

      const parallel = new ex.ParallelActions([
        sound,
        move
      ])
      await this.actions.runAction(parallel).toPromise()
    }
    if (currentCell) {
      currentCell.addUnit(this)
    }
    this.moved = true
  }

  defineDirection(x_first: number, x_last: number) {
    if (x_first > x_last) {
      // Movendo para a esquerda
      if (this.direction !== 'esquerda') {
        this.direction = 'esquerda'
        this.graphics.flipHorizontal = true
      }
    } else if (x_first < x_last) {
      // Movendo para a direita
      if (this.direction !== 'direita') {
        this.direction = 'direita'
        this.graphics.flipHorizontal = false
      }
    }
  }

  reset() {
    this.moved = false
    this.attacked = false
  }

  canAttack() {
    return this.getPossibleTargets()?.length !== 0 && !this.attacked
  }

  canMove() {
    return !this.moved
  }

  hasActions() {
    return this.canMove() || this.canAttack()
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

  pass() {
    this.moved = true
    this.attacked = true
  }

  getPossibleTargets() {
    if (this.cell) {
      const range = this.cell.board.pathFinder.getRange(this.cell.pathNode, ~this.player.mask, this.unitConfig.range)
      const cellsWithEnemies = range.map(node => node.owner as Cell).filter(cell => {
        if (cell.unit?.player) {
          return cell.unit.player !== this.player
        }
        return false
      })
      return cellsWithEnemies
    }
  }

  async attack(other: Unit) {
    const d6atk1 = Math.floor(Math.random() * 6) + 1
    const d6atk2 = Math.floor(Math.random() * 6) + 1
    const d6atk3 = Math.floor(Math.random() * 6) + 1
    const diceatk = d6atk1 + d6atk2 + d6atk3

    const d6def1 = Math.floor(Math.random() * 6) + 1
    const d6def2 = Math.floor(Math.random() * 6) + 1
    const d6def3 = Math.floor(Math.random() * 6) + 1
    const dicedef = d6def1 + d6def2 + d6def3

    let atk: number
    let def: number
    
    if (diceatk === 18) {
      atk = (this.unitConfig.attack * 3) + diceatk
    } else if (diceatk === 3) {
      atk = diceatk
    } else {
      atk = this.unitConfig.attack + diceatk
    }

    if (dicedef === 18) {
      def = (other.unitConfig.defense * 3) + dicedef
    } else if (dicedef === 3) {
      def = dicedef
    } else {
      def = other.unitConfig.defense + dicedef
    }

    let damage = atk - def
    damage = damage > 0 ? damage : 1

    other.health -= damage
    Resources.HitSound.play()

    this.damageManager.spawnDamageNumber(other.pos.add(other.unitConfig.graphics.offset).add(ex.vec(16 * SCALE.x, 0)), damage, diceatk)
    await other.actions.blink(200, 200, 5).toPromise()
    this.attacked = true
  }
}