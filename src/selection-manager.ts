import { Unit, type StrikeRolls } from './unit'
import { Board } from './board'
import { Cell } from './cell'
import { PathNodeComponent } from './path-finding/path-node-component'
import { Player } from './player'
import * as ex from 'excalibur'
import { facingBetween } from './combat'

/**
 * Manages current unit selection
 */
export class SelectionManager {

  currentPlayer: Player | null = null
  /** heal = picking the target of an ally skill (Heal) */
  currentSelectionMode: 'move' | 'attack' | 'heal' = 'move'
  currentUnitSelection: Unit | null = null
  currentCursor: { x: number, y: number } = { x: 0, y: 0 }
  /** Cells showing a move preview marker (facing arrow, back attack) */
  private previewCells: Cell[] = []

  constructor(private board: Board, private engine: ex.Engine) {
    this.board = board
    this.engine = engine
  }

  reset() {
    this.resetHighlight()
    this.currentUnitSelection = null
  }

  showCursor(x: number, y: number) {
    const cell = this.board.getCell(x, y)
    if (cell?.unit || cell?.highlight) {
      this.engine.canvas.style.cursor = 'pointer'
    } else {
      this.engine.canvas.style.cursor = 'default'
    }

    if (cell) {
      this.board.getCell(this.currentCursor.x, this.currentCursor.y)?.toggleCursor(false)
      cell.toggleCursor(true)
      this.currentCursor = { x, y }
    }
  }

  selectPlayer(player: Player) {
    this.currentPlayer = player
  }

  selectUnit(unit: Unit, type: 'move' | 'attack' | 'heal') {
    if (unit.player !== this.currentPlayer) return
    this.currentUnitSelection = unit
    this.currentSelectionMode = type
  }

  /**
   * Moves the unit to `destination`. Uses `path` when given (already computed
   * by the caller), otherwise finds the cheapest path within the unit's movement.
   */
  async selectDestinationAndMove(unit: Unit, destination: Cell, path?: PathNodeComponent[]) {
    if (unit.player !== this.currentPlayer) return
    const route = path ?? this.findPath(destination, unit)
    if (route.length > 1) {
      await unit.move(route)
    }
    this.reset()
  }

  /** `rolls`: dice already rolled (online play sends them to the other side) */
  async selectDestinationAndAttack(unit: Unit, destination: Cell, rolls?: StrikeRolls) {
    if (unit.player !== this.currentPlayer) return
    const range = this.findAttackRange(unit)
    if (destination.unit && range.includes(destination.pathNode)) {
      await unit.attack(destination.unit, rolls)
    }
    this.reset()
  }

  findAttackRange(unit: Unit): PathNodeComponent[] {
    if (!unit.cell) return []
    return this.board.pathFinder.getRangeAttack(
      unit.cell.pathNode,
      ~unit.player.mask,
      unit.unitConfig.range,
      unit.name
    )
  }

  findMovementRange(unit: Unit): PathNodeComponent[] {
    if (!unit.cell) return []
    return this.board.pathFinder.getRange(
      unit.cell.pathNode,
      unit.player.mask,
      unit.effectiveMovement,
      unit.name
    )
  }

  resetHighlight() {
    this.board.cells.forEach(cell => {
      if (cell.highlight) cell.toggleHighlight(false, cell.highlight)
    })
    this.clearMovePreview()
  }

  /**
   * Move mode, hovering a destination: the way `unit` ends up facing there and
   * the enemies it could attack from there (marked when from behind).
   */
  showMovePreview(unit: Unit, path: PathNodeComponent[]) {
    this.clearMovePreview()
    if (path.length < 2) return
    const destination = path[path.length - 1].owner as Cell
    destination.showFacingPreview(facingBetween(path[path.length - 2], path[path.length - 1]))
    this.previewCells.push(destination)
    for (const target of unit.targetsFrom(destination)) {
      const cell = target.unit.cell!
      cell.toggleHighlight(true, 'attack')
      if (target.back) {
        cell.toggleBackMarker(true)
        this.previewCells.push(cell)
      }
    }
  }

  private clearMovePreview() {
    this.previewCells.forEach(cell => {
      cell.showFacingPreview(null)
      cell.toggleBackMarker(false)
    })
    this.previewCells = []
  }

  showHighlight(path: PathNodeComponent[], type: 'path' | 'range' | 'attack'): void {
    path.forEach(node => {
      const cell = node.owner as Cell
      cell.toggleHighlight(true, type)
    })
  }

  /** Cheapest path for `unit` to `destination` within its movement, or [] */
  findPath(destination: Cell, unit: Unit): PathNodeComponent[] {
    if (!unit.cell) return []
    return this.board.pathFinder.findPath(
      unit.cell.pathNode,
      destination.pathNode,
      unit.player.mask,
      unit.effectiveMovement,
      unit.name
    )
  }
}
