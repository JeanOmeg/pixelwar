import { t } from './i18n'
import * as ex from 'excalibur'
import { Board } from './board'
import { Resources } from './resources'
import { SCALE, SCALE_UNIT, UNIT_CONFIG, UnitConfig, UnitType } from './config'
import { Cell } from './cell'
import { PathNodeComponent } from './path-finding/path-node-component'
import { Player } from './player'
import { DustParticles } from './dust-particles'
import { DamageManager } from './damage-manager'
import { AttackContext, AttackOutcome, CombatStats, FOREST_DEFENSE, Facing, PLAIN_ATTACK, facingBetween, resolveAttack, rollWithAdvantage } from './combat'
import {
  BRACE_DEF, BRACE_REACH, FIREBALL_SPLASH, FRENZY_ATK, FRENZY_DEF, GUARD_DEF, HEAL_HP,
  SECOND_WIND_HP, SHIELD_WALL_DEF, SKILLS, STEAL_MP, SkillDefinition, SkillId, skillBonusDamage
} from './skills'
import { gameDelay } from './speed'

/**
 * What an attack does, in order: the strike, the effects of the attack skill,
 * then the counterattack. Built by Unit.resolveAttackOn (rolls the dice, changes
 * nothing) and applied by applyAttackEvent, so the game can animate each step
 * and the AI simulation can apply them all at once.
 */
export type AttackEvent =
  | { kind: 'strike', attacker: Unit, defender: Unit, outcome: AttackOutcome, counter: boolean }
  | { kind: 'heal', unit: Unit, amount: number }
  | { kind: 'steal', from: Unit, to: Unit, amount: number }
  | { kind: 'pin', unit: Unit }
  | { kind: 'splash', unit: Unit, damage: number }

/** Color of the "Skill -N MP" text over a unit (the MP bar's color) */
const SKILL_TEXT_COLOR = '#4cc9f0'

/** Dice for one strike: [d20, d6], both with advantage */
export type StrikeRolls = () => [number, number]
export const rollStrike: StrikeRolls = () => [rollWithAdvantage(20), rollWithAdvantage(6)]

/**
 * Dice already rolled, used in order (online play: the attacker rolls and
 * sends them, everybody else replays the same attack)
 */
export function fixedRolls(rolls: [number, number][]): StrikeRolls {
  let next = 0
  return () => {
    const roll = rolls[next++]
    if (!roll) throw new Error('Not enough dice for this attack')
    return roll
  }
}

/** Where the unit was before its last move this turn (for Undo move) */
interface PreviousMove {
  cell: Cell
  facing: Facing
  flip: boolean
  /** The move used Run: undoing it gives the MP back */
  ran: boolean
}

export class Unit extends ex.Actor {
  cell: Cell | null = null
  unitConfig: UnitConfig
  moved = false
  attacked = false
  passed = false
  /** A skill was used this turn (one per turn) */
  usedSkill = false
  /** Move/attack skill paid for but not used yet (refunded if cancelled) */
  pendingSkill: SkillDefinition | null = null
  /** Bonuses from skills, until the owner's next turn */
  attackBonus = 0
  defenseBonus = 0
  /** Brace: counterattacks from further away */
  braced = false
  /** Pinning Shot: can't move on its next turn */
  pinned = false
  anim: ex.Animation
  private facing: Facing = 'right'
  /** The board is drawn mirrored (Board.mirrored): left/right sprites swap */
  private mirrored = false
  oldPosition!: ex.Vector | null
  health: number
  mp: number = 0
  damageManager!: DamageManager
  private previousMove: PreviousMove | null = null
  private dying = false
  private hpBar = new ex.Actor({ anchor: ex.Vector.Zero, z: 3 })
  private shownHealth = -1

  get isRunning(): boolean {
    return this.pendingSkill?.id === 'skill-run'
  }

  get forcesCritical(): boolean {
    return this.pendingSkill?.id === 'skill-special-attack'
  }

  get effectiveMovement(): number {
    return this.isRunning ? this.unitConfig.movement * 2 : this.unitConfig.movement
  }

  get isDying(): boolean {
    return this.dying || this.health <= 0
  }

  constructor(x: number, y: number, unitType: UnitType, private readonly board: Board, public player: Player) {
    super({
      name: unitType,
      anchor: ex.vec(0, 0),
      z: 2
    })
    this.unitConfig = { ...UNIT_CONFIG[unitType] }

    this.health = this.unitConfig.health
    this.mp = this.unitConfig.mp

    this.anim = this.unitConfig.graphics.idle.clone()
    this.anim.scale = SCALE_UNIT
    this.graphics.use(this.anim)
    this.player = player
    this.mirrored = board.mirrored

    const cell = board.getCell(x, y)
    if (cell) {
      this.pos = cell.pos.sub(this.unitConfig.graphics.offset)
      cell.addUnit(this)
    }
  }

  onInitialize(engine: ex.Engine): void {
    this.damageManager = new DamageManager(engine.currentScene)
    engine.currentScene.add(this.hpBar)
  }

  onPostUpdate(): void {
    this.anim.tint = this.hasActions() ? ex.Color.White : ex.Color.Gray
    this.updateHpBar()
    if (this.health <= 0) void this.die()
  }

  /** Small HP bar under the unit, on the map */
  private updateHpBar() {
    // the bar sits at the bottom of the unit's tile
    this.hpBar.pos = this.pos.add(this.unitConfig.graphics.offset).add(ex.vec(8 * SCALE.x, 28 * SCALE.y))
    const health = Math.max(this.health, 0)
    if (health === this.shownHealth) return
    this.shownHealth = health
    const width = 24 * SCALE.x
    const height = 2 * SCALE.y
    const ratio = health / this.unitConfig.health
    const color = ratio <= 0.25 ? '#ff4d4d' : ratio <= 0.5 ? '#ffd23f' : '#4ee06a'
    this.hpBar.graphics.use(new ex.GraphicsGroup({
      useAnchor: false,
      members: [
        { graphic: new ex.Rectangle({ width: width + 2 * SCALE.x, height: height + 2 * SCALE.y, color: ex.Color.Black }), offset: ex.vec(-SCALE.x, -SCALE.y) },
        { graphic: new ex.Rectangle({ width: Math.max(Math.round(width * ratio), health > 0 ? 1 : 0), height, color: ex.Color.fromHex(color) }), offset: ex.Vector.Zero }
      ]
    }))
  }

  /** Death animation, once (onPostUpdate keeps calling while health <= 0) */
  private async die() {
    if (this.dying) return
    this.dying = true
    this.cell?.removeUnit(this)
    this.board.onUnitDown?.(this)
    this.hpBar.kill()
    this.setAnim(this.selectAnimationDeath())
    await this.actions.delay(500).toPromise()
    Resources.ExplosionSound.play()
    await this.actions.fade(0, 300).toPromise()
    this.kill()
  }

  async move(path: PathNodeComponent[]) {
    if (this.pendingSkill?.kind === 'move' && path.length > 1) this.announceSkill(this.pendingSkill)
    this.oldPosition = null

    if (this.cell) {
      this.previousMove = { cell: this.cell, facing: this.miniDirection, flip: this.graphics.flipHorizontal, ran: this.isRunning }
      this.cell.removeUnit(this)
    }

    let currentCell: Cell | null = null
    for (let i = 1; i < path.length; i++) {
      currentCell = path[i].owner as Cell

      this.defineDirection(path[i - 1], path[i])

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
    await gameDelay(250)
    this.moved = true
  }

  /** The last move can be taken back while the unit hasn't attacked */
  canUndoMove(): boolean {
    return this.moved && !this.attacked && !this.passed && !!this.previousMove && !this.previousMove.cell.unit && !!this.cell
  }

  /** Puts the unit back where it was before moving (and refunds Run) */
  undoMove() {
    const previous = this.previousMove
    if (!previous || !this.canUndoMove()) return
    this.cell?.removeUnit(this)
    previous.cell.addUnit(this)
    this.pos = previous.cell.pos.sub(this.unitConfig.graphics.offset)
    this.miniDirection = previous.facing
    this.graphics.flipHorizontal = previous.flip
    this.setAnim(this.selectAnimationIdle())
    this.moved = false
    if (previous.ran) {
      this.mp += SKILLS['skill-run'].cost
      this.usedSkill = false
    }
    this.previousMove = null
  }

  /**
   * Facing on the board (cell coordinates: back attacks depend on it). Facing
   * left or right also turns the sprite, the other way on a mirrored board.
   */
  get miniDirection(): Facing {
    return this.facing
  }

  set miniDirection(facing: Facing) {
    this.facing = facing
    if (facing === 'left' || facing === 'right') this.graphics.flipHorizontal = (facing === 'left') !== this.mirrored
  }

  /** Faces from cell `from` towards cell `to` (cell coordinates, never world positions) */
  defineDirection(from: { x: number, y: number }, to: { x: number, y: number }) {
    this.miniDirection = facingBetween(from, to)
  }

  private animationFor(kind: 'idle' | 'move' | 'attack' | 'death') {
    const graphics = this.unitConfig.graphics
    if (this.miniDirection === 'up') return graphics[`${kind}Up`].clone()
    if (this.miniDirection === 'down') return graphics[`${kind}Down`].clone()
    return graphics[kind].clone()
  }

  selectAnimationIdle() {
    return this.animationFor('idle')
  }

  /** Plays once and holds the last frame (the shared animations loop) */
  selectAnimationAttack() {
    const animation = this.animationFor('attack')
    animation.strategy = ex.AnimationStrategy.Freeze
    return animation
  }

  selectAnimationMove() {
    return this.animationFor('move')
  }

  /** Plays once and holds the last frame while it fades out */
  selectAnimationDeath() {
    const animation = this.animationFor('death')
    animation.strategy = ex.AnimationStrategy.Freeze
    return animation
  }

  /** Start of the owner's turn: actions back, temporary effects gone */
  reset() {
    this.moved = false
    this.attacked = false
    this.passed = false
    this.pendingSkill = null
    this.usedSkill = false
    this.attackBonus = 0
    this.defenseBonus = 0
    this.braced = false
    this.previousMove = null
    if (this.pinned) {
      // Pinning Shot: this turn it can only attack
      this.moved = true
      this.pinned = false
    }
  }

  canAttack() {
    return this.getPossibleTargets()?.length !== 0 && !this.attacked
  }

  canMove() {
    return !this.moved
  }

  hasActions() {
    if (this.passed || this.isDying) {
      return false
    } else {
      return this.canMove() || this.canAttack()
    }
  }

  /**
   * Something can still be done with the unit (its menu opens): act, take the
   * move back, or use a skill that doesn't need a move/attack.
   */
  canBeSelected(): boolean {
    if (this.passed || this.isDying) return false
    return this.hasActions() || this.canUndoMove() || this.unitConfig.skills.some(skill => this.canUseSkill(skill.id))
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
    this.anim.scale = SCALE_UNIT
    this.graphics.use(this.anim)
  }

  // ---- Skills ----

  hasSkill(id: SkillId): boolean {
    return this.unitConfig.skills.some(skill => skill.id === id)
  }

  canUseSkill(id: SkillId | string): boolean {
    const skill = SKILLS[id as SkillId]
    if (!skill || !this.hasSkill(skill.id) || this.usedSkill || this.mp < skill.cost || this.passed) return false
    switch (skill.kind) {
    case 'move': return !this.moved && !this.attacked
    case 'attack': return this.canAttack()
    case 'ally': return this.healTargets().length > 0
    case 'self': return skill.id !== 'skill-second-wind' || this.health < this.unitConfig.health
    }
  }

  /**
   * Pays for a skill. Self skills take effect now; move/attack skills wait for
   * the next move/attack (`pendingSkill`); ally skills need `useSkillOn`.
   */
  startSkill(id: SkillId): boolean {
    if (!this.canUseSkill(id)) return false
    const skill = SKILLS[id]
    this.mp -= skill.cost
    this.usedSkill = true
    if (skill.kind === 'move' || skill.kind === 'attack') this.pendingSkill = skill
    if (skill.kind === 'self') {
      this.announceSkill(skill)
      this.applySelfSkill(skill.id)
    }
    return true
  }

  /**
   * "Guard -2 MP" floating over the unit when a skill really happens (self
   * skills when used, Heal on its target, Run when the move starts, attack
   * skills when the attack goes off). Picking a skill and cancelling shows
   * nothing. Drawn a bit above the effect text (DEF +3, +8...) so both read.
   */
  private announceSkill(skill: SkillDefinition) {
    void this.damageManager?.spawnText(this.textPos().add(ex.vec(0, -18 * SCALE.y)), `${skill.name} -${skill.cost} ${t().stats.mp}`, SKILL_TEXT_COLOR)
  }

  /** Gives the MP back for a move/attack skill that wasn't used */
  settlePendingSkill() {
    const skill = this.pendingSkill
    if (!skill) return
    const used = skill.kind === 'move' ? this.moved : this.attacked
    if (!used) {
      this.mp += skill.cost
      this.usedSkill = false
    }
    this.pendingSkill = null
  }

  /** Allies (and itself) that Heal can target: hurt, here or next to it */
  healTargets(): Unit[] {
    if (!this.cell) return []
    const around = [this.cell, ...this.cell.getNeighbors()].map(cell => cell.unit)
    return around.filter((u): u is Unit => !!u && u.player === this.player && u.health < u.unitConfig.health)
  }

  /** Ally skill (Heal) on `target` */
  useSkillOn(id: SkillId, target: Unit): boolean {
    if (id !== 'skill-heal' || !this.canUseSkill(id) || !this.healTargets().includes(target)) return false
    this.mp -= SKILLS[id].cost
    this.usedSkill = true
    this.announceSkill(SKILLS[id])
    target.heal(HEAL_HP)
    return true
  }

  heal(amount: number) {
    const healed = Math.min(amount, this.unitConfig.health - this.health)
    if (healed <= 0) return
    this.health += healed
    void this.damageManager?.spawnText(this.textPos(), `+${healed}`, '#4ee06a')
  }

  private applySelfSkill(id: SkillId) {
    switch (id) {
    case 'skill-second-wind':
      this.heal(SECOND_WIND_HP)
      break
    case 'skill-guard':
      this.defenseBonus += GUARD_DEF
      void this.damageManager?.spawnText(this.textPos(), `${t().stats.def} +${GUARD_DEF}`, '#4cc9f0')
      break
    case 'skill-frenzy':
      this.attackBonus += FRENZY_ATK
      this.defenseBonus += FRENZY_DEF
      void this.damageManager?.spawnText(this.textPos(), `${t().stats.atk} +${FRENZY_ATK}`, '#ff8c42')
      break
    case 'skill-brace':
      this.braced = true
      this.defenseBonus += BRACE_DEF
      void this.damageManager?.spawnText(this.textPos(), t().floating.brace, '#4cc9f0')
      break
    case 'skill-shield-wall':
      for (const ally of this.alliesAround(true)) {
        ally.defenseBonus += SHIELD_WALL_DEF
        void ally.damageManager?.spawnText(ally.textPos(), `${t().stats.def} +${SHIELD_WALL_DEF}`, '#4cc9f0')
      }
      break
    }
  }

  /** Allied units on the 4 tiles around (and the unit itself) */
  private alliesAround(includeSelf: boolean): Unit[] {
    if (!this.cell) return []
    const units = this.cell.getNeighbors().map(cell => cell.unit).filter((u): u is Unit => !!u && u.player === this.player)
    return includeSelf ? [this, ...units] : units
  }

  // ---- Combat ----

  /** Attack and defense right now: skill bonuses and +2 DEF in the forest */
  combatStats(): CombatStats {
    return {
      attack: this.unitConfig.attack + this.attackBonus,
      defense: this.unitConfig.defense + this.defenseBonus + (this.isInForest() ? FOREST_DEFENSE : 0)
    }
  }

  isInForest(): boolean {
    const node = this.cell?.pathNode
    return !!node && node.isWalkable && !node.isFast && !node.isDoor
  }

  /** How the next attack on `other` would go (back attack + pending skill) */
  attackContext(other: Unit): AttackContext {
    const skill = this.pendingSkill?.id
    return {
      forcesCritical: skill === 'skill-special-attack',
      backAttack: this.isBehind(other) || skill === 'skill-backstab',
      guaranteedHit: skill === 'skill-aimed-shot',
      ignoreDefense: skill === 'skill-pierce',
      bonusDamage: skillBonusDamage(skill)
    }
  }

  /** Tiles away it can strike back from: 1 for melee, 2 when braced, 0 for ranged/reach */
  counterReach(): number {
    if (this.braced) return BRACE_REACH
    return this.unitConfig.range === 1 ? 1 : 0
  }

  /** Whether it would strike back at `attacker` after surviving its attack */
  canCounter(attacker: Unit, context: AttackContext): boolean {
    return !!attacker.cell && this.canCounterFrom(attacker.cell.pathNode, context)
  }

  /** Same as canCounter, for an attacker standing at `node` (used by the AI to plan) */
  canCounterFrom(node: PathNodeComponent, context: AttackContext): boolean {
    if (context.backAttack || !this.cell || this.isDying) return false
    const reach = this.counterReach()
    if (reach === 0) return false
    // straight line, nothing in between, within reach (same rules as a normal attack)
    return this.cell.board.pathFinder
      .getRangeAttack(this.cell.pathNode, ~this.player.mask, reach, this.name)
      .includes(node)
  }

  /**
   * Rolls an attack on `other` and lists what happens, without changing
   * anything: the strike, the effects of the pending skill and, if the target
   * survives and can, its counterattack.
   */
  resolveAttackOn(other: Unit, rolls: StrikeRolls = rollStrike): AttackEvent[] {
    const context = this.attackContext(other)
    const skill = this.pendingSkill?.id
    const [d20, d6] = rolls()
    const outcome = resolveAttack(this.combatStats(), other.combatStats(), context, d20, d6)
    const events: AttackEvent[] = [{ kind: 'strike', attacker: this, defender: other, outcome, counter: false }]
    let healthAfter = other.health - outcome.damage

    // skill effects that follow the hit
    if (skill === 'skill-drain' && outcome.hit) events.push({ kind: 'heal', unit: this, amount: outcome.damage })
    if (skill === 'skill-steal' && outcome.hit) events.push({ kind: 'steal', from: other, to: this, amount: Math.min(STEAL_MP, other.mp) })
    if (skill === 'skill-fireball' && other.cell) {
      // the target burns too (hit or miss), unless the strike already killed it
      if (healthAfter > 0) {
        events.push({ kind: 'splash', unit: other, damage: FIREBALL_SPLASH })
        healthAfter -= FIREBALL_SPLASH
      }
      for (const cell of other.cell.getNeighbors()) {
        if (cell.unit && cell.unit.player !== this.player) events.push({ kind: 'splash', unit: cell.unit, damage: FIREBALL_SPLASH })
      }
    }
    if (skill === 'skill-pinning-shot' && outcome.hit && healthAfter > 0) events.push({ kind: 'pin', unit: other })

    // a melee defender that survives strikes back (never after a back attack)
    if (healthAfter > 0 && other.canCounter(this, context)) {
      const [c20, c6] = rolls()
      const counter = resolveAttack(other.combatStats(), this.combatStats(), PLAIN_ATTACK, c20, c6)
      events.push({ kind: 'strike', attacker: other, defender: this, outcome: counter, counter: true })
    }
    return events
  }

  /** Animated attack; `rolls` can fix the dice (online play) */
  async attack(other: Unit, rolls: StrikeRolls = rollStrike) {
    if (this.cell && other.cell) this.defineDirection(this.cell, other.cell)
    if (this.pendingSkill?.kind === 'attack') {
      this.announceSkill(this.pendingSkill)
      await gameDelay(350)
    }
    const events = this.resolveAttackOn(other, rolls)
    this.pendingSkill = null
    for (const event of events) {
      if (event.kind === 'strike') {
        const striker = event.attacker
        if (event.counter) {
          await gameDelay(250)
          if (striker.cell && event.defender.cell) striker.defineDirection(striker.cell, event.defender.cell)
        }
        await striker.playStrike(event)
        if (event.counter) striker.setAnim(striker.selectAnimationIdle())
      } else {
        applyAttackEvent(event)
      }
    }
    this.attacked = true
  }

  /**
   * The same attack with no animation or waiting (AI simulation, tests).
   * `rolls` can fix the dice.
   */
  attackInstant(other: Unit, rolls: StrikeRolls = rollStrike): AttackEvent[] {
    if (this.cell && other.cell) this.miniDirection = facingBetween(this.cell, other.cell)
    const events = this.resolveAttackOn(other, rolls)
    this.pendingSkill = null
    for (const event of events) {
      if (event.kind === 'strike' && event.counter && event.attacker.cell && event.defender.cell) {
        event.attacker.miniDirection = facingBetween(event.attacker.cell, event.defender.cell)
      }
      applyAttackEvent(event)
    }
    this.attacked = true
    // everybody the attack killed (Fireball splash too) leaves the board now
    for (const event of events) {
      const hit = event.kind === 'strike' ? event.defender : event.kind === 'splash' ? event.unit : null
      if (hit && hit.health <= 0) hit.cell?.removeUnit(hit)
    }
    return events
  }

  /** The same move with no animation (AI simulation, tests) */
  moveInstant(path: PathNodeComponent[]) {
    const target = path[path.length - 1]?.owner as Cell | undefined
    if (!this.cell || !target || path.length < 2) return
    this.previousMove = { cell: this.cell, facing: this.miniDirection, flip: this.graphics.flipHorizontal, ran: this.isRunning }
    this.cell.removeUnit(this)
    target.addUnit(this)
    this.pos = target.pos.sub(this.unitConfig.graphics.offset)
    this.miniDirection = facingBetween(path[path.length - 2], path[path.length - 1])
    this.moved = true
  }

  /** Attack animation, then the damage and its number */
  private async playStrike(event: Extract<AttackEvent, { kind: 'strike' }>) {
    // the animation starts when the sequence runs, not when it is queued: a
    // counterattacker may still be blinking from the hit it just took
    const atkAnim = new ex.ActionSequence(this, (ctx) => {
      ctx.callMethod(() => {
        this.setAnim(this.selectAnimationAttack())
        Resources.HitSound.play()
      })
      ctx.moveTo({
        pos: this.pos,
        duration: 500,
        easing: ex.EasingFunctions.EaseInOutCubic
      })
    })
    await this.actions.runAction(atkAnim).toPromise()
    this.setAnim(this.selectAnimationIdle())

    applyAttackEvent(event)
    await gameDelay(350)
    await this.damageManager.spawnDamageNumber(event.defender.textPos(), event.outcome, event.counter ? t().floating.counter : '')
    if (event.defender.health > 0) event.defender.actions.blink(100, 100, 4)
  }

  /** Where floating numbers over this unit start */
  textPos(): ex.Vector {
    return this.pos.add(this.unitConfig.graphics.offset).add(ex.vec(16 * SCALE.x, 0))
  }

  /** Floating text over this unit (no-op outside a running scene) */
  say(text: string, color: string) {
    void this.damageManager?.spawnText(this.textPos(), text, color)
  }

  /** True when attacking `other` from here would hit it in the back */
  isBehind(other: Unit): boolean {
    if (!this.cell || !other.cell) return false
    return facingBetween(this.cell, other.cell) === other.miniDirection
  }
}

/** Applies one step of an attack to the units involved */
export function applyAttackEvent(event: AttackEvent) {
  switch (event.kind) {
  case 'strike':
    event.defender.health -= event.outcome.damage
    break
  case 'heal':
    event.unit.heal(event.amount)
    break
  case 'steal':
    event.from.mp -= event.amount
    event.to.mp += event.amount
    if (event.amount > 0) event.to.say(`${t().stats.mp} +${event.amount}`, '#4cc9f0')
    break
  case 'pin':
    event.unit.pinned = true
    event.unit.say(t().floating.pinned, '#b8bcc8')
    break
  case 'splash':
    event.unit.health -= event.damage
    event.unit.say(`${event.damage}`, '#ff8c42')
    break
  }
}
