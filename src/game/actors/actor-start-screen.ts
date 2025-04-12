import * as ex from 'excalibur'
import { SCALE } from '../config'
import { titleText, p1VsCpuText, p1VsP2Text, cpuVsCpuText } from '../texts/text'

export namespace ActorStartScreen {
  function createButtonActor(
    name: string,
    position: ex.Vector,
    color: ex.Color,
    text: ex.Text,
    width = 200,
    height = 45
  ): ex.Actor {
    const button = new ex.Actor({
      name,
      pos: position,
      width: width * SCALE.x,
      height: height * SCALE.y,
      color,
      coordPlane: ex.CoordPlane.Screen

    })

    button.graphics.use(
      new ex.GraphicsGroup({
        members: [
          { graphic: new ex.Rectangle({ width: button.width, height: button.height, color: button.color, lineWidth: 4 }), offset: ex.vec(0, 0) },
          { graphic: text, offset: ex.vec(button.width / 2 - text.width / 2, button.height / 2 - text.height / 2) }
        ]
      })
    )

    button.scale = SCALE

    return button
  }

  export function createTitleActor() {
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

  export function createFadeOverlayActor(engine: ex.Engine): ex.Actor {
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

  export function createP1VsCpuButtonActor() {
    return createButtonActor('p1VsCpuButton', ex.vec(650, 400), ex.Color.Red, p1VsCpuText)
  }

  export function createP1VsP2ButtonActor() {
    return createButtonActor('p1VsP2Button', ex.vec(650, 520), ex.Color.Blue, p1VsP2Text)
  }

  export function createCpuVsCpuButtonActor() {
    return createButtonActor('cpuVsCpuButton', ex.vec(650, 640), ex.Color.Red, cpuVsCpuText)
  }
}
