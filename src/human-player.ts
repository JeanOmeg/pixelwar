import * as ex from 'excalibur'
import { Board } from './board'
import { Player } from './player'
import { SelectionManager } from './selection-manager'
import type { GameUI } from './game-ui'
import { Cell } from './cell'
import { Unit, fixedRolls, type StrikeRolls } from './unit'
import type { ActionFeed } from './online/feed'
import type { GameAction } from './online/protocol'
import { applyAction, instantPresenter, posOf, rollAttackDice } from './online/actions'
import { withoutEffects } from './effects'
import { Resources } from './resources'
import { SKILLS, SkillId } from './skills'
import type { CameraController } from './camera-controller'
import { SCALE } from './config'

type Button = 'left' | 'right' | 'middle'

const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0]
}

/**
 * Tutorial: keeps the player to the scripted action (see TutorialMatch).
 * Without a gate everything works as usual.
 */
export interface ActionGate {
  /** Own unit that can be selected now */
  allowsUnit(unit: Unit): boolean
  /** Menu item of `unit` that can be picked: move, attack, undo, pass or a skill id */
  allowsMenu(unit: Unit, id: string): boolean
  /** Cell `unit` may move to, attack or heal in its current mode */
  allowsTarget(unit: Unit, cell: Cell): boolean
  allowsEndTurn(): boolean
  /** Dice of the attack about to happen */
  attackRolls(): [number, number][]
  /** An action was confirmed and has finished playing */
  done(action: GameAction): void
  /** The player tried something the lesson doesn't ask for */
  refused(): void
}

export class HumanPlayer extends Player {
  override readonly isHuman = true
  private humanMove = new ex.Future<void>()
  private subscriptions: ex.Subscription[] = []
  /** Touch: cell tapped once in move/attack mode, waiting for a second tap to confirm */
  private pendingTarget: Cell | null = null
  /** Unit whose range is shown by clicking it (no right/middle button on touch) */
  private inspected: { unit: Unit, mode: 'range' | 'attack' } | null = null
  private onKeyDown = (event: KeyboardEvent) => this.handleKey(event)
  private stopTaps: () => void
  /** Online: every confirmed action is recorded here (and sent to the others) */
  feed: ActionFeed | null = null
  /** Online: a replayed action broke the rules (the match went out of sync) */
  onOutOfSync: (error: unknown) => void = () => {}
  /** Tutorial: only the scripted action is allowed */
  gate: ActionGate | null = null

  constructor(name: string, engine: ex.Engine, private selectionManager: SelectionManager, public ui: GameUI, board: Board, private camera: CameraController) {
    super(name, board)
    this.selectionManager = selectionManager
    this.ui = ui
    this.subscriptions.push(
      engine.input.pointers.on('down', this.pointerClick.bind(this)),
      engine.input.pointers.on('move', this.pointerMove.bind(this))
    )
    // touch acts on release (CameraController): the first finger of a pinch or a drag isn't a tap
    this.stopTaps = camera.onTap(world => void this.act(this.board.getCellByWorldPos(world), 'left', true))
    window.addEventListener('keydown', this.onKeyDown)
    document.body.oncontextmenu = () => false
  }

  override dispose() {
    super.dispose()
    this.subscriptions.forEach(s => s.close())
    this.subscriptions = []
    this.stopTaps()
    window.removeEventListener('keydown', this.onKeyDown)
  }

  pointerClick(pointer: ex.PointerEvent) {
    // touch: see the tap listener in the constructor
    if (pointer.pointerType === ex.PointerType.Touch) return
    const button: Button | null = pointer.button === ex.PointerButton.Left ? 'left'
      : pointer.button === ex.PointerButton.Right ? 'right'
        : pointer.button === ex.PointerButton.Middle ? 'middle' : null
    if (button) void this.act(this.board.getCellByWorldPos(pointer.worldPos), button)
  }

  /** Click, tap or Enter on `cell` */
  async act(cell: Cell | null, button: Button, confirmTwice = false) {
    if (!this.active) return

    // Touch has no hover to preview the path or the attack: the first tap on a
    // valid target previews it, a second tap on the same cell confirms
    const selected = this.selectionManager.currentUnitSelection
    // tutorial: a valid target that isn't the one the lesson asks for does nothing
    if (this.gate && button === 'left' && selected && cell && this.isValidTarget(selected, cell) && !this.gate.allowsTarget(selected, cell)) {
      this.gate.refused()
      return
    }
    if (confirmTwice && selected && cell && cell !== this.pendingTarget && this.isValidTarget(selected, cell)) {
      this.pendingTarget = cell
      this.selectionManager.showCursor(cell.x, cell.y)
      this.showSelectionHighlight(cell)
      return
    }
    this.pendingTarget = null

    this.board.getUnits().forEach(u => u.setAnim(u.selectAnimationIdle()))
    this.selectionManager.resetHighlight()

    if (button === 'left') {
      const unit = this.selectionManager.currentUnitSelection
      if (unit) {
        const mode = this.selectionManager.currentSelectionMode
        if (mode === 'move') {
          await this.maybeMove(unit, cell)
        } else if (mode === 'attack') {
          await this.maybeAttack(unit, cell)
        } else {
          this.maybeHeal(unit, cell)
        }
        if (!this.hasWon()) this.maybeSelectUnit(unit.cell, true)
      } else if (cell?.unit && !this.isOwnSelectableUnit(cell)) {
        this.inspectUnit(cell.unit)
      } else {
        this.maybeSelectUnit(cell)
      }
      if (!this.selectionManager.currentUnitSelection && !cell?.unit) this.inspected = null
    }

    if (button === 'right') {
      this.highlightUnitMoveRange(cell)
      if (cell?.unit) this.ui.noteCommand('move-range')
    }
    if (button === 'middle') {
      this.highlightUnitAttackRange(cell)
      if (cell?.unit) this.ui.noteCommand('attack-range')
    }
  }

  pointerMove(pointer: ex.PointerEvent) {
    // a finger has no hover: moving it pans or pinches the map
    if (!this.active || pointer.pointerType === ex.PointerType.Touch) return
    this.hover(this.board.getCellByWorldPos(pointer.worldPos))
  }

  private hover(cell: Cell | null) {
    if (cell) this.selectionManager.showCursor(cell.x, cell.y)
    this.showSelectionHighlight(cell)
  }

  /**
   * Keyboard: arrows/WASD move the cursor, Enter/Space act on it (like a left
   * click), Tab jumps to the next unit that can act, R/F show the move/attack
   * range of the unit under the cursor. Esc, E (end turn) and P (pause) are
   * handled by GameUI.
   */
  private handleKey(event: KeyboardEvent) {
    if (!this.active || this.ui.isBlockingInput()) return
    if (event.target instanceof HTMLElement && event.target.closest('input, textarea')) return
    const { x, y } = this.selectionManager.currentCursor
    const step = ARROWS[event.key] ?? ARROWS[event.key.toLowerCase()]
    // no cursor on the board yet (mouse never moved): start on a unit
    if ((step || event.key === 'Enter' || event.key === ' ') && !this.board.getCell(x, y)?.hasCursor) {
      event.preventDefault()
      this.cycleUnits(1)
      return
    }
    if (step && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
      // arrows follow the screen: on a mirrored board, left is +x
      const dx = this.board.mirrored ? -step[0] : step[0]
      this.moveCursor(this.board.getCell(x + dx, y + step[1]))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      void this.act(this.board.getCell(x, y), 'left')
    } else if (event.key === 'Tab') {
      event.preventDefault()
      this.cycleUnits(event.shiftKey ? -1 : 1)
    } else if (event.key.toLowerCase() === 'r') {
      void this.act(this.board.getCell(x, y), 'right')
    } else if (event.key.toLowerCase() === 'f') {
      void this.act(this.board.getCell(x, y), 'middle')
    }
  }

  private moveCursor(cell: Cell | null) {
    if (!cell) return
    // zoomed in: pan so the cursor (and one tile around it) stays on screen
    const tile = ex.vec(this.board.tileWidth * SCALE.x, this.board.tileHeight * SCALE.y)
    this.camera.ensureVisible(cell.pos, tile, tile.x)
    this.hover(cell)
    this.ui.setHovered(cell)
  }

  /** Tab: cursor to the next own unit that can still act */
  private cycleUnits(direction: 1 | -1) {
    const units = this.board.getUnits().filter(u => u.player === this && u.canBeSelected() && u.cell)
    if (units.length === 0) return
    this.ui.noteCommand('next-unit')
    const { x, y } = this.selectionManager.currentCursor
    const order = (u: Unit) => (u.cell!.y * this.board.cols) + u.cell!.x
    units.sort((a, b) => order(a) - order(b))
    const current = y * this.board.cols + x
    const next = direction === 1
      ? units.find(u => order(u) > current) ?? units[0]
      : [...units].reverse().find(u => order(u) < current) ?? units[units.length - 1]
    this.moveCursor(next.cell)
  }

  /** Range of the selected unit (move/attack/heal mode) plus the path/target under `hovered` */
  private showSelectionHighlight(hovered: Cell | null) {
    const unit = this.selectionManager.currentUnitSelection
    if (!unit?.cell) return

    this.selectionManager.resetHighlight()
    const mode = this.selectionManager.currentSelectionMode

    if (mode === 'move') {
      const movementMap = this.board.pathFinder.getMovementMap(unit.cell.pathNode, this.mask, unit.effectiveMovement, unit.name)
      this.selectionManager.showHighlight(movementMap.range, 'range')

      if (hovered) {
        const path = movementMap.pathTo(hovered.pathNode)
        if (path.length > 1) {
          this.selectionManager.showHighlight(path, 'path')
          this.selectionManager.showMovePreview(unit, path)
        }
      }
    } else if (mode === 'attack') {
      const currentRange = this.selectionManager.findAttackRange(unit)
      this.selectionManager.showHighlight(currentRange, 'attack')

      if (hovered && this.hasNonPlayerUnit(hovered) && currentRange.includes(hovered.pathNode)) {
        this.selectionManager.showHighlight([hovered.pathNode], 'path')
      }
    } else {
      const targets = unit.healTargets().map(u => u.cell!.pathNode)
      this.selectionManager.showHighlight(targets, 'range')
      if (hovered && targets.includes(hovered.pathNode)) this.selectionManager.showHighlight([hovered.pathNode], 'path')
    }
  }

  /** Whether clicking `cell` would move/attack/heal with `unit` in the current mode */
  private isValidTarget(unit: Unit, cell: Cell): boolean {
    if (!unit.cell) return false
    const mode = this.selectionManager.currentSelectionMode
    if (mode === 'move') {
      if (!unit.canMove()) return false
      const movementMap = this.board.pathFinder.getMovementMap(unit.cell.pathNode, this.mask, unit.effectiveMovement, unit.name)
      return movementMap.pathTo(cell.pathNode).length > 1
    }
    if (mode === 'heal') return !!cell.unit && unit.healTargets().includes(cell.unit)
    return unit.canAttack() && !!this.hasNonPlayerUnit(cell) && this.selectionManager.findAttackRange(unit).includes(cell.pathNode)
  }

  /**
   * Click / tap on an enemy or on a unit that can't act: shows its movement
   * range; clicking it again shows its attack range (and so on).
   */
  private inspectUnit(unit: Unit) {
    const mode = this.inspected?.unit === unit && this.inspected.mode === 'range' ? 'attack' : 'range'
    this.inspected = { unit, mode }
    if (mode === 'range') this.highlightUnitMoveRange(unit.cell)
    else this.highlightUnitAttackRange(unit.cell)
    this.ui.noteCommand(mode === 'range' ? 'move-range' : 'attack-range')
  }

  private selectMode(unit: Unit, mode: 'move' | 'attack' | 'heal') {
    this.pendingTarget = null
    this.inspected = null
    this.selectionManager.selectUnit(unit, mode)
    this.showSelectionHighlight(null)
  }

  /** Skill picked in the menu */
  private useSkill(unit: Unit, id: SkillId) {
    const skill = SKILLS[id]
    if (!skill || !unit.canUseSkill(id)) return
    if (skill.kind === 'ally') {
      // paid when the target is picked
      this.selectMode(unit, 'heal')
      return
    }
    if (!unit.startSkill(id)) return
    // move/attack skills are sent with the move/attack that uses them
    if (skill.kind === 'self' && unit.cell) {
      const action: GameAction = { a: 'self-skill', unit: posOf(unit.cell), skill: id }
      this.record(action)
      this.gate?.done(action)
    }
    Resources.SelectSound.play()
    if (skill.kind === 'move') this.selectMode(unit, 'move')
    else if (skill.kind === 'attack') this.selectMode(unit, 'attack')
    else this.maybeSelectUnit(unit.cell, true)
  }

  /** Esc: leaves move/attack/heal mode, refunding a pending skill */
  cancelSelection() {
    if (!this.active) return
    const unit = this.selectionManager.currentUnitSelection
    unit?.settlePendingSkill()
    this.pendingTarget = null
    this.selectionManager.reset()
    this.ui.dismissAll()
  }

  async maybeMove(unit: Unit, destination: Cell | null) {
    if (destination && unit.canMove() && this.isValidTarget(unit, destination)) {
      this.active = false
      Resources.TargetSelectSound.play()
      const path = this.selectionManager.findPath(destination, unit)
      let action: GameAction | null = null
      if (path.length > 1 && unit.cell) {
        const skill = unit.pendingSkill?.kind === 'move' ? unit.pendingSkill.id : undefined
        action = { a: 'move', unit: posOf(unit.cell), path: path.map(node => [node.x, node.y]), ...(skill ? { skill } : {}) }
        this.record(action)
      }
      await this.selectionManager.selectDestinationAndMove(unit, destination, path)
      unit.settlePendingSkill()
      if (action) this.gate?.done(action)
      this.humanMove.resolve()
    } else {
      unit.settlePendingSkill()
      this.selectionManager.reset()
    }
  }

  async maybeAttack(attacker: Unit, destination: Cell | null) {
    if (destination && attacker.canAttack() && this.hasNonPlayerUnit(destination)) {
      this.active = false
      // online: roll here and send the dice, so every board plays the same attack;
      // tutorial: the dice come from the script
      let rolls: StrikeRolls | undefined
      let action: GameAction | null = null
      if ((this.feed || this.gate) && attacker.cell && this.selectionManager.findAttackRange(attacker).includes(destination.pathNode)) {
        const dice = this.gate ? this.gate.attackRolls() : rollAttackDice()
        const skill = attacker.pendingSkill?.kind === 'attack' ? attacker.pendingSkill.id : undefined
        action = { a: 'attack', unit: posOf(attacker.cell), target: posOf(destination), rolls: dice, ...(skill ? { skill } : {}) }
        this.record(action)
        rolls = fixedRolls(dice)
      }
      await this.selectionManager.selectDestinationAndAttack(attacker, destination, rolls)
      attacker.settlePendingSkill()
      if (action) this.gate?.done(action)
      this.humanMove.resolve()
    } else {
      attacker.settlePendingSkill()
      this.selectionManager.reset()
    }

    if (this.hasWon()) {
      this.humanMove.resolve()
      this.ui.dismissAll()
    }
  }

  private maybeHeal(unit: Unit, cell: Cell | null) {
    if (cell?.unit && unit.cell && unit.useSkillOn('skill-heal', cell.unit)) {
      const action: GameAction = { a: 'heal', unit: posOf(unit.cell), target: posOf(cell) }
      this.record(action)
      Resources.SelectSound.play()
      this.gate?.done(action)
    }
    this.selectionManager.reset()
  }

  /** Highlight the movement range of any unit, friendly or not */
  highlightUnitMoveRange(cell: Cell | null) {
    if (cell?.unit) {
      this.selectionManager.showHighlight(this.selectionManager.findMovementRange(cell.unit), 'range')
    } else {
      this.selectionManager.reset()
    }
  }

  highlightUnitAttackRange(cell: Cell | null) {
    if (cell?.unit) {
      this.selectionManager.showHighlight(this.selectionManager.findAttackRange(cell.unit), 'attack')
    } else {
      this.selectionManager.reset()
    }
  }

  /** Opens the menu of the own unit on `cell`; `quiet`: reopened after an action (the tutorial doesn't complain) */
  maybeSelectUnit(cell: Cell | null, quiet = false) {
    if (cell?.unit && this.isOwnSelectableUnit(cell)) {
      const unit = cell.unit
      const gate = this.gate
      if (gate && !gate.allowsUnit(unit)) {
        if (!quiet) gate.refused()
        this.selectionManager.reset()
        return
      }
      unit.setAnim(unit.selectAnimationMove())
      this.selectionManager.showCursor(cell.x, cell.y)
      Resources.SelectSound.play()
      if (!quiet) this.ui.noteCommand('select')

      this.ui.showUnitMenu(unit, {
        move: () => this.selectMode(unit, 'move'),
        attack: () => this.selectMode(unit, 'attack'),
        skill: id => this.useSkill(unit, id),
        undo: () => {
          if (!unit.canUndoMove() || !unit.cell) return
          const action: GameAction = { a: 'undo', unit: posOf(unit.cell) }
          this.record(action)
          unit.undoMove()
          this.selectionManager.reset()
          gate?.done(action)
          this.maybeSelectUnit(unit.cell, true)
        },
        pass: async () => {
          const action: GameAction | null = unit.cell ? { a: 'pass', unit: posOf(unit.cell) } : null
          if (action) this.record(action)
          unit.setAnim(unit.selectAnimationIdle())
          await unit.pass()
          this.selectionManager.reset()
          if (action) gate?.done(action)
          this.humanMove.resolve()
        },
        ...(gate ? { allows: (id: string) => gate.allowsMenu(unit, id) } : {})
      })
    } else {
      this.selectionManager.reset()
    }
  }

  /**
   * Ends the turn for every unit of this player (End Turn button; online, also
   * when the turn timer runs out). Returns false when it can't right now (an
   * animation is playing).
   */
  async endTurn(reason: 'button' | 'timeout' = 'button'): Promise<boolean> {
    if (!this.active) return false
    if (this.gate && !this.gate.allowsEndTurn()) {
      this.gate.refused()
      return false
    }
    this.active = false
    this.pendingTarget = null
    this.selectionManager.currentUnitSelection?.settlePendingSkill()
    const action: GameAction = { a: 'end-turn', reason }
    this.record(action)
    this.ui.dismissAll()
    const units = this.board.getUnits().filter(u => u.player === this)
    units.forEach(u => u.setAnim(u.selectAnimationIdle()))
    for (const u of units) await u.pass()
    this.selectionManager.reset()
    this.gate?.done(action)
    this.humanMove.resolve()
    return true
  }

  private record(action: GameAction) {
    this.feed?.recordLocal(action)
  }

  /**
   * Online, back after a reload: this player's own actions come back through
   * the history and are replayed at once. Returns true if they ended the turn.
   */
  private async catchUp(): Promise<boolean> {
    while (this.feed?.catchingUp && await this.hasMoves()) {
      const entry = this.feed.take()
      if (!entry) break
      try {
        if (await withoutEffects(() => applyAction(this.board, this, entry.action, instantPresenter))) return true
      } catch (error) {
        this.onOutOfSync(error)
        return true
      }
    }
    return false
  }

  hasNonPlayerUnit(cell: Cell) {
    return !!cell.unit && cell.unit.player !== this
  }

  /** Own unit whose menu can open (it can act, undo its move or use a skill) */
  isOwnSelectableUnit(cell: Cell) {
    return !!cell.unit && cell.unit.player === this && cell.unit.canBeSelected()
  }

  async waitForHumanMove() {
    this.active = true
    await this.humanMove.promise
    this.humanMove = new ex.Future()
  }

  /** The turn goes on while some unit can still move or attack */
  async hasMoves() {
    const units = this.board.getUnits().filter(u => u.player === this && u.hasActions())
    return units.length > 0 && !this.hasWon()
  }

  override async makeMove(): Promise<boolean> {
    if (await this.catchUp()) return true
    let moves = false
    do {
      moves = await this.hasMoves()
      if (moves) {
        await this.waitForHumanMove()
      }
    } while (moves)
    return true
  }
}
