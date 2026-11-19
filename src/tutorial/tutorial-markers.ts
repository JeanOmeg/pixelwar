import * as ex from 'excalibur'
import type { Cell } from '../cell'
import { SCALE } from '../config'

const GOLD = ex.Color.fromHex('#ffd23f')
/** Border width in world pixels */
const LINE = 2 * SCALE.x

/** Blinking gold frames on the cells the current lesson points at */
export class TutorialMarkers {
  private actors = new Map<Cell, ex.Actor>()

  constructor(private scene: ex.Scene) {}

  /** Frames exactly these cells (keeps the ones already shown, so they don't restart blinking) */
  show(cells: Cell[]) {
    for (const [cell, actor] of this.actors) {
      if (cells.includes(cell)) continue
      actor.kill()
      this.actors.delete(cell)
    }
    for (const cell of cells) {
      if (this.actors.has(cell)) continue
      const actor = this.frame(cell)
      this.scene.add(actor)
      this.actors.set(cell, actor)
    }
  }

  clear() {
    this.show([])
  }

  private frame(cell: Cell): ex.Actor {
    const width = cell.board.tileWidth * SCALE.x
    const height = cell.board.tileHeight * SCALE.y
    // over the units (z 2) and their HP bars (z 3); only the border is drawn
    const actor = new ex.Actor({ pos: cell.pos.clone(), anchor: ex.Vector.Zero, z: 4 })
    actor.graphics.use(new ex.Rectangle({
      width: width - LINE,
      height: height - LINE,
      color: ex.Color.Transparent,
      strokeColor: GOLD,
      lineWidth: LINE
    }))
    actor.graphics.offset = ex.vec(LINE / 2, LINE / 2)
    actor.actions.repeatForever(ctx => ctx.fade(0.2, 350).fade(1, 350))
    return actor
  }
}
