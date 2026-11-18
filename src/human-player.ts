import * as ex from 'excalibur'
import { Board } from './board'
import { Player } from './player'
import { SelectionManager } from './selection-manager'
import type { GameUI } from './game-ui'
import { Cell } from './cell'
import { Unit } from './unit'
import { Resources } from './resources'


export class HumanPlayer extends Player {
  override readonly isHuman = true
  private humanMove = new ex.Future<void>()
  private subscriptions: ex.Subscription[] = []
  /** Touch: cell tapped once in move/attack mode, waiting for a second tap to confirm */
  private pendingTarget: Cell | null = null
  /** Unit whose range is shown by tapping it (no right/middle button on touch) */
  private inspected: { unit: Unit, mode: 'range' | 'attack' } | null = null

  constructor(name: string, private engine: ex.Engine, private selectionManager: SelectionManager, public ui: GameUI, board: Board) {
    super(name, board)
    this.engine = engine
    this.selectionManager = selectionManager
    this.ui = ui
    this.subscriptions.push(
      engine.input.pointers.on('down', this.pointerClick.bind(this)),
      engine.input.pointers.on('move', this.pointerMove.bind(this))
    )
    document.body.oncontextmenu = () => false
  }

  override dispose() {
    super.dispose()
    this.subscriptions.forEach(s => s.close())
    this.subscriptions = []
  }

  async pointerClick(pointer: ex.PointerEvent) {
    if (!this.active) return
    const maybeClickedCell = this.board.getCellByWorldPos(pointer.worldPos)
    const touch = pointer.pointerType === ex.PointerType.Touch

    // Touch has no hover to preview the path or the attack: the first tap on a
    // valid target previews it, a second tap on the same cell confirms
    const selected = this.selectionManager.currentUnitSelection
    if (touch && selected && maybeClickedCell && maybeClickedCell !== this.pendingTarget && this.isValidTarget(selected, maybeClickedCell)) {
      this.pendingTarget = maybeClickedCell
      this.selectionManager.showCursor(maybeClickedCell.x, maybeClickedCell.y)
      this.showSelectionHighlight(maybeClickedCell)
      return
    }
    this.pendingTarget = null

    this.board.getUnits().forEach(u => u.setAnim(u.selectAnimationIdle()))
    this.selectionManager.resetHighlight()

    if (pointer.button === ex.PointerButton.Left || touch) {
      if (this.selectionManager.currentUnitSelection) {
        const unit = this.selectionManager.currentUnitSelection
        if (this.selectionManager.currentSelectionMode === 'move') {
          await this.maybeMove(unit, maybeClickedCell)
          await this.maybeSelectUnit(unit.cell)
        } else {
          await this.maybeAttack(unit, maybeClickedCell)
          const won = this.hasWon()
          if (!won) {
            await this.maybeSelectUnit(unit.cell)
          }
        }
      } else if (maybeClickedCell?.unit && !this.hasPlayerUnitWithActions(maybeClickedCell)) {
        this.inspectUnit(maybeClickedCell.unit)
      } else {
        this.maybeSelectUnit(maybeClickedCell)
      }
    }
    if (!this.selectionManager.currentUnitSelection && !maybeClickedCell?.unit) this.inspected = null

    if (pointer.button === ex.PointerButton.Right) {
      this.highlightUnitMoveRange(maybeClickedCell)
    }

    if (pointer.button === ex.PointerButton.Middle) {
      this.highlightUnitAttackRange(maybeClickedCell)
    }
  }

  pointerMove(pointer: ex.PointerEvent) {
    if (!this.active) return

    const cellBelowPointer = this.board.getCellByWorldPos(pointer.worldPos)
    if (cellBelowPointer) {
      this.selectionManager.showCursor(cellBelowPointer.x, cellBelowPointer.y)
    }

    this.showSelectionHighlight(cellBelowPointer)
  }

  /** Range of the selected unit (move or attack mode) plus the path/target under `hovered` */
  private showSelectionHighlight(hovered: Cell | null) {
    const unit = this.selectionManager.currentUnitSelection
    if (!unit?.cell) return

    this.selectionManager.resetHighlight()

    if (this.selectionManager.currentSelectionMode === 'move') {
      const movementMap = this.board.pathFinder.getMovementMap(unit.cell.pathNode, this.mask, unit.effectiveMovement, unit.name)
      this.selectionManager.showHighlight(movementMap.range, 'range')

      if (hovered) {
        const path = movementMap.pathTo(hovered.pathNode)
        if (path.length > 1) this.selectionManager.showHighlight(path, 'path')
      }
    } else {
      const currentRange = this.selectionManager.findAttackRange(unit)
      this.selectionManager.showHighlight(currentRange, 'attack')

      if (hovered && this.hasNonPlayerUnit(hovered) && currentRange.includes(hovered.pathNode)) {
        this.selectionManager.showHighlight([hovered.pathNode], 'path')
      }
    }
  }

  /** Whether tapping `cell` would move/attack with `unit` in the current mode */
  private isValidTarget(unit: Unit, cell: Cell): boolean {
    if (!unit.cell) return false
    if (this.selectionManager.currentSelectionMode === 'move') {
      if (!unit.canMove()) return false
      const movementMap = this.board.pathFinder.getMovementMap(unit.cell.pathNode, this.mask, unit.effectiveMovement, unit.name)
      return movementMap.pathTo(cell.pathNode).length > 1
    }
    return unit.canAttack() && !!this.hasNonPlayerUnit(cell) && this.selectionManager.findAttackRange(unit).includes(cell.pathNode)
  }

  /**
   * Left click / tap on an enemy or on a unit that already acted: shows its
   * movement range; tapping it again shows its attack range (and so on).
   */
  private inspectUnit(unit: Unit) {
    const mode = this.inspected?.unit === unit && this.inspected.mode === 'range' ? 'attack' : 'range'
    this.inspected = { unit, mode }
    if (mode === 'range') this.highlightUnitMoveRange(unit.cell)
    else this.highlightUnitAttackRange(unit.cell)
  }

  private selectMode(unit: Unit, mode: 'move' | 'attack') {
    this.pendingTarget = null
    this.inspected = null
    this.selectionManager.selectUnit(unit, mode)
    this.showSelectionHighlight(null)
  }

  /**
   * A skill picked from the menu (Run / Special Attack) only takes effect on
   * the next move/attack. If that action didn't happen, give the MP back.
   */
  private refundPendingSkill(unit: Unit) {
    if (unit.isRunning) {
      unit.isRunning = false
      if (!unit.moved) {
        unit.mp += 2
        unit.usedSkill = false
      }
    }
    if (unit.forcesCritical && !unit.attacked) {
      unit.forcesCritical = false
      unit.mp += 4
      unit.usedSkill = false
    }
  }

  /** Esc: leaves move/attack mode, refunding a pending skill */
  cancelSelection() {
    if (!this.active) return
    const unit = this.selectionManager.currentUnitSelection
    if (unit) this.refundPendingSkill(unit)
    this.pendingTarget = null
    this.selectionManager.reset()
    this.ui.dismissAll()
  }

  async maybeMove(unit: Unit, destination: Cell | null) {
    if (destination && unit.canMove()) {
      this.active = false
      Resources.TargetSelectSound.play()
      await this.selectionManager.selectDestinationAndMove(unit, destination)
      this.refundPendingSkill(unit)
      this.humanMove.resolve()
    } else {
      this.refundPendingSkill(unit)
      this.selectionManager.reset()
    }
  }

  async maybeAttack(attacker: Unit, destination: Cell | null) {
    if (destination && attacker.canAttack() && this.hasNonPlayerUnit(destination)) {
      this.active = false
      await this.selectionManager.selectDestinationAndAttack(attacker, destination)
      this.refundPendingSkill(attacker)
      this.humanMove.resolve()
    } else {
      this.refundPendingSkill(attacker)
      this.selectionManager.reset()
    }

    const won = this.hasWon()
    if (won) {
      this.humanMove.resolve()
      this.ui.dismissAll()
    }
  }

  /**
   * Highlight the range of any unit friendly or not
   * @param cell
   */
  async highlightUnitMoveRange(cell: Cell | null) {
    if (cell?.unit) {
      const unit = cell.unit
      const currentRange = this.selectionManager.findMovementRange(unit)
      this.selectionManager.showHighlight(currentRange, 'range')
    } else {
      this.selectionManager.reset()
    }
  }

  async highlightUnitAttackRange(cell: Cell | null) {
    if (cell?.unit) {
      this.selectionManager.showHighlight(this.selectionManager.findAttackRange(cell.unit), 'attack')
    } else {
      this.selectionManager.reset()
    }
  }

  async maybeSelectUnit(cell: Cell | null) {
    if (cell?.unit && this.hasPlayerUnitWithActions(cell)) {
      const unit = cell.unit
      unit.setAnim(unit.selectAnimationMove())
      this.selectionManager.showCursor(cell.x, cell.y)
      Resources.SelectSound.play()

      this.ui.showUnitMenu(unit, {
        move: () => this.selectMode(unit, 'move'),
        attack: () => this.selectMode(unit, 'attack'),
        run: () => {
          unit.mp -= 2
          unit.isRunning = true
          unit.usedSkill = true
          this.selectMode(unit, 'move')
        },
        specialAttack: () => {
          unit.mp -= 4
          unit.forcesCritical = true
          unit.usedSkill = true
          this.selectMode(unit, 'attack')
        },
        pass: async () => {
          unit.setAnim(unit.selectAnimationIdle())
          await unit.pass()
          this.selectionManager.reset()
          this.humanMove.resolve()
        }
      })
    } else {
      this.selectionManager.reset()
    }
  }

  /** Ends the turn for every unit of this player (End Turn button) */
  async endTurn() {
    if (!this.active) return
    const unit = this.selectionManager.currentUnitSelection
    if (unit) this.refundPendingSkill(unit)
    this.ui.dismissAll()
    const units = this.board.getUnits().filter(u => u.player === this)
    units.forEach(u => u.setAnim(u.selectAnimationIdle()))
    for (const u of units) await u.pass()
    this.selectionManager.reset()
    this.humanMove.resolve()
  }

  hasNonPlayerUnit(maybeClickedCell: Cell) {
    return maybeClickedCell && maybeClickedCell.unit && maybeClickedCell.unit.player !== this
  }

  hasPlayerUnitWithActions(maybeClickedCell: Cell) {
    return maybeClickedCell?.unit && maybeClickedCell?.unit?.hasActions() && maybeClickedCell.unit.player === this
  }

  async waitForHumanMove() {
    this.active = true
    await this.humanMove.promise
    this.humanMove = new ex.Future()
  }

  async hasMoves() {
    let units = this.board.getUnits()
    units = units.filter(u => u.player === this).filter(u => u.hasActions())
    const won = this.hasWon()
    return units.length > 0 && !won
  }

  override async makeMove(): Promise<boolean> {
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
