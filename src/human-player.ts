import * as ex from 'excalibur'
import { Board } from './board'
import { Player } from './player'
import { SelectionManager } from './selection-manager'
import { UIManager } from './ui-manager'
import { Cell } from './cell'
import { Unit } from './unit'
import { Resources } from './resources'


export class HumanPlayer extends Player {
  private humanMove = new ex.Future<void>()

  constructor(name: string, private engine: ex.Engine, private selectionManager: SelectionManager, public uiManager: UIManager, board: Board) {
    super(name, board)
    this.engine = engine
    this.selectionManager = selectionManager
    this.uiManager = uiManager
    engine.input.pointers.on('down', this.pointerClick.bind(this))
    engine.input.pointers.on('move', this.pointerMove.bind(this))
    document.body.oncontextmenu = () => false
  }

  async pointerClick(pointer: ex.PointerEvent) {
    if (!this.active) return
    this.board.getUnits().forEach(u => u.setAnim(u.selectAnimationIdle()))
    this.selectionManager.resetHighlight()
    const maybeClickedCell = this.board.getCellByWorldPos(pointer.worldPos)

    if (pointer.button === ex.PointerButton.Left) {
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
      } else {
        this.maybeSelectUnit(maybeClickedCell)
      }
    }

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

    if (!this.selectionManager.currentUnitSelection) return

    this.selectionManager.resetHighlight()

    if (this.selectionManager.currentSelectionMode === 'move') {
      const currentRange = this.selectionManager.findMovementRange(this.selectionManager.currentUnitSelection)
      this.selectionManager.showHighlight(currentRange, 'range')

      const destination = this.board.getCellByWorldPos(pointer.worldPos)
      if (destination) {
        const currentPath = this.selectionManager.findPath(destination, currentRange, this.selectionManager.currentUnitSelection.name)
        this.selectionManager.showHighlight(currentPath, 'path')
      }
    } else {
      const currentRange = this.selectionManager.findAttackRange(this.selectionManager.currentUnitSelection)
      this.selectionManager.showHighlight(currentRange, 'attack')

      const destination = this.board.getCellByWorldPos(pointer.worldPos)
      if (destination && this.hasNonPlayerUnit(destination)) {
        this.selectionManager.showHighlight([destination.pathNode], 'path')
      }
    }
  }

  async maybeMove(unit: Unit, destination: Cell | null) {
    if (destination && unit.canMove()) {
      this.active = false
      Resources.TargetSelectSound.play()
      await this.selectionManager.selectDestinationAndMove(unit, destination)
      this.humanMove.resolve()
    } else {
      this.selectionManager.reset()
    }
  }

  async maybeAttack(attacker: Unit, destination: Cell | null) {
    if (destination && attacker.canAttack() && this.hasNonPlayerUnit(destination)) {
      this.active = false
      await this.selectionManager.selectDestinationAndAttack(attacker, destination)
      this.humanMove.resolve()
    } else {
      this.selectionManager.reset()
    }

    const won = this.hasWon()
    if (won) {
      this.humanMove.resolve()
      this.uiManager.dismissAll()
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
      const unit = cell.unit
      const attack = this.board.pathFinder.getRangeAttack(
        cell.pathNode,
        ~unit.player.mask,
        unit.unitConfig.range,
        unit.name
      )
      this.selectionManager.showHighlight(attack, 'attack')
    } else {
      this.selectionManager.reset()
    }
  }

  async maybeSelectUnit(cell: Cell | null) {
    if (cell?.unit && this.hasPlayerUnitWithActions(cell)) {
      const maybeClickedCell = this.board.getCellByWorldPos(cell.pos)
      if (maybeClickedCell) {
        cell.unit.setAnim(cell.unit.selectAnimationMove())
        this.selectionManager.showCursor(maybeClickedCell.x, maybeClickedCell.y)
      }
      Resources.SelectSound.play()

      this.uiManager.showUnitMenu(cell.unit, {
        move: () => {
          this.selectionManager.selectUnit(cell.unit!, 'move')
        },
        attack: () => {
          this.selectionManager.selectUnit(cell.unit!, 'attack')
        },
        pass: async () => {
          cell.unit?.setAnim(cell.unit?.selectAnimationIdle())
          await cell.unit?.pass()
          this.selectionManager.reset()
          this.humanMove.resolve()
        },
        passTurn: async () => {
          let  units = this.board.getUnits()
          units = units.filter(u => u.player === this)
          units.forEach(unit => unit.setAnim(unit.selectAnimationIdle()))
          units.forEach(async unit => await unit.pass())
          this.selectionManager.reset()
          this.humanMove.resolve()
        }
      })
    } else {
      this.selectionManager.reset()
    }
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