import * as ex from 'excalibur'
import { SCALE } from '../config'
import { titleText, p1VsCpuText } from '../texts/text'

export namespace ActorStartScreen {
  export function createTitle() {
    const title = new ex.Actor({
      name: 'title',
      pos: ex.vec(650, 200),
      coordPlane: ex.CoordPlane.Screen,
      scale: SCALE
    })

    title.graphics.use(titleText)
    title.actions.repeatForever(ctx => {
      ctx.moveBy({
        offset: ex.vec(0, -30 * SCALE.y),
        duration: 1000,
        easing: ex.EasingFunctions.EaseInOutQuad
      }).moveBy({
        offset: ex.vec(0, 30 * SCALE.y),
        duration: 1000,
        easing: ex.EasingFunctions.EaseInOutQuad
      })
    })

    return title
  }

  export function createP1VsCpuButton() {
    const p1VsCpuButton = new ex.Actor({
      name: 'p1VsCpuButton',
      pos: ex.vec(650, 400),
      width: 200 * SCALE.x,
      height: 45 * SCALE.y,
      color: ex.Color.Red,
      coordPlane: ex.CoordPlane.Screen
    })

    p1VsCpuButton.graphics.use(
      new ex.GraphicsGroup({
        members: [
          { graphic: new ex.Rectangle({ width: p1VsCpuButton.width, height: p1VsCpuButton.height, color: p1VsCpuButton.color, lineWidth: 4 }), offset: ex.vec(0, 0) },
          { graphic: p1VsCpuText, offset: ex.vec(p1VsCpuButton.width / 2 - p1VsCpuText.width / 2, p1VsCpuButton.height / 2 - p1VsCpuText.height / 2) }
        ]
      })
    )

    p1VsCpuButton.scale = SCALE

    return p1VsCpuButton
  }

  export function createFadeOverlay(engine: ex.Engine): ex.Actor {
    return new ex.Actor({
      pos: ex.vec(0, 0),
      anchor: ex.Vector.Zero,
      width: engine.drawWidth,
      height: engine.drawHeight,
      color: ex.Color.Black,
      opacity: 0,
      z: 1000
    })
  }
}
