import * as ex from 'excalibur'
import type { Cell } from '../cell'
import { SCALE_CURSOR } from '../config'
import { CursorAnimation } from '../resources'

/**
 * Marks the cells the current lesson points at with the game's own yellow
 * cursor (the one of a move's path), drawn over the units so it can't be missed.
 */
export class TutorialMarkers {
  private actors = new Map<Cell, ex.Actor>()

  constructor(private scene: ex.Scene) {}

  /** Marks exactly these cells (keeps the ones already shown, so their animation doesn't restart) */
  show(cells: Cell[]) {
    for (const [cell, actor] of this.actors) {
      if (cells.includes(cell)) continue
      actor.kill()
      this.actors.delete(cell)
    }
    for (const cell of cells) {
      if (this.actors.has(cell)) continue
      const actor = this.marker(cell)
      this.scene.add(actor)
      this.actors.set(cell, actor)
    }
  }

  clear() {
    this.show([])
  }

  private marker(cell: Cell): ex.Actor {
    // over the units (z 2) and their HP bars (z 3), same size and offset as the cell's cursor
    const actor = new ex.Actor({ pos: cell.pos.clone(), anchor: ex.Vector.Zero, z: 4 })
    const animation = CursorAnimation.clone()
    animation.scale = SCALE_CURSOR
    actor.graphics.use(animation)
    actor.graphics.offset = ex.vec(-4, -4)
    return actor
  }
}
